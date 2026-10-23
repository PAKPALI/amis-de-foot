import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Reveal } from '@/components/ui/reveal';
import AppLayout from '@/layouts/app-layout';
import { ClubAlert } from '@/lib/club-alert';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Head, useForm, usePage } from '@inertiajs/react';
import { ChevronDown, ShieldCheck, UserRoundPlus, UsersRound } from 'lucide-react';
import { useEffect, useRef } from 'react';

type AdministrativeUser = {
    id: number;
    name: string;
    email: string | null;
    phone: string | null;
    role: 'administrator' | 'manager';
    account_status: 'active' | 'suspended' | 'left';
    created_at: string;
};

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Administration', href: '/administration' },
    { title: 'Utilisateurs', href: '/administration/utilisateurs' },
];

export default function Users({ users }: { users: AdministrativeUser[] }) {
    const form = useForm({ name: '', email: '', phone: '' });
    const { flash } = usePage<SharedData>().props;
    const handledPassword = useRef<string | null>(null);

    useEffect(() => {
        if (!flash.temporaryPassword || handledPassword.current === flash.temporaryPassword) return;
        handledPassword.current = flash.temporaryPassword;
        void ClubAlert.fire({
            title: `Compte créé · ${flash.temporaryPasswordFor ?? 'Administrateur'}`,
            text: 'Copiez ce mot de passe provisoire et remettez-le directement à la personne.',
            input: 'text',
            inputValue: flash.temporaryPassword,
            inputAttributes: { readonly: 'readonly', 'aria-label': 'Mot de passe provisoire du nouvel administrateur' },
            icon: 'success',
            confirmButtonText: 'J’ai copié le mot de passe',
            footer: 'Il devra être changé lors de la première connexion.',
        });
    }, [flash.temporaryPassword, flash.temporaryPasswordFor]);

    const submit = (event: React.FormEvent) => {
        event.preventDefault();
        form.post(route('admin.users.store'), { preserveScroll: true, onSuccess: () => form.reset() });
    };

    return <AppLayout breadcrumbs={breadcrumbs}>
        <Head title="Utilisateurs administrateurs" />
        <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-8 sm:py-9">
            <Reveal><section className="adf-scene rounded-[30px] px-6 py-9 sm:px-10"><p className="adf-eyebrow text-blue-200">Administration du club</p><h1 className="mt-4 text-3xl font-extrabold text-white sm:text-4xl">Utilisateurs</h1><p className="mt-3 max-w-2xl text-blue-100/75">Créez les comptes des personnes autorisées à administrer le club et consultez les accès administratifs existants.</p></section></Reveal>

            <Collapsible className="adf-soft-panel overflow-hidden rounded-[28px]">
                <CollapsibleTrigger className="group flex w-full items-center justify-between gap-4 p-5 text-left sm:p-7"><span className="flex items-center gap-4"><span className="flex size-11 items-center justify-center rounded-2xl bg-blue-600 text-white"><UserRoundPlus className="size-5" /></span><span><strong className="block text-lg">Créer un administrateur</strong><span className="text-muted-foreground text-sm">Ouvrir le formulaire de création</span></span></span><ChevronDown className="size-5 transition-transform group-data-[state=open]:rotate-180" /></CollapsibleTrigger>
                <CollapsibleContent className="border-t border-white/10 p-5 sm:p-7">
                    <form onSubmit={submit} className="grid gap-5">
                        <div className="grid gap-2"><Label htmlFor="admin-name">Nom complet</Label><Input id="admin-name" value={form.data.name} onChange={(event) => form.setData('name', event.target.value)} autoComplete="name" required placeholder="Nom et prénom" /><InputError message={form.errors.name} /></div>
                        <div className="grid gap-5 md:grid-cols-2">
                            <div className="grid gap-2"><Label htmlFor="admin-email">Adresse e-mail</Label><Input id="admin-email" type="email" value={form.data.email} onChange={(event) => form.setData('email', event.target.value)} autoComplete="email" placeholder="admin@exemple.com" /><InputError message={form.errors.email} /></div>
                            <div className="grid gap-2"><Label htmlFor="admin-phone">Téléphone</Label><Input id="admin-phone" value={form.data.phone} onChange={(event) => form.setData('phone', event.target.value)} autoComplete="tel" placeholder="Numéro de téléphone" /><InputError message={form.errors.phone} /></div>
                        </div>
                        <p className="text-muted-foreground text-sm">Renseignez au moins un e-mail ou un téléphone. Le rôle Administrateur sera attribué automatiquement.</p>
                        <Button type="submit" disabled={form.processing || !form.data.name.trim() || (!form.data.email.trim() && !form.data.phone.trim())} className="sm:justify-self-start"><UserRoundPlus className="size-4" /> Créer le compte administrateur</Button>
                    </form>
                </CollapsibleContent>
            </Collapsible>

            <section className="adf-soft-panel overflow-hidden rounded-[28px]">
                <div className="flex items-center gap-3 border-b p-5 sm:p-7"><UsersRound className="size-6 text-blue-600" /><div><h2 className="text-xl font-bold">Accès administratifs</h2><p className="text-muted-foreground text-sm">{users.length} compte(s) administrateur ou responsable.</p></div></div>
                <div className="overflow-x-auto"><table className="w-full min-w-[720px] text-left text-sm"><thead className="bg-muted/40 text-muted-foreground"><tr><th className="px-6 py-4">Utilisateur</th><th className="px-6 py-4">Contact</th><th className="px-6 py-4">Rôle</th><th className="px-6 py-4">Statut</th><th className="px-6 py-4">Création</th></tr></thead><tbody>{users.map((user) => <tr key={user.id} className="border-t"><td className="px-6 py-4 font-semibold">{user.name}</td><td className="px-6 py-4"><span className="block">{user.email ?? 'Sans e-mail'}</span><span className="text-muted-foreground">{user.phone ?? 'Sans téléphone'}</span></td><td className="px-6 py-4"><span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 font-semibold text-blue-600"><ShieldCheck className="size-4" />{user.role === 'manager' ? 'Responsable habilité' : 'Administrateur'}</span></td><td className="px-6 py-4">{user.account_status === 'active' ? 'Actif' : user.account_status === 'left' ? 'Parti' : 'Suspendu'}</td><td className="px-6 py-4">{new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium' }).format(new Date(user.created_at))}</td></tr>)}</tbody></table></div>
                {!users.length && <p className="text-muted-foreground p-8 text-center">Aucun accès administratif enregistré.</p>}
            </section>
        </main>
    </AppLayout>;
}
