import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, useForm } from '@inertiajs/react';
import { CalendarDays, CircleCheck, Clock3, ReceiptText, Wallet } from 'lucide-react';
import Swal from 'sweetalert2';
import { ClubAlert } from '@/lib/club-alert';

interface Period { id: number; batchId: number | null; periodStartsOn: string; amount: number; paidAt: string | null; paymentReportedAt: string | null; receiptNumber: string | null; }
interface Props { periods: Period[]; nextPeriodStartsOn: string | null; contributionFee: number; maxMonths: number; }
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Mes cotisations', href: '/mes-cotisations' }];
const label = (date: string) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const monthsFrom = (start: string | null, count: number) => start ? Array.from({ length: count }, (_, i) => { const d = new Date(`${start}T12:00:00`); d.setMonth(d.getMonth() + i); return d.toISOString().slice(0, 10); }) : [];

export default function Contributions({ periods, nextPeriodStartsOn, contributionFee, maxMonths }: Props) {
    const form = useForm({ months: 1 });
    const preview = monthsFrom(nextPeriodStartsOn, form.data.months);
    const total = form.data.months * contributionFee;
    const paid = periods.filter((item) => item.paidAt).length;
    const report = async () => {
        const result = await Swal.fire({ title: 'Valider cette cotisation ?', text: `${preview.map(label).join(', ')} · ${total.toLocaleString('fr-FR')} FCFA. L’administration confirmera ensuite la réception.`, icon: 'question', showCancelButton: true, confirmButtonText: 'Valider', cancelButtonText: 'Annuler' });
        if (result.isConfirmed) form.post(route('member.contributions.report'), {
            preserveScroll: true,
            onSuccess: () => {
                void ClubAlert.fire({ icon: 'success', title: 'Cotisation signalée', text: 'Votre signalement a été transmis à l’administration.', confirmButtonText: 'Fermer' });
            },
            onError: (errors) => {
                const message = Object.values(errors).join('\n') || 'Le serveur n’a pas pu traiter votre demande.';
                void ClubAlert.fire({ icon: 'error', title: 'Signalement impossible', text: message, confirmButtonText: 'Compris' });
            },
        });
    };
    return <AppLayout breadcrumbs={breadcrumbs}><Head title="Mes cotisations" />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
            <Reveal><section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11"><span className="adf-eyebrow text-blue-200">Cotisations mensuelles</span><h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Mes cotisations</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75 sm:text-base">Choisissez le nombre de mois à payer. Les mois et le montant sont affichés avant validation.</p></section></Reveal>
            <section className="grid gap-4 sm:grid-cols-3"><article className="adf-soft-panel rounded-[24px] p-5"><Wallet className="text-primary size-5" /><strong className="mt-4 block text-2xl">{periods.length}</strong><span className="text-muted-foreground text-sm">Cotisations enregistrées</span></article><article className="adf-soft-panel rounded-[24px] p-5"><CircleCheck className="size-5 text-emerald-500" /><strong className="mt-4 block text-2xl">{paid}</strong><span className="text-muted-foreground text-sm">Mois réglés</span></article><article className="adf-soft-panel rounded-[24px] p-5"><Clock3 className="size-5 text-amber-500" /><strong className="mt-4 block text-2xl">{periods.length - paid}</strong><span className="text-muted-foreground text-sm">En confirmation</span></article></section>
            {nextPeriodStartsOn && <section className="adf-soft-panel rounded-[28px] p-5 sm:p-7"><h2 className="text-lg font-bold">Nouvelle cotisation</h2><p className="text-muted-foreground mt-1 text-sm">Prochain mois : <span className="font-semibold capitalize">{label(nextPeriodStartsOn)}</span>.</p><div className="mt-5 grid gap-5 lg:grid-cols-[220px_1fr]"><label className="text-sm font-semibold">Nombre de mois<select className="mt-2 flex h-10 w-full rounded-md border border-input bg-background px-3" value={form.data.months} onChange={(e) => form.setData('months', Number(e.target.value))}>{Array.from({ length: maxMonths }, (_, i) => <option key={i + 1} value={i + 1}>{i + 1} mois</option>)}</select></label><div className="rounded-2xl border border-blue-300/20 bg-blue-500/10 p-4"><p className="text-sm font-bold">Mois à payer</p><div className="mt-3 flex flex-wrap gap-2">{preview.map((date) => <span className="rounded-full bg-white/10 px-3 py-1 text-sm capitalize" key={date}>{label(date)}</span>)}</div><p className="mt-4 text-lg font-extrabold">Total : {total.toLocaleString('fr-FR')} FCFA</p></div></div><Button type="button" className="mt-5" onClick={() => void report()} disabled={form.processing}>Valider et signaler le paiement</Button></section>}
            {!nextPeriodStartsOn && <section className="adf-soft-panel rounded-[28px] p-6 text-sm text-muted-foreground">Votre adhésion doit être approuvée et votre compte actif avant de pouvoir cotiser.</section>}
            <section className="adf-soft-panel rounded-[28px] p-5 sm:p-7"><h2 className="text-lg font-bold">Historique</h2>{periods.length === 0 ? <p className="text-muted-foreground mt-3 text-sm">Aucune cotisation enregistrée.</p> : <div className="mt-5 grid gap-3">{periods.map((period) => <article key={period.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-slate-950/25 p-4"><span className="flex items-center gap-3"><CalendarDays className="text-primary size-5" /><strong className="capitalize">{label(period.periodStartsOn)}</strong></span><span className="font-semibold text-sm">{period.amount.toLocaleString('fr-FR')} FCFA</span>{period.paidAt ? <span className="flex flex-wrap items-center gap-3 text-sm font-bold text-emerald-500">Réglée {period.receiptNumber && `· ${period.receiptNumber}`} {period.batchId && <Link className="text-primary underline underline-offset-4" href={route('contributions.receipt', { batch: period.batchId })}>Voir le reçu</Link>}</span> : <span className="text-sm font-bold text-blue-500">À confirmer</span>}</article>)}</div>}<p className="text-muted-foreground mt-5 flex items-center gap-2 text-xs"><ReceiptText className="size-4" /> Les paiements partiels ne sont pas acceptés.</p></section>
        </main></AppLayout>;
}
