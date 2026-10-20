import { Reveal } from '@/components/ui/reveal';
import PublicLayout from '@/layouts/public-layout';
import { type SharedData } from '@/types';
import { Head, Link, usePage } from '@inertiajs/react';
import { ArrowRight, LogIn, MessageCircle, UserPlus } from 'lucide-react';

export default function Contact() {
    const { auth } = usePage<SharedData>().props;
    const destination = auth.user ? route('member.dashboard') : route('register');

    return <PublicLayout>
        <Head title="Contact — Amis de foot">
            <meta name="description" content="Rejoindre Amis de foot ou contacter les responsables du club depuis votre espace personnel." />
        </Head>
        <section className="mx-auto grid min-h-[70vh] max-w-6xl items-center gap-8 px-4 py-14 sm:px-8 lg:grid-cols-[1.05fr_.95fr] lg:py-24">
            <Reveal>
                <p className="adf-home-kicker">RESTONS EN CONTACT</p>
                <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">Une question pour le club&nbsp;?</h1>
                <p className="mt-6 max-w-xl text-base leading-8 text-blue-100/75 sm:text-lg">Créez votre compte pour rejoindre le collectif. Les membres déjà inscrits peuvent retrouver leur espace et échanger avec les responsables du club.</p>
            </Reveal>
            <Reveal delay={0.12} className="grid gap-4">
                <div className="rounded-[28px] border border-white/15 bg-white/10 p-6 shadow-2xl backdrop-blur-xl sm:p-8">
                    <span className="flex size-12 items-center justify-center rounded-2xl bg-blue-500/25 text-blue-100"><MessageCircle className="size-6" /></span>
                    <h2 className="mt-6 text-2xl font-bold text-white">Votre point d’entrée</h2>
                    <p className="mt-3 leading-7 text-blue-100/70">Les coordonnées officielles du club pourront être ajoutées ici dès leur validation. Pour le moment, l’espace personnel centralise l’accès aux services.</p>
                    <Link href={destination} className="adf-home-button mt-7">
                        {auth.user ? <LogIn className="size-4" /> : <UserPlus className="size-4" />}
                        {auth.user ? 'Ouvrir mon espace' : 'Créer mon compte'}
                        <ArrowRight className="size-4" />
                    </Link>
                    {!auth.user && <p className="mt-5 text-sm text-blue-100/65">Déjà membre ? <Link href={route('login')} className="font-bold text-white underline underline-offset-4">Se connecter</Link></p>}
                </div>
            </Reveal>
        </section>
    </PublicLayout>;
}
