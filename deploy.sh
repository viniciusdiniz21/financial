#!/bin/bash

# ==============================================================================
# CONFIGURAÇÕES DE USUÁRIO (EDITE AQUI)
# ==============================================================================
# ID do seu projeto no Google Cloud (veja na dashboard do GCP)
PROJECT_ID="financialapp-486522"

# Nome que você quer dar para sua máquina virtual
INSTANCE_NAME="app-financeiro-server"

# Região e Zona (us-central1-a é geralmente mais barato e tem free tier)
ZONE="us-central1-a"
REGION="us-central1"

# Tipo da máquina (e2-micro é free tier elegível, e2-medium é melhor para build)
MACHINE_TYPE="e2-medium"

# Seu usuário do sistema (para SSH) - geralmente é o seu email sem @gmail.com ou 'ubuntu'
SSH_USER="ubuntu"

# ==============================================================================
# FIM DA EDIÇÃO - A MÁGICA COMEÇA ABAIXO
# ==============================================================================

set -e # Para o script se houver erro

echo "🚀 Iniciando Deploy Automatizado no GCP..."

# 1. Configurar Projeto
echo "🔹 Configurando projeto: $PROJECT_ID"
gcloud config set project $PROJECT_ID

# 2. Criar IP Estático (para o DNS não mudar se reiniciar)
if gcloud compute addresses describe ${INSTANCE_NAME}-ip --region $REGION &>/dev/null; then
    echo "🔸 IP Estático já existe."
else
    echo "🔹 Criando IP Estático..."
    gcloud compute addresses create ${INSTANCE_NAME}-ip --region $REGION
fi

STATIC_IP=$(gcloud compute addresses describe ${INSTANCE_NAME}-ip --region $REGION --format='get(address)')
echo "✅ IP Reservado: $STATIC_IP (Configure este IP no seu DNS/GoDaddy/Registro.br)"

# 3. Configurar Firewall (Abrir porta 80, 443 e 8000/5173 se precisar testar)
echo "🔹 Verificando regras de Firewall..."
if ! gcloud compute firewall-rules describe allow-http-https &>/dev/null; then
    gcloud compute firewall-rules create allow-http-https \
        --allow tcp:80,tcp:443 \
        --target-tags http-server,https-server \
        --description "Allow HTTP and HTTPS"
fi

# 4. Criar a Instância (VM)
if gcloud compute instances describe $INSTANCE_NAME --zone $ZONE &>/dev/null; then
    echo "🔸 A instância $INSTANCE_NAME já existe. Pulando criação."
else
    echo "🔹 Criando instância VM ($MACHINE_TYPE)..."
    gcloud compute instances create $INSTANCE_NAME \
        --zone=$ZONE \
        --machine-type=$MACHINE_TYPE \
        --image-family=ubuntu-2204-lts \
        --image-project=ubuntu-os-cloud \
        --tags=http-server,https-server \
        --address=$STATIC_IP \
        --boot-disk-size=20GB
    
    echo "⏳ Aguardando a VM inicializar (30s)..."
    sleep 30
fi

# 5. Provisionamento do Servidor (Instalar Docker e Nginx remotamente)
echo "🔹 Configurando ambiente na VM (Isso pode demorar um pouco)..."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command "
    sudo apt-get update
    
    # Instalar Docker
    if ! command -v docker &> /dev/null; then
        echo 'Instalando Docker...'
        sudo apt-get install -y docker.io docker-compose-plugin
        sudo usermod -aG docker \$USER
    fi

    # Instalar Nginx
    if ! command -v nginx &> /dev/null; then
        echo 'Instalando Nginx...'
        sudo apt-get install -y nginx
    fi
"

# 6. Upload dos Arquivos do Projeto
echo "🔹 Enviando arquivos do projeto para o servidor..."
# Copia tudo da pasta atual, exceto node_modules e .git (crie um arquivo .gcloudignore se quiser filtrar melhor)
gcloud compute scp --recurse . $INSTANCE_NAME:~/app --zone=$ZONE

# 7. Configuração Final e Start
echo "🔹 Iniciando Containers e Configurando Proxy..."
gcloud compute ssh $INSTANCE_NAME --zone=$ZONE --command "
    cd ~/app
    
    # Parar containers antigos
    sudo docker compose down || true
    
    # Subir containers (Rebuild)
    sudo docker compose up -d --build
    
    # Configurar Nginx
    sudo cp nginx.conf /etc/nginx/nginx.conf
    sudo nginx -t # Testar config
    sudo systemctl restart nginx
"

echo "=========================================================="
echo "✅ DEPLOY CONCLUÍDO COM SUCESSO!"
echo "🌍 Acesse sua aplicação em: http://$STATIC_IP"
echo "⚠️  IMPORTANTE: Configure o registro A do seu domínio para apontar para $STATIC_IP"
echo "=========================================================="