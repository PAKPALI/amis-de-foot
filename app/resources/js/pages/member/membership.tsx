import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { CalendarCheck2, CircleCheck, Clock3, CreditCard, RotateCcw, Send, ShieldCheck } from 'lucide-react';

interface MembershipEvent {
    action: string;
    actorName: string;
    reason: string | null;
    createdAt: string | null;
}

interface MembershipData {
    id: number;
    feeAmount: number;
    status: 'awaiting_payment' | 'awaiting_approval' | 'approved' | 'rejected';
    paymentReportedAt: string | null;
    paymentConfirmedAt: string | null;
    approvedAt: string | null;
    rejectionReason: string | null;
    events: MembershipEvent[];
}

interface MembershipPageProps {
    membership: MembershipData | null;
    feeAmount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Mon espace', href: '/mon-espace' },
    { title: 'Mon adhésion', href: '/mon-adhesion' },
];

const dateLabel = (value: string | null) =>
    value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(new Date(value)) : '—';

function statusView(status: MembershipData['status']) {
    switch (status) {
        case 'awaiting_payment':
            return { label: 'En attente du règlement', icon: CreditCard, tone: 'text-amber-700 bg-amber-100' };
        case 'awaiting_approval':
            return { label: 'Paiement à vérifier', icon: Clock3, tone: 'text-blue-700 bg-blue-100' };
        case 'approved':
            return {
                label: 'Membre approuvé',
                icon: CircleCheck,
                tone: 'bg-emerald-100 text-emerald-900 dark:bg-emerald-400/15 dark:text-emerald-200',
            };
        case 'rejected':
            return { label: 'Demande refusée', icon: RotateCcw, tone: 'text-rose-700 bg-rose-100' };
    }
}

export default function MembershipPage({ membership, feeAmount }: MembershipPageProps) {
    const { auth } = usePage<SharedData>().props;
    const requestForm = useForm({});
    const paymentForm = useForm({});

    const requestMembership = async () => {
        const result = await ClubAlert.fire({
            title: membership ? 'Soumettre une nouvelle demande ?' : 'Demander mon adhésion ?',
            text: `L’adhésion coûte ${feeAmount.toLocaleString('fr-FR')} FCFA, payable une seule fois.`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Continuer',
            cancelButtonText: 'Annuler',
        });

        if (result.isConfirmed) requestForm.post(route('member.membership.request'), { preserveScroll: true });
    };

    const reportPayment = async () => {
        const result = await ClubAlert.fire({
            title: 'Signaler le règlement ?',
            text: `Confirmez uniquement après avoir remis les ${feeAmount.toLocaleString('fr-FR')} FCFA à un administrateur. Celui-ci devra vérifier la réception.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Oui, j’ai réglé',
            cancelButtonText: 'Annuler',
        });

        if (result.isConfirmed) paymentForm.patch(route('member.membership.report-payment'), { preserveScroll: true });
    };

    const status = membership ? statusView(membership.status) : null;
    const StatusIcon = status?.icon;

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Mon adhésion" />
            <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11">
                        <p className="adf-eyebrow text-blue-200">Parcours membre</p>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Mon adhésion</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75 sm:text-base">
                            L’adhésion au club est un règlement unique de {feeAmount.toLocaleString('fr-FR')} FCFA. Elle est distincte des cotisations
                            mensuelles.
                        </p>
                    </section>
                </Reveal>

                <Reveal delay={0.08}>
                    <section className="adf-soft-panel rounded-[26px] p-5 sm:p-7">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                            <div>
                                <p className="text-muted-foreground text-sm">Compte membre</p>
                                <h2 className="mt-1 text-xl font-bold">{auth.user.name}</h2>
                            </div>
                            {status && StatusIcon && (
                                <span className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold ${status.tone}`}>
                                    <StatusIcon className="size-4" /> {status.label}
                                </span>
                            )}
                        </div>

                        {!membership && (
                            <div className="border-primary/15 bg-primary/5 mt-6 rounded-2xl border p-4 sm:p-5">
                                <p className="font-semibold">Aucune demande d’adhésion pour le moment</p>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Déposez votre demande, puis réglez le montant auprès d’un administrateur.
                                </p>
                                <Button className="mt-5 w-full sm:w-auto" onClick={requestMembership} disabled={requestForm.processing}>
                                    <Send /> Demander mon adhésion
                                </Button>
                            </div>
                        )}

                        {membership?.status === 'awaiting_payment' && (
                            <div className="mt-6 rounded-2xl border border-amber-300/50 bg-amber-50/80 p-4 sm:p-5">
                                <p className="font-bold text-slate-950">Étape 1 · Régler votre adhésion</p>
                                <p className="mt-2 text-sm leading-6 text-slate-800">
                                    Remettez {membership.feeAmount.toLocaleString('fr-FR')} FCFA à un administrateur. Après le règlement, signalez-le
                                    ici pour qu’il puisse le vérifier.
                                </p>
                                <Button className="mt-5 w-full sm:w-auto" onClick={reportPayment} disabled={paymentForm.processing}>
                                    <CreditCard /> J’ai réglé l’adhésion
                                </Button>
                            </div>
                        )}

                        {membership?.status === 'awaiting_approval' && (
                            <div className="mt-6 rounded-2xl border border-blue-300/50 bg-blue-50/80 p-4 sm:p-5">
                                <p className="font-semibold">Étape 2 · Vérification par l’administration</p>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">
                                    Votre règlement a été signalé le {dateLabel(membership.paymentReportedAt)}. Un administrateur doit confirmer sa
                                    réception et approuver votre adhésion.
                                </p>
                            </div>
                        )}

                        {membership?.status === 'approved' && (
                            <div className="mt-6 rounded-2xl border border-emerald-500/50 bg-emerald-100/90 p-4 text-emerald-950 shadow-sm shadow-emerald-950/5 sm:p-5 dark:border-emerald-400/45 dark:bg-emerald-950/55 dark:text-emerald-50">
                                <p className="flex items-center gap-2 text-base font-extrabold">
                                    <ShieldCheck className="size-6 shrink-0 text-emerald-700 dark:text-emerald-300" /> Adhésion approuvée
                                </p>
                                <p className="mt-2 text-sm leading-6 text-emerald-900 dark:text-emerald-100">
                                    Votre statut de membre est actif. Le règlement unique de {membership.feeAmount.toLocaleString('fr-FR')} FCFA a été
                                    confirmé.
                                </p>
                                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-emerald-400/50 pt-3 text-sm dark:border-emerald-300/25">
                                    <span className="font-semibold">Date de confirmation</span>
                                    <time className="font-bold">{dateLabel(membership.paymentConfirmedAt)}</time>
                                </div>
                            </div>
                        )}

                        {membership?.status === 'rejected' && (
                            <div className="mt-6 rounded-2xl border border-rose-300/50 bg-rose-50/80 p-4 sm:p-5">
                                <p className="font-semibold">Demande refusée</p>
                                <p className="text-muted-foreground mt-2 text-sm leading-6">Motif : {membership.rejectionReason}</p>
                                <Button className="mt-5 w-full sm:w-auto" onClick={requestMembership} disabled={requestForm.processing}>
                                    <RotateCcw /> Soumettre une nouvelle demande
                                </Button>
                            </div>
                        )}
                    </section>
                </Reveal>

                {membership && membership.events.length > 0 && (
                    <Reveal delay={0.14}>
                        <section className="adf-soft-panel rounded-[26px] p-5 sm:p-7">
                            <h2 className="flex items-center gap-2 text-lg font-bold">
                                <CalendarCheck2 className="text-primary size-5" /> Historique de la demande
                            </h2>
                            <ol className="mt-5 space-y-4">
                                {membership.events.map((event, index) => (
                                    <li key={`${event.action}-${event.createdAt}-${index}`} className="border-primary/20 border-l-2 pl-4">
                                        <p className="font-medium">{eventLabel(event.action)}</p>
                                        <p className="text-muted-foreground mt-1 text-xs">
                                            {dateLabel(event.createdAt)} · {event.actorName}
                                        </p>
                                        {event.reason && <p className="text-muted-foreground mt-1 text-sm">{event.reason}</p>}
                                    </li>
                                ))}
                            </ol>
                        </section>
                    </Reveal>
                )}
            </main>
        </AppLayout>
    );
}

function eventLabel(action: string): string {
    return (
        {
            request_submitted: 'Demande d’adhésion déposée',
            request_resubmitted: 'Nouvelle demande déposée',
            payment_reported: 'Paiement signalé par le membre',
            payment_confirmed_and_approved: 'Paiement confirmé et adhésion approuvée',
            request_rejected: 'Demande refusée',
        }[action] ?? 'Mise à jour de la demande'
    );
}
