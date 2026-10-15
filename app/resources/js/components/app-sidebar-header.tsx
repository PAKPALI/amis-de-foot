import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAppearance } from '@/hooks/use-appearance';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { Moon, Sun } from 'lucide-react';
import { useEffect, useState } from 'react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const { auth } = usePage<SharedData>().props;
    const { appearance, updateAppearance } = useAppearance();
    const [systemAppearance, setSystemAppearance] = useState<'light' | 'dark'>('light');
    const initial = auth.user?.name?.trim().charAt(0).toUpperCase() || 'M';
    const isDark = appearance === 'dark' || (appearance === 'system' && systemAppearance === 'dark');
    const nextAppearance = isDark ? 'light' : 'dark';
    const themeLabel = `Activer le mode ${nextAppearance === 'dark' ? 'sombre' : 'clair'}`;

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const syncSystemAppearance = () => setSystemAppearance(mediaQuery.matches ? 'dark' : 'light');

        syncSystemAppearance();
        mediaQuery.addEventListener('change', syncSystemAppearance);

        return () => mediaQuery.removeEventListener('change', syncSystemAppearance);
    }, []);

    return (
        <header className="adf-floating-topbar adf-chrome-orbit mx-3 mt-3 flex min-h-[72px] shrink-0 items-center justify-between gap-3 rounded-[22px] px-3 sm:mx-4 sm:mt-4 sm:px-5">
            <div className="flex min-w-0 items-center gap-3 sm:gap-4">
                <SidebarTrigger className="adf-topbar-trigger shrink-0" aria-label="Ouvrir ou réduire le menu" />
                <span className="bg-border/80 h-8 w-px shrink-0" aria-hidden="true" />
                <div className="min-w-0">
                    <p className="text-muted-foreground hidden text-[10px] font-bold tracking-[0.18em] uppercase sm:block">
                        Amis de foot · Espace privé
                    </p>
                    <div className="truncate text-sm font-semibold sm:mt-1 sm:text-base">
                        <Breadcrumbs breadcrumbs={breadcrumbs} />
                    </div>
                </div>
            </div>

            <div className="flex shrink-0 items-center gap-1.5">
                <button
                    type="button"
                    className="adf-topbar-theme-toggle flex size-10 items-center justify-center rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                    onClick={() => updateAppearance(nextAppearance)}
                    aria-label={themeLabel}
                    title={themeLabel}
                >
                    {isDark ? <Sun className="size-4" aria-hidden="true" /> : <Moon className="size-4" aria-hidden="true" />}
                </button>

                <Link
                    href="/settings/profile"
                    prefetch
                    className="adf-topbar-account group flex min-w-0 shrink-0 items-center gap-2 rounded-full p-1 pr-1.5 transition-colors sm:pr-3"
                    aria-label={`Ouvrir le profil de ${auth.user?.name ?? 'membre'}`}
                >
                    <span
                        className="adf-topbar-avatar flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-extrabold"
                        aria-hidden="true"
                    >
                        {initial}
                    </span>
                    <span className="hidden max-w-32 truncate text-xs font-semibold sm:block">{auth.user?.name}</span>
                </Link>
            </div>
        </header>
    );
}
