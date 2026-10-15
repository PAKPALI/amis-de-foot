import { Brand } from '@/components/brand';
import { Reveal } from '@/components/ui/reveal';
import { Link } from '@inertiajs/react';
import { ArrowLeft, LockKeyhole, Sparkles } from 'lucide-react';

interface AuthLayoutProps {
    children: React.ReactNode;
    title?: string;
    description?: string;
}

export default function AuthSimpleLayout({ children, title, description }: AuthLayoutProps) {
    return (
        <div className="adf-scene adf-auth-scene min-h-svh px-4 py-5 sm:px-6 sm:py-8">
            <div className="adf-auth-photo" aria-hidden="true" />
            <div className="adf-auth-scrim" aria-hidden="true" />
            <div className="mx-auto max-w-6xl">
                <header className="flex items-center justify-between gap-4">
                    <Link
                        href={route('home')}
                        aria-label="Accueil Amis de foot"
                        className="rounded-xl focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white"
                    >
                        <Brand onDark />
                    </Link>
                    <Link
                        href={route('home')}
                        className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
                    >
                        <ArrowLeft className="size-4" />
                        <span className="hidden sm:inline">Retour à l’accueil</span>
                        <span className="sm:hidden">Accueil</span>
                    </Link>
                </header>

                <div className="grid items-stretch gap-8 py-10 lg:grid-cols-[1.04fr_0.96fr] lg:gap-14 lg:py-14">
                    <Reveal className="hidden lg:block">
                        <aside className="adf-glass-dark flex h-full flex-col justify-between rounded-[32px] p-10 xl:p-12">
                            <div>
                                <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-blue-200/25 bg-blue-200/10 px-4 py-2 text-xs font-bold tracking-[0.18em] text-blue-100 uppercase">
                                    <Sparkles className="size-4" />
                                    Une nouvelle expérience du club
                                </div>
                                <h2 className="max-w-lg text-5xl leading-[1.05] font-extrabold tracking-[-0.055em] text-white">
                                    Les grandes histoires commencent ensemble.
                                </h2>
                                <p className="mt-6 max-w-md text-base leading-7 text-blue-100/75">
                                    Un espace pour retrouver votre équipe, gérer votre profil et suivre la vie d’Amis de foot, simplement.
                                </p>
                            </div>

                            <div className="relative my-9 h-56 overflow-hidden rounded-[26px] border border-white/15 bg-gradient-to-br from-blue-500/35 via-indigo-700/30 to-blue-950/75 p-5">
                                <div className="adf-pitch absolute inset-5 rotate-[-6deg] rounded-[18px]" />
                                <div className="absolute top-1/2 left-1/2 z-10 flex size-20 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-white/35 bg-white/15 text-4xl text-white shadow-[0_15px_45px_rgba(2,9,40,0.35)] backdrop-blur-xl">
                                    <span aria-hidden="true">✦</span>
                                </div>
                                <div className="absolute right-4 bottom-4 z-10 rounded-2xl border border-white/20 bg-[#0b1e50]/75 px-4 py-3 text-sm font-semibold text-white backdrop-blur-xl">
                                    L’esprit d’équipe, partout.
                                </div>
                            </div>

                            <div className="flex items-center gap-3 border-t border-white/15 pt-6 text-sm text-blue-100/75">
                                <LockKeyhole className="size-4 text-blue-200" />
                                Votre espace personnel, accessible à tout moment.
                            </div>
                        </aside>
                    </Reveal>

                    <Reveal delay={0.08} className="mx-auto flex w-full max-w-xl items-center lg:max-w-none">
                        <section className="adf-auth-card w-full rounded-[32px] px-6 py-8 sm:px-10 sm:py-10 xl:px-12">
                            <div className="adf-eyebrow mb-4 text-blue-100">Espace membre</div>
                            <h1 className="max-w-md text-3xl leading-tight font-extrabold tracking-[-0.045em] sm:text-4xl">{title}</h1>
                            {description && <p className="text-muted-foreground mt-3 max-w-md text-sm leading-6">{description}</p>}
                            <div className="mt-8">{children}</div>
                            <p className="mt-8 border-t border-white/20 pt-5 text-center text-xs text-blue-50/75">Amis de foot · Le club, ensemble</p>
                        </section>
                    </Reveal>
                </div>
            </div>
            <footer className="relative z-10 mx-auto mt-2 max-w-6xl text-center text-[11px] text-blue-50/75">
                Photo :{' '}
                <a
                    className="underline decoration-white/40 underline-offset-2 hover:text-white"
                    href="https://commons.wikimedia.org/wiki/File:Cristiano_Ronaldo_and_Lionel_Messi_-_Portugal_vs_Argentina,_9th_February_2011.jpg"
                    target="_blank"
                    rel="noreferrer"
                >
                    Fanny Schertzer / Wikimedia Commons
                </a>{' '}
                · recadrée et assombrie ·{' '}
                <a
                    className="underline decoration-white/40 underline-offset-2 hover:text-white"
                    href="https://creativecommons.org/licenses/by/3.0/"
                    target="_blank"
                    rel="noreferrer"
                >
                    CC BY 3.0
                </a>
            </footer>
        </div>
    );
}
