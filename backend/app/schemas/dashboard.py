from pydantic import BaseModel

class DashboardSummary(BaseModel):
    total_balance: float  # Saldo Atual (Salário + Receitas - Despesas)
    total_income: float   # Total de Entradas
    total_expense: float  # Total de Saídas
    user_salary: float    # Salário Base do Usuário
