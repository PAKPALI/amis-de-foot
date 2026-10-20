<?php

namespace App\Services;

use App\Models\ContributionPeriod;
use App\Models\Membership;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Collection;

class ContributionPeriods
{
    public function nextPeriodStartsOn(User $member): ?CarbonImmutable
    {
        $membership = $member->membership;

        if ($member->account_status !== 'active' || ! $membership || $membership->status !== Membership::STATUS_APPROVED || ! $membership->approved_at) {
            return null;
        }

        $firstPeriod = $membership->approved_at->toImmutable()->startOfMonth()->addMonth();
        $lastSelected = ContributionPeriod::query()->where('user_id', $member->id)->max('period_starts_on');

        return $lastSelected ? CarbonImmutable::parse($lastSelected)->addMonth()->startOfMonth() : $firstPeriod;
    }

    public function periodsFor(User $member, int $months): Collection
    {
        $start = $this->nextPeriodStartsOn($member);

        if (! $start) {
            return collect();
        }

        return collect(range(0, $months - 1))->map(fn (int $offset) => $start->addMonths($offset));
    }
}
