import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, ClipboardList, LockKeyhole, ShieldCheck, UsersRound } from 'lucide-react';

interface AdministrationDashboardProps {
    auth: { user: User };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Administration', href: '/administration' }];

export default function AdministrationDashboard({ auth }: AdministrationDashboardProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Administration" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11">
                        <span className="adf-eyebrow text-blue-200">Administration du club</span>
                        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Pilotez le club, ensemble.</h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-base">
                                    Bienvenue, {auth.user.name}. Retrouvez ici les outils disponibles pour gérer les accès des membres.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-blue-100 backdrop-blur-xl">
                                <ShieldCheck className="size-4" /> Accès autorisé
                            </span>
                        </div>
                    </section>
                </Reveal>

                <div className="grid gap-4 md:grid-cols-3">
                    <Reveal delay={0.08}>
                        <Link
                            href={route('admin.roles')}
                            className="adf-soft-panel group focus-visible:outline-primary flex h-full flex-col rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <UsersRound className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Accès et rôles</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Consultez les comptes, gérez les rôles autorisés et réinitialisez l’accès d’un membre.
                            </p>
                            <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-bold">
                                Ouvrir la gestion <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <Link
                            href={route('admin.memberships')}
                            className="adf-soft-panel group flex h-full flex-col rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-1"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                                <ClipboardList className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Adhésions</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Vérifiez le règlement unique de 1 000 FCFA et approuvez les nouveaux membres.
                            </p>
                            <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-bold">
                                Traiter les demandes <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Reveal>
                    <Reveal delay={0.22}>
                        <article className="adf-soft-panel flex h-full flex-col rounded-[26px] p-6">
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                                <LockKeyhole className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Opérations suivies</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Les changements de rôle et les réinitialisations d’accès sont déjà journalisés.
                            </p>
                            <span className="text-muted-foreground mt-6 text-xs font-bold tracking-[0.14em] uppercase">En service</span>
                        </article>
                    </Reveal>
                </div>

                <Reveal delay={0.28}>
                    <Link
                        href={route('member.dashboard')}
                        className="adf-soft-panel text-primary hover:border-primary/40 focus-visible:outline-primary inline-flex items-center gap-2 self-start rounded-2xl px-5 py-3 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2"
                    >
                        Revenir à mon espace membre <ArrowRight className="size-4" />
                    </Link>
                </Reveal>
            </main>
        </AppLayout>
    );
}
