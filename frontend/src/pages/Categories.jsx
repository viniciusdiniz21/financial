import { useState, useEffect } from 'react';
import axios from 'axios';
import { Wallet, Circle, Plus, Pencil } from 'lucide-react';
import { Card, CardContent } from '../components/ui/Card';
import { Modal, Button, Input, Select } from '../components/ui/Modal';

export default function Categories() {
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [formData, setFormData] = useState({ name: '', type: 'expense', icon: 'circle' });

    const getAuthHeaders = () => {
        const token = localStorage.getItem('token');
        return token ? { 'Authorization': `Bearer ${token}` } : {};
    };

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
        headers: getAuthHeaders()
    });

    const fetchCategories = async () => {
        try {
            const response = await api.get('/categories/');
            setCategories(response.data);
        } catch (error) {
            console.error("Error fetching categories:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const handleOpenModal = (item = null) => {
        if (item) {
            setEditingItem(item);
            setFormData({ name: item.name, type: item.type, icon: item.icon || 'circle' });
        } else {
            setEditingItem(null);
            setFormData({ name: '', type: 'expense', icon: 'circle' });
        }
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editingItem) {
                await api.put(`/categories/${editingItem.id}`, formData);
            } else {
                await api.post('/categories/', formData);
            }
            setIsModalOpen(false);
            fetchCategories();
        } catch (error) {
            console.error("Error saving category:", error);
            alert("Erro ao salvar categoria");
        }
    };

    const getIcon = (iconName) => Circle; // Simplification

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-50">Categorias</h1>
                <Button onClick={() => handleOpenModal()}>
                    <Plus size={18} />
                    Nova Categoria
                </Button>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-32 bg-slate-200 rounded-xl animate-pulse dark:bg-slate-800" />)}
                </div>
            ) : categories.length === 0 ? (
                <div className="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200 dark:bg-slate-800/50 dark:border-slate-800">
                    <div className="p-3 bg-white inline-flex rounded-full shadow-sm text-slate-400 mb-3 dark:bg-slate-800 dark:text-slate-500">
                        <Wallet size={24} />
                    </div>
                    <p className="text-slate-500 dark:text-slate-400">Nenhuma categoria encontrada.</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {categories.map((cat) => {
                        const Icon = getIcon(cat.icon);
                        return (
                            <Card key={cat.id} className="group hover:shadow-md transition-all border-slate-200 relative dark:border-slate-800">
                                <button
                                    onClick={() => handleOpenModal(cat)}
                                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white shadow-sm text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity dark:bg-slate-800 dark:text-slate-500 dark:hover:text-indigo-400"
                                >
                                    <Pencil size={14} />
                                </button>
                                <CardContent className="p-6 flex flex-col items-center justify-center gap-3 text-center">
                                    <div className={`p-3 rounded-full ${cat.type === 'income' ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-400'
                                        }`}>
                                        <Icon size={24} />
                                    </div>
                                    <h3 className="font-medium text-slate-700 dark:text-slate-200">{cat.name}</h3>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editingItem ? "Editar Categoria" : "Nova Categoria"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input
                        label="Nome"
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        required
                    />
                    <Select
                        label="Tipo"
                        value={formData.type}
                        onChange={e => setFormData({ ...formData, type: e.target.value })}
                        options={[
                            { value: 'expense', label: 'Despesa' },
                            { value: 'income', label: 'Receita' }
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
