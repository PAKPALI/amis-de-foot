<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContributionPaymentBatch;
use App\Models\ContributionPeriod;
use App\Models\Membership;
use App\Models\User;
use App\Services\ContributionPeriods;
use App\Services\CashLedger;
use Carbon\Carbon;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class ContributionController extends Controller
{
    public function index(ContributionPeriods $service): Response
    {
        $members = User::query()->where('account_status', 'active')->whereHas('membership', fn ($query) => $query->where('status', Membership::STATUS_APPROVED))->with('membership')->orderBy('name')->get();
        $periods = ContributionPeriod::query()->with(['member:id,name,email,phone', 'paymentBatch'])->latest('period_starts_on')->get();
        $pendingBatches = ContributionPaymentBatch::query()->where('status', ContributionPaymentBatch::STATUS_AWAITING_CONFIRMATION)->with(['member:id,name,email,phone', 'periods'])->latest('reported_at')->get();

        return Inertia::render('admin/contributions', [
            'members' => $members->map(fn (User $member) => ['id' => $member->id, 'name' => $member->name, 'contact' => $member->email ?: $member->phone, 'nextPeriodStartsOn' => $service->nextPeriodStartsOn($member)?->toDateString()]),
            'periods' => $periods->map(fn (ContributionPeriod $period) => $this->period($period)),
            'pendingBatches' => $pendingBatches->map(fn (ContributionPaymentBatch $batch) => ['id' => $batch->id, 'memberName' => $batch->member->name, 'memberContact' => $batch->member->email ?: $batch->member->phone, 'amount' => $batch->amount, 'months' => $batch->periods->sortBy('period_starts_on')->pluck('period_starts_on')->map(fn ($date) => $date->toDateString())->values()]),
            'contributionFee' => (int) config('club.contribution_fee', 1000), 'maxMonths' => 12,
        ]);
    }

    public function store(Request $request, ContributionPeriods $service, CashLedger $cashLedger): RedirectResponse
    {
        $validated = $request->validate(['user_id' => ['required', 'integer', 'exists:users,id'], 'months' => ['required', 'integer', 'min:1', 'max:12'], 'amount' => ['required', 'integer'], 'received_at' => ['nullable', 'date'], 'reference' => ['nullable', 'string', 'max:120'], 'note' => ['nullable', 'string', 'max:1000']]);
        $actor = $request->user();

        DB::transaction(function () use ($validated, $actor, $service, $cashLedger): void {
            $member = User::query()->lockForUpdate()->findOrFail($validated['user_id']);
            $member->load('membership');
            $starts = $service->periodsFor($member, $validated['months']);
            if ($starts->isEmpty()) throw ValidationException::withMessages(['user_id' => 'Ce membre ne possède pas une adhésion active approuvée.']);
            $total = $starts->count() * (int) config('club.contribution_fee', 1000);
            if ((int) $validated['amount'] !== $total) throw ValidationException::withMessages(['amount' => "Le paiement doit être exactement de {$total} FCFA. Les paiements partiels ne sont pas acceptés."]);
            $receivedAt = isset($validated['received_at']) ? Carbon::parse($validated['received_at']) : now();
            $batch = ContributionPaymentBatch::query()->create(['user_id' => $member->id, 'amount' => $total, 'status' => ContributionPaymentBatch::STATUS_CONFIRMED, 'reported_at' => $receivedAt, 'confirmed_at' => $receivedAt, 'confirmed_by' => $actor->id, 'reference' => $validated['reference'] ?? null, 'note' => $validated['note'] ?? null]);
            $batch->update(['receipt_number' => sprintf('COT-%s-%06d', $receivedAt->format('Ym'), $batch->id)]);
            foreach ($starts as $start) ContributionPeriod::query()->create(['user_id' => $member->id, 'payment_batch_id' => $batch->id, 'period_starts_on' => $start->toDateString(), 'amount' => config('club.contribution_fee', 1000), 'paid_at' => $receivedAt]);
            $cashLedger->recordSourceIncome($actor, $total, Carbon::parse($receivedAt)->toImmutable(), 'monthly_contribution', 'Cotisation enregistrée — '.$member->name, 'contribution_batch', $batch->id, $batch->receipt_number);
        });
        return to_route('admin.contributions')->with('status', 'Paiement enregistré et reçu généré.');
    }

    public function confirm(Request $request, ContributionPaymentBatch $batch, CashLedger $cashLedger): RedirectResponse
    {
        $actor = $request->user();
        DB::transaction(function () use ($batch, $actor, $cashLedger): void {
            $locked = ContributionPaymentBatch::query()->lockForUpdate()->findOrFail($batch->id);
            if ($locked->status !== ContributionPaymentBatch::STATUS_AWAITING_CONFIRMATION) throw ValidationException::withMessages(['contribution' => 'Ce signalement a déjà été traité.']);
            $now = now();
            $locked->update(['status' => ContributionPaymentBatch::STATUS_CONFIRMED, 'confirmed_at' => $now, 'confirmed_by' => $actor->id, 'receipt_number' => sprintf('COT-%s-%06d', $now->format('Ym'), $locked->id)]);
            ContributionPeriod::query()->where('payment_batch_id', $locked->id)->update(['paid_at' => $now]);
            $cashLedger->recordSourceIncome($actor, $locked->amount, Carbon::parse($now)->toImmutable(), 'monthly_contribution', 'Cotisation confirmée — membre #'.$locked->user_id, 'contribution_batch', $locked->id, $locked->receipt_number);
        });
        return to_route('admin.contributions')->with('status', 'Paiement confirmé et reçu généré.');
    }

    private function period(ContributionPeriod $period): array
    {
        return ['id' => $period->id, 'batchId' => $period->payment_batch_id, 'memberName' => $period->member->name, 'memberContact' => $period->member->email ?: $period->member->phone, 'periodStartsOn' => $period->period_starts_on->toDateString(), 'amount' => $period->amount, 'paidAt' => $period->paid_at?->toIso8601String(), 'paymentReportedAt' => $period->payment_reported_at?->toIso8601String(), 'receiptNumber' => $period->paymentBatch?->receipt_number];
    }
}
