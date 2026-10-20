<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;

class UserAccountController extends Controller
{
    public function deactivate(Request $request, User $user): RedirectResponse
    {
        $validated = $request->validate([
            'status' => ['required', 'in:suspended,left'],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        if ($request->user()->is($user)) {
            return back()->withErrors(['account' => 'Vous ne pouvez pas désactiver votre propre compte.']);
        }

        if (! $user->isAccountActive()) {
            return back()->withErrors(['account' => 'Ce compte est déjà désactivé.']);
        }

        $user->forceFill([
            'account_status' => $validated['status'],
            'account_deactivated_at' => now(),
            'account_deactivated_by' => $request->user()->id,
            'account_deactivation_reason' => $validated['reason'] ?? null,
        ])->save();

        return back()->with('status', 'Le compte est désactivé et ne peut plus se connecter.');
    }
}
