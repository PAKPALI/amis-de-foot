import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect } from 'react';

import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem, type SharedData } from '@/types';

interface RoleOption {
    value: string;
    label: string;
}

interface Member {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    role: RoleOption['value'];
    account_status: 'active' | 'suspended' | 'left';
}

interface RoleChange {
    id: number;
    subject_name: string;
    actor_name: string | null;
    old_role: string;
    new_role: string;
    reason: string;
    created_at: string;
}

interface PasswordReset {
    id: number;
    subject_name: string;
    actor_name: string;
    reason: string;
    created_at: string;
}

interface RoleManagementProps {
    members: Member[];
    roles: RoleOption[];
    canManageRoles: boolean;
    history: RoleChange[];
    passwordResetHistory: PasswordReset[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '/administration' },
    { title: 'Rôles des membres', href: '/administration/roles' },
];

function RoleForm({ member, roles, canManageRoles }: { member: Member; roles: RoleOption[]; canManageRoles: boolean }) {
    const { data, setData, patch, processing, errors } = useForm({
        role: member.role,
        reason: '',
    });
    const resetForm = useForm({ reason: '' });
    const deactivateForm = useForm({ status: 'suspended', reason: '' });

    const submit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const selectedRole = roles.find((role) => role.value === data.role)?.label ?? data.role;
        const result = await ClubAlert.fire({
            title: 'Confirmer le changement de rôle ?',
            text: `${member.name} aura le rôle « ${selectedRole} ». Motif : ${data.reason}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Confirmer',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        patch(route('admin.roles.update', { user: member.id }), {
            preserveScroll: true,
            onSuccess: () => {
                void ClubAlert.fire({
                    title: 'Rôle mis à jour',
                    icon: 'success',
                    timer: 1400,
                    showConfirmButton: false,
                });
            },
        });
    };

    const resetAccess = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();

        const result = await ClubAlert.fire({
            title: 'Réinitialiser l’accès ?',
            text: `Un mot de passe provisoire sera créé pour ${member.name}. La personne devra le changer à sa prochaine connexion. Remettez-lui ce mot de passe en main propre. Motif : ${resetForm.data.reason}`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Réinitialiser',
            cancelButtonText: 'Annuler',
        });

        if (!result.isConfirmed) return;

        resetForm.post(route('admin.members.reset-access', { user: member.id }), {
            preserveScroll: true,
            onSuccess: () => resetForm.reset(),
        });
    };

    const deactivate = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const statusLabel = deactivateForm.data.status === 'left' ? 'parti' : 'suspendu';
        const result = await ClubAlert.fire({
            title: `Désactiver ce compte ?`,
            text: `${member.name} ne pourra plus se connecter. Statut : ${statusLabel}.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Désactiver',
            cancelButtonText: 'Annuler',
        });
        if (result.isConfirmed) deactivateForm.patch(route('admin.members.deactivate', { user: member.id }), { preserveScroll: true });
    };

    return (
        <div className="adf-soft-panel grid gap-4 rounded-[24px] p-5 sm:p-6">
            <div className="min-w-0">
                <p className="font-medium">{member.name}</p>
                <p className="text-muted-foreground truncate text-sm">{member.email || member.phone || 'Contact non renseigné'}</p>
            </div>
            {canManageRoles && (
                <form className="grid gap-3 md:grid-cols-[1fr_2fr_auto] md:items-end" onSubmit={submit}>
                    <div className="grid gap-2">
                        <Label htmlFor={`role-${member.id}`}>Rôle</Label>
                        <select
                            id={`role-${member.id}`}
                            className="border-input bg-background/75 focus-visible:outline-primary h-11 rounded-xl border px-3 text-sm focus-visible:outline-2 focus-visible:outline-offset-2"
                            value={data.role}
                            onChange={(event) => setData('role', event.target.value)}
                            disabled={processing}
                        >
                            {roles.map((role) => (
                                <option key={role.value} value={role.value}>
                                    {role.label}
                                </option>
                            ))}
                        </select>
                        <InputError message={errors.role} />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor={`role-reason-${member.id}`}>Motif obligatoire</Label>
                        <Input
                            id={`role-reason-${member.id}`}
                            value={data.reason}
                            onChange={(event) => setData('reason', event.target.value)}
                            placeholder="Ex. désignation par le bureau"
                            disabled={processing}
                        />
                        <InputError message={errors.reason} />
                    </div>
                    <Button type="submit" disabled={processing || data.role === member.role || data.reason.trim().length < 5}>
                        Modifier le rôle
                    </Button>
                </form>
            )}
            <form className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end" onSubmit={resetAccess}>
                <div className="grid gap-2">
                    <Label htmlFor={`reset-reason-${member.id}`}>Motif de réinitialisation</Label>
                    <Input
                        id={`reset-reason-${member.id}`}
                        value={resetForm.data.reason}
                        onChange={(event) => resetForm.setData('reason', event.target.value)}
                        placeholder="Ex. demande du membre"
                        disabled={resetForm.processing}
                    />
                    <InputError message={resetForm.errors.reason} />
                </div>
                <Button type="submit" variant="outline" disabled={resetForm.processing || resetForm.data.reason.trim().length < 5}>
                    Réinitialiser l’accès
                </Button>
            </form>
            {member.account_status === 'active' ? (
                <form className="grid gap-3 md:grid-cols-[auto_1fr_auto] md:items-end" onSubmit={deactivate}>
                    <div className="grid gap-2">
                        <Label htmlFor={`account-status-${member.id}`}>Statut</Label>
                        <select id={`account-status-${member.id}`} className="border-input bg-background/75 h-11 rounded-xl border px-3 text-sm" value={deactivateForm.data.status} onChange={(event) => deactivateForm.setData('status', event.target.value as 'suspended' | 'left')}>
                            <option value="suspended">Suspendu</option>
                            <option value="left">Parti</option>
                        </select>
                    </div>
                    <div className="grid gap-2"><Label htmlFor={`account-reason-${member.id}`}>Motif facultatif</Label><Input id={`account-reason-${member.id}`} value={deactivateForm.data.reason} onChange={(event) => deactivateForm.setData('reason', event.target.value)} placeholder="Ex. départ du club" /></div>
                    <Button type="submit" variant="destructive" disabled={deactivateForm.processing}>Désactiver le compte</Button>
                </form>
            ) : <p className="text-sm font-semibold text-amber-500">Compte {member.account_status === 'left' ? 'parti' : 'suspendu'} : connexion bloquée.</p>}
        </div>
    );
}

export default function RoleManagement({ members, roles, canManageRoles, history, passwordResetHistory }: RoleManagementProps) {
    const { flash } = usePage<SharedData>().props;

    useEffect(() => {
        if (!flash.temporaryPassword) return;

        void ClubAlert.fire({
            title: `Mot de passe provisoire · ${flash.temporaryPasswordFor ?? 'membre'}`,
            input: 'text',
            inputValue: flash.temporaryPassword,
            inputAttributes: { readonly: 'readonly', 'aria-label': 'Mot de passe provisoire à remettre au membre' },
            confirmButtonText: 'Fermer',
            footer: 'Copiez-le et remettez-le directement au membre. Il devra le changer à sa prochaine connexion.',
        });
    }, [flash.temporaryPassword, flash.temporaryPasswordFor]);

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Rôles des membres" />
            <main className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-4 py-6 sm:px-8 sm:py-9">
                <section className="adf-scene mb-2 rounded-[30px] px-6 py-9 sm:px-10">
                    <p className="adf-eyebrow text-blue-200">Administration du club</p>
                    <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.045em] text-white sm:text-4xl">Gestion des rôles</h1>
                    <p className="mt-3 max-w-3xl text-sm leading-6 text-blue-100/75">
                        Les réinitialisations sont réservées à l’administration. Seul un responsable habilité peut modifier les rôles. Chaque
                        opération exige un motif et reste historisée.
                    </p>
                </section>
                {members.map((member) => (
                    <RoleForm key={member.id} member={member} roles={roles} canManageRoles={canManageRoles} />
                ))}
                {members.length === 0 && <p className="adf-soft-panel text-muted-foreground rounded-[24px] p-6">Aucun membre enregistré.</p>}
                {canManageRoles && history.length > 0 && (
                    <section className="adf-soft-panel mt-4 rounded-[24px] p-6">
                        <h2 className="font-semibold">Historique des rôles</h2>
                        <div className="mt-4 space-y-3">
                            {history.map((change) => (
                                <article key={change.id} className="border-b pb-3 text-sm last:border-0">
                                    <p className="font-medium">
                                        {change.subject_name} : {change.old_role} → {change.new_role}
                                    </p>
                                    <p className="text-muted-foreground">
                                        Par {change.actor_name ?? 'compte supprimé'} · {change.created_at}
                                    </p>
                                    <p>{change.reason}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
                {passwordResetHistory.length > 0 && (
                    <section className="adf-soft-panel mt-4 rounded-[24px] p-6">
                        <h2 className="font-semibold">Historique des réinitialisations</h2>
                        <div className="mt-4 space-y-3">
                            {passwordResetHistory.map((reset) => (
                                <article key={reset.id} className="border-b pb-3 text-sm last:border-0">
                                    <p className="font-medium">{reset.subject_name}</p>
                                    <p className="text-muted-foreground">
                                        Réinitialisé par {reset.actor_name} · {reset.created_at}
                                    </p>
                                    <p>{reset.reason}</p>
                                </article>
                            ))}
                        </div>
                    </section>
                )}
            </main>
        </AppLayout>
    );
}
