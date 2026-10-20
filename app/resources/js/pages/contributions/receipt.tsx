import { Button } from '@/components/ui/button';
import { Head, Link } from '@inertiajs/react';
import { ArrowLeft, Printer } from 'lucide-react';

interface Month { periodStartsOn: string; amount: number; }
interface Props { receiptNumber: string; issuedAt: string; memberName: string; memberContact: string | null; reference: string | null; months: Month[]; amount: number; }
const monthLabel = (date: string) => new Intl.DateTimeFormat('fr-FR', { month: 'long', year: 'numeric' }).format(new Date(`${date}T12:00:00`));
const dateLabel = (date: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(date));

export default function Receipt({ receiptNumber, issuedAt, memberName, memberContact, reference, months, amount }: Props) {
    return <>
        <Head title={`Reçu ${receiptNumber}`} />
        <main className="min-h-screen bg-slate-100 px-4 py-8 text-slate-950 sm:py-12 print:min-h-0 print:bg-white print:p-0">
            <div className="mx-auto max-w-3xl">
                <div className="mb-5 flex flex-wrap items-center justify-between gap-3 print:hidden">
                    <Link className="inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-blue-700" href="/mes-cotisations"><ArrowLeft className="size-4" />Retour aux cotisations</Link>
                    <Button type="button" onClick={() => window.print()}><Printer className="size-4" />Imprimer / enregistrer en PDF</Button>
                </div>
                <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl sm:p-10 print:rounded-none print:border-0 print:p-8 print:shadow-none">
                    <header className="flex flex-wrap items-start justify-between gap-5 border-b border-slate-200 pb-6">
                        <div><p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-700">Amis de foot</p><h1 className="mt-2 text-3xl font-black tracking-tight">Reçu de cotisation</h1><p className="mt-2 text-sm text-slate-500">Cotisation mensuelle du club</p></div>
                        <div className="rounded-2xl bg-blue-50 px-4 py-3 text-right"><span className="block text-xs font-semibold uppercase tracking-wide text-slate-500">Numéro du reçu</span><strong className="mt-1 block text-lg text-blue-800">{receiptNumber}</strong></div>
                    </header>
                    <section className="grid gap-5 border-b border-slate-200 py-6 sm:grid-cols-2"><div><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Membre</span><strong className="mt-1 block text-base">{memberName}</strong>{memberContact && <span className="mt-1 block text-sm text-slate-600">{memberContact}</span>}</div><div><span className="text-xs font-semibold uppercase tracking-wide text-slate-500">Date d’émission</span><strong className="mt-1 block text-base">{dateLabel(issuedAt)}</strong>{reference && <span className="mt-1 block text-sm text-slate-600">Référence : {reference}</span>}</div></section>
                    <section className="py-6"><h2 className="font-bold">Détail du règlement</h2><div className="mt-4 divide-y divide-slate-200 rounded-2xl border border-slate-200">{months.map((month) => <div key={month.periodStartsOn} className="flex items-center justify-between gap-3 px-4 py-3"><span className="capitalize">Cotisation — {monthLabel(month.periodStartsOn)}</span><span className="font-semibold tabular-nums">{month.amount.toLocaleString('fr-FR')} FCFA</span></div>)}<div className="flex items-center justify-between gap-3 bg-slate-50 px-4 py-4 text-lg font-extrabold"><span>Total payé</span><span className="tabular-nums">{amount.toLocaleString('fr-FR')} FCFA</span></div></div></section>
                    <footer className="border-t border-slate-200 pt-5 text-sm text-slate-500">Ce reçu confirme l’enregistrement du règlement par l’administration du club.</footer>
                </article>
            </div>
        </main>
    </>;
}
