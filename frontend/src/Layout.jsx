import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Home, PieChart as PieChartIcon, ArrowLeftRight, Wallet, LogOut, User as UserIcon, Settings, Sun, Moon } from 'lucide-react';
import { cn } from './lib/utils';
import { Button } from './components/ui/Button';
import { useAuth } from './contexts/AuthContext';
import { useTheme } from './hooks/useTheme';

const SidebarItem = ({ icon: Icon, label, to, active }) => (
    <NavLink
        to={to}
        className={cn(
            "flex items-center gap-3 px-4 py-3 text-sm font-medium transition-all duration-200 rounded-lg group",
            active
                ? "bg-indigo-50 text-indigo-700 shadow-sm dark:bg-indigo-900/30 dark:text-indigo-300"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-200"
        )}
    >
        <Icon
            size={20}
            className={cn(
                "transition-colors duration-200",
                active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 group-hover:text-slate-600 dark:text-slate-500 dark:group-hover:text-slate-300"
            )}
        />
        {label}
    </NavLink>
);

export default function Layout() {
    const location = useLocation();
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const menuItems = [
        { icon: Home, label: 'Dashboard', to: '/' },
        { icon: ArrowLeftRight, label: 'Transações', to: '/transactions' },
        { icon: PieChartIcon, label: 'Investimentos', to: '/investments' },
        { icon: Wallet, label: 'Categorias', to: '/categories' },
        { icon: Settings, label: 'Configurações', to: '/settings' },
    ];

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="flex min-h-screen w-full bg-slate-50 font-sans pb-16 md:pb-0 dark:bg-slate-950 transition-colors duration-300">
            {/* Floating Sidebar - Desktop Only */}
            <aside className="fixed left-4 top-4 bottom-4 w-72 hidden md:flex flex-col bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 z-10 overflow-hidden ring-1 ring-slate-200/50 dark:bg-slate-900/80 dark:border-slate-800 dark:ring-slate-800">
                <div className="p-6">
                    <NavLink to="/" className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <span className="font-bold text-lg">F</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-slate-900 tracking-tight leading-none dark:text-white">Finanças</h1>
                            <span className="text-xs text-slate-500 font-medium tracking-wide dark:text-slate-400">PREMIUM</span>
                        </div>
                    </NavLink>

                    <nav className="space-y-1.5">
                        {menuItems.map((item) => (
                            <SidebarItem
                                key={item.to}
                                {...item}
                                active={location.pathname === item.to}
                            />
                        ))}
                    </nav>
                </div>

                <div className="p-4 border-t border-slate-100 mt-auto dark:border-slate-800 space-y-4">
                    {/* Theme Toggle */}
                    <Button
                        variant="ghost"
                        onClick={toggleTheme}
                        className="w-full justify-start text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
                    >
                        {theme === 'dark' ? <Sun size={20} className="mr-3" /> : <Moon size={20} className="mr-3" />}
                        {theme === 'dark' ? 'Modo Claro' : 'Modo Escuro'}
                    </Button>

                    <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-50 border border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold dark:bg-indigo-900 dark:text-indigo-300">
                            {user?.full_name ? user.full_name.charAt(0).toUpperCase() : <UserIcon size={20} />}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-slate-900 truncate dark:text-slate-100">
                                {user?.full_name || 'Usuário'}
                            </p>
                            <p className="text-xs text-slate-500 truncate dark:text-slate-400">
                                {user?.email || 'email@exemplo.com'}
                            </p>
                        </div>
                    </div>

                    <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:text-slate-400 dark:hover:bg-rose-900/20" onClick={handleLogout}>
                        <LogOut size={20} className="mr-3" />
                        Sair
                    </Button>
                </div>
            </aside>

            {/* Bottom Navigation Bar - Mobile Only */}
            <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-3 md:hidden z-50 dark:bg-slate-900 dark:border-slate-800">
                {menuItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.to;
                    return (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            className={cn(
                                "flex flex-col items-center gap-1 p-2 rounded-lg transition-colors",
                                isActive ? "text-indigo-600 dark:text-indigo-400" : "text-slate-400 dark:text-slate-500"
                            )}
                        >
                            <Icon size={24} className={isActive ? "fill-indigo-100 dark:fill-indigo-900" : ""} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </NavLink>
                    );
                })}
                {/* Mobile Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="flex flex-col items-center gap-1 p-2 rounded-lg transition-colors text-slate-400 dark:text-slate-500"
                >
                    {theme === 'dark' ? <Sun size={24} /> : <Moon size={24} />}
                    <span className="text-[10px] font-medium">Tema</span>
                </button>
            </nav>

            {/* Main Content Area */}
            <main className="flex-1 md:ml-80 min-h-screen p-4 md:p-8">
                <div className="max-w-7xl mx-auto animate-in fade-in duration-500 slide-in-from-bottom-4">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
