import AppLogoIcon from '@/components/app-logo-icon';
import { Reveal } from '@/components/ui/reveal';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, CircleCheck, Heart, ShieldCheck, UsersRound } from 'lucide-react';

export default function Club() {
    return <PublicLayout>
        <Head title="Le club — Amis de foot" />
        <section className="adf-home-hero min-h-[65vh] items-center" aria-labelledby="club-public-title">
            <Reveal className="adf-hero-copy">
                <p className="adf-home-kicker">L'ESPRIT AMIS DE FOOT</p>
                <h1 id="club-public-title">Le football<br />crée des liens.<br /><span>Nous les faisons vivre.</span></h1>
                <p className="adf-hero-description">Un collectif réuni autour du jeu, du respect et des moments partagés sur le terrain comme en dehors.</p>
                <Link href={route('register')} className="adf-home-button mt-7">Rejoindre le club <ArrowRight className="size-4" /></Link>
            </Reveal>
            <Reveal delay={0.12} className="adf-hero-visual">
                <div className="adf-story-card min-h-[420px]">
                    <span className="adf-story-number">ADF</span>
                    <div className="relative z-10 flex h-full flex-col justify-between gap-10">
                        <AppLogoIcon className="size-24" />
                        <div><p className="adf-home-kicker">UNE IDENTITÉ COMMUNE</p><h3>La passion comme point de rencontre.</h3><p className="adf-story-description">Chaque membre apporte son énergie. Le club lui donne un terrain pour la partager.</p></div>
                    </div>
                </div>
            </Reveal>
        </section>
        <section className="adf-home-section" aria-labelledby="values-title">
            <div className="adf-section-heading"><div><p className="adf-home-kicker">NOS REPÈRES</p><h2 id="values-title">Une équipe.<br />Trois engagements.</h2></div><p>Des principes simples pour faire vivre le collectif.</p></div>
            <div className="grid gap-4 md:grid-cols-3">
                {[{ icon: UsersRound, title: 'Collectif', text: 'Faire circuler le ballon, les idées et l’entraide.' }, { icon: Heart, title: 'Passion', text: 'Partager le plaisir du jeu et les émotions du football.' }, { icon: ShieldCheck, title: 'Respect', text: 'Accueillir chacun et avancer avec un esprit sportif.' }].map((value) => <article key={value.title} className="adf-ecosystem-card"><value.icon className="size-7" /><h3 className="mt-12">{value.title}</h3><p>{value.text}</p></article>)}
            </div>
        </section>
        <section className="adf-home-section" aria-labelledby="membership-title">
            <div className="adf-section-heading"><div><p className="adf-home-kicker">DEVENIR MEMBRE</p><h2 id="membership-title">Votre place<br />dans le collectif.</h2></div></div>
            <div className="grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
                <div className="adf-story-card"><div className="relative z-10"><p className="adf-home-kicker">UN PARCOURS SIMPLE</p><h3>Créez votre compte, signalez votre adhésion, puis suivez sa validation.</h3><div className="mt-8 grid gap-3">{['Compte personnel par téléphone ou e-mail', 'Adhésion unique de 1 000 FCFA', 'Cotisation mensuelle de 1 000 FCFA après approbation'].map((item) => <span key={item} className="flex items-center gap-3 rounded-xl bg-white/5 px-4 py-3"><CircleCheck className="size-5 text-cyan-300" />{item}</span>)}</div></div></div>
                <div className="adf-ecosystem-card adf-ecosystem-featured flex flex-col justify-between"><div><p className="adf-home-kicker">PRÊT À COMMENCER ?</p><h3 className="mt-7">Le collectif vous attend.</h3><p>Votre espace vous permet de suivre votre adhésion, vos cotisations et vos reçus.</p></div><Link href={route('register')} className="adf-card-action mt-10">Créer mon compte <ArrowRight className="size-5" /></Link></div>
            </div>
        </section>
    </PublicLayout>;
}
