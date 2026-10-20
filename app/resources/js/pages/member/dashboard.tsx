import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BarChart3, CalendarDays, CircleCheck, ShieldCheck, UserRound, Wallet } from 'lucide-react';

interface MemberDashboardProps {
    auth: { user: User };
}

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mon espace', href: '/mon-espace' }];

export default function MemberDashboard({ auth }: MemberDashboardProps) {
    const canOpenAdministration = auth.user.role === 'administrator' || auth.user.role === 'manager';

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon espace" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11">
                        <span className="adf-eyebrow text-blue-200">Votre espace personnel</span>
                        <div className="mt-4 flex flex-wrap items-end justify-between gap-6">
                            <div>
                                <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Bonjour, {auth.user.name}.</h1>
                                <p className="mt-3 max-w-xl text-sm leading-6 text-blue-100/75 sm:text-base">
                                    Bienvenue dans votre espace Amis de foot. Votre profil est prêt ; les prochains services du club arriveront ici.
                                </p>
                            </div>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-2 text-xs font-bold text-blue-100 backdrop-blur-xl">
                                <CircleCheck className="size-4" /> Compte actif
                            </span>
                        </div>
                    </section>
                </Reveal>

                <div className="grid gap-4 md:grid-cols-3">
                    <Reveal delay={0.08}>
                        <Link
                            href={route('profile.edit')}
                            className="adf-soft-panel group focus-visible:outline-primary flex h-full flex-col rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <UserRound className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Mon profil</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Consultez vos coordonnées et gardez vos informations à jour.
                            </p>
                            <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-bold">
                                Ouvrir mon profil <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Reveal>
                    <Reveal delay={0.15}>
                        <Link
                            href={route('member.membership')}
                            className="adf-soft-panel group flex h-full flex-col rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-1"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-700">
                                <CalendarDays className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Mon adhésion</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Déposez votre demande et suivez sa validation par l’administration.
                            </p>
                            <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-bold">
                                Suivre mon adhésion <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Reveal>
                    <Reveal delay={0.22}>
                        <Link
                            href={route('member.contributions')}
                            className="adf-soft-panel group flex h-full flex-col rounded-[26px] p-6 transition-transform duration-200 hover:-translate-y-1"
                        >
                            <span className="flex size-11 items-center justify-center rounded-2xl bg-sky-100 text-sky-700">
                                <Wallet className="size-5" />
                            </span>
                            <h2 className="mt-8 text-lg font-bold">Mes cotisations</h2>
                            <p className="text-muted-foreground mt-2 flex-1 text-sm leading-6">
                                Consultez vos périodes mensuelles réglées ou en attente.
                            </p>
                            <span className="text-primary mt-6 inline-flex items-center gap-2 text-sm font-bold">
                                Voir mes cotisations <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                            </span>
                        </Link>
                    </Reveal>
                </div>

                <Reveal delay={0.24}>
                    <Link href={route('member.statistics')} className="adf-soft-panel flex items-center justify-between gap-5 rounded-[26px] p-6">
                        <span className="flex items-center gap-4">
                            <BarChart3 className="size-7 text-blue-600" />
                            <span>
                                <strong className="block text-lg">Mes statistiques</strong>
                                <span className="text-muted-foreground text-sm">Mes adhésions, cotisations et reçus.</span>
                            </span>
                        </span>
                        <ArrowRight className="size-5 text-blue-600" />
                    </Link>
                </Reveal>

                {canOpenAdministration && (
                    <Reveal delay={0.28}>
                        <Link
                            href={route('admin.dashboard')}
                            className="adf-soft-panel hover:border-primary/40 focus-visible:outline-primary flex items-center justify-between gap-5 rounded-[24px] p-5 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 sm:p-6"
                        >
                            <span className="flex items-center gap-4">
                                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                    <ShieldCheck className="size-5" />
                                </span>
                                <span>
                                    <strong className="block text-sm">Espace administration</strong>
                                    <span className="text-muted-foreground mt-1 block text-xs">Gérer les accès du club avec votre rôle actuel.</span>
                                </span>
                            </span>
                            <ArrowRight className="text-primary size-5 shrink-0" />
                        </Link>
                    </Reveal>
                )}
            </main>
        </AppLayout>
    );
}
