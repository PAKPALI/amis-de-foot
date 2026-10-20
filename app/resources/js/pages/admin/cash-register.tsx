import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, router, useForm } from '@inertiajs/react';
import DtCore from 'datatables.net-dt';
import 'datatables.net-dt/css';
import DataTable, { Column } from 'datatables.net-react';
import 'datatables.net-responsive-dt';
import 'datatables.net-responsive-dt/css';
import { ChevronDown, CircleDollarSign, RotateCcw, Wallet } from 'lucide-react';
import { type ReactNode, useEffect, useState } from 'react';
import Swal from 'sweetalert2';

// DataTables React requires a one-time registration before the component is mounted.
// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DtCore);

function FormCollapse({
    title,
    summary,
    children,
    defaultOpen = false,
}: {
    title: string;
    summary: string;
    children: ReactNode;
    defaultOpen?: boolean;
}) {
    return (
        <Collapsible defaultOpen={defaultOpen} className="adf-soft-panel overflow-hidden rounded-[28px]">
            <CollapsibleTrigger className="group focus-visible:ring-primary flex w-full items-center justify-between gap-4 p-5 text-left transition-colors outline-none hover:bg-white/5 focus-visible:ring-2 focus-visible:ring-inset sm:px-7 sm:py-6">
                <span className="min-w-0">
                    <span className="block text-lg font-bold">{title}</span>
                    <span className="text-muted-foreground mt-1 block text-sm">{summary}</span>
                </span>
                <ChevronDown className="size-5 shrink-0 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </CollapsibleTrigger>
            <CollapsibleContent>
                <div className="border-t border-white/10 p-5 sm:p-7">{children}</div>
            </CollapsibleContent>
        </Collapsible>
    );
}

interface Register {
    name: string;
    currency: string;
    balance: number;
    openedAt: string | null;
    openedBy: string | null;
}
interface Movement {
    id: number;
    kind: string;
    direction: 'in' | 'out';
    amount: number;
    occurredAt: string;
    category: string;
    description: string;
    reference: string | null;
    createdBy: string | null;
    approvedBy: string | null;
    reversesTransactionId: number | null;
    alreadyCorrected: boolean;
}
interface Props {
    register: Register;
    transactions: Movement[];
    hasOpeningBalance: boolean;
    oldestMovementAt: string | null;
    openingDate: string;
    today: string;
}
const breadcrumbs: BreadcrumbItem[] = [{ title: 'Caisse', href: '/administration/caisse' }];
const amountLabel = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const dateLabel = (date: string) => new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(date));
const kindLabel: Record<string, string> = {
    opening: 'Solde d’ouverture',
    income: 'Entrée manuelle',
    expense: 'Dépense approuvée',
    reversal: 'Contre-écriture',
    membership: 'Adhésion',
    contribution: 'Cotisation',
};
const notifyError = (errors: Record<string, string>) =>
    void ClubAlert.fire({
        icon: 'error',
        title: 'Opération impossible',
        text: Object.values(errors).join('\n') || 'Le serveur n’a pas pu traiter la demande.',
        confirmButtonText: 'Compris',
    });

export default function CashRegisterPage({ register, transactions, hasOpeningBalance, oldestMovementAt, openingDate, today }: Props) {
    const opening = useForm({ amount: 0, occurred_at: openingDate, description: 'Solde d’ouverture de la caisse du club' });
    const income = useForm({ amount: 0, occurred_at: today, category: 'Autre entrée', description: '', reference: '' });
    const expense = useForm({ amount: 0, occurred_at: today, category: '', description: '', reference: '' });
    const correction = useForm({
        direction: 'out' as 'in' | 'out',
        amount: 0,
        occurred_at: today,
        category: '',
        description: '',
        reason: '',
        reference: '',
    });
    const [correcting, setCorrecting] = useState<number | null>(null);

    useEffect(() => {
        const removeListener = router.on('success', (event) => {
            if (event.detail.page.component !== 'admin/cash-register') return;

            const status = (event.detail.page.props as { flash?: SharedData['flash'] }).flash?.status;
            if (!status) return;

            void ClubAlert.fire({
                icon: 'success',
                title: 'Enregistrement réussi',
                text: status,
                confirmButtonText: 'Fermer',
            });
        });

        return removeListener;
    }, []);

    const submit = async (title: string, text: string, post: () => void) => {
        const answer = await Swal.fire({
            title,
            text,
            icon: 'question',
            showCancelButton: true,
            confirmButtonText: 'Confirmer',
            cancelButtonText: 'Annuler',
        });
        if (!answer.isConfirmed) return;
        post();
    };
    const saveOpening = () =>
        void submit(
            'Enregistrer le solde d’ouverture ?',
            `Montant : ${amountLabel(opening.data.amount)}. Cette entrée de départ sera conservée dans l’historique.`,
            () => opening.post(route('admin.cash-register.opening'), { preserveScroll: true, onError: notifyError }),
        );
    const saveIncome = () =>
        void submit('Enregistrer cette entrée ?', `${amountLabel(income.data.amount)} · ${income.data.description}`, () =>
            income.post(route('admin.cash-register.income'), { preserveScroll: true, onError: notifyError }),
        );
    const saveExpense = () =>
        void submit(
            'Enregistrer et approuver cette dépense ?',
            `${amountLabel(expense.data.amount)} · ${expense.data.description}. L’opération sera inscrite au nom du responsable.`,
            () => expense.post(route('admin.cash-register.expense'), { preserveScroll: true, onError: notifyError }),
        );
    const startCorrection = (movement: Movement) => {
        setCorrecting(movement.id);
        correction.setData({
            direction: movement.direction,
            amount: movement.amount,
            occurred_at: movement.occurredAt.slice(0, 10),
            category: movement.category,
            description: movement.description,
            reason: '',
            reference: movement.reference ?? '',
        });
    };
    const saveCorrection = async () => {
        if (!correcting) return;
        const answer = await Swal.fire({
            title: 'Corriger ce mouvement ?',
            text: 'L’écriture d’origine sera conservée. Le système ajoutera une contre-écriture et le mouvement corrigé.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Corriger',
            cancelButtonText: 'Annuler',
        });
        if (!answer.isConfirmed) return;
        correction.post(route('admin.cash-register.correct', { transaction: correcting }), {
            preserveScroll: true,
            onSuccess: () => {
                setCorrecting(null);
            },
            onError: notifyError,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Caisse du club" />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10 sm:py-11">
                        <span className="adf-eyebrow text-blue-200">Gestion financière</span>
                        <h1 className="mt-4 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Caisse du club</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-blue-100/75">
                            Une caisse en FCFA. Les adhésions et cotisations confirmées sont ajoutées automatiquement au journal.
                        </p>
                    </section>
                </Reveal>
                <section className="grid gap-4 sm:grid-cols-2">
                    <article className="adf-soft-panel rounded-[24px] p-5">
                        <Wallet className="text-primary size-5" />
                        <span className="text-muted-foreground mt-3 block text-sm">
                            {hasOpeningBalance ? 'Solde disponible' : 'Solde à confirmer à l’ouverture'}
                        </span>
                        <strong className="mt-1 block text-3xl">{amountLabel(register.balance)}</strong>
                    </article>
                    <article className="adf-soft-panel rounded-[24px] p-5">
                        <CircleDollarSign className="text-primary size-5" />
                        <span className="text-muted-foreground mt-3 block text-sm">État de la caisse</span>
                        <strong className="mt-1 block text-xl">{hasOpeningBalance ? 'Ouverte' : 'Solde d’ouverture à saisir'}</strong>
                        {register.openedAt && (
                            <span className="text-muted-foreground mt-1 block text-sm">
                                Ouverte le {dateLabel(register.openedAt)}
                                {register.openedBy ? ` par ${register.openedBy}` : ''}
                            </span>
                        )}
                    </article>
                </section>

                {!hasOpeningBalance && (
                    <FormCollapse title="Ouvrir la caisse" summary="Saisir le solde réel de départ" defaultOpen>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Saisis le montant réellement présent en caisse à la date choisie. Les anciennes adhésions et cotisations restent
                            consultables dans le journal, mais ne sont pas ajoutées à ce solde, car les dépenses antérieures ne sont pas reprises.
                        </p>
                        {oldestMovementAt && (
                            <p className="mt-2 text-sm">
                                Le journal contient des règlements antérieurs, dont le plus ancien date du {dateLabel(oldestMovementAt)}.
                            </p>
                        )}
                        <div className="mt-4 grid gap-3 md:grid-cols-3">
                            <label className="text-sm font-semibold">
                                Solde réel (FCFA)
                                <Input
                                    className="mt-2"
                                    type="number"
                                    min="0"
                                    value={opening.data.amount}
                                    onChange={(e) => opening.setData('amount', Number(e.target.value))}
                                />
                            </label>
                            <label className="text-sm font-semibold">
                                Date d’ouverture
                                <Input
                                    className="mt-2"
                                    type="date"
                                    value={opening.data.occurred_at}
                                    onChange={(e) => opening.setData('occurred_at', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold">
                                Note
                                <Input
                                    className="mt-2"
                                    value={opening.data.description}
                                    onChange={(e) => opening.setData('description', e.target.value)}
                                />
                            </label>
                        </div>
                        <Button className="mt-4" type="button" disabled={opening.processing} onClick={saveOpening}>
                            Enregistrer le solde d’ouverture
                        </Button>
                    </FormCollapse>
                )}

                {hasOpeningBalance && (
                    <section className="grid gap-5 xl:grid-cols-2">
                        <FormCollapse title="Ajouter une autre entrée" summary="Saisir une recette hors adhésions et cotisations">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    saveIncome();
                                }}
                            >
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <label className="text-sm font-semibold">
                                        Montant (FCFA)
                                        <Input
                                            type="number"
                                            min="1"
                                            className="mt-2"
                                            value={income.data.amount || ''}
                                            onChange={(e) => income.setData('amount', Number(e.target.value))}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold">
                                        Date
                                        <Input
                                            type="date"
                                            className="mt-2"
                                            value={income.data.occurred_at}
                                            onChange={(e) => income.setData('occurred_at', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold">
                                        Catégorie
                                        <Input
                                            className="mt-2"
                                            value={income.data.category}
                                            onChange={(e) => income.setData('category', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold">
                                        Référence (facultatif)
                                        <Input
                                            className="mt-2"
                                            value={income.data.reference}
                                            onChange={(e) => income.setData('reference', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold sm:col-span-2">
                                        Motif
                                        <Input
                                            className="mt-2"
                                            value={income.data.description}
                                            onChange={(e) => income.setData('description', e.target.value)}
                                        />
                                    </label>
                                </div>
                                <Button className="mt-4" type="submit" disabled={income.processing}>
                                    Enregistrer l’entrée
                                </Button>
                            </form>
                        </FormCollapse>
                        <FormCollapse title="Enregistrer une dépense" summary="Saisie et approbation par le responsable">
                            <form
                                onSubmit={(e) => {
                                    e.preventDefault();
                                    saveExpense();
                                }}
                            >
                                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                                    <label className="text-sm font-semibold">
                                        Montant (FCFA)
                                        <Input
                                            type="number"
                                            min="1"
                                            className="mt-2"
                                            value={expense.data.amount || ''}
                                            onChange={(e) => expense.setData('amount', Number(e.target.value))}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold">
                                        Date
                                        <Input
                                            type="date"
                                            className="mt-2"
                                            value={expense.data.occurred_at}
                                            onChange={(e) => expense.setData('occurred_at', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold sm:col-span-2">
                                        Catégorie
                                        <Input
                                            className="mt-2"
                                            placeholder="Ex. matériel, transport"
                                            value={expense.data.category}
                                            onChange={(e) => expense.setData('category', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold sm:col-span-2">
                                        Motif
                                        <Input
                                            className="mt-2"
                                            value={expense.data.description}
                                            onChange={(e) => expense.setData('description', e.target.value)}
                                        />
                                    </label>
                                    <label className="text-sm font-semibold sm:col-span-2">
                                        Référence / justificatif (facultatif)
                                        <Input
                                            className="mt-2"
                                            value={expense.data.reference}
                                            onChange={(e) => expense.setData('reference', e.target.value)}
                                        />
                                    </label>
                                </div>
                                <Button className="mt-4" type="submit" disabled={expense.processing}>
                                    Enregistrer et approuver
                                </Button>
                            </form>
                        </FormCollapse>
                    </section>
                )}

                {correcting && (
                    <FormCollapse title="Contre-écriture et nouvelle écriture" summary="Le mouvement original restera dans le journal" defaultOpen>
                        <p className="text-muted-foreground text-sm">Le mouvement original reste intact dans le journal.</p>
                        <div className="mt-4 grid gap-3 sm:grid-cols-2">
                            <label className="text-sm font-semibold">
                                Type corrigé
                                <select
                                    className="border-input bg-background mt-2 flex h-10 w-full rounded-md border px-3"
                                    value={correction.data.direction}
                                    onChange={(e) => correction.setData('direction', e.target.value as 'in' | 'out')}
                                >
                                    <option value="in">Entrée</option>
                                    <option value="out">Dépense</option>
                                </select>
                            </label>
                            <label className="text-sm font-semibold">
                                Montant (FCFA)
                                <Input
                                    type="number"
                                    min="1"
                                    className="mt-2"
                                    value={correction.data.amount}
                                    onChange={(e) => correction.setData('amount', Number(e.target.value))}
                                />
                            </label>
                            <label className="text-sm font-semibold">
                                Date
                                <Input
                                    type="date"
                                    className="mt-2"
                                    value={correction.data.occurred_at}
                                    onChange={(e) => correction.setData('occurred_at', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold">
                                Catégorie
                                <Input
                                    className="mt-2"
                                    value={correction.data.category}
                                    onChange={(e) => correction.setData('category', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold sm:col-span-2">
                                Description corrigée
                                <Input
                                    className="mt-2"
                                    value={correction.data.description}
                                    onChange={(e) => correction.setData('description', e.target.value)}
                                />
                            </label>
                            <label className="text-sm font-semibold sm:col-span-2">
                                Motif de correction
                                <Input
                                    className="mt-2"
                                    value={correction.data.reason}
                                    onChange={(e) => correction.setData('reason', e.target.value)}
                                />
                            </label>
                        </div>
                        <div className="mt-4 flex gap-3">
                            <Button type="button" disabled={correction.processing} onClick={() => void saveCorrection()}>
                                Appliquer la correction
                            </Button>
                            <Button type="button" variant="outline" onClick={() => setCorrecting(null)}>
                                Annuler
                            </Button>
                        </div>
                    </FormCollapse>
                )}

                <section className="adf-soft-panel overflow-hidden rounded-[28px]">
                    <div className="border-b border-white/10 p-5 sm:p-7">
                        <h2 className="text-lg font-bold">Journal de caisse</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                            Les 150 derniers mouvements. Recherche, tri et pagination sont disponibles ; les écritures validées ne sont jamais
                            modifiées ou supprimées.
                        </p>
                    </div>
                    {transactions.length === 0 ? (
                        <p className="text-muted-foreground p-6 text-sm">Aucun mouvement de caisse.</p>
                    ) : (
                        <div className="overflow-x-auto p-4 sm:p-6">
                            <DataTable
                                data={transactions}
                                className="display responsive nowrap w-full"
                                options={{
                                    responsive: true,
                                    autoWidth: false,
                                    pageLength: 10,
                                    order: [[0, 'desc']],
                                    language: {
                                        search: 'Rechercher :',
                                        lengthMenu: 'Afficher _MENU_ mouvements',
                                        info: '_START_ à _END_ sur _TOTAL_ mouvements',
                                        infoEmpty: 'Aucun mouvement',
                                        zeroRecords: 'Aucun résultat',
                                        emptyTable: 'Aucun mouvement de caisse.',
                                        paginate: { first: 'Première', last: 'Dernière', next: 'Suivante', previous: 'Précédente' },
                                    },
                                }}
                            >
                                <Column data="occurredAt" title="Date" render={(value) => dateLabel(value)} />
                                <Column data="kind" title="Type" render={(value) => kindLabel[value] ?? value} />
                                <Column data="category" title="Catégorie" />
                                <Column data="description" title="Motif" />
                                <Column
                                    data="amount"
                                    title="Montant"
                                    render={(value, _type, row: Movement) => (
                                        <span className={row.direction === 'in' ? 'font-semibold text-emerald-500' : 'font-semibold text-rose-500'}>
                                            {row.direction === 'in' ? '+' : '−'}
                                            {amountLabel(Number(value))}
                                        </span>
                                    )}
                                />
                                <Column data="createdBy" title="Saisi par" render={(value) => value ?? 'Historique importé'} />
                                <Column data="reference" title="Référence" render={(value) => value ?? '—'} />
                                <Column data="id" title="Action" options={{ orderable: false, searchable: false }}>
                                    {(_id, _type, row: Movement) =>
                                        !row.alreadyCorrected && row.kind !== 'reversal' ? (
                                            <Button type="button" variant="outline" size="sm" onClick={() => startCorrection(row)}>
                                                <RotateCcw className="size-4" />
                                                Corriger
                                            </Button>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">{row.alreadyCorrected ? 'Corrigé' : '—'}</span>
                                        )
                                    }
                                </Column>
                            </DataTable>
                        </div>
                    )}
                </section>
            </main>
        </AppLayout>
    );
}
