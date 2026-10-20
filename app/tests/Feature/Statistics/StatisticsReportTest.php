<?php

namespace Tests\Feature\Statistics;

use App\Enums\UserRole;
use App\Models\CashRegister;
use App\Models\CashTransaction;
use App\Models\ContributionPeriod;
use App\Models\Membership;
use App\Models\User;
use App\Services\StatisticsReport;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StatisticsReportTest extends TestCase
{
    use RefreshDatabase;

    public function test_global_report_is_restricted_and_member_report_contains_only_personal_data(): void
    {
        $first = User::factory()->create();
        $second = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        Membership::query()->create(['user_id' => $first->id, 'status' => Membership::STATUS_APPROVED, 'fee_amount' => 1000, 'approved_at' => now()->subMonths(2)]);
        Membership::query()->create(['user_id' => $second->id, 'status' => Membership::STATUS_APPROVED, 'fee_amount' => 1000, 'approved_at' => now()->subMonths(2)]);
        ContributionPeriod::query()->create(['user_id' => $second->id, 'period_starts_on' => now()->subMonth()->startOfMonth(), 'amount' => 1000, 'paid_at' => now()]);

        $this->actingAs($first)->get('/administration/statistiques')->assertForbidden();
        $this->get('/mes-statistiques?member_id='.$second->id)->assertOk()->assertInertia(fn ($page) => $page
            ->component('statistics/report')->where('scope', 'member')
            ->where('report.totals.membership_requests', 1)
            ->where('report.totals.contributions_paid', 0));
        $this->actingAs($admin)->get('/administration/statistiques')->assertOk()->assertInertia(fn ($page) => $page
            ->component('statistics/report')->where('scope', 'admin')
            ->where('report.totals.membership_requests', 2)
            ->where('report.totals.contributions_paid', 1));
    }

    public function test_financial_totals_exclude_opening_historical_receipts_and_corrected_transactions(): void
    {
        $register = CashRegister::query()->where('singleton_key', 'club')->firstOrFail();
        $actor = User::factory()->create(['role' => UserRole::Manager]);
        $base = ['cash_register_id' => $register->id, 'occurred_at' => now(), 'category' => 'equipment', 'description' => 'Test', 'created_by' => $actor->id];
        CashTransaction::query()->create($base + ['kind' => 'opening', 'direction' => 'in', 'amount' => 5000, 'affects_balance' => true]);
        CashTransaction::query()->create($base + ['kind' => 'membership', 'direction' => 'in', 'amount' => 1000, 'affects_balance' => false]);
        $original = CashTransaction::query()->create($base + ['kind' => 'expense', 'direction' => 'out', 'amount' => 200, 'affects_balance' => true]);
        CashTransaction::query()->create($base + ['kind' => 'reversal', 'direction' => 'in', 'amount' => 200, 'affects_balance' => true, 'reverses_transaction_id' => $original->id]);
        CashTransaction::query()->create($base + ['kind' => 'expense', 'direction' => 'out', 'amount' => 100, 'affects_balance' => true]);
        $register->update(['current_balance' => 4900]);

        $report = app(StatisticsReport::class)->build([]);
        $this->assertSame(0, $report['totals']['income']);
        $this->assertSame(100, $report['totals']['expenses']);
        $this->assertSame(4900, $report['balance']);
    }

    public function test_date_member_status_and_category_filters_apply_to_the_relevant_totals(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();
        Membership::query()->create(['user_id' => $member->id, 'status' => Membership::STATUS_APPROVED, 'fee_amount' => 1000, 'approved_at' => now()->subMonths(3), 'created_at' => now()->subMonths(3)]);
        Membership::query()->create(['user_id' => $other->id, 'status' => Membership::STATUS_REJECTED, 'fee_amount' => 1000]);
        ContributionPeriod::query()->create(['user_id' => $member->id, 'period_starts_on' => now()->subMonth()->startOfMonth(), 'amount' => 1000, 'paid_at' => now()]);
        $register = CashRegister::query()->where('singleton_key', 'club')->firstOrFail();
        CashTransaction::query()->create(['cash_register_id' => $register->id, 'kind' => 'income', 'direction' => 'in', 'amount' => 500,
            'occurred_at' => now()->subMonth(), 'category' => 'donation', 'description' => 'Don', 'affects_balance' => true]);
        CashTransaction::query()->create(['cash_register_id' => $register->id, 'kind' => 'expense', 'direction' => 'out', 'amount' => 200,
            'occurred_at' => now()->subMonth(), 'category' => 'equipment', 'description' => 'Ballon', 'affects_balance' => true]);

        $month = now()->subMonth();
        $report = app(StatisticsReport::class)->build([
            'from' => $month->startOfMonth()->toDateString(), 'to' => $month->endOfMonth()->toDateString(),
            'member_id' => $member->id, 'membership_status' => 'approved', 'contribution_status' => 'paid', 'category' => 'donation',
        ]);
        $this->assertSame(0, $report['totals']['membership_requests']);
        $this->assertSame(1, $report['totals']['contributions_paid']);
        $this->assertSame(0, $report['totals']['contributions_pending']);
        $this->assertSame(0, $report['totals']['income']); // Aucun mouvement manuel n'est attribué au membre.
        $this->assertSame(0, $report['totals']['expenses']);

        $allMembers = app(StatisticsReport::class)->build(['from' => $month->startOfMonth()->toDateString(), 'to' => $month->endOfMonth()->toDateString(), 'category' => 'donation']);
        $this->assertSame(500, $allMembers['totals']['income']);
        $this->assertSame(0, $allMembers['totals']['expenses']);
    }
}
