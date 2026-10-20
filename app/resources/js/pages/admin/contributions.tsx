import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CircleCheck, Clock3, ReceiptText, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';
import { ClubAlert } from '@/lib/club-alert';
interface Member { id: number; name: string; contact: string | null; nextPeriodStartsOn: string | null; }
interface Period { id: number; batchId: number | null; memberName: string; memberContact: string | null; periodStartsOn: string; amount: number; paidAt: string | null; paymentReportedAt: string | null; receiptNumber: string | null; }
interface Batch { id: number; memberName: string; memberContact: string | null; amount: number; months: string[]; }
interface Props { members: Member[]; periods: Period[]; pendingBatches: Batch[]; contributionFee: number; maxMonths: number; }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Cotisations', href: '/administration/cotisations' }];
const label = (date: string) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const monthsFrom = (start: string | null, count: number) => start ? Array.from({ length: count }, (_, i) => { const d = new Date(`${start}T12:00:00`); d.setMonth(d.getMonth() + i); return d.toISOString().slice(0, 10); }) : [];
export default function Contributions({ members, periods, pendingBatches, contributionFee, maxMonths }: Props) {
    const form = useForm({ user_id: members[0]?.id ?? 0, months: 1, amount: contributionFee, reference: '', note: '' });
    const member = members.find((item) => item.id === Number(form.data.user_id));
    const preview = monthsFrom(member?.nextPeriodStartsOn ?? null, form.data.months); const total = form.data.months * contributionFee;
    const record = async () => {
        const result = await Swal.fire({ title: 'Enregistrer ce paiement ?', text: `${member?.name} · ${preview.map(label).join(', ')} · ${total.toLocaleString('fr-FR')} FCFA.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Enregistrer', cancelButtonText: 'Annuler' });
        if (!result.isConfirmed) return;

        // Inertia's transform() configures the form and returns void; call post() separately.
        form.transform((data) => ({ ...data, amount: total }));
        form.post(route('admin.contributions.store'), {
            preserveScroll: true,
            onSuccess: () => {
                void ClubAlert.fire({ icon: 'success', title: 'Cotisation enregistrée', text: 'Le paiement et son reçu ont bien été enregistrés.', confirmButtonText: 'Fermer' });
            },
            onError: (errors) => {
                const message = Object.values(errors).join('\n') || 'Le serveur n’a pas pu enregistrer ce paiement.';
                void ClubAlert.fire({ icon: 'error', title: 'Enregistrement impossible', text: message, confirmButtonText: 'Compris' });
            },
        });
    };
    const confirm = async (batch: number) => { const result = await Swal.fire({ title: 'Confirmer le signalement ?', text: 'Les mois indiqués seront marqués comme réglés et un reçu sera généré.', icon: 'question', showCancelButton: true, confirmButtonText: 'Confirmer', cancelButtonText: 'Annuler' }); if (result.isConfirmed) form.post(route('admin.contributions.confirm', { batch }), { preserveScroll: true }); };
    return <AppLayout breadcrumbs={breadcrumbs}><Head title="Gestion des cotisations" /><main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9"><Reveal><section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11"><span className="adf-eyebrow text-blue-200">Administration</span><h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Gestion des cotisations</h1><p className="mt-3 text-sm leading-6 text-blue-100/75">Sélectionnez un membre et le nombre de mois. Le système affiche les mois consécutifs avant l’enregistrement.</p></section></Reveal>
        <section className="adf-soft-panel rounded-[28px] p-5 sm:p-7"><h2 className="text-lg font-bold">Enregistrer une cotisation</h2>{members.length === 0 ? <p className="text-muted-foreground mt-3 text-sm">Aucun membre ayant une adhésion approuvée et un compte actif.</p> : <div className="mt-5 grid gap-4 lg:grid-cols-2"><label className="text-sm font-semibold">Membre<select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3" value={form.data.user_id} onChange={(e) => form.setData('user_id', Number(e.target.value))}>{members.map((item) => <option value={item.id} key={item.id}>{item.name}{item.contact ? ` — ${item.contact}` : ''}</option>)}</select></label><label className="text-sm font-semibold">Nombre de mois<select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3" value={form.data.months} onChange={(e) => form.setData('months', Number(e.target.value))}>{Array.from({ length: maxMonths }, (_, i) => <option value={i + 1} key={i + 1}>{i + 1} mois</option>)}</select></label><div className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4 lg:col-span-2"><p className="font-bold text-sm">Mois à régler</p><div className="mt-3 flex flex-wrap gap-2">{preview.map((date) => <span key={date} className="rounded-full bg-white/10 px-3 py-1 text-sm capitalize">{label(date)}</span>)}</div><p className="mt-4 text-lg font-extrabold">Total : {total.toLocaleString('fr-FR')} FCFA</p></div><Input value={form.data.reference} onChange={(e) => form.setData('reference', e.target.value)} placeholder="Référence facultative" /><Button type="button" onClick={() => void record()} disabled={form.processing || !preview.length}>Enregistrer le paiement</Button></div>}</section>
        {pendingBatches.length > 0 && <section className="adf-soft-panel rounded-[28px] p-5 sm:p-7"><h2 className="text-lg font-bold">Signalements à confirmer</h2><div className="mt-4 grid gap-3">{pendingBatches.map((batch) => <article key={batch.id} className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-white/10 p-4"><span><strong>{batch.memberName}</strong><span className="mt-1 block text-sm text-muted-foreground capitalize">{batch.months.map(label).join(', ')}</span></span><span className="font-bold">{batch.amount.toLocaleString('fr-FR')} FCFA</span><Button size="sm" type="button" onClick={() => void confirm(batch.id)}>Confirmer</Button></article>)}</div></section>}
        <section className="adf-soft-panel rounded-[28px] p-5 sm:p-7"><h2 className="text-lg font-bold">Historique</h2>{periods.length === 0 ? <p className="text-muted-foreground mt-3 text-sm">Aucune cotisation enregistrée.</p> : <div className="mt-4 grid gap-3">{periods.map((item) => <article className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 p-4" key={item.id}><span><strong>{item.memberName}</strong><span className="mt-1 block text-sm text-muted-foreground capitalize">{label(item.periodStartsOn)}</span></span><span className="font-semibold">{item.amount.toLocaleString('fr-FR')} FCFA</span>{item.paidAt ? <span className="inline-flex items-center gap-3 text-sm font-bold text-emerald-500"><ReceiptText className="size-4" />Réglée {item.batchId && <Link className="text-primary underline underline-offset-4" href={route('contributions.receipt', { batch: item.batchId })}>Voir le reçu</Link>}</span> : <span className="inline-flex items-center gap-2 text-sm font-bold text-blue-500"><Clock3 className="size-4" />À confirmer</span>}</article>)}</div>}</section>
    </main></AppLayout>;
}
