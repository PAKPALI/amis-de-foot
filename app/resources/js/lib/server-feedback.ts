import { router } from '@inertiajs/react';
import { ClubAlert } from '@/lib/club-alert';

const showError = (title: string, text: string) =>
    ClubAlert.fire({
        icon: 'error',
        title,
        text,
        confirmButtonText: 'Compris',
    });

export function registerServerFeedback(): void {
    router.on('error', (event) => {
        const messages = Object.values(event.detail.errors)
            .flatMap((message) => (Array.isArray(message) ? message : [message]))
            .filter((message): message is string => typeof message === 'string' && message.length > 0);

        if (messages.length === 0) return;

        void showError(
            messages.length === 1 ? 'Vérifiez les informations saisies' : 'Plusieurs erreurs sont à corriger',
            messages.join('\n'),
        );
    });

    router.on('invalid', (event) => {
        event.preventDefault();

        const status = event.detail.response.status;
        const feedback: Record<number, { title: string; text: string }> = {
            401: {
                title: 'Connexion requise',
                text: 'Votre session n’est plus valide. Connectez-vous puis réessayez.',
            },
            403: {
                title: 'Accès refusé',
                text: 'Vous ne disposez pas des droits nécessaires pour effectuer cette action.',
            },
            404: {
                title: 'Élément introuvable',
                text: 'La page ou la donnée demandée est introuvable.',
            },
            419: {
                title: 'Session expirée',
                text: 'La page a expiré. Rechargez-la puis réessayez.',
            },
            429: {
                title: 'Trop de tentatives',
                text: 'Veuillez patienter avant de réessayer.',
            },
        };
        const message = feedback[status] ?? {
            title: status >= 500 ? 'Erreur du serveur' : 'Réponse inattendue',
            text:
                status >= 500
                    ? 'Une erreur est survenue sur le serveur. Réessayez plus tard ou contactez un administrateur.'
                    : `Le serveur n’a pas pu traiter la demande (erreur ${status}). Réessayez.`,
        };

        void showError(message.title, message.text);
    });

    router.on('exception', (event) => {
        event.preventDefault();
        void showError('Serveur injoignable', 'La demande n’a pas pu être envoyée. Vérifiez votre connexion puis réessayez.');
    });
}
