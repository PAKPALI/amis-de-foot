<?php

namespace Tests\Feature\Admin;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserRoleChange;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\Hash;
use Tests\TestCase;

class MemberAccessManagementTest extends TestCase
{
    use RefreshDatabase;

    public function test_only_a_responsible_can_change_a_role_and_the_change_is_logged(): void
    {
        $manager = User::factory()->create(['role' => UserRole::Manager]);
        $member = User::factory()->create();

        $this->actingAs($manager)->patch(route('admin.roles.update', $member), [
            'role' => UserRole::Administrator->value,
            'reason' => 'Désignation validée par le bureau',
        ])->assertRedirect(route('admin.roles'));

        $this->assertSame(UserRole::Administrator, $member->fresh()->role);
        $this->assertDatabaseHas('user_role_changes', [
            'subject_user_id' => $member->id,
            'actor_user_id' => $manager->id,
            'old_role' => UserRole::Member->value,
            'new_role' => UserRole::Administrator->value,
        ]);
    }

    public function test_the_last_responsible_cannot_remove_their_own_role(): void
    {
        $manager = User::factory()->create(['role' => UserRole::Manager]);

        $this->actingAs($manager)->from(route('admin.roles'))->patch(route('admin.roles.update', $manager), [
            'role' => UserRole::Member->value,
            'reason' => 'Fin de mission',
        ])->assertSessionHasErrors('role');

        $this->assertSame(UserRole::Manager, $manager->fresh()->role);
    }

    public function test_administrators_can_reset_access_and_the_member_must_change_the_temporary_password(): void
    {
        $administrator = User::factory()->create(['role' => UserRole::Administrator]);
        $member = User::factory()->create(['email' => null, 'phone' => '+228 90 00 00 02']);

        $response = $this->actingAs($administrator)->post(route('admin.members.reset-access', $member), [
            'reason' => 'Demande du membre',
        ])->assertRedirect(route('admin.roles'));

        $this->assertTrue($member->fresh()->must_change_password);
        $this->assertTrue(Hash::check(
            Crypt::decryptString($response->getSession()->get('temporaryPassword')),
            $member->fresh()->password,
        ));
        $this->assertDatabaseHas('user_password_resets', [
            'subject_user_id' => $member->id,
            'actor_user_id' => $administrator->id,
        ]);

        $member->refresh();
        $this->actingAs($member)->get('/mon-espace')->assertRedirect(route('password.edit'));
        $this->from(route('password.edit'))->put(route('password.update'), [
            'password' => 'new-secure-password',
            'password_confirmation' => 'new-secure-password',
        ])->assertRedirect(route('password.edit'));

        $this->assertFalse($member->fresh()->must_change_password);
    }
}
