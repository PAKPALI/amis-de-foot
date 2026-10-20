<?php

namespace App\Http\Controllers\Admin;

use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserRoleChange;
use App\Models\UserPasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;
use Inertia\Response;

class UserRoleController extends Controller
{
    public function index(Request $request): Response
    {
        return Inertia::render('admin/roles', [
            'members' => User::query()
                ->orderBy('name')
                ->get(['id', 'name', 'email', 'phone', 'role', 'account_status']),
            'roles' => array_map(
                fn (UserRole $role) => ['value' => $role->value, 'label' => $this->label($role)],
                UserRole::cases(),
            ),
            'canManageRoles' => $request->user()->canManageRoles(),
            'history' => $request->user()->canManageRoles()
                ? UserRoleChange::query()->latest()->limit(50)->get()
                : [],
            'passwordResetHistory' => UserPasswordReset::query()->latest()->limit(50)->get(),
        ]);
    }

    public function update(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'role' => ['required', Rule::enum(UserRole::class)],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $newRole = UserRole::from($validated['role']);
        $actor = $request->user();

        DB::transaction(function () use ($actor, $user, $newRole, $validated): void {
            $lockedUser = User::query()->lockForUpdate()->findOrFail($user->id);
            $oldRole = $lockedUser->role;

            if ($oldRole === $newRole) {
                return;
            }

            if ($oldRole === UserRole::Manager && $newRole !== UserRole::Manager) {
                $anotherManagerExists = User::query()
                    ->where('role', UserRole::Manager->value)
                    ->whereKeyNot($lockedUser->id)
                    ->exists();

                if (! $anotherManagerExists) {
                    throw ValidationException::withMessages([
                        'role' => 'Le dernier responsable habilité ne peut pas être retiré.',
                    ]);
                }
            }

            $lockedUser->role = $newRole;
            $lockedUser->save();

            UserRoleChange::query()->create([
                'subject_user_id' => $lockedUser->id,
                'actor_user_id' => $actor->id,
                'subject_name' => $lockedUser->name,
                'actor_name' => $actor->name,
                'old_role' => $oldRole->value,
                'new_role' => $newRole->value,
                'reason' => $validated['reason'],
            ]);
        });

        if ($actor->is($user) && $newRole !== UserRole::Manager) {
            return to_route('member.dashboard')->with('status', 'Votre rôle a été mis à jour.');
        }

        return to_route('admin.roles')->with('status', 'Le rôle du membre a été mis à jour.');
    }

    private function label(UserRole $role): string
    {
        return match ($role) {
            UserRole::Member => 'Membre',
            UserRole::Administrator => 'Administrateur',
            UserRole::Manager => 'Responsable habilité',
        };
    }
}
