import { Brand } from '@/components/brand';
import { type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { ArrowUpRight, Menu, X } from 'lucide-react';
import { type PropsWithChildren, useState } from 'react';

export default function PublicLayout({ children }: PropsWithChildren) {
    const { auth } = usePage<SharedData>().props;
    const [open, setOpen] = useState(false);
    const destination = auth.user ? route('member.dashboard') : route('register');
    const links = [
        { label: 'Accueil', href: route('home') },
        { label: 'Le club', href: route('public.club') },
        { label: 'Actualités', href: route('public.articles') },
        { label: 'Contact', href: route('public.contact') },
    ];

    return <div className="adf-home adf-scene min-h-svh text-white">
        <a href="#main" className="adf-skip-link">Aller au contenu</a>
        <div className="adf-home-shell">
            <header className="adf-home-header">
                <Link href={route('home')} aria-label="Accueil Amis de foot"><Brand onDark /></Link>
                <nav aria-label="Navigation publique" className="hidden items-center gap-5 md:flex">
                    {links.map((link) => <Link key={link.href} href={link.href} className="adf-nav-link">{link.label}</Link>)}
                    {!auth.user && <Link href={route('login')} className="adf-nav-link">Connexion</Link>}
                    <Link href={destination} className="adf-home-button adf-home-button-small">{auth.user ? 'Mon espace' : 'Rejoindre'} <ArrowUpRight className="size-4" /></Link>
                </nav>
                <button type="button" onClick={() => setOpen(!open)} aria-expanded={open} aria-controls="public-menu" aria-label={open ? 'Fermer le menu' : 'Ouvrir le menu'} className="rounded-xl border border-white/20 bg-white/10 p-2.5 md:hidden">
                    {open ? <X className="size-5" /> : <Menu className="size-5" />}
                </button>
            </header>
            {open && <nav id="public-menu" aria-label="Navigation mobile" className="mx-2 grid gap-2 rounded-2xl border border-white/15 bg-slate-950/90 p-4 shadow-2xl backdrop-blur-xl md:hidden">
                {links.map((link) => <Link key={link.href} href={link.href} onClick={() => setOpen(false)} className="rounded-xl px-4 py-3 font-semibold hover:bg-white/10">{link.label}</Link>)}
                {!auth.user && <Link href={route('login')} className="rounded-xl px-4 py-3 font-semibold hover:bg-white/10">Connexion</Link>}
                <Link href={destination} className="adf-home-button mt-2 justify-center">{auth.user ? 'Mon espace' : 'Rejoindre le club'}</Link>
            </nav>}
            <main id="main">{children}</main>
            <footer className="adf-home-footer">
                <Brand onDark compact />
                <span>© {new Date().getFullYear()} Amis de foot · Le club, ensemble.</span>
                <span className="flex flex-wrap items-center gap-4"><Link href={route('public.articles')} className="adf-discover-link">Les actualités</Link><Link href={route('public.contact')} className="adf-discover-link">Contact →</Link></span>
            </footer>
        </div>
    </div>;
}
