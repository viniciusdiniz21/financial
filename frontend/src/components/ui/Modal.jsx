import { X } from 'lucide-react';
import { useEffect } from 'react';

export function Modal({ isOpen, onClose, title, children }) {
    if (!isOpen) return null;

    useEffect(() => {
        const handleEsc = (e) => {
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div
                className="bg-white dark:bg-gray-800 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200 border border-transparent dark:border-gray-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-gray-700">
                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white">{title}</h3>
                    <button
                        onClick={onClose}
                        className="p-1 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-700"
                    >
                        <X size={20} />
                    </button>
                </div>
                <div className="p-6 text-gray-900 dark:text-gray-100">
                    {children}
                </div>
            </div>
        </div>
    );
}

export function Button({ children, variant = "primary", className = "", ...props }) {
    const variants = {
        primary: "bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm",
        secondary: "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-sm dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-600",
        danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm",
        ghost: "hover:bg-slate-100 text-slate-600 dark:text-gray-400 dark:hover:text-indigo-400 dark:hover:bg-gray-800"
    };

    return (
        <button
            className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ label, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>}
            <input
                className={`w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 ${error
                    ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-500/20 dark:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30'
                    }`}
                {...props}
            />
            {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
        </div>
    );
}

export function Select({ label, options, error, ...props }) {
    return (
        <div className="space-y-1.5">
            {label && <label className="text-sm font-medium text-slate-700 dark:text-gray-300">{label}</label>}
            <select
                className={`w-full px-3 py-2 rounded-lg border bg-white focus:outline-none focus:ring-2 transition-all appearance-none dark:bg-gray-700 dark:text-white dark:border-gray-600 ${error
                    ? 'border-rose-300 focus:border-rose-300 focus:ring-rose-500/20 dark:border-rose-500'
                    : 'border-slate-200 focus:border-indigo-300 focus:ring-indigo-500/20 dark:focus:ring-indigo-500/30'
                    }`}
                {...props}
            >
                {options.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
            {error && <p className="text-xs text-rose-500 dark:text-rose-400">{error}</p>}
        </div>
    );
}
