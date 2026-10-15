import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

const settingsNavItems: NavItem[] = [
    { title: 'Profil', url: '/settings/profile', icon: null },
    { title: 'Mot de passe', url: '/settings/password', icon: null },
    { title: 'Apparence', url: '/settings/appearance', icon: null },
];

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
    const currentPath = usePage().url.split('?')[0];

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-8 sm:py-9">
            <div className="adf-scene rounded-[30px] px-6 py-9 sm:px-10">
                <p className="adf-eyebrow text-blue-200">Compte et préférences</p>
                <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Mes paramètres</h1>
                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75">
                    Vos coordonnées, votre sécurité et l’apparence de votre espace au même endroit.
                </p>
            </div>

            <div className="mt-6 grid gap-5 lg:grid-cols-[210px_minmax(0,1fr)]">
                <aside className="adf-soft-panel h-fit rounded-[24px] p-3">
                    <nav aria-label="Paramètres du compte" className="flex flex-wrap gap-1 lg:flex-col">
                        {settingsNavItems.map((item) => (
                            <Button
                                key={item.url}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn(
                                    'min-w-0 flex-1 justify-start lg:w-full lg:flex-none',
                                    currentPath === item.url && 'bg-accent text-accent-foreground',
                                )}
                            >
                                <Link href={item.url} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <div className="adf-soft-panel min-w-0 rounded-[24px] p-5 sm:p-8">
                    <section className="max-w-2xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
