<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class MembershipDecisionNotification extends Notification
{
    public function __construct(
        private readonly bool $approved,
        private readonly int $feeAmount,
        private readonly ?string $reason = null,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $status = $this->approved ? 'confirmée et approuvée' : 'refusée';
        $mail = (new MailMessage)
            ->subject($this->approved ? 'Votre adhésion est approuvée' : 'Votre demande d’adhésion a été refusée')
            ->greeting('Bonjour,')
            ->line("Votre demande d’adhésion a été {$status}.")
            ->line('Montant : '.number_format($this->feeAmount, 0, ',', ' ').' FCFA.');

        if (! $this->approved && filled($this->reason)) {
            $mail->line('Motif : '.$this->reason);
        }

        return $mail
            ->action('Consulter mon adhésion', route('member.membership'))
            ->line('Merci de faire partie du club Amis de foot.');
    }
}
