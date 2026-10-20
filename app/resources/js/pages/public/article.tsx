import { ArticleSlider } from '@/components/article-slider';
import PublicLayout from '@/layouts/public-layout';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, CalendarDays, UserRound } from 'lucide-react';

type Article = { title: string; slug: string; excerpt: string; content: string; coverImage: string | null; images: string[]; publishedAt: string; author: string };

export default function Article({ article }: { article: Article }) {
    return <PublicLayout>
        <Head title={`${article.title} — Amis de foot`}><meta name="description" content={article.excerpt} /></Head>
        <article className="adf-home-section mx-auto max-w-5xl pt-14 sm:pt-24">
            <Link href={route('public.articles')} className="adf-discover-link"><ArrowLeft className="size-4" /> Retour aux actualités</Link>
            <header className="mt-10"><p className="adf-home-kicker">ACTUALITÉ DU CLUB</p><h1 className="mt-5 text-4xl font-black tracking-[-.05em] sm:text-6xl">{article.title}</h1><p className="mt-6 max-w-3xl text-xl leading-8 text-blue-100/70">{article.excerpt}</p><div className="mt-7 flex flex-wrap gap-5 text-sm text-blue-100/65"><span className="flex items-center gap-2"><CalendarDays className="size-4" />{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long' }).format(new Date(article.publishedAt))}</span><span className="flex items-center gap-2"><UserRound className="size-4" />{article.author}</span></div></header>
            <ArticleSlider images={article.images} title={article.title} />
            <div className="adf-soft-panel mt-10 whitespace-pre-wrap rounded-[28px] p-6 text-base leading-8 text-slate-800 sm:p-10 sm:text-lg dark:text-blue-50">{article.content}</div>
        </article>
    </PublicLayout>;
}
