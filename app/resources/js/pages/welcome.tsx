import AppLogoIcon from '@/components/app-logo-icon';
import { Brand } from '@/components/brand';
import { Reveal } from '@/components/ui/reveal';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowDown, ArrowRight, ArrowUpRight, CalendarDays, Flag, Heart, Pause, Play, ShieldCheck, UsersRound } from 'lucide-react';
import { useState } from 'react';

const universes = [
    {
        name: 'Le collectif',
        icon: UsersRound,
        tag: 'NOTRE FORCE',
        title: 'Des individualités. Un même maillot.',
        text: 'On vient pour le football. On reste pour les liens. Amis de foot rassemble celles et ceux qui partagent le goût du jeu et l’esprit d’équipe.',
        word: 'ENSEMBLE',
        number: '01',
    },
    {
        name: 'La passion',
        icon: Heart,
        tag: 'NOTRE MOTEUR',
        title: 'Le jeu nous anime. La passion nous unit.',
        text: 'Un beau geste, une passe juste, une émotion partagée. C’est cette énergie du football que nous voulons faire vivre, sur le terrain comme au quotidien.',
        word: 'PASSION',
        number: '02',
    },
    {
        name: 'L’esprit sportif',
        icon: Flag,
        tag: 'NOTRE ENGAGEMENT',
        title: 'Jouer avec envie. Avancer avec respect.',
        text: 'Le respect, l’entraide et le plaisir du jeu donnent du sens au collectif. Chacun a sa place dans une équipe qui avance ensemble.',
        word: 'RESPECT',
        number: '03',
    },
];

function Stadium() {
    return (
        <div className="adf-stadium" aria-hidden="true">
            <div className="adf-stadium-halo" />
            <div className="adf-stadium-beam adf-stadium-beam-left" />
            <div className="adf-stadium-beam adf-stadium-beam-right" />
            <div className="adf-stadium-ring adf-stadium-ring-outer" />
            <div className="adf-stadium-ring" />
            <svg className="adf-stadium-field" viewBox="0 0 600 440" fill="none">
                <defs>
                    <linearGradient id="pitch-fill" x1="300" y1="35" x2="300" y2="405" gradientUnits="userSpaceOnUse">
                        <stop stopColor="#103c83" />
                        <stop offset="1" stopColor="#071b43" />
                    </linearGradient>
                    <pattern id="pitch-stripes" width="60" height="440" patternUnits="userSpaceOnUse">
                        <rect width="30" height="440" fill="#b3e6ff" fillOpacity=".035" />
                    </pattern>
                </defs>
                <rect x="28" y="28" width="544" height="384" rx="16" fill="url(#pitch-fill)" stroke="#74caff" strokeOpacity=".5" />
                <rect x="28" y="28" width="544" height="384" rx="16" fill="url(#pitch-stripes)" />
                <g stroke="#9fddff" strokeWidth="1.5" strokeOpacity=".65">
                    <path d="M52 52H548V388H52Z M300 52V388 M52 126H128V314H52 M548 126H472V314H548 M52 172H85V268H52 M548 172H515V268H548" />
                    <circle cx="300" cy="220" r="57" />
                    <circle cx="300" cy="220" r="3" fill="#cceeff" />
                    <path d="M128 179Q165 220 128 261 M472 179Q435 220 472 261" />
                </g>
                <path
                    className="adf-pass-path"
                    d="M165 305L244 145L370 266L445 124"
                    stroke="#91e9ff"
                    strokeWidth="2"
                    strokeDasharray="6 9"
                    opacity=".65"
                />
                {[
                    [165, 305],
                    [244, 145],
                    [370, 266],
                    [445, 124],
                    [120, 220],
                    [330, 95],
                    [275, 345],
                ].map(([x, y], i) => (
                    <g key={i}>
                        <circle cx={x} cy={y} r="15" fill="#5caaff" fillOpacity=".13" />
                        <circle cx={x} cy={y} r="6" fill={i === 3 ? '#c2faff' : '#75bfff'} stroke="#e8faff" strokeWidth="2" />
                    </g>
                ))}
            </svg>
            <div className="adf-match-ball">
                <AppLogoIcon className="size-full" />
            </div>
            <div className="adf-stadium-caption">
                <span className="adf-live-dot" /> LE COLLECTIF PREND VIE
            </div>
            <span className="adf-stadium-coordinate">ADF / TERRAIN D’EXPRESSION</span>
        </div>
    );
}

type ArticlePreview = { id: number; title: string; slug: string; excerpt: string; coverImage: string | null; publishedAt: string };

export default function Welcome({ latestArticles = [] }: { latestArticles?: ArticlePreview[] }) {
    const { auth } = usePage<SharedData>().props;
    const [active, setActive] = useState(0);
    const [paused, setPaused] = useState(false);
    const universe = universes[active];
    const destination = auth.user ? route('member.dashboard') : route('register');
    return (
        <>
            <Head title="Amis de foot — Le collectif prend vie" />
            <div className="adf-home adf-scene min-h-svh" data-paused={paused}>
                <a href="#main" className="adf-skip-link">
                    Aller au contenu
                </a>
                <div className="adf-home-shell">
                    <header className="adf-home-header">
                        <Link href={route('home')} aria-label="Accueil Amis de foot">
                            <Brand onDark />
                        </Link>
                        <nav aria-label="Navigation principale" className="flex items-center gap-2 sm:gap-5">
                            <Link href={route('public.club')} className="adf-nav-link hidden md:inline-flex">Le club</Link>
                            <Link href={route('public.articles')} className="adf-nav-link hidden lg:inline-flex">Actualités</Link>
                            {!auth.user && (
                                <Link href={route('login')} className="adf-nav-link">
                                    Connexion
                                </Link>
                            )}
                            <Link href={destination} className="adf-home-button adf-home-button-small">
                                {auth.user ? 'Mon espace' : 'Rejoindre'}
                                <ArrowUpRight className="size-4" />
                            </Link>
                        </nav>
                    </header>
                    <main id="main">
                        <section className="adf-home-hero" aria-labelledby="hero-title">
                            <div className="adf-hero-copy">
                                <Reveal>
                                    <p className="adf-home-kicker">
                                        <span className="adf-live-dot" /> LE FOOTBALL SE VIT ENSEMBLE
                                    </p>
                                </Reveal>
                                <Reveal delay={0.08}>
                                    <h1 id="hero-title">
                                        Une passion.
                                        <br />
                                        Un collectif.
                                        <br />
                                        <span>Votre place.</span>
                                    </h1>
                                </Reveal>
                                <Reveal delay={0.16}>
                                    <p className="adf-hero-description">
                                        Les émotions du terrain. Les liens qui restent.
                                        <br className="hidden sm:block" /> Entrez dans l’univers d’Amis de foot et faites partie de l’équipe.
                                    </p>
                                </Reveal>
                                <Reveal delay={0.24} className="flex flex-wrap items-center gap-4">
                                    <Link href={destination} className="adf-home-button">
                                        {auth.user ? 'Retrouver mon espace' : 'Entrer dans le collectif'}
                                        <ArrowRight className="size-4" />
                                    </Link>
                                    <a href="#concept" className="adf-discover-link">
                                        Explorer le club <ArrowDown className="size-4" />
                                    </a>
                                </Reveal>
                                <div className="adf-hero-note">
                                    <ShieldCheck className="size-4 shrink-0" />
                                    <span>Un compte personnel. Un club qui nous rassemble.</span>
                                </div>
                            </div>
                            <Reveal delay={0.2} className="adf-hero-visual">
                                <div className="adf-visual-heading">
                                    <span>LA PASSION COMME POINT DE RENCONTRE</span>
                                    <span>EST. ADF</span>
                                </div>
                                <Stadium />
                                <div className="adf-visual-footer">
                                    <span>Un même terrain. Une même énergie.</span>
                                    <button
                                        type="button"
                                        onClick={() => setPaused(!paused)}
                                        aria-pressed={paused}
                                        aria-label={paused ? 'Reprendre les animations' : 'Mettre les animations en pause'}
                                    >
                                        {paused ? <Play className="size-3.5" /> : <Pause className="size-3.5" />}
                                        <span>{paused ? 'Reprendre' : 'Pause'}</span>
                                    </button>
                                </div>
                            </Reveal>
                        </section>
                        <div className="adf-values-ribbon" aria-label="Les valeurs du club">
                            <span>PASSION</span>
                            <span aria-hidden="true">✦</span>
                            <span>COLLECTIF</span>
                            <span aria-hidden="true">✦</span>
                            <span>RESPECT</span>
                            <span aria-hidden="true">✦</span>
                            <span>PARTAGE</span>
                        </div>
                        <section id="concept" className="adf-home-section" aria-labelledby="club-title">
                            <div className="adf-section-heading">
                                <div>
                                    <p className="adf-home-kicker">01 / L’ESPRIT DU CLUB</p>
                                    <h2 id="club-title">
                                        Bien plus que
                                        <br />
                                        90 minutes.
                                    </h2>
                                </div>
                                <p>
                                    Le coup de sifflet termine le match.
                                    <br />
                                    Il ne termine pas l’histoire.
                                </p>
                            </div>
                            <div className="adf-universe-grid">
                                <div className="adf-universe-controls" role="group" aria-label="Explorer les valeurs du club">
                                    {universes.map((item, index) => (
                                        <button
                                            key={item.name}
                                            type="button"
                                            aria-pressed={active === index}
                                            aria-controls="club-story"
                                            onClick={() => setActive(index)}
                                        >
                                            <item.icon className="size-5" />
                                            <span>{item.name}</span>
                                            <ArrowUpRight className="size-4" />
                                        </button>
                                    ))}
                                </div>
                                <div id="club-story" className="adf-story-card" aria-live="polite">
                                    <span className="adf-story-number" aria-hidden="true">
                                        {universe.number}
                                    </span>
                                    <div className="relative z-10 max-w-lg">
                                        <p className="adf-home-kicker">{universe.tag}</p>
                                        <h3>{universe.title}</h3>
                                        <p className="adf-story-description">{universe.text}</p>
                                    </div>
                                    <span className="adf-story-word" aria-hidden="true">
                                        {universe.word}
                                    </span>
                                </div>
                            </div>
                        </section>
                        <section id="ecosysteme" className="adf-home-section" aria-labelledby="ecosystem-title">
                            <div className="adf-section-heading">
                                <div>
                                    <p className="adf-home-kicker">02 / UN CLUB CONNECTÉ</p>
                                    <h2 id="ecosystem-title">
                                        Votre club.
                                        <br />
                                        <span className="text-blue-300">À portée de main.</span>
                                    </h2>
                                </div>
                                <p>
                                    Un espace qui grandit avec le collectif.
                                    <br />
                                    Chaque service trouve sa place.
                                </p>
                            </div>
                            <div className="adf-ecosystem-grid">
                                <Link href={destination} className="adf-ecosystem-card adf-ecosystem-featured">
                                    <div className="flex items-center justify-between">
                                        <UsersRound className="size-7" />
                                        <span className="adf-service-status">Disponible</span>
                                    </div>
                                    <div className="adf-member-pass" aria-hidden="true">
                                        <AppLogoIcon className="size-10" />
                                        <span>
                                            AMIS DE FOOT<small>LE CLUB, ENSEMBLE</small>
                                        </span>
                                        <ShieldCheck className="ml-auto size-6" />
                                    </div>
                                    <h3>Votre espace personnel</h3>
                                    <p>Retrouvez votre profil et accédez aux services du club depuis un même endroit.</p>
                                    <span className="adf-card-action">
                                        {auth.user ? 'Ouvrir mon espace' : 'Créer mon compte'}
                                        <ArrowUpRight className="size-5" />
                                    </span>
                                </Link>
                                <Link href={route('public.articles')} className="adf-ecosystem-card">
                                    <div className="flex items-center justify-between">
                                        <Flag className="size-7" />
                                        <span className="adf-service-status">Disponible</span>
                                    </div>
                                    <span className="adf-card-art" aria-hidden="true">
                                        LE
                                        <br />
                                        CLUB.
                                    </span>
                                    <h3>La vie du club</h3>
                                    <p>Découvrez les actualités, les histoires et les moments qui nous rassemblent.</p>
                                    <span className="adf-card-action">Lire les actualités <ArrowUpRight className="size-5" /></span>
                                </Link>
                                <Link href={auth.user ? route('member.contributions') : route('register')} className="adf-ecosystem-card">
                                    <div className="flex items-center justify-between">
                                        <Heart className="size-7" />
                                        <span className="adf-service-status">Disponible</span>
                                    </div>
                                    <div className="adf-bars-art" aria-hidden="true">
                                        {[35, 60, 45, 85, 65, 100, 80].map((height, index) => (
                                            <span key={index} style={{ height: `${height}%` }} />
                                        ))}
                                    </div>
                                    <h3>Faire grandir le collectif</h3>
                                    <p>Le suivi des cotisations accompagne les projets et la vie de l’association.</p>
                                    <span className="adf-card-action">{auth.user ? 'Voir mes cotisations' : 'Rejoindre le club'} <ArrowUpRight className="size-5" /></span>
                                </Link>
                            </div>
                        </section>
                        <section className="adf-home-section" aria-labelledby="news-title">
                            <div className="adf-section-heading">
                                <div><p className="adf-home-kicker">03 / LES DERNIÈRES NOUVELLES</p><h2 id="news-title">Le club.<br /><span className="text-blue-300">En mouvement.</span></h2></div>
                                <Link href={route('public.articles')} className="adf-discover-link">Toutes les actualités <ArrowRight className="size-4" /></Link>
                            </div>
                            {latestArticles.length ? <div className="grid gap-5 md:grid-cols-3">
                                {latestArticles.map((article) => <Link key={article.id} href={route('public.article', { article: article.slug })} className="group overflow-hidden rounded-[26px] border border-white/15 bg-white/[0.07] transition duration-300 hover:-translate-y-1 hover:bg-white/[0.11]">
                                    {article.coverImage ? <img src={article.coverImage} alt="" className="h-48 w-full object-cover transition duration-500 group-hover:scale-[1.03]" /> : <div className="flex h-48 items-center justify-center bg-gradient-to-br from-blue-600/30 to-indigo-950"><Flag className="size-10 text-blue-200" /></div>}
                                    <div className="p-6"><span className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.16em] text-blue-300"><CalendarDays className="size-4" /> {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(article.publishedAt))}</span><h3 className="mt-4 text-xl font-bold text-white">{article.title}</h3><p className="mt-3 line-clamp-3 leading-7 text-blue-100/65">{article.excerpt}</p></div>
                                </Link>)}
                            </div> : <div className="rounded-[26px] border border-white/15 bg-white/[0.07] p-8 text-center text-blue-100/70">Les premières actualités du club seront publiées ici.</div>}
                        </section>
                        <section className="adf-home-cta">
                            <div>
                                <p className="adf-home-kicker">LE PROCHAIN CHAPITRE S’ÉCRIT ENSEMBLE</p>
                                <h2>Le collectif vous attend.</h2>
                                <p>La même passion. Une nouvelle façon de se retrouver.</p>
                            </div>
                            <Link href={destination} className="adf-home-button">
                                {auth.user ? 'Rejoindre mon espace' : 'Prendre ma place'}
                                <ArrowUpRight className="size-5" />
                            </Link>
                        </section>
                    </main>
                    <footer className="adf-home-footer">
                        <Brand onDark compact />
                        <span>© {new Date().getFullYear()} Amis de foot · Le club, ensemble.</span>
                        <span className="flex flex-wrap items-center gap-4"><Link href={route('public.contact')} className="adf-discover-link">Contact</Link><a href="#main" className="adf-discover-link">Retour en haut ↑</a></span>
                    </footer>
                </div>
            </div>
        </>
    );
}
