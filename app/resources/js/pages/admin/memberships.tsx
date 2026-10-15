import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, router } from '@inertiajs/react';
import DtCore from 'datatables.net-dt';
import 'datatables.net-dt/css';
import DataTable, { Column } from 'datatables.net-react';
import 'datatables.net-responsive-dt';
import 'datatables.net-responsive-dt/css';
import { Check, ClipboardCheck, UserRound, X } from 'lucide-react';

// DataTables React requires a one-time registration before the component is mounted.
// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DtCore);

interface MembershipRow {
    id: number;
    memberName: string;
    email: string | null;
    phone: string | null;
    feeAmount: number;
    status: 'awaiting_payment' | 'awaiting_approval' | 'rejected';
    paymentReportedAt: string | null;
    rejectionReason: string | null;
    updatedAt: string;
}

interface MembershipAdminProps {
    memberships: MembershipRow[];
    feeAmount: number;
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '/administration' },
    { title: 'Adhésions', href: '/administration/adhesions' },
];

const dateLabel = (value: string | null) =>
    value ? new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(value)) : 'Non signalé';

function statusLabel(status: MembershipRow['status']): string {
    return {
        awaiting_payment: 'En attente de paiement',
        awaiting_approval: 'Paiement signalé',
        rejected: 'Refusée',
    }[status];
}

function MembershipActions({ membership, feeAmount }: { membership: MembershipRow; feeAmount: number }) {
    const canProcess = membership.status !== 'rejected';

    const approve = async () => {
        const result = await ClubAlert.fire({
            title: 'Confirmer le règlement et approuver ?',
            text: `Vous confirmez avoir vérifié la réception des ${feeAmount.toLocaleString('fr-FR')} FCFA pour ${membership.memberName}. Votre nom et la date seront conservés dans l’historique.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmer et approuver',
            cancelButtonText: 'Annuler',
        });

        if (result.isConfirmed) {
            router.post(
                route('admin.memberships.approve', { membership: membership.id }),
                {},
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        void ClubAlert.fire({
                            title: 'Adhésion approuvée',
                            text: `Le règlement de ${feeAmount.toLocaleString('fr-FR')} FCFA a été confirmé et le membre approuvé.`,
                            icon: 'success',
                            confirmButtonText: 'Fermer',
                        });
                    },
                },
            );
        }
    };

    const reject = async () => {
        const result = await ClubAlert.fire({
            title: 'Refuser cette demande ?',
            text: `La raison du refus sera affichée au membre.`,
            input: 'textarea',
            inputLabel: 'Motif du refus',
            inputPlaceholder: 'Expliquez la décision (5 caractères minimum)',
            inputAttributes: { 'aria-label': 'Motif du refus' },
            inputValidator: (value) => (!value || value.trim().length < 5 ? 'Saisissez un motif d’au moins 5 caractères.' : undefined),
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Refuser la demande',
            cancelButtonText: 'Annuler',
        });

        if (result.isConfirmed && typeof result.value === 'string') {
            router.post(
                route('admin.memberships.reject', { membership: membership.id }),
                { reason: result.value.trim() },
                {
                    preserveScroll: true,
                    onSuccess: () => {
                        void ClubAlert.fire({
                            title: 'Demande refusée',
                            text: `La décision a été enregistrée. Une notification sera envoyée à son adresse e-mail si elle est renseignée.`,
                            icon: 'success',
                            confirmButtonText: 'Fermer',
                        });
                    },
                },
            );
        }
    };

    if (!canProcess) return <span className="text-muted-foreground text-xs">Le membre peut soumettre à nouveau</span>;

    return (
        <div className="flex min-w-48 flex-wrap gap-2">
            <Button type="button" size="sm" onClick={approve} aria-label={`Confirmer le paiement de ${membership.memberName} et approuver`}>
                <Check /> Confirmer
            </Button>
            <Button type="button" variant="outline" size="sm" onClick={reject} aria-label={`Refuser la demande de ${membership.memberName}`}>
                <X /> Refuser
            </Button>
        </div>
    );
}

export default function MembershipAdminPage({ memberships, feeAmount }: MembershipAdminProps) {
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Gestion des adhésions" />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11">
                        <p className="adf-eyebrow text-blue-200">Administration du club</p>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Gestion des adhésions</h1>
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/75">
                            Vérifiez le règlement unique de {feeAmount.toLocaleString('fr-FR')} FCFA avant d’approuver. Chaque décision conserve
                            l’administrateur et son horodatage.
                        </p>
                    </section>
                </Reveal>

                <Reveal delay={0.08}>
                    <section className="adf-soft-panel rounded-[26px] p-4 sm:p-6">
                        <div className="mb-5 flex items-center gap-3">
                            <span className="flex size-10 items-center justify-center rounded-2xl bg-blue-100 text-blue-700">
                                <ClipboardCheck className="size-5" />
                            </span>
                            <div>
                                <h2 className="font-bold">Demandes à examiner</h2>
                                <p className="text-muted-foreground text-sm">
                                    {memberships.length} demande{memberships.length === 1 ? '' : 's'} en attente ou refusée
                                </p>
                            </div>
                        </div>
                        <div className="space-y-3 xl:hidden">
                            {memberships.map((membership) => (
                                <article key={membership.id} className="rounded-2xl border border-white/10 bg-slate-950/35 p-4">
                                    <div className="flex flex-wrap items-start justify-between gap-3">
                                        <div>
                                            <h3 className="font-bold">{membership.memberName}</h3>
                                            <p className="text-muted-foreground mt-1 text-sm">
                                                {membership.phone || membership.email || 'Contact non renseigné'}
                                            </p>
                                        </div>
                                        <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                            {statusLabel(membership.status)}
                                        </span>
                                    </div>
                                    <dl className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
                                        <div>
                                            <dt className="text-muted-foreground text-xs">Montant</dt>
                                            <dd className="mt-1 font-semibold">{membership.feeAmount.toLocaleString('fr-FR')} FCFA</dd>
                                        </div>
                                        <div>
                                            <dt className="text-muted-foreground text-xs">Paiement signalé</dt>
                                            <dd className="mt-1 font-semibold">{dateLabel(membership.paymentReportedAt)}</dd>
                                        </div>
                                        <div className="col-span-2">
                                            <dt className="text-muted-foreground text-xs">Dernière mise à jour</dt>
                                            <dd className="mt-1 font-semibold">{dateLabel(membership.updatedAt)}</dd>
                                        </div>
                                    </dl>
                                    <div className="mt-4 border-t border-white/10 pt-4">
                                        <MembershipActions membership={membership} feeAmount={feeAmount} />
                                    </div>
                                </article>
                            ))}
                        </div>
                        {memberships.length > 0 ? (
                            <div className="hidden overflow-x-auto xl:block">
                                <DataTable
                                    data={memberships}
                                    className="display responsive nowrap w-full"
                                    options={{
                                        responsive: true,
                                        autoWidth: false,
                                        pageLength: 10,
                                        order: [[3, 'desc']],
                                        language: {
                                            search: 'Rechercher :',
                                            lengthMenu: 'Afficher _MENU_ demandes',
                                            info: '_START_ à _END_ sur _TOTAL_ demandes',
                                            infoEmpty: 'Aucune demande',
                                            zeroRecords: 'Aucun résultat',
                                            emptyTable: 'Aucune demande à examiner.',
                                            paginate: { first: 'Première', last: 'Dernière', next: 'Suivante', previous: 'Précédente' },
                                        },
                                    }}
                                >
                                    <Column data="memberName" title="Membre" />
                                    <Column data="phone" title="Contact" render={(value, _type, row: MembershipRow) => value || row.email || '—'} />
                                    <Column data="status" title="État">
                                        {(value) => (
                                            <span className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-xs font-bold text-blue-800">
                                                {statusLabel(value)}
                                            </span>
                                        )}
                                    </Column>
                                    <Column data="paymentReportedAt" title="Paiement signalé" render={(value) => dateLabel(value)} />
                                    <Column data="feeAmount" title="Montant" render={(value) => `${Number(value).toLocaleString('fr-FR')} FCFA`} />
                                    <Column data="updatedAt" title="Mise à jour" render={(value) => dateLabel(value)} />
                                    <Column data="id" title="Décision" options={{ orderable: false, searchable: false }}>
                                        {(_id, _type, row: MembershipRow) => <MembershipActions membership={row} feeAmount={feeAmount} />}
                                    </Column>
                                </DataTable>
                            </div>
                        ) : (
                            <div className="border-primary/25 bg-primary/5 rounded-2xl border border-dashed px-5 py-10 text-center">
                                <UserRound className="text-muted-foreground mx-auto size-8" />
                                <p className="mt-3 font-semibold">Aucune demande à traiter</p>
                                <p className="text-muted-foreground mt-1 text-sm">Les demandes des membres apparaîtront ici.</p>
                            </div>
                        )}
                    </section>
                </Reveal>
            </main>
        </AppLayout>
    );
}
