import { Button } from '@/components/ui/button';
import { DatePicker } from '@/components/ui/date-picker';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem } from '@/types';
import { Head, Link, router } from '@inertiajs/react';
import DtCore from 'datatables.net-dt';
import 'datatables.net-dt/css';
import DataTable from 'datatables.net-react';
import 'datatables.net-responsive-dt';
import 'datatables.net-responsive-dt/css';
import { BarChart3, Download, FileText, Filter, ReceiptText } from 'lucide-react';
import { useState } from 'react';

// DataTables React requires a one-time registration before mounting.
// eslint-disable-next-line react-hooks/rules-of-hooks
DataTable.use(DtCore);

type Membership = { member: string; status: string; amount: number; date: string };
type Contribution = { member: string; period: string; status: string; amount: number; receipt: string | null; batch_id: number | null };
type Cash = { date: string; direction: string; category: string; description: string; amount: number };
type Filters = { from?: string; to?: string; member_id?: string; membership_status?: string; contribution_status?: string; category?: string };
type Report = {
    memberships: Membership[];
    contributions: Contribution[];
    cash: Cash[];
    balance: number | null;
    totals: {
        membership_requests: number;
        membership_approved: number;
        contributions_paid: number;
        contributions_paid_amount: number;
        contributions_pending: number;
        contributions_pending_amount: number;
        income: number;
        expenses: number;
    };
};
type Props = { scope: 'admin' | 'member'; filters: Filters; report: Report; members: { id: number; name: string }[]; categories: string[] };

const money = (amount: number) => `${amount.toLocaleString('fr-FR')} FCFA`;
const membershipLabels: Record<string, string> = {
    awaiting_payment: 'Paiement attendu',
    awaiting_approval: 'À approuver',
    approved: 'Approuvée',
    rejected: 'Refusée',
};
const categoryLabels: Record<string, string> = {
    membership_fee: 'Adhésions',
    monthly_contribution: 'Cotisations',
    opening_balance: 'Ouverture',
    correction: 'Correction',
};
const labelCategory = (key: string) => categoryLabels[key] ?? key.replaceAll('_', ' ');
const columns = (titles: string[]) => titles.map((title) => ({ title }));
const tableOptions = {
    responsive: true,
    pageLength: 10,
    language: {
        search: 'Rechercher :',
        lengthMenu: 'Afficher _MENU_ lignes',
        info: '_START_ à _END_ sur _TOTAL_',
        infoEmpty: 'Aucune ligne',
        zeroRecords: 'Aucun résultat',
        emptyTable: 'Aucune donnée',
        paginate: { previous: 'Précédent', next: 'Suivant' },
    },
};

export default function StatisticsReport({ scope, filters, report, members, categories }: Props) {
    const isAdmin = scope === 'admin';
    const [draft, setDraft] = useState<Filters>(filters);
    const [exporting, setExporting] = useState(false);
    const path = isAdmin ? '/administration/statistiques' : '/mes-statistiques';
    const breadcrumbs: BreadcrumbItem[] = isAdmin
        ? [
              { title: 'Administration', href: '/administration' },
              { title: 'Statistiques', href: path },
          ]
        : [
              { title: 'Mon espace', href: '/mon-espace' },
              { title: 'Mes statistiques', href: path },
          ];
    const query = (values: Filters) => Object.fromEntries(Object.entries(values).filter(([, value]) => value !== '' && value !== undefined));
    const apply = (event: React.FormEvent) => {
        event.preventDefault();
        router.get(path, query(draft), { preserveState: true, preserveScroll: true });
    };
    const reset = () => {
        setDraft({});
        router.get(path, {}, { preserveState: true, preserveScroll: true });
    };

    const summaryRows = [
        ['Demandes d’adhésion', report.totals.membership_requests],
        ['Adhésions approuvées', report.totals.membership_approved],
        ['Mois réglés', report.totals.contributions_paid],
        ['Montant réglé', money(report.totals.contributions_paid_amount)],
        ['Mois à régler', report.totals.contributions_pending],
        ['Montant à régler', money(report.totals.contributions_pending_amount)],
        ...(isAdmin
            ? [
                  ['Recettes de caisse', money(report.totals.income)],
                  ['Dépenses de caisse', money(report.totals.expenses)],
                  ['Solde actuel', money(report.balance ?? 0)],
              ]
            : []),
    ];
    const exportFilters = [
        ['Du', filters.from || 'Toutes les dates'],
        ['Au', filters.to || 'Toutes les dates'],
        ...(isAdmin ? [['Membre', members.find((member) => String(member.id) === String(filters.member_id))?.name ?? 'Tous']] : []),
        ['Adhésion', filters.membership_status ? membershipLabels[filters.membership_status] : 'Tous les statuts'],
        [
            'Cotisation',
            filters.contribution_status === 'paid' ? 'Réglée' : filters.contribution_status === 'pending' ? 'À régler' : 'Tous les statuts',
        ],
        ...(isAdmin ? [['Catégorie', filters.category ? labelCategory(filters.category) : 'Toutes']] : []),
    ];
    const membershipRows = report.memberships.map((row) => [row.date, row.member, membershipLabels[row.status] ?? row.status, money(row.amount)]);
    const contributionRows = report.contributions.map((row) => [
        row.period,
        row.member,
        row.status === 'paid' ? 'Réglé' : 'À régler',
        money(row.amount),
        row.receipt ?? '—',
    ]);
    const cashRows = report.cash.map((row) => [
        row.date,
        row.direction === 'in' ? 'Recette' : 'Dépense',
        labelCategory(row.category),
        row.description,
        money(row.amount),
    ]);

    const exportExcel = async () => {
        setExporting(true);
        try {
            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const addSheet = (name: string, headers: string[], rows: (string | number)[][]) => {
                const sheet = workbook.addWorksheet(name);
                sheet.addRow(headers);
                rows.forEach((row) => sheet.addRow(row));
                sheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
                sheet.getRow(1).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF102D72' } };
                sheet.columns.forEach((column) => {
                    column.width = 24;
                });
                sheet.autoFilter = { from: 'A1', to: `${String.fromCharCode(64 + headers.length)}1` };
            };
            addSheet('Résumé', ['Indicateur', 'Valeur'], [...exportFilters, ...summaryRows]);
            addSheet('Adhésions', ['Date', 'Membre', 'Statut', 'Montant'], membershipRows);
            addSheet('Cotisations', ['Mois', 'Membre', 'Statut', 'Montant', 'Reçu'], contributionRows);
            if (isAdmin) addSheet('Caisse', ['Date', 'Type', 'Catégorie', 'Motif', 'Montant'], cashRows);
            const buffer = await workbook.xlsx.writeBuffer();
            const url = URL.createObjectURL(new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }));
            const anchor = document.createElement('a');
            anchor.href = url;
            anchor.download = `amis-de-foot-statistiques-${scope}.xlsx`;
            anchor.click();
            URL.revokeObjectURL(url);
        } catch {
            void ClubAlert.fire({ title: 'Export Excel impossible', text: 'Veuillez réessayer.', icon: 'error' });
        } finally {
            setExporting(false);
        }
    };
    const exportPdf = async () => {
        setExporting(true);
        try {
            const [{ jsPDF }, { autoTable }] = await Promise.all([import('jspdf'), import('jspdf-autotable')]);
            const pdf = new jsPDF({ orientation: 'landscape' });
            // Les polices intégrées à jsPDF sont limitées à WinAnsi ; elles couvrent les libellés français usuels.
            const section = (title: string, headers: string[], rows: (string | number)[][], first = false) => {
                if (!first) pdf.addPage();
                pdf.setFontSize(17);
                pdf.setTextColor(16, 45, 114);
                pdf.text(title, 14, 18);
                pdf.setFontSize(9);
                pdf.setTextColor(80, 90, 110);
                pdf.text(
                    `Amis de foot | ${filters.from || 'début'} au ${filters.to || 'aujourd’hui'} | ${isAdmin ? 'Gestion du club' : 'Compte personnel'}`,
                    14,
                    25,
                );
                autoTable(pdf, {
                    head: [headers],
                    body: rows.map((row) => row.map(String)),
                    startY: 30,
                    theme: 'striped',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [16, 45, 114] },
                });
            };
            section(isAdmin ? 'Statistiques du club' : 'Mes statistiques', ['Indicateur', 'Valeur'], [...exportFilters, ...summaryRows], true);
            section('Adhésions', ['Date', 'Membre', 'Statut', 'Montant'], membershipRows);
            section('Cotisations', ['Mois', 'Membre', 'Statut', 'Montant', 'Reçu'], contributionRows);
            if (isAdmin) section('Caisse', ['Date', 'Type', 'Catégorie', 'Motif', 'Montant'], cashRows);
            pdf.save(`amis-de-foot-statistiques-${scope}.pdf`);
        } catch {
            void ClubAlert.fire({ title: 'Export PDF impossible', text: 'Veuillez réessayer.', icon: 'error' });
        } finally {
            setExporting(false);
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title={isAdmin ? 'Rapports et statistiques' : 'Mes statistiques'} />
            <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
                <Reveal>
                    <section className="adf-scene rounded-[30px] px-6 py-8 sm:px-10">
                        <span className="adf-eyebrow text-blue-200">{isAdmin ? 'Gestion du club' : 'Votre suivi'}</span>
                        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
                            {isAdmin ? 'Rapports et statistiques' : 'Mes statistiques'}
                        </h1>
                        <p className="mt-3 max-w-2xl text-sm text-blue-100/80">
                            {isAdmin
                                ? 'Suivez les adhésions, les cotisations et les finances de la caisse.'
                                : 'Retrouvez votre adhésion, vos cotisations et vos reçus.'}
                        </p>
                    </section>
                </Reveal>
                <section className="adf-soft-panel relative z-20 rounded-[26px] p-5 sm:p-6" aria-label="Filtres des statistiques">
                    <h2 className="flex items-center gap-2 text-lg font-bold">
                        <Filter className="size-5 text-blue-600" /> Filtres
                    </h2>
                    <form onSubmit={apply} className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <DatePicker
                            label="Du"
                            value={draft.from}
                            onChange={(from) => setDraft({ ...draft, from, to: draft.to && from && draft.to < from ? '' : draft.to })}
                        />
                        <DatePicker label="Au" value={draft.to} min={draft.from} align="right" onChange={(to) => setDraft({ ...draft, to })} />
                        {isAdmin && (
                            <label className="text-sm font-semibold">
                                Membre{' '}
                                <select
                                    value={draft.member_id ?? ''}
                                    onChange={(e) => setDraft({ ...draft, member_id: e.target.value })}
                                    className="bg-background mt-1 w-full rounded-xl border px-3 py-2"
                                >
                                    <option value="">Tous les membres</option>
                                    {members.map((member) => (
                                        <option key={member.id} value={member.id}>
                                            {member.name}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        <label className="text-sm font-semibold">
                            Statut d’adhésion{' '}
                            <select
                                value={draft.membership_status ?? ''}
                                onChange={(e) => setDraft({ ...draft, membership_status: e.target.value })}
                                className="bg-background mt-1 w-full rounded-xl border px-3 py-2"
                            >
                                <option value="">Tous</option>
                                {Object.entries(membershipLabels).map(([value, label]) => (
                                    <option key={value} value={value}>
                                        {label}
                                    </option>
                                ))}
                            </select>
                        </label>
                        <label className="text-sm font-semibold">
                            Statut de cotisation{' '}
                            <select
                                value={draft.contribution_status ?? ''}
                                onChange={(e) => setDraft({ ...draft, contribution_status: e.target.value })}
                                className="bg-background mt-1 w-full rounded-xl border px-3 py-2"
                            >
                                <option value="">Tous</option>
                                <option value="paid">Réglé</option>
                                <option value="pending">À régler</option>
                            </select>
                        </label>
                        {isAdmin && (
                            <label className="text-sm font-semibold">
                                Catégorie financière{' '}
                                <select
                                    value={draft.category ?? ''}
                                    onChange={(e) => setDraft({ ...draft, category: e.target.value })}
                                    className="bg-background mt-1 w-full rounded-xl border px-3 py-2"
                                >
                                    <option value="">Toutes</option>
                                    {categories.map((category) => (
                                        <option key={category} value={category}>
                                            {labelCategory(category)}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        )}
                        <div className="flex flex-wrap items-end gap-2 sm:col-span-2 lg:col-span-3">
                            <Button type="submit" className="text-white">
                                Appliquer les filtres
                            </Button>
                            <Button type="button" variant="outline" onClick={reset}>
                                Effacer
                            </Button>
                        </div>
                    </form>
                    <p className="text-muted-foreground mt-3 text-xs">
                        Les dates filtrent les demandes et les mouvements à leur date ; les cotisations selon le mois concerné. Les mois futurs sans
                        paiement ne sont pas « à régler ».
                    </p>
                </section>
                <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3" aria-label="Indicateurs">
                    {summaryRows.map(([label, value]) => (
                        <div key={label} className="adf-soft-panel rounded-2xl p-5">
                            <p className="text-muted-foreground text-sm">{label}</p>
                            <strong className="mt-2 block text-2xl font-extrabold text-blue-800 dark:text-blue-200">{value}</strong>
                        </div>
                    ))}
                </section>
                {isAdmin && (
                    <p className="text-muted-foreground text-sm">
                        Le solde est le solde actuel de la caisse entière. Les recettes et dépenses excluent le solde d’ouverture et les écritures
                        remplacées par correction. Les règlements antérieurs à l’ouverture de caisse sont conservés dans l’historique, hors totaux de
                        caisse.
                    </p>
                )}
                <div className="flex flex-wrap gap-3">
                    <Button type="button" disabled={exporting} onClick={() => void exportExcel()} className="text-white">
                        <Download className="mr-2 size-4" /> Exporter Excel
                    </Button>
                    <Button type="button" disabled={exporting} onClick={() => void exportPdf()} className="text-white">
                        <FileText className="mr-2 size-4" /> Exporter PDF
                    </Button>
                </div>
                <section className="adf-soft-panel min-w-0 rounded-[26px] p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <BarChart3 className="size-5 text-blue-600" /> Adhésions
                    </h2>
                    <DataTable
                        data={membershipRows}
                        columns={columns(['Date', 'Membre', 'Statut', 'Montant'])}
                        options={tableOptions}
                        className="display nowrap w-full"
                    />
                </section>
                <section className="adf-soft-panel min-w-0 rounded-[26px] p-5 sm:p-6">
                    <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
                        <ReceiptText className="size-5 text-blue-600" /> Cotisations
                    </h2>
                    <DataTable
                        data={contributionRows}
                        columns={columns(['Mois', 'Membre', 'Statut', 'Montant', 'N° reçu'])}
                        options={tableOptions}
                        className="display nowrap w-full"
                    />
                    {!isAdmin && (
                        <div className="mt-5 flex flex-wrap gap-2">
                            {report.contributions
                                .filter((row) => row.batch_id && row.receipt)
                                .map((row) => (
                                    <Link
                                        key={`${row.batch_id}-${row.period}`}
                                        href={`/cotisations/${row.batch_id}/recu`}
                                        className="rounded-xl border border-blue-300 px-3 py-2 text-sm font-semibold text-blue-700 dark:text-blue-200"
                                    >
                                        Reçu {row.receipt}
                                    </Link>
                                ))}
                        </div>
                    )}
                </section>
                {isAdmin && (
                    <section className="adf-soft-panel min-w-0 rounded-[26px] p-5 sm:p-6">
                        <h2 className="mb-4 text-lg font-bold">Mouvements de caisse</h2>
                        <DataTable
                            data={cashRows}
                            columns={columns(['Date', 'Type', 'Catégorie', 'Motif', 'Montant'])}
                            options={tableOptions}
                            className="display nowrap w-full"
                        />
                    </section>
                )}
            </main>
        </AppLayout>
    );
}
