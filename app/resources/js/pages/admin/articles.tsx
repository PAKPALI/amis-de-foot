import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, Link, router, useForm, usePage, type InertiaFormProps } from '@inertiajs/react';
import { BookOpenText, ChevronDown, Eye, ImagePlus, Plus, Send, Trash2 } from 'lucide-react';
import { useEffect, useRef } from 'react';

type Article = { id: number; title: string; slug: string; excerpt: string; content: string; status: 'draft' | 'published'; coverImage: string | null; images: string[]; author: string; publishedAt: string | null; updatedAt: string };
type FormValues = { title: string; excerpt: string; content: string; status: 'draft' | 'published'; photos: File[]; remove_cover: boolean };
const empty: FormValues = { title: '', excerpt: '', content: '', status: 'draft', photos: [], remove_cover: false };
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Administration', href: '/administration' }, { title: 'Actualités', href: '/administration/actualites' }];

type ArticleForm = InertiaFormProps<FormValues>;

function Fields({ form, submitLabel }: { form: ArticleForm; submitLabel: string }) {
    return <div className="grid gap-5">
        <label className="text-sm font-semibold">Titre<Input className="mt-2" value={form.data.title} onChange={(e) => form.setData('title', e.target.value)} maxLength={180} placeholder="Ex. Retour sur notre rencontre du samedi" /></label>
        <label className="text-sm font-semibold">Résumé<textarea className="bg-background mt-2 min-h-24 w-full rounded-xl border px-3 py-3" value={form.data.excerpt} onChange={(e) => form.setData('excerpt', e.target.value)} maxLength={320} placeholder="Une introduction courte visible sur la liste publique." /></label>
        <label className="text-sm font-semibold">Contenu<textarea className="bg-background mt-2 min-h-64 w-full rounded-xl border px-3 py-3 leading-7" value={form.data.content} onChange={(e) => form.setData('content', e.target.value)} placeholder="Rédigez l’actualité. Les retours à la ligne seront conservés." /></label>
        <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-sm font-semibold">État<select value={form.data.status} onChange={(e) => form.setData('status', e.target.value as FormValues['status'])} className="bg-background mt-2 h-11 w-full rounded-xl border px-3"><option value="draft">Brouillon privé</option><option value="published">Publié sur le site</option></select></label>
            <label className="text-sm font-semibold">Photos du slider (maximum 3)<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(e) => { const photos = Array.from(e.target.files ?? []); if (photos.length > 3) void ClubAlert.fire({ title: 'Maximum 3 photos', text: 'Seules les trois premières photos ont été retenues.', icon: 'info', confirmButtonText: 'Compris' }); form.setData('photos', photos.slice(0, 3)); }} className="mt-2 block w-full rounded-xl border bg-background p-2 text-sm" /><span className="text-muted-foreground mt-1 block text-xs">{form.data.photos.length ? `${form.data.photos.length} photo(s) sélectionnée(s)` : 'JPEG, PNG ou WebP · 4 Mo maximum par photo'}</span>{form.errors.photos && <span className="mt-1 block text-xs text-red-500">{form.errors.photos}</span>}</label>
        </div>
        <Button type="submit" disabled={form.processing}><Send className="size-4" /> {submitLabel}</Button>
    </div>;
}

function EditArticle({ article }: { article: Article }) {
    const form = useForm<FormValues>({ title: article.title, excerpt: article.excerpt, content: article.content, status: article.status, photos: [], remove_cover: false });
    const update = (event: React.FormEvent) => { event.preventDefault(); form.post(route('admin.articles.update', { article: article.slug }), { forceFormData: true, preserveScroll: true }); };
    const remove = async () => {
        const answer = await ClubAlert.fire({ title: 'Supprimer cette actualité ?', text: `« ${article.title} » sera retirée définitivement.`, icon: 'warning', showCancelButton: true, confirmButtonText: 'Supprimer', cancelButtonText: 'Annuler' });
        if (answer.isConfirmed) router.delete(route('admin.articles.destroy', { article: article.slug }), { preserveScroll: true });
    };
    return <Collapsible className="adf-soft-panel overflow-hidden rounded-[24px]">
        <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6">
            <span className="min-w-0"><span className="flex flex-wrap items-center gap-2"><strong className="truncate">{article.title}</strong><span className={`rounded-full px-2.5 py-1 text-[11px] font-bold ${article.status === 'published' ? 'bg-emerald-500/15 text-emerald-500' : 'bg-amber-500/15 text-amber-500'}`}>{article.status === 'published' ? 'Publié' : 'Brouillon'}</span></span><span className="text-muted-foreground mt-1 block text-xs">Par {article.author} · modifié le {new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(article.updatedAt))}</span></span>
            <ChevronDown className="size-5 shrink-0 transition-transform group-data-[state=open]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="border-t border-white/10 p-5 sm:p-6">
            {article.images.length > 0 && <div className="mb-5"><div className="flex flex-wrap gap-3">{article.images.map((image, index) => <img key={image} src={image} alt={`Photo ${index + 1}`} className="h-20 w-28 rounded-xl object-cover" />)}</div><label className="mt-3 flex items-center gap-2 text-sm"><input type="checkbox" checked={form.data.remove_cover} onChange={(e) => form.setData('remove_cover', e.target.checked)} /> Retirer toutes les photos actuelles</label><p className="text-muted-foreground mt-1 text-xs">La sélection de nouvelles photos remplace toute la galerie actuelle.</p></div>}
            <form onSubmit={update}><Fields form={form} submitLabel="Enregistrer les modifications" /></form>
            <div className="mt-4 flex flex-wrap gap-2">{article.status === 'published' && <Button asChild variant="outline"><Link href={route('public.article', { article: article.slug })}><Eye className="size-4" /> Voir l’article</Link></Button>}<Button type="button" variant="destructive" onClick={() => void remove()}><Trash2 className="size-4" /> Supprimer</Button></div>
        </CollapsibleContent>
    </Collapsible>;
}

export default function Articles({ articles }: { articles: Article[] }) {
    const form = useForm<FormValues>(empty);
    const { flash } = usePage<SharedData>().props;
    const lastStatus = useRef<string | null>(null);
    useEffect(() => { if (flash.status && flash.status !== lastStatus.current) { lastStatus.current = flash.status; void ClubAlert.fire({ title: flash.status, icon: 'success', confirmButtonText: 'Fermer' }); } }, [flash.status]);
    const create = (event: React.FormEvent) => { event.preventDefault(); form.post(route('admin.articles.store'), { forceFormData: true, preserveScroll: true, onSuccess: () => form.reset() }); };
    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Gestion des actualités" />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
            <Reveal><section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10"><p className="adf-eyebrow text-blue-200">Vie publique du club</p><h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Actualités et publications</h1><p className="mt-3 max-w-2xl text-blue-100/75">Préparez les récits du club en brouillon, puis publiez-les lorsqu’ils sont prêts.</p></section></Reveal>
            <Collapsible className="adf-soft-panel overflow-hidden rounded-[28px]">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-5 text-left sm:p-7"><span className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><Plus className="size-5" /></span><span><strong className="block text-lg">Nouvelle actualité</strong><span className="text-muted-foreground text-sm">Ouvrir le formulaire de rédaction</span></span></span><ChevronDown className="size-5 transition-transform group-data-[state=open]:rotate-180" /></CollapsibleTrigger>
                <CollapsibleContent className="border-t border-white/10 p-5 sm:p-7"><form onSubmit={create}><Fields form={form} submitLabel="Enregistrer l’article" /></form></CollapsibleContent>
            </Collapsible>
            <section><div className="mb-4 flex items-center justify-between"><h2 className="flex items-center gap-2 text-xl font-bold"><BookOpenText className="size-5 text-blue-600" /> Articles enregistrés</h2><Button asChild variant="outline"><Link href={route('public.articles')}><Eye className="size-4" /> Voir le blog</Link></Button></div><div className="grid gap-4">{articles.length ? articles.map((article) => <EditArticle key={article.id} article={article} />) : <div className="adf-soft-panel rounded-[24px] p-8 text-center"><ImagePlus className="mx-auto size-10 text-blue-500" /><p className="mt-4 font-bold">Aucune actualité enregistrée.</p><p className="text-muted-foreground mt-2 text-sm">Ouvrez le formulaire pour rédiger la première publication.</p></div>}</div></section>
        </main>
    </AppLayout>;
}
