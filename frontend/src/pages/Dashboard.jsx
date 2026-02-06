import { useState, useEffect } from 'react';
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, Calendar, MoreHorizontal, PieChart as PieChartIcon } from 'lucide-react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Utils
const formatCurrency = (value) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);

const formatDate = (dateString) =>
    new Intl.DateTimeFormat('pt-BR').format(new Date(dateString));

// Mock Data for Charts (keep static for now as requested only Summary/Transactions integration)
const PIE_DATA = [
    { name: 'Moradia', value: 2500, color: '#10b981' },
    { name: 'Alimentação', value: 1200, color: '#6366f1' },
    { name: 'Lazer', value: 800, color: '#f59e0b' },
    { name: 'Transporte', value: 450, color: '#f43f5e' },
];

const MONTHLY_DATA = [
    { name: 'Jan', income: 5000, expense: 3200 },
    { name: 'Fev', income: 5200, expense: 4100 },
    { name: 'Mar', income: 4800, expense: 2900 },
];

const KPICard = ({ title, value, icon: Icon, trend, type, loading }) => (
    <Card className="hover:shadow-md transition-shadow">
        <CardContent className="p-6">
            <div className="flex items-center justify-between space-y-0 pb-2">
                <span className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</span>
                <div className={`p-2 rounded-full ${type === 'income' ? 'bg-emerald-50 text-emerald-600' :
                    type === 'expense' ? 'bg-rose-50 text-rose-500' : 'bg-indigo-50 text-indigo-600'
                    }`}>
                    <Icon size={16} />
                </div>
            </div>
            <div className="flex flex-col gap-1">
                {loading ? (
                    <div className="h-8 w-32 bg-slate-200 rounded animate-pulse" />
                ) : (
                    <div className="text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-slate-50">{value}</div>
                )}
                {/* Trend hardcoded for now or fetched if API provides */}
            </div>
        </CardContent>
    </Card>
);

// ... imports ...

export default function Dashboard() {
    const navigate = useNavigate();
    const [summary, setSummary] = useState(null);
    const [recentTransactions, setRecentTransactions] = useState([]);

    // New State for Charts
    const [chartData, setChartData] = useState({ history: [], categories: [] });

    const [loading, setLoading] = useState(true);

    const api = axios.create({
        baseURL: 'http://localhost:8000/api/v1',
    });

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) return;

                api.defaults.headers.common['Authorization'] = `Bearer ${token}`;

                const [summaryRes, transactionsRes, chartsRes] = await Promise.all([
                    api.get('/dashboard/'), // Fixed: endpoint is /dashboard/ (root of router)
                    api.get('/transactions/?limit=5'),
                    api.get('/dashboard/charts') // New endpoint
                ]);

                setSummary(summaryRes.data);
                setRecentTransactions(transactionsRes.data);
                setChartData(chartsRes.data);
            } catch (error) {
                console.error("Error fetching dashboard data:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    // Helper for Empty Chart State
    const EmptyChart = ({ message }) => (
        <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <PieChartIcon size={48} className="mb-2 opacity-20" />
            <p className="text-sm font-medium">{message}</p>
        </div>
    );

    return (
        <div className="space-y-8">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight dark:text-slate-50">Visão Geral</h1>
                    <p className="text-slate-500 mt-1 dark:text-slate-400">Acompanhe suas métricas financeiras.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="secondary" size="sm">
                        <Calendar size={16} className="mr-2" />
                        {/* Dynamic Month/Year could be added here */}
                        Mês Atual
                    </Button>
                    <Button size="sm" onClick={() => navigate('/transactions')}>
                        <Wallet size={16} className="mr-2" />
                        Nova Transação
                    </Button>
                </div>
            </header>

            {/* KPI Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <KPICard
                    title="Receita Total"
                    value={formatCurrency(summary?.current_balance)}
                    icon={Wallet}
                    type="balance"
                    loading={loading}
                />
            </div>

            {/* Charts Section - Bento Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                {/* Evolution Chart (2/3 width) */}
                <Card className="lg:col-span-2 flex flex-col">
                    <CardHeader>
                        <CardTitle>Evolução Financeira (Últimos 6 Meses)</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0">
                        {chartData.history.length > 0 ? (
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={chartData.history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }} barGap={8}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="month"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12 }}
                                        dy={10}
                                    />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'JetBrains Mono' }}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{
                                            borderRadius: '12px',
                                            border: '1px solid #e2e8f0',
                                            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                                            fontFamily: 'Inter',
                                            fontSize: '12px'
                                        }}
                                        formatter={(value) => formatCurrency(value)}
                                    />
                                    <Bar dataKey="income" name="Receitas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                    <Bar dataKey="expense" name="Despesas" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : (
                            <EmptyChart message="Sem dados de histórico" />
                        )}
                    </CardContent>
                </Card>

                {/* Categories Pie Chart (1/3 width) */}
                <Card className="flex flex-col">
                    <CardHeader>
                        <CardTitle>Gastos por Categoria</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 min-h-0 relative">
                        {chartData.categories.length > 0 ? (
                            <>
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={chartData.categories}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={5}
                                            dataKey="value"
                                        >
                                            {chartData.categories.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                                            formatter={(value) => formatCurrency(value)}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                                {/* Custom Legend */}
                                <div className="absolute bottom-0 left-0 right-0 flex justify-center gap-4 flex-wrap">
                                    {chartData.categories.slice(0, 3).map(item => (
                                        <div key={item.name} className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-xs text-slate-500 font-medium">{item.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <EmptyChart message="Sem gastos registrados" />
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Transactions Table */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle>Últimas Transações</CardTitle>
                    <Button variant="ghost" size="sm" className="text-slate-500 dark:text-slate-400 dark:hover:text-indigo-400" onClick={() => navigate('/transactions')}>
                        Ver todas <MoreHorizontal size={16} className="ml-1" />
                    </Button>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left">
                            <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 border-b border-slate-100 dark:bg-slate-900/50 dark:border-slate-800 dark:text-slate-400">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Descrição</th>
                                    <th className="px-4 py-3 font-medium">Categoria</th>
                                    <th className="px-4 py-3 font-medium">Data</th>
                                    <th className="px-4 py-3 font-medium text-right">Valor</th>
                                    <th className="px-4 py-3 font-medium text-center">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                                {loading && recentTransactions.length === 0 ? (
                                    // Skeleton Rows
                                    [1, 2, 3].map(i => (
                                        <tr key={i}>
                                            <td colSpan={5} className="px-4 py-3"><div className="h-4 bg-slate-100 rounded w-full dark:bg-slate-800" /></td>
                                        </tr>
                                    ))
                                ) : (
                                    recentTransactions.map((t) => (
                                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors group dark:hover:bg-slate-800/50">
                                            <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-50">{t.description}</td>
                                            {/* Assuming t.category is an object after join, assume string for now or fix backend */}
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{t.category?.name || 'Geral'}</td>
                                            <td className="px-4 py-3 text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
                                            <td className={`px-4 py-3 text-right font-mono font-medium ${t.type === 'income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-50'
                                                }`}>
                                                {t.type === 'expense' ? '-' : '+'} {formatCurrency(Math.abs(t.amount))}
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <Badge variant={t.type === 'income' ? 'success' : 'default'}>
                                                    {t.type === 'income' ? 'Recebido' : 'Pago'}
                                                </Badge>
                                            </td>
                                        </tr>
                                    ))
                                )}
                                {!loading && recentTransactions.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-4 py-8 text-center text-slate-500 dark:text-slate-400">Nenhuma transação encontrada.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
