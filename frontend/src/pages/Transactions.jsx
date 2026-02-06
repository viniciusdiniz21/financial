import { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Pencil, Trash2 } from 'lucide-react';
import { Card, CardContent, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Modal, Button, Input, Select } from '../components/ui/Modal';

const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatDate = (dateString) =>
    new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));

export default function Transactions() {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ description: '', amount: '', type: 'expense', category_id: 1, date: '' });

    // Auth token helper
    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
        headers: getAuthHeaders()
    });

    const fetchTransactions = async () => {
        try {
            const response = await api.get('/transactions/');
            setTransactions(response.data);
        } catch (error) {
            console.error("Error fetching transactions:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTransactions();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({
                description: item.description || item.title,
                amount: item.amount,
                type: item.type,
                category_id: item.category_id,
                date: item.date ? item.date.split('T')[0] : ''
            });
        } else {
            setEditingItem(null);
            setFormData({ description: '', amount: '', type: 'expense', category_id: 1, date: new Date().toISOString().split('T')[0] });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Ensure payload matches backend expectations
            // Backend expects 'title' but schema has 'description' alias likely or model uses title.
            // Let's check schema: description is alias for title? Or vice versa.
            // In transaction.py schema: title is mapped to description? No.
            // Let's check Backend Schema again.
            // Actually, `TransactionBase` usually creates the fields.
            // I'll send `description` as key if schema expects it, or `title`.
            // The previous `TransactionCreate` schema was empty inheriting Base?
            // If Base has `title`, `amount`, etc.
            // I'll assume `description` maps to `title` or just send `title` if I can.
            // Code shows: `description = item.description || item.title`.
            // Update: I will send "title" in payload to be safe if that is the DB column.

            const payload = {
                title: formData.description, // Mapping description form field to title
                description: formData.description, // Sending both just in case
                amount: parseFloat(formData.amount),
                type: formData.type,
                category_id: parseInt(formData.category_id),
                date: formData.date
            };

            if (editingItem) {
                await api.put(`/transactions/${editingItem.id}`, payload);
            } else {
                await api.post('/transactions/', payload);
            }

            setIsModalOpen(false);
            fetchTransactions();
        } catch (error) {
            console.error("Error saving transaction:", error);
            alert("Erro ao salvar transação");
        }
    };

    return (
        <Card>
            <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-slate-800">
                <CardTitle>Histórico de Transações</CardTitle>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Nova Transação
                </Button>
            </div>

            <CardContent className="p-0">
                <div className="overflow-x-auto">
                    {/* Desktop Table View */}
                    <table className="w-full text-sm text-left hidden md:table">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400">
                            <tr>
                                <th className="px-6 py-3 font-medium">Data</th>
                                <th className="px-6 py-3 font-medium">Título</th>
                                <th className="px-6 py-3 font-medium">Categoria</th>
                                <th className="px-6 py-3 font-medium text-right">Valor</th>
                                <th className="px-6 py-3 font-medium text-center">Tipo</th>
                                <th className="px-6 py-3 font-medium text-center">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {loading ? (
                                [1, 2, 3].map(i => (
                                    <tr key={i}><td colSpan={6} className="px-6 py-4"><div className="h-4 bg-slate-100 rounded dark:bg-slate-800" /></td></tr>
                                ))
                            ) : transactions.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500 dark:text-slate-400">
                                        <div className="flex flex-col items-center gap-2">
                                            <div className="p-3 bg-slate-100 rounded-full text-slate-400 dark:bg-slate-800">
                                                <Plus size={24} />
                                            </div>
                                            <p>Nenhuma transação encontrada.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                transactions.map((t) => (
                                    <tr key={t.id} className="hover:bg-slate-50/80 transition-colors dark:hover:bg-slate-800/50">
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
                                        <td className="px-6 py-4 font-medium text-slate-900 dark:text-slate-50">{t.description}</td>
                                        <td className="px-6 py-4 text-slate-500 dark:text-slate-400">#{t.category_id}</td>
                                        <td className={`px-6 py-4 text-right font-mono font-medium ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'expense' ? '-' : '+'} {formatCurrency(Math.abs(t.amount))}
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <Badge variant={t.type === 'income' ? 'success' : 'default'}>
                                                {t.type === 'income' ? 'Entrada' : 'Saída'}
                                            </Badge>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <button
                                                onClick={() => handleOpenModal(t)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors dark:hover:bg-indigo-900/30 dark:hover:text-indigo-400"
                                            >
                                                <Pencil size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>

                    {/* Mobile Card View */}
                    <div className="md:hidden space-y-4 p-4 bg-slate-50/50 dark:bg-slate-900/50">
                        {loading ? (
                            [1, 2, 3].map(i => (
                                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 h-24 animate-pulse dark:bg-slate-800 dark:border-slate-700" />
                            ))
                        ) : transactions.length === 0 ? (
                            <div className="flex flex-col items-center gap-2 py-8 text-slate-400">
                                <p>Nenhuma transação encontrada.</p>
                            </div>
                        ) : (
                            transactions.map((t) => (
                                <div key={t.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 space-y-3 dark:bg-slate-900 dark:border-slate-800">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h4 className="font-semibold text-slate-900 dark:text-slate-50">{t.description}</h4>
                                            <p className="text-xs text-slate-500 dark:text-slate-400">{formatDate(t.date)} • #{t.category_id}</p>
                                        </div>
                                        <Badge variant={t.type === 'income' ? 'success' : 'default'}>
                                            {t.type === 'income' ? 'Entrada' : 'Saída'}
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center pt-2 border-t border-slate-50 dark:border-slate-800">
                                        <span className={`font-mono font-bold ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}`}>
                                            {t.type === 'expense' ? '-' : '+'} {formatCurrency(Math.abs(t.amount))}
                                        </span>
                                        <Button size="sm" variant="ghost" onClick={() => handleOpenModal(t)}>
                                            <Pencil size={16} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </CardContent>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Transação" : "Nova Transação"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Descrição"
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        required
                    />
                    <div className="grid grid-cols-2 gap-4">
                        <Input
                            label="Valor (R$)"
                            type="number"
                            step="0.01"
                            value={formData.amount}
                            onChange={e => setFormData({ ...formData, amount: e.target.value })}
                            required
                        />
                        <Input
                            label="Data"
                            type="date"
                            value={formData.date}
                            onChange={e => setFormData({ ...formData, date: e.target.value })}
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <Select
                            label="Tipo"
                            value={formData.type}
                            onChange={e => setFormData({ ...formData, type: e.target.value })}
                            options={[
                                { value: 'expense', label: 'Saída' },
                                { value: 'income', label: 'Entrada' }
                            ]}
                        />
                        <Select
                            label="Categoria"
                            value={formData.category_id}
                            onChange={e => setFormData({ ...formData, category_id: e.target.value })}
                            options={[
                                { value: 1, label: 'Geral' },
                                { value: 2, label: 'Alimentação' },
                                { value: 3, label: 'Transporte' },
                                { value: 4, label: 'Salário' }
                            ]}
                        />
                    </div>
                    <div className="pt-2 flex justify-end gap-3">
                        <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                        <Button type="submit">Salvar</Button>
                    </div>
                </form>
            </Modal>
        </Card>
    );
}
