import { useState, useEffect } from 'react';
import axios from 'axios';
import { Save, User as UserIcon, DollarSign, CreditCard } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { useAuth } from '../contexts/AuthContext';

export default function Settings() {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        base_salary: '',
        monthly_fixed_expenses: ''
    });

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
        headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
    });

    useEffect(() => {
        fetchUserData();
    }, []);

    const fetchUserData = async () => {
        try {
            const response = await api.get('/users/me');
            const data = response.data;
            setFormData({
                full_name: data.full_name || '',
                email: data.email || '',
                base_salary: data.base_salary || 0,
                monthly_fixed_expenses: data.monthly_fixed_expenses || 0
            });
        } catch (error) {
            console.error("Error fetching user data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const payload = {
                full_name: formData.full_name,
                base_salary: parseFloat(formData.base_salary),
                monthly_fixed_expenses: parseFloat(formData.monthly_fixed_expenses)
            };

            await api.put('/users/me', payload);
            alert("Configurações salvas com sucesso!");
        } catch (error) {
            console.error("Error saving settings:", error);
            alert("Erro ao salvar configurações.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="space-y-8 max-w-2xl mx-auto">
            <header>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-50">Configurações</h1>
                <p className="text-slate-500 mt-1 dark:text-slate-400">Gerencie seu perfil e parâmetros financeiros.</p>
            </header>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <UserIcon size={20} className="text-indigo-600 dark:text-indigo-400" />
                        Perfil Financeiro
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid gap-4">
                            {/* Nome Completo */}
                            <div>
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Nome Completo
                                </label>
                                <input
                                    type="text"
                                    className="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400"
                                    value={formData.full_name}
                                    onChange={e => setFormData({ ...formData, full_name: e.target.value })}
                                />
                            </div>

                            {/* Email (Read Only) */}
                            <div className="opacity-60 cursor-not-allowed">
                                <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                    Email (Não editável)
                                </label>
                                <input
                                    type="email"
                                    readOnly
                                    className="w-full rounded-md shadow-sm sm:text-sm p-2.5 border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
                                    value={formData.email}
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                {/* Salário Base */}
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Salário Base Mensal (R$)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 pl-10"
                                            value={formData.base_salary}
                                            onChange={e => setFormData({ ...formData, base_salary: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                                            <DollarSign size={16} />
                                        </div>
                                    </div>
                                </div>

                                {/* Gastos Fixos */}
                                <div className="relative">
                                    <label className="block text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">
                                        Gasto Fixo Mensal (R$)
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            className="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm p-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-400 pl-10"
                                            value={formData.monthly_fixed_expenses}
                                            onChange={e => setFormData({ ...formData, monthly_fixed_expenses: e.target.value })}
                                        />
                                        <div className="absolute left-3 top-2.5 text-gray-400 dark:text-gray-500">
                                            <CreditCard size={16} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {saving ? 'Salvando...' : (
                                    <span className="flex items-center">
                                        <Save size={18} className="mr-2" />
                                        Salvar Alterações
                                    </span>
                                )}
                            </button>
                        </div>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
}
