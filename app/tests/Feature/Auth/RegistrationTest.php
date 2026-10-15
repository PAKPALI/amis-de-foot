<?php

namespace Tests\Feature\Auth;

use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RegistrationTest extends TestCase
{
    use RefreshDatabase;

    public function test_registration_screen_can_be_rendered()
    {
        $response = $this->get('/register');

        $response->assertStatus(200);
    }

    public function test_new_users_are_redirected_to_login_after_registration(): void
    {
        $response = $this->post('/register', [
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => 'password-123',
            'password_confirmation' => 'password-123',
        ]);

        $this->assertGuest();
        $response->assertRedirect(route('login', absolute: false));
        $response->assertSessionHas('status', 'Votre compte a été créé. Connectez-vous avec votre téléphone ou votre adresse e-mail.');
        $this->assertDatabaseHas('users', ['email' => 'test@example.com']);
    }

    public function test_a_member_can_register_with_a_phone_without_an_email(): void
    {
        $response = $this->post('/register', [
            'name' => 'Membre Téléphone',
            'phone' => '+228 90 00 00 01',
            'email' => null,
            'password' => 'password',
            'password_confirmation' => 'password',
        ]);

        $this->assertGuest();
        $this->assertDatabaseHas('users', [
            'phone' => '+228 90 00 00 01',
            'email' => null,
            'role' => 'member',
        ]);
        $response->assertRedirect(route('login', absolute: false));
        $response->assertSessionHas('status');
    }
}
