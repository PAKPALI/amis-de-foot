import { Reveal } from '@/components/ui/reveal';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowRight, BookOpenText, CalendarDays } from 'lucide-react';

type Article = { title: string; slug: string; excerpt: string; coverImage: string | null; publishedAt: string };
const date = (value: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(value));

export default function Articles({ articles }: { articles: Article[] }) {
    return <PublicLayout>
        <Head title="Actualités — Amis de foot" />
        <section className="adf-home-section pt-16 sm:pt-24" aria-labelledby="news-title">
            <Reveal><p className="adf-home-kicker">LA VIE DU CLUB</p><h1 id="news-title" className="mt-5 max-w-4xl text-5xl font-black tracking-[-.055em] sm:text-7xl">Les histoires qui font vivre le collectif.</h1><p className="mt-7 max-w-2xl text-lg text-blue-100/75">Retrouvez les nouvelles, rendez-vous et moments partagés par Amis de foot.</p></Reveal>
            {articles.length ? <div className="mt-16 grid gap-5 md:grid-cols-2 xl:grid-cols-3">{articles.map((article, index) => <Reveal key={article.slug} delay={index * .06}><Link href={route('public.article', { article: article.slug })} className="adf-ecosystem-card group block h-full overflow-hidden p-0"><div className="aspect-[16/10] overflow-hidden bg-gradient-to-br from-blue-500/30 to-indigo-950">{article.coverImage ? <img src={article.coverImage} alt="" className="h-full w-full object-cover transition duration-500 group-hover:scale-105" /> : <div className="flex h-full items-center justify-center"><BookOpenText className="size-16 text-blue-200/50" /></div>}</div><div className="p-6"><span className="flex items-center gap-2 text-xs font-bold text-blue-200/70"><CalendarDays className="size-4" /> {date(article.publishedAt)}</span><h2 className="mt-5 text-2xl font-extrabold">{article.title}</h2><p className="mt-3 text-blue-100/65">{article.excerpt}</p><span className="adf-card-action mt-7">Lire l’article <ArrowRight className="size-4" /></span></div></Link></Reveal>)}</div> : <div className="adf-story-card mt-14 text-center"><BookOpenText className="mx-auto size-12 text-blue-300" /><h2 className="mt-6 text-2xl font-bold">Les premières actualités arrivent bientôt.</h2><p className="mt-3 text-blue-100/65">Le club prépare ses prochains récits et rendez-vous.</p></div>}
        </section>
    </PublicLayout>;
}
