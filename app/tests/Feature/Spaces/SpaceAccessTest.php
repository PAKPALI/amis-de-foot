<?php

namespace Tests\Feature\Spaces;

use App\Enums\UserRole;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class SpaceAccessTest extends TestCase
{
    use RefreshDatabase;

    public function test_members_can_access_their_personal_space_but_not_administration(): void
    {
        $this->actingAs(User::factory()->create());

        $this->get('/mon-espace')->assertOk();
        $this->get('/administration')->assertForbidden();
    }

    public function test_administrators_keep_their_personal_space_and_can_access_administration(): void
    {
        $user = User::factory()->create(['role' => UserRole::Administrator]);
        $this->actingAs($user);

        $this->get('/mon-espace')->assertOk();
        $this->get('/administration')->assertOk();
    }
}
