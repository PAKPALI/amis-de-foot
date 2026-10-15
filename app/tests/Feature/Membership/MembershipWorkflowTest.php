<?php

namespace Tests\Feature\Membership;

use App\Enums\UserRole;
use App\Models\Membership;
use App\Models\User;
use App\Notifications\MembershipDecisionNotification;
use App\Notifications\MembershipRequestSubmitted;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Notification;
use Tests\TestCase;

class MembershipWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_member_can_submit_and_report_a_one_time_membership_payment(): void
    {
        Notification::fake();
        $member = User::factory()->create();
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $manager = User::factory()->create(['role' => UserRole::Manager]);
        $adminWithoutEmail = User::factory()->create(['role' => UserRole::Administrator, 'email' => null]);
        User::factory()->create(['role' => UserRole::Member]);
        $this->actingAs($member);

        $this->get('/mon-adhesion')->assertOk()->assertInertia(fn ($page) => $page
            ->component('member/membership')
            ->where('feeAmount', 1000)
            ->where('membership', null));

        $this->post('/mon-adhesion')->assertRedirect('/mon-adhesion');
        Notification::assertSentTo([$admin, $manager], MembershipRequestSubmitted::class);
        Notification::assertNotSentTo($adminWithoutEmail, MembershipRequestSubmitted::class);
        Notification::assertNotSentTo($member, MembershipRequestSubmitted::class);

        $membership = Membership::query()->where('user_id', $member->id)->firstOrFail();
        $this->assertSame(1000, $membership->fee_amount);
        $this->assertSame(Membership::STATUS_AWAITING_PAYMENT, $membership->status);

        $this->patch('/mon-adhesion/signalement-paiement')->assertRedirect('/mon-adhesion');
        $membership->refresh();
        $this->assertSame(Membership::STATUS_AWAITING_APPROVAL, $membership->status);
        $this->assertNotNull($membership->payment_reported_at);
        $this->assertDatabaseHas('membership_events', [
            'membership_id' => $membership->id,
            'action' => 'payment_reported',
            'actor_user_id' => $member->id,
        ]);
    }

    public function test_administrator_confirms_payment_and_approves_a_member_with_audit_details(): void
    {
        Notification::fake();
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create();
        $membership = Membership::query()->create([
            'user_id' => $member->id,
            'fee_amount' => 1000,
            'status' => Membership::STATUS_AWAITING_PAYMENT,
        ]);

        $this->actingAs($admin);
        $this->get('/administration/adhesions')->assertOk()->assertInertia(fn ($page) => $page
            ->component('admin/memberships')
            ->where('memberships.0.memberName', $member->name));
        $this->post("/administration/adhesions/{$membership->id}/approuver")->assertRedirect('/administration/adhesions');
        Notification::assertSentTo($member, MembershipDecisionNotification::class, fn (MembershipDecisionNotification $notification): bool => $notification->toMail($member)->subject === 'Votre adhésion est approuvée');

        $membership->refresh();
        $this->assertSame(Membership::STATUS_APPROVED, $membership->status);
        $this->assertSame(1000, $membership->fee_amount);
        $this->assertSame($admin->id, $membership->payment_confirmed_by);
        $this->assertSame($admin->id, $membership->approved_by);
        $this->assertNotNull($membership->payment_confirmed_at);
        $this->assertNotNull($membership->approved_at);
        $this->assertDatabaseHas('membership_events', [
            'membership_id' => $membership->id,
            'actor_user_id' => $admin->id,
            'action' => 'payment_confirmed_and_approved',
        ]);
    }

    public function test_member_cannot_open_administration_or_approve_another_membership(): void
    {
        $member = User::factory()->create();
        $other = User::factory()->create();
        $membership = Membership::query()->create([
            'user_id' => $other->id,
            'fee_amount' => 1000,
            'status' => Membership::STATUS_AWAITING_APPROVAL,
        ]);

        $this->actingAs($member);
        $this->get('/administration/adhesions')->assertForbidden();
        $this->post("/administration/adhesions/{$membership->id}/approuver")->assertForbidden();
        $this->assertSame(Membership::STATUS_AWAITING_APPROVAL, $membership->fresh()->status);
    }

    public function test_rejection_requires_a_reason_and_member_can_resubmit_without_erasing_history(): void
    {
        Notification::fake();
        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create();
        $membership = Membership::query()->create([
            'user_id' => $member->id,
            'fee_amount' => 1000,
            'status' => Membership::STATUS_AWAITING_APPROVAL,
        ]);

        $this->actingAs($admin);
        $this->from('/administration/adhesions')->post("/administration/adhesions/{$membership->id}/refuser", ['reason' => 'no'])->assertSessionHasErrors('reason');
        $this->post("/administration/adhesions/{$membership->id}/refuser", ['reason' => 'Paiement non retrouvé'])->assertRedirect('/administration/adhesions');
        Notification::assertSentTo($member, MembershipDecisionNotification::class, function (MembershipDecisionNotification $notification) use ($member): bool {
            $mail = $notification->toMail($member);

            return $mail->subject === 'Votre demande d’adhésion a été refusée'
                && in_array('Motif : Paiement non retrouvé', $mail->introLines, true);
        });

        $membership->refresh();
        $this->assertSame(Membership::STATUS_REJECTED, $membership->status);
        $this->assertSame('Paiement non retrouvé', $membership->rejection_reason);

        $this->actingAs($member);
        $this->post('/mon-adhesion')->assertRedirect('/mon-adhesion');
        $this->assertSame(Membership::STATUS_AWAITING_PAYMENT, $membership->fresh()->status);
        $this->assertDatabaseHas('membership_events', ['membership_id' => $membership->id, 'action' => 'request_rejected']);
        $this->assertDatabaseHas('membership_events', ['membership_id' => $membership->id, 'action' => 'request_resubmitted']);
    }

    public function test_member_cannot_create_a_second_membership_request_after_approval(): void
    {
        $member = User::factory()->create();
        Membership::query()->create([
            'user_id' => $member->id,
            'fee_amount' => 1000,
            'status' => Membership::STATUS_APPROVED,
        ]);

        $this->actingAs($member)
            ->from('/mon-adhesion')
            ->post('/mon-adhesion')
            ->assertSessionHasErrors('membership');

        $this->assertSame(1, Membership::query()->where('user_id', $member->id)->count());
    }

    public function test_member_without_email_does_not_receive_membership_decision_email(): void
    {
        Notification::fake();

        $admin = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create(['email' => null]);
        $membership = Membership::query()->create([
            'user_id' => $member->id,
            'fee_amount' => 1000,
            'status' => Membership::STATUS_AWAITING_PAYMENT,
        ]);

        $this->actingAs($admin)
            ->post("/administration/adhesions/{$membership->id}/approuver")
            ->assertRedirect('/administration/adhesions');

        Notification::assertNotSentTo($member, MembershipDecisionNotification::class);
    }
}
