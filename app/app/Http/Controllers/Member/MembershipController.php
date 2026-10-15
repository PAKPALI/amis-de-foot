<?php

namespace App\Http\Controllers\Member;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\MembershipEvent;
use App\Models\User;
use App\Notifications\MembershipRequestSubmitted;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;
use Throwable;

class MembershipController extends Controller
{
    public function index(Request $request): Response
    {
        $membership = $request->user()->membership()->with('events')->first();

        return Inertia::render('member/membership', [
            'membership' => $membership ? [
                'id' => $membership->id,
                'feeAmount' => $membership->fee_amount,
                'status' => $membership->status,
                'paymentReportedAt' => $membership->payment_reported_at?->toIso8601String(),
                'paymentConfirmedAt' => $membership->payment_confirmed_at?->toIso8601String(),
                'approvedAt' => $membership->approved_at?->toIso8601String(),
                'rejectionReason' => $membership->rejection_reason,
                'events' => $membership->events->map(fn (MembershipEvent $event) => [
                    'action' => $event->action,
                    'actorName' => $event->actor_name,
                    'reason' => $event->reason,
                    'createdAt' => $event->created_at?->toIso8601String(),
                ]),
            ] : null,
            'feeAmount' => (int) config('club.membership_fee', 1000),
        ]);
    }

    public function request(Request $request): RedirectResponse
    {
        $user = $request->user();

        $membership = DB::transaction(function () use ($user): Membership {
            $lockedUser = $user->newQuery()->lockForUpdate()->findOrFail($user->id);
            $membership = Membership::query()->where('user_id', $lockedUser->id)->lockForUpdate()->first();

            if ($membership && $membership->status !== Membership::STATUS_REJECTED) {
                throw ValidationException::withMessages([
                    'membership' => 'Une demande d’adhésion existe déjà pour votre compte.',
                ]);
            }

            $isResubmission = $membership !== null;

            if (! $membership) {
                $membership = Membership::query()->create([
                    'user_id' => $lockedUser->id,
                    'fee_amount' => (int) config('club.membership_fee', 1000),
                    'status' => Membership::STATUS_AWAITING_PAYMENT,
                ]);
            } else {
                $membership->update([
                    'status' => Membership::STATUS_AWAITING_PAYMENT,
                    'payment_reported_at' => null,
                    'payment_confirmed_at' => null,
                    'payment_confirmed_by' => null,
                    'approved_at' => null,
                    'approved_by' => null,
                    'rejected_at' => null,
                    'rejected_by' => null,
                    'rejection_reason' => null,
                ]);
            }

            $membership->events()->create([
                'actor_user_id' => $lockedUser->id,
                'actor_name' => $lockedUser->name,
                'action' => $isResubmission ? 'request_resubmitted' : 'request_submitted',
                'reason' => null,
            ]);

            return $membership;
        });

        $this->notifyAdministrators($membership);

        return to_route('member.membership')->with('status', 'Votre demande d’adhésion est créée. Réglez les 1 000 FCFA auprès d’un administrateur, puis signalez le paiement ici.');
    }

    public function reportPayment(Request $request): RedirectResponse
    {
        $user = $request->user();

        DB::transaction(function () use ($user): void {
            $membership = Membership::query()->where('user_id', $user->id)->lockForUpdate()->firstOrFail();

            if ($membership->status !== Membership::STATUS_AWAITING_PAYMENT) {
                throw ValidationException::withMessages([
                    'membership' => 'Votre demande ne peut pas être signalée dans son état actuel.',
                ]);
            }

            $membership->update([
                'status' => Membership::STATUS_AWAITING_APPROVAL,
                'payment_reported_at' => now(),
            ]);

            $membership->events()->create([
                'actor_user_id' => $user->id,
                'actor_name' => $user->name,
                'action' => 'payment_reported',
                'reason' => null,
            ]);
        });

        return to_route('member.membership')->with('status', 'Votre paiement a été signalé. Un administrateur doit le vérifier avant l’approbation.');
    }

    private function notifyAdministrators(Membership $membership): void
    {
        $administrators = User::query()
            ->whereIn('role', [UserRole::Administrator->value, UserRole::Manager->value])
            ->whereNotNull('email')
            ->where('email', '<>', '')
            ->get();
        $memberName = $membership->user()->value('name');

        foreach ($administrators as $administrator) {
            try {
                $administrator->notify(new MembershipRequestSubmitted(
                    memberName: $memberName,
                    feeAmount: $membership->fee_amount,
                ));
            } catch (Throwable $exception) {
                Log::error('Impossible d’envoyer la notification de demande d’adhésion.', [
                    'membership_id' => $membership->id,
                    'recipient_id' => $administrator->id,
                    'exception' => $exception::class,
                ]);
            }
        }
    }
}
