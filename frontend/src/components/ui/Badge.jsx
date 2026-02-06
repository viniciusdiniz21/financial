import { cn } from '../../lib/utils';

export function Badge({
    className,
    variant = 'default',
    children,
    ...props
}) {
    const variants = {
        default: 'bg-slate-100 text-slate-800',
        primary: 'bg-indigo-50 text-indigo-700',
        success: 'bg-emerald-50 text-emerald-700',
        warning: 'bg-amber-50 text-amber-700',
        error: 'bg-rose-50 text-rose-700',
    };

    return (
        <span
            className={cn(
                "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors",
                variants[variant],
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
}
