<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\UserPasswordReset;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class UserPasswordResetController extends Controller
{
    public function store(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
        ]);

        $temporaryPassword = Str::password(16, symbols: false);
        $actor = $request->user();

        DB::transaction(function () use ($user, $actor, $validated, $temporaryPassword): void {
            $user->forceFill([
                'password' => $temporaryPassword,
                'must_change_password' => true,
            ])->save();

            UserPasswordReset::query()->create([
                'subject_user_id' => $user->id,
                'actor_user_id' => $actor->id,
                'subject_name' => $user->name,
                'actor_name' => $actor->name,
                'reason' => $validated['reason'],
            ]);
        });

        return to_route('admin.roles')->with(
            'temporaryPassword',
            Crypt::encryptString($temporaryPassword),
        )->with('temporaryPasswordFor', $user->name);
    }
}
