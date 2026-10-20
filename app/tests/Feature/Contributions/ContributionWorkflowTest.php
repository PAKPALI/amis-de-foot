<?php

namespace Tests\Feature\Contributions;

use App\Enums\UserRole;
use App\Models\ContributionPeriod;
use App\Models\ContributionPaymentBatch;
use App\Models\Membership;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ContributionWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_previews_months_without_creating_periods(): void
    {
        $member = User::factory()->create();
        $approvedAt = now()->subMonths(2)->startOfMonth()->addDays(3);
        Membership::query()->create(['user_id' => $member->id, 'fee_amount' => 1000, 'status' => Membership::STATUS_APPROVED, 'approved_at' => $approvedAt]);

        $this->actingAs($member)->get('/mes-cotisations')->assertOk()->assertInertia(fn ($page) => $page
            ->component('member/contributions')->where('contributionFee', 1000)
            ->where('nextPeriodStartsOn', $approvedAt->toImmutable()->startOfMonth()->addMonth()->toDateString()));
        $this->assertDatabaseCount('contribution_periods', 0);
    }

    public function test_member_can_select_multiple_months_and_administrator_can_confirm_them(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create();
        Membership::query()->create(['user_id' => $member->id, 'fee_amount' => 1000, 'status' => Membership::STATUS_APPROVED, 'approved_at' => now()->subMonth()]);

        $this->actingAs($member)->post('/mes-cotisations/signalement-paiement', ['months' => 2])->assertRedirect('/mes-cotisations');
        $batch = ContributionPaymentBatch::query()->firstOrFail();
        $this->assertSame(2000, $batch->amount);
        $this->assertSame(ContributionPaymentBatch::STATUS_AWAITING_CONFIRMATION, $batch->status);
        $this->assertDatabaseCount('contribution_periods', 2);

        $this->actingAs($admin)->post("/administration/cotisations/signalements/{$batch->id}/confirmer")->assertRedirect('/administration/cotisations');
        $this->assertSame(2, ContributionPeriod::query()->whereNotNull('paid_at')->count());
        $this->assertDatabaseHas('contribution_payment_batches', ['id' => $batch->id, 'status' => ContributionPaymentBatch::STATUS_CONFIRMED, 'confirmed_by' => $admin->id]);
    }

    public function test_administrator_can_directly_record_selected_number_of_months_but_not_a_partial_amount(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create();
        Membership::query()->create(['user_id' => $member->id, 'fee_amount' => 1000, 'status' => Membership::STATUS_APPROVED, 'approved_at' => now()->subMonth()]);

        $this->actingAs($admin)->post('/administration/cotisations', ['user_id' => $member->id, 'months' => 2, 'amount' => 1500])->assertSessionHasErrors('amount');
        $this->post('/administration/cotisations', ['user_id' => $member->id, 'months' => 2, 'amount' => 2000, 'reference' => 'ESP-002'])->assertRedirect('/administration/cotisations');
        $this->assertDatabaseHas('contribution_payment_batches', ['user_id' => $member->id, 'amount' => 2000, 'status' => ContributionPaymentBatch::STATUS_CONFIRMED, 'reference' => 'ESP-002']);
        $this->assertDatabaseCount('contribution_periods', 2);
    }
    public function test_deactivated_account_cannot_log_in_or_use_an_existing_session(): void
    {
        $member = User::factory()->create([
            'email' => 'suspendu@example.test',
            'password' => 'password',
            'account_status' => 'suspended',
        ]);

        $this->post('/login', ['identifier' => $member->email, 'password' => 'password'])
            ->assertSessionHasErrors('identifier');

        $this->actingAs($member)
            ->get('/mon-espace')
            ->assertRedirect('/login');
    }

    public function test_administrator_can_suspend_a_member_but_not_their_own_account(): void
    {
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create();

        $this->actingAs($admin)
            ->patch("/administration/membres/{$member->id}/desactiver", ['status' => 'suspended'])
            ->assertRedirect();

        $this->assertDatabaseHas('users', ['id' => $member->id, 'account_status' => 'suspended']);

        $this->patch("/administration/membres/{$admin->id}/desactiver", ['status' => 'left'])
            ->assertSessionHasErrors('account');
    }
}

