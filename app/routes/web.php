<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\UserPasswordResetController;
use App\Http\Controllers\Admin\MembershipController as AdminMembershipController;
use App\Http\Controllers\Member\MembershipController as MemberMembershipController;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('welcome');
})->name('home');

Route::middleware(['auth', 'password.changed'])->group(function () {
    Route::get('dashboard', function (): RedirectResponse {
        return to_route('member.dashboard');
    })->name('dashboard');

    Route::get('mon-espace', function () {
        return Inertia::render('member/dashboard');
    })->name('member.dashboard');

    Route::get('mon-adhesion', [MemberMembershipController::class, 'index'])->name('member.membership');
    Route::post('mon-adhesion', [MemberMembershipController::class, 'request'])->name('member.membership.request');
    Route::patch('mon-adhesion/signalement-paiement', [MemberMembershipController::class, 'reportPayment'])->name('member.membership.report-payment');

    Route::get('administration', function () {
        return Inertia::render('admin/dashboard');
    })->middleware('role:administrator,manager')->name('admin.dashboard');

    Route::middleware('role:administrator,manager')->prefix('administration')->name('admin.')->group(function () {
        Route::get('adhesions', [AdminMembershipController::class, 'index'])->name('memberships');
        Route::post('adhesions/{membership}/approuver', [AdminMembershipController::class, 'approve'])->name('memberships.approve');
        Route::post('adhesions/{membership}/refuser', [AdminMembershipController::class, 'reject'])->name('memberships.reject');
        Route::get('roles', [UserRoleController::class, 'index'])->name('roles');
        Route::post('membres/{user}/reinitialiser-acces', [UserPasswordResetController::class, 'store'])
            ->name('members.reset-access');
    });

    Route::middleware('role:manager')->prefix('administration')->name('admin.')->group(function () {
        Route::patch('membres/{user}/role', [UserRoleController::class, 'update'])->name('roles.update');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
