import { useState, useEffect } from 'react';
import axios from 'axios';
import { PieChart, TrendingUp, Plus, Pencil } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Modal, Button, Input, Select } from '../components/ui/Modal';

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

export default function Investments() {
    const [portfolio, setPortfolio] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'stocks', quantity: '', average_price: '' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
        headers: getAuthHeaders()
    });

    const fetchInvestments = async () => {
        try {
            const response = await api.get('/investments/');
            setPortfolio(response.data);
        } catch (error) {
            console.error("Error fetching investments:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInvestments();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                name: item.name,
                type: item.type,
                quantity: item.quantity,
                average_price: item.average_price
            });
        } else {
            setEditingItem(null);
            setFormData({ name: '', type: 'stocks', quantity: '', average_price: '' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const payload = {
                ...formData,
                quantity: parseFloat(formData.quantity),
                average_price: parseFloat(formData.average_price)
            };

            if (editingItem) {
                await api.put(`/investments/${editingItem.id}`, payload);
            } else {
                await api.post('/investments/', payload);
            }
            setIsModalOpen(false);
            fetchInvestments();
        } catch (error) {
            console.error("Error saving investment:", error);
            alert("Erro ao salvar investimento");
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-50">Investimentos</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Novo Ativo
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Meus Ativos</CardTitle>
                </CardHeader>
                <CardContent>
                    {loading ? (
                        <div className="space-y-4">
                            {[1, 2, 3].map(i => <div key={i} className="h-16 bg-slate-100 rounded w-full animate-pulse dark:bg-slate-800" />)}
                        </div>
                    ) : portfolio.length === 0 ? (
                        <div className="text-center py-10 text-slate-500 dark:text-slate-400">
                            <PieChart className="mx-auto mb-3 opacity-20" size={48} />
                            <p>Você ainda não possui investimentos cadastrados.</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {portfolio.map((asset) => (
                                <div key={asset.id} className="flex items-center justify-between p-4 hover:bg-slate-50 rounded-lg transition-colors border-b border-slate-100 last:border-0 group dark:hover:bg-slate-800/50 dark:border-slate-800">
                                    <div className="flex items-center gap-4">
                                        <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg dark:bg-indigo-900/30 dark:text-indigo-400">
                                            <TrendingUp size={20} />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 dark:text-slate-50">{asset.asset_name}</h3>
                                            <p className="text-sm text-slate-500 dark:text-slate-400">{asset.type.toUpperCase()} • {asset.quantity} cotas</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="text-right">
                                            <div className="font-mono font-bold text-slate-900 dark:text-slate-50">
                                                {formatCurrency(asset.current_total)}
                                            </div>
                                            <div className="text-xs text-slate-500 dark:text-slate-400">
                                                Preço Médio: {formatCurrency(asset.average_price)}
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleOpenModal(asset)}
                                            className="p-1.5 text-slate-300 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg opacity-0 group-hover:opacity-100 transition-all dark:text-slate-600 dark:hover:text-indigo-400 dark:hover:bg-indigo-900/30"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Ativo" : "Novo Investimento"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Ativo (Ticker/Nome)"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Quantidade"
                            type="number"
                            step="0.00000001"
                            value={formData.quantity}
                            onChange={e => setFormData({ ...formData, quantity: e.target.value })}
                            required
                        />
                        <Input
                            label="Preço Médio (R$)"
                            type="number"
                            step="0.01"
                            value={formData.average_price}
                            onChange={e => setFormData({ ...formData, average_price: e.target.value })}
                            required
                        />
                    </div>
                    <Select
                        label="Tipo"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        options={[
                            { value: 'stocks', label: 'Ações' },
                            { value: 'bonds', label: 'Renda Fixa' },
                            { value: 'crypto', label: 'Criptomoedas' },
                            { value: 'reits', label: 'FIIs' }
                        ]}
                    />
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
