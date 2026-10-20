<?php

namespace App\Services;

use App\Models\CashRegister;
use App\Models\CashTransaction;
use App\Models\ContributionPaymentBatch;
use App\Models\ContributionPeriod;
use App\Models\Membership;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;

class StatisticsReport
{
    public function build(array $filters, ?User $member = null): array
    {
        $from = isset($filters['from']) ? CarbonImmutable::parse($filters['from']) : null;
        $to = isset($filters['to']) ? CarbonImmutable::parse($filters['to']) : null;
        $memberId = $member?->id ?? ($filters['member_id'] ?? null);

        $membershipQuery = Membership::query()->with('user:id,name')->when($memberId, fn ($q) => $q->where('user_id', $memberId))
            ->when($from, fn ($q) => $q->whereDate('created_at', '>=', $from->toDateString()))
            ->when($to, fn ($q) => $q->whereDate('created_at', '<=', $to->toDateString()))
            ->when($filters['membership_status'] ?? null, fn ($q, $status) => $q->where('status', $status));
        $memberships = $membershipQuery->orderByDesc('created_at')->get()->map(fn ($m) => [
            'member' => $m->user?->name ?? 'Compte supprimé', 'status' => $m->status,
            'amount' => $m->fee_amount, 'date' => $m->created_at?->toDateString(),
        ]);

        $periodQuery = ContributionPeriod::query()->with('member:id,name', 'paymentBatch:id,receipt_number')
            ->when($memberId, fn ($q) => $q->where('user_id', $memberId))
            ->when($from, fn ($q) => $q->whereDate('period_starts_on', '>=', $from->startOfMonth()->toDateString()))
            ->when($to, fn ($q) => $q->whereDate('period_starts_on', '<=', $to->startOfMonth()->toDateString()))
            ->when($filters['contribution_status'] ?? null, fn ($q, $status) => $status === 'paid' ? $q->whereNotNull('paid_at') : $q->whereNull('paid_at'));
        $periods = $periodQuery->orderByDesc('period_starts_on')->get();
        $contributions = $periods->map(fn ($p) => [
            'member' => $p->member?->name ?? 'Compte supprimé', 'period' => $p->period_starts_on->format('Y-m'),
            'status' => $p->paid_at ? 'paid' : 'pending', 'amount' => $p->amount,
            'receipt' => $p->paid_at && $p->paymentBatch ? $p->paymentBatch->receipt_number : null,
            'batch_id' => $p->paid_at ? $p->payment_batch_id : null,
        ]);

        // Les mois sans enregistrement sont calculés sans créer de dette ni de pénalité.
        // Un compte désactivé est exclu : la date de départ n'est pas historisée.
        $activeMemberships = Membership::query()->with('user:id,name,account_status')
            ->where('status', Membership::STATUS_APPROVED)->whereNotNull('approved_at')
            ->whereHas('user', fn ($q) => $q->where('account_status', 'active'))
            ->when($memberId, fn ($q) => $q->where('user_id', $memberId))->get();
        $existing = ContributionPeriod::query()->when($memberId, fn ($q) => $q->where('user_id', $memberId))
            ->whereIn('user_id', $activeMemberships->pluck('user_id'))->get(['user_id', 'period_starts_on'])
            ->mapWithKeys(fn ($p) => [$p->user_id.'|'.$p->period_starts_on->format('Y-m') => true]);
        $today = CarbonImmutable::today()->startOfMonth();
        foreach ($activeMemberships as $membership) {
            $cursor = $membership->approved_at->toImmutable()->startOfMonth()->addMonth();
            $end = $to ? min($to->startOfMonth(), $today) : $today;
            $start = $from ? max($from->startOfMonth(), $cursor) : $cursor;
            for ($date = $start; $date <= $end; $date = $date->addMonth()) {
                if (! isset($existing[$membership->user_id.'|'.$date->format('Y-m')])) {
                    $contributions->push([
                        'member' => $membership->user->name, 'period' => $date->format('Y-m'),
                        'status' => 'pending', 'amount' => (int) config('club.contribution_fee', 1000),
                        'receipt' => null, 'batch_id' => null,
                    ]);
                }
            }
        }
        $contributions = $contributions->filter(fn ($row) => ! ($filters['contribution_status'] ?? null) ||
            ($filters['contribution_status'] === 'paid' ? $row['status'] === 'paid' : $row['status'] === 'pending'))
            ->sortByDesc('period')->values();

        $cash = collect();
        $balance = null;
        if (! $member) {
            $cash = CashTransaction::query()->where('affects_balance', true)->where('kind', '!=', CashTransaction::KIND_OPENING)
                ->where('kind', '!=', CashTransaction::KIND_REVERSAL)
                ->whereNotIn('id', DB::table('cash_transactions')->whereNotNull('reverses_transaction_id')->select('reverses_transaction_id'))
                ->when($from, fn ($q) => $q->whereDate('occurred_at', '>=', $from->toDateString()))
                ->when($to, fn ($q) => $q->whereDate('occurred_at', '<=', $to->toDateString()))
                ->when($filters['category'] ?? null, fn ($q, $category) => $q->where('category', $category))
                ->when($memberId, fn ($q) => $q->where(function ($q) use ($memberId) {
                    $membershipIds = Membership::query()->where('user_id', $memberId)->select('id');
                    $batchIds = ContributionPaymentBatch::query()->where('user_id', $memberId)->select('id');
                    $q->where(fn ($q) => $q->where('source_type', 'membership')->whereIn('source_id', $membershipIds))
                        ->orWhere(fn ($q) => $q->where('source_type', 'contribution_batch')->whereIn('source_id', $batchIds));
                }))
                ->orderByDesc('occurred_at')->get()->map(fn ($t) => [
                    'date' => $t->occurred_at->toDateString(), 'direction' => $t->direction,
                    'category' => $t->category, 'description' => $t->description, 'amount' => $t->amount,
                ]);
            $balance = (int) CashRegister::query()->where('singleton_key', 'club')->value('current_balance');
        }

        return [
            'memberships' => $memberships->values(), 'contributions' => $contributions,
            'cash' => $cash, 'balance' => $balance,
            'totals' => [
                'membership_requests' => $memberships->count(),
                'membership_approved' => $memberships->where('status', 'approved')->count(),
                'contributions_paid' => $contributions->where('status', 'paid')->count(),
                'contributions_paid_amount' => $contributions->where('status', 'paid')->sum('amount'),
                'contributions_pending' => $contributions->where('status', 'pending')->count(),
                'contributions_pending_amount' => $contributions->where('status', 'pending')->sum('amount'),
                'income' => $cash->where('direction', 'in')->sum('amount'),
                'expenses' => $cash->where('direction', 'out')->sum('amount'),
            ],
        ];
    }
}
