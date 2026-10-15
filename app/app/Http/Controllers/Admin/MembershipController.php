<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Membership;
use App\Models\User;
use App\Notifications\MembershipDecisionNotification;
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
    public function index(): Response
    {
        $memberships = Membership::query()
            ->with('user:id,name,email,phone')
            ->whereIn('status', [
                Membership::STATUS_AWAITING_PAYMENT,
                Membership::STATUS_AWAITING_APPROVAL,
                Membership::STATUS_REJECTED,
            ])
            ->latest('updated_at')
            ->get()
            ->map(fn (Membership $membership) => [
                'id' => $membership->id,
                'memberName' => $membership->user->name,
                'email' => $membership->user->email,
                'phone' => $membership->user->phone,
                'feeAmount' => $membership->fee_amount,
                'status' => $membership->status,
                'paymentReportedAt' => $membership->payment_reported_at?->toIso8601String(),
                'rejectionReason' => $membership->rejection_reason,
                'updatedAt' => $membership->updated_at?->toIso8601String(),
            ]);

        return Inertia::render('admin/memberships', [
            'memberships' => $memberships,
            'feeAmount' => (int) config('club.membership_fee', 1000),
        ]);
    }

    public function approve(Request $request, Membership $membership): RedirectResponse
    {
        $actor = $request->user();

        $membership = DB::transaction(function () use ($membership, $actor): Membership {
            $locked = Membership::query()->lockForUpdate()->findOrFail($membership->id);

            if (! in_array($locked->status, [Membership::STATUS_AWAITING_PAYMENT, Membership::STATUS_AWAITING_APPROVAL], true)) {
                throw ValidationException::withMessages([
                    'membership' => 'Cette demande a déjà été traitée ou doit être soumise à nouveau par le membre.',
                ]);
            }

            $now = now();
            $locked->update([
                'status' => Membership::STATUS_APPROVED,
                'payment_confirmed_at' => $now,
                'payment_confirmed_by' => $actor->id,
                'approved_at' => $now,
                'approved_by' => $actor->id,
                'rejected_at' => null,
                'rejected_by' => null,
                'rejection_reason' => null,
            ]);

            $locked->events()->create([
                'actor_user_id' => $actor->id,
                'actor_name' => $actor->name,
                'action' => 'payment_confirmed_and_approved',
                'reason' => 'Règlement de l’adhésion confirmé par l’administrateur.',
            ]);

            return $locked;
        });

        $this->notifyMember($membership, approved: true);

        return to_route('admin.memberships')->with('status', 'Le paiement de l’adhésion a été confirmé et le membre approuvé.');
    }

    public function reject(Request $request, Membership $membership): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ]);
        $actor = $request->user();

        $membership = DB::transaction(function () use ($membership, $actor, $validated): Membership {
            $locked = Membership::query()->lockForUpdate()->findOrFail($membership->id);

            if (! in_array($locked->status, [Membership::STATUS_AWAITING_PAYMENT, Membership::STATUS_AWAITING_APPROVAL], true)) {
                throw ValidationException::withMessages([
                    'membership' => 'Cette demande a déjà été traitée ou doit être soumise à nouveau par le membre.',
                ]);
            }

            $locked->update([
                'status' => Membership::STATUS_REJECTED,
                'rejected_at' => now(),
                'rejected_by' => $actor->id,
                'rejection_reason' => $validated['reason'],
            ]);

            $locked->events()->create([
                'actor_user_id' => $actor->id,
                'actor_name' => $actor->name,
                'action' => 'request_rejected',
                'reason' => $validated['reason'],
            ]);

            return $locked;
        });

        $this->notifyMember($membership, approved: false, reason: $validated['reason']);

        return to_route('admin.memberships')->with('status', 'La demande a été refusée. Le motif reste visible par le membre et dans l’historique.');
    }

    private function notifyMember(Membership $membership, bool $approved, ?string $reason = null): void
    {
        $member = User::query()->find($membership->user_id);

        if (! $member || blank($member->email)) {
            return;
        }

        try {
            $member->notify(new MembershipDecisionNotification(
                approved: $approved,
                feeAmount: $membership->fee_amount,
                reason: $reason,
            ));
        } catch (Throwable $exception) {
            Log::error('Impossible d’envoyer la notification de décision d’adhésion.', [
                'membership_id' => $membership->id,
                'recipient_id' => $member->id,
                'exception' => $exception::class,
            ]);
        }
    }
}
