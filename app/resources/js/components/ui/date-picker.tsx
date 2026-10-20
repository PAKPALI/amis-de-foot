import { CalendarDays, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

type DatePickerProps = {
    label: string;
    value?: string;
    min?: string;
    align?: 'left' | 'right';
    onChange: (value: string) => void;
};

const weekdays = ['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'];
const months = Array.from({ length: 12 }, (_, month) => new Intl.DateTimeFormat('fr-FR', { month: 'long' }).format(new Date(2024, month, 1)));
const iso = (date: Date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const parse = (value: string) => {
    const [year, month, day] = value.split('-').map(Number);
    return new Date(year, month - 1, day);
};

export function DatePicker({ label, value, min, align = 'left', onChange }: DatePickerProps) {
    const [open, setOpen] = useState(false);
    const [shown, setShown] = useState(() => (value ? parse(value) : new Date()));
    const root = useRef<HTMLDivElement>(null);
    const trigger = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (value) setShown(parse(value));
    }, [value]);

    useEffect(() => {
        if (!open) return;
        const closeOutside = (event: PointerEvent) => {
            if (root.current && !root.current.contains(event.target as Node)) setOpen(false);
        };
        const closeEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setOpen(false);
                trigger.current?.focus();
            }
        };
        document.addEventListener('pointerdown', closeOutside);
        document.addEventListener('keydown', closeEscape);
        return () => {
            document.removeEventListener('pointerdown', closeOutside);
            document.removeEventListener('keydown', closeEscape);
        };
    }, [open]);

    const year = shown.getFullYear();
    const month = shown.getMonth();
    const mondayOffset = (new Date(year, month, 1).getDay() + 6) % 7;
    const dayCount = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: mondayOffset + dayCount }, (_, index) => (index < mondayOffset ? null : index - mondayOffset + 1));
    const shift = (step: number) => setShown(new Date(year, month + step, 1));
    const choose = (date: Date) => {
        onChange(iso(date));
        setOpen(false);
        trigger.current?.focus();
    };
    const display = value
        ? new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }).format(parse(value))
        : 'Choisir une date';

    return (
        <div ref={root} className="relative min-w-0 text-sm font-semibold">
            <span id={`${label}-label`} className="block">
                {label}
            </span>
            <button
                ref={trigger}
                type="button"
                aria-label={`${label} : ${display}`}
                aria-expanded={open}
                aria-haspopup="dialog"
                onClick={() => setOpen(!open)}
                className="bg-background/75 mt-1 flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left shadow-sm transition-colors hover:border-blue-400 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none"
            >
                <span className={value ? '' : 'text-muted-foreground'}>{display}</span>
                <CalendarDays className="size-4 shrink-0 text-blue-600" />
            </button>
            {open && (
                <div
                    role="dialog"
                    aria-label={`Calendrier ${label.toLowerCase()}`}
                    className={`bg-background/95 absolute top-full left-0 z-50 mt-2 w-[min(21rem,calc(100vw-3rem))] rounded-2xl border border-blue-200/60 p-4 shadow-2xl backdrop-blur-xl dark:border-white/20 ${align === 'right' ? 'sm:right-0 sm:left-auto' : ''}`}
                >
                    <div className="mb-3 flex items-center justify-between gap-2">
                        <button
                            type="button"
                            aria-label="Mois précédent"
                            onClick={() => shift(-1)}
                            className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                        >
                            <ChevronLeft className="size-4" />
                        </button>
                        <div className="flex min-w-0 gap-1">
                            <select
                                aria-label="Mois"
                                value={month}
                                onChange={(event) => setShown(new Date(year, Number(event.target.value), 1))}
                                className="bg-background max-w-32 rounded-lg border px-1 py-1.5 capitalize"
                            >
                                {months.map((name, index) => (
                                    <option key={name} value={index}>
                                        {name}
                                    </option>
                                ))}
                            </select>
                            <select
                                aria-label="Année"
                                value={year}
                                onChange={(event) => setShown(new Date(Number(event.target.value), month, 1))}
                                className="bg-background rounded-lg border px-1 py-1.5"
                            >
                                {Array.from({ length: 101 }, (_, index) => year - 50 + index).map((option) => (
                                    <option key={option} value={option}>
                                        {option}
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button
                            type="button"
                            aria-label="Mois suivant"
                            onClick={() => shift(1)}
                            className="rounded-lg p-2 hover:bg-blue-100 dark:hover:bg-blue-900"
                        >
                            <ChevronRight className="size-4" />
                        </button>
                    </div>
                    <div className="text-muted-foreground grid grid-cols-7 gap-1 text-center text-xs">
                        {weekdays.map((day) => (
                            <span key={day} className="py-1">
                                {day}
                            </span>
                        ))}
                    </div>
                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {days.map((day, index) => {
                            if (!day) return <span key={`empty-${index}`} />;
                            const date = new Date(year, month, day);
                            const dateValue = iso(date);
                            const selected = dateValue === value;
                            const today = dateValue === iso(new Date());
                            return (
                                <button
                                    key={dateValue}
                                    type="button"
                                    disabled={Boolean(min && dateValue < min)}
                                    aria-label={new Intl.DateTimeFormat('fr-FR', { dateStyle: 'full' }).format(date)}
                                    aria-pressed={selected}
                                    onClick={() => choose(date)}
                                    className={`aspect-square rounded-lg text-sm transition-colors focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 ${selected ? 'bg-blue-700 font-bold text-white' : today ? 'border border-blue-500 text-blue-700 dark:text-blue-200' : 'hover:bg-blue-100 dark:hover:bg-blue-900'}`}
                                >
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                    <div className="mt-3 flex items-center justify-between border-t pt-3 text-xs">
                        <button
                            type="button"
                            onClick={() => choose(new Date())}
                            disabled={Boolean(min && iso(new Date()) < min)}
                            className="font-bold text-blue-700 disabled:opacity-30 dark:text-blue-200"
                        >
                            Aujourd’hui
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => {
                                    onChange('');
                                    setOpen(false);
                                    trigger.current?.focus();
                                }}
                                className="text-muted-foreground hover:text-foreground flex items-center gap-1"
                            >
                                <X className="size-3" /> Effacer
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
