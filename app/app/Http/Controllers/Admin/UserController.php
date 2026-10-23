<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRoleChange;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Inertia\Response;

class UserController extends Controller
{
    public function index(): Response
    {
        return Inertia::render('admin/users', [
            'users' => User::query()
                ->whereIn('role', [UserRole::Administrator->value, UserRole::Manager->value])
                ->latest()
                ->get(['id', 'name', 'email', 'phone', 'role', 'account_status', 'created_at']),
        ]);
    }

    public function store(Request $request): RedirectResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['nullable', 'required_without:phone', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'required_without:email', 'string', 'max:32', 'unique:users,phone'],
        ], [
            'email.required_without' => 'Renseignez une adresse e-mail ou un numéro de téléphone.',
            'phone.required_without' => 'Renseignez un numéro de téléphone ou une adresse e-mail.',
            'email.unique' => 'Cette adresse e-mail est déjà utilisée.',
            'phone.unique' => 'Ce numéro de téléphone est déjà utilisé.',
        ]);

        $temporaryPassword = Str::password(12);
        $actor = $request->user();

        $user = DB::transaction(function () use ($validated, $temporaryPassword, $actor): User {
            $user = User::query()->create([
                'name' => trim($validated['name']),
                'email' => filled($validated['email'] ?? null) ? Str::lower(trim($validated['email'])) : null,
                'phone' => filled($validated['phone'] ?? null) ? trim($validated['phone']) : null,
                'password' => $temporaryPassword,
            ]);

            $user->role = UserRole::Administrator;
            $user->must_change_password = true;
            $user->save();

            UserRoleChange::query()->create([
                'subject_user_id' => $user->id,
                'actor_user_id' => $actor->id,
                'subject_name' => $user->name,
                'actor_name' => $actor->name,
                'old_role' => UserRole::Member->value,
                'new_role' => UserRole::Administrator->value,
                'reason' => 'Création d’un compte administrateur depuis la gestion des utilisateurs.',
            ]);

            return $user;
        });

        return to_route('admin.users')->with([
            'status' => 'Le compte administrateur a été créé.',
            'temporaryPassword' => $temporaryPassword,
            'temporaryPasswordFor' => $user->name,
        ]);
    }
}
