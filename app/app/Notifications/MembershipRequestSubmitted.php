<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipRequestSubmitted extends Notification
{
    public function __construct(
        private readonly string $memberName,
        private readonly int $feeAmount,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Nouvelle demande d’adhésion')
            ->greeting('Bonjour,')
            ->line("{$this->memberName} vient de déposer une demande d’adhésion.")
            ->line('Montant à vérifier : '.number_format($this->feeAmount, 0, ',', ' ').' FCFA.')
            ->action('Examiner les adhésions', route('admin.memberships'))
            ->line('Vérifiez le règlement avant de confirmer l’adhésion.');
    }
}
