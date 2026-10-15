import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';

interface LoginForm extends Record<string, string | boolean> {
    identifier: string;
    password: string;
    remember: boolean;
}

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<LoginForm>({
        identifier: '',
        password: '',
        remember: false,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <AuthLayout title="Connexion à votre compte" description="Saisissez votre téléphone ou votre adresse e-mail et votre mot de passe">
            <Head title="Connexion" />

            <form className="flex flex-col gap-6" onSubmit={submit}>
                <div className="grid gap-6">
                    <div className="grid gap-2">
                        <Label htmlFor="identifier">Téléphone ou adresse e-mail</Label>
                        <Input
                            id="identifier"
                            type="text"
                            required
                            autoFocus
                            tabIndex={1}
                            autoComplete="username"
                            value={data.identifier}
                            onChange={(e) => setData('identifier', e.target.value)}
                            placeholder="Téléphone ou e-mail"
                        />
                        <InputError message={errors.identifier} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex flex-wrap items-center justify-between gap-x-2 gap-y-1">
                            <Label htmlFor="password">Mot de passe</Label>
                            {canResetPassword && (
                                <TextLink href={route('password.request')} className="ml-auto text-sm whitespace-nowrap" tabIndex={5}>
                                    Mot de passe oublié ?
                                </TextLink>
                            )}
                        </div>
                        <Input
                            id="password"
                            type="password"
                            required
                            tabIndex={2}
                            autoComplete="current-password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Mot de passe"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            name="remember"
                            tabIndex={3}
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked === true)}
                        />
                        <Label htmlFor="remember">Se souvenir de moi</Label>
                    </div>

                    <Button type="submit" className="mt-4 w-full" tabIndex={4} disabled={processing}>
                        {processing && <LoaderCircle className="h-4 w-4 animate-spin" />}
                        Se connecter
                    </Button>
                </div>

                <div className="text-muted-foreground text-center text-sm">
                    Vous n’avez pas de compte ?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Créer un compte
                    </TextLink>
                </div>
            </form>

            {status && <div className="mb-4 text-center text-sm font-medium text-green-600">{status}</div>}
        </AuthLayout>
    );
}
