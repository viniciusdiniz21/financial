import { useState, useEffect } from 'react';
import { Calendar } from 'lucide-react';
import { Button } from './ui/Button';
import { Select } from './ui/Modal'; // Recycling reusable Select logic

export default function DateRangeFilter({ onChange }) {
    const [selectedPreset, setSelectedPreset] = useState('this_month');
    const [dates, setDates] = useState({ start: '', end: '' });

    // Presets Logic
    useEffect(() => {
        applyPreset(selectedPreset);
    }, [selectedPreset]);

    const applyPreset = (preset) => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();

        let start, end;

        switch (preset) {
            case 'this_month':
                // First day to Last day of current month
                start = new Date(year, month, 1);
                end = new Date(year, month + 1, 0);
                break;
            case 'last_month':
                start = new Date(year, month - 1, 1);
                end = new Date(year, month, 0);
                break;
            case 'last_90_days':
                end = now;
                start = new Date(now);
                start.setDate(now.getDate() - 90);
                break;
            case 'this_year':
                start = new Date(year, 0, 1);
                end = new Date(year, 11, 31);
                break;
            case 'custom':
                // Reset or keep previous? Let's just return to avoid auto-firing
                return;
            default:
                return;
        }

        // Format to YYYY-MM-DD
        const formatDate = (d) => d.toISOString().split('T')[0];

        if (start && end) {
            const newDates = { start: formatDate(start), end: formatDate(end) };
            setDates(newDates);

            // Only fire update if not custom. Constants fire immediately.
            if (onChange) onChange(newDates);
        }
    };

    const handleCustomChange = (field, value) => {
        const newDates = { ...dates, [field]: value };
        setDates(newDates);

        // Fire onChange if both present? Or check validity?
        if (newDates.start && newDates.end) {
            if (onChange) onChange(newDates);
        }
    };

    return (
        <div className="flex flex-col sm:flex-row gap-2 items-center bg-white dark:bg-gray-800 p-2 rounded-lg border border-slate-100 dark:border-gray-700 shadow-sm">
            <div className="flex items-center gap-2">
                <Calendar size={18} className="text-slate-500 dark:text-gray-400" />
                <select
                    className="bg-transparent border-none outline-none text-sm font-medium text-slate-700 dark:text-gray-200 focus:ring-0 cursor-pointer"
                    value={selectedPreset}
                    onChange={(e) => setSelectedPreset(e.target.value)}
                >
                    <option value="this_month">Este Mês</option>
                    <option value="last_month">Mês Passado</option>
                    <option value="last_90_days">Últimos 90 Dias</option>
                    <option value="this_year">Este Ano</option>
                    <option value="custom">Personalizado</option>
                </select>
            </div>

            {selectedPreset === 'custom' && (
                <div className="flex items-center gap-2 animate-in fade-in slide-in-from-left-2 duration-200">
                    <input
                        type="date"
                        className="text-xs px-2 py-1.5 rounded border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                        value={dates.start}
                        onChange={(e) => handleCustomChange('start', e.target.value)}
                    />
                    <span className="text-slate-400">-</span>
                    <input
                        type="date"
                        className="text-xs px-2 py-1.5 rounded border border-slate-200 dark:border-gray-600 bg-slate-50 dark:bg-gray-700 text-slate-700 dark:text-gray-200 focus:outline-none focus:border-indigo-500"
                        value={dates.end}
                        onChange={(e) => handleCustomChange('end', e.target.value)}
                    />
                </div>
            )}
        </div>
    );
}
