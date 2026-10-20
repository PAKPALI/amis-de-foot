<?php

namespace App\Http\Controllers\Member;

use App\Http\Controllers\Controller;
use App\Models\ContributionPaymentBatch;
use App\Models\ContributionPeriod;
use App\Models\User;
use App\Services\ContributionPeriods;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ContributionController extends Controller
{
    public function index(Request $request, ContributionPeriods $periods): Response
    {
        $member = $request->user();
        $items = ContributionPeriod::query()->where('user_id', $member->id)->with('paymentBatch')->latest('period_starts_on')->get();

        return Inertia::render('member/contributions', [
            'periods' => $items->map(fn (ContributionPeriod $period) => $this->period($period)),
            'nextPeriodStartsOn' => $periods->nextPeriodStartsOn($member)?->toDateString(),
            'contributionFee' => (int) config('club.contribution_fee', 1000),
            'maxMonths' => 12,
        ]);
    }

    public function report(Request $request, ContributionPeriods $service): RedirectResponse
    {
        $validated = $request->validate(['months' => ['required', 'integer', 'min:1', 'max:12']]);
        $memberId = $request->user()->id;

        DB::transaction(function () use ($memberId, $validated, $service): void {
            $member = User::query()->lockForUpdate()->findOrFail($memberId);
            $member->load('membership');
            $starts = $service->periodsFor($member, $validated['months']);
            if ($starts->isEmpty()) {
                throw ValidationException::withMessages(['months' => 'Votre adhésion doit être approuvée avant toute cotisation.']);
            }

            $now = now();
            $amount = $starts->count() * (int) config('club.contribution_fee', 1000);
            $batch = ContributionPaymentBatch::query()->create([
                'user_id' => $member->id, 'amount' => $amount,
                'status' => ContributionPaymentBatch::STATUS_AWAITING_CONFIRMATION, 'reported_at' => $now,
            ]);
            foreach ($starts as $start) {
                ContributionPeriod::query()->create([
                    'user_id' => $member->id, 'payment_batch_id' => $batch->id,
                    'period_starts_on' => $start->toDateString(), 'amount' => config('club.contribution_fee', 1000),
                    'payment_reported_at' => $now,
                ]);
            }
        });

        return to_route('member.contributions')->with('status', 'Votre paiement a été signalé. L’administration doit le confirmer.');
    }

    private function period(ContributionPeriod $period): array
    {
        return ['id' => $period->id, 'batchId' => $period->payment_batch_id, 'periodStartsOn' => $period->period_starts_on->toDateString(), 'amount' => $period->amount,
            'paidAt' => $period->paid_at?->toIso8601String(), 'paymentReportedAt' => $period->payment_reported_at?->toIso8601String(),
            'receiptNumber' => $period->paymentBatch?->receipt_number];
    }
}
