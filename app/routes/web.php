<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\RedirectResponse;
use App\Http\Controllers\Admin\UserRoleController;
use App\Http\Controllers\Admin\UserPasswordResetController;
use App\Http\Controllers\Admin\MembershipController as AdminMembershipController;
use App\Http\Controllers\Member\MembershipController as MemberMembershipController;
use App\Http\Controllers\Member\ContributionController as MemberContributionController;
use App\Http\Controllers\Admin\ContributionController as AdminContributionController;
use App\Http\Controllers\Admin\UserAccountController;
use App\Http\Controllers\Admin\CashRegisterController;
use App\Http\Controllers\ContributionReceiptController;
use App\Http\Controllers\StatisticsController;
use App\Http\Controllers\PublicSiteController;
use App\Http\Controllers\Admin\ArticleController;
use Inertia\Inertia;

Route::get('/', [PublicSiteController::class, 'home'])->name('home');
Route::get('le-club', [PublicSiteController::class, 'club'])->name('public.club');
Route::get('contact', [PublicSiteController::class, 'contact'])->name('public.contact');
Route::get('actualites', [PublicSiteController::class, 'articles'])->name('public.articles');
Route::get('actualites/{article}', [PublicSiteController::class, 'article'])->name('public.article');

Route::middleware(['auth', 'account.active', 'password.changed'])->group(function () {
    Route::get('dashboard', function (): RedirectResponse {
        return to_route('member.dashboard');
    })->name('dashboard');

    Route::get('mon-espace', function () {
        return Inertia::render('member/dashboard');
    })->name('member.dashboard');

    Route::get('mon-adhesion', [MemberMembershipController::class, 'index'])->name('member.membership');
    Route::post('mon-adhesion', [MemberMembershipController::class, 'request'])->name('member.membership.request');
    Route::patch('mon-adhesion/signalement-paiement', [MemberMembershipController::class, 'reportPayment'])->name('member.membership.report-payment');
    Route::get('mes-cotisations', [MemberContributionController::class, 'index'])->name('member.contributions');
    Route::post('mes-cotisations/signalement-paiement', [MemberContributionController::class, 'report'])->name('member.contributions.report');
    Route::get('cotisations/{batch}/recu', [ContributionReceiptController::class, 'show'])->name('contributions.receipt');
    Route::get('mes-statistiques', [StatisticsController::class, 'member'])->name('member.statistics');

    Route::get('administration', function () {
        return Inertia::render('admin/dashboard');
    })->middleware('role:administrator,manager')->name('admin.dashboard');

    Route::middleware('role:administrator,manager')->prefix('administration')->name('admin.')->group(function () {
        Route::get('adhesions', [AdminMembershipController::class, 'index'])->name('memberships');
        Route::post('adhesions/{membership}/approuver', [AdminMembershipController::class, 'approve'])->name('memberships.approve');
        Route::post('adhesions/{membership}/refuser', [AdminMembershipController::class, 'reject'])->name('memberships.reject');
        Route::get('cotisations', [AdminContributionController::class, 'index'])->name('contributions');
        Route::get('statistiques', [StatisticsController::class, 'admin'])->name('statistics');
        Route::get('actualites', [ArticleController::class, 'index'])->name('articles');
        Route::post('actualites', [ArticleController::class, 'store'])->name('articles.store');
        Route::post('actualites/{article}', [ArticleController::class, 'update'])->name('articles.update');
        Route::delete('actualites/{article}', [ArticleController::class, 'destroy'])->name('articles.destroy');
        Route::post('cotisations', [AdminContributionController::class, 'store'])->name('contributions.store');
        Route::post('cotisations/signalements/{batch}/confirmer', [AdminContributionController::class, 'confirm'])->name('contributions.confirm');
        Route::patch('membres/{user}/desactiver', [UserAccountController::class, 'deactivate'])->name('members.deactivate');
        Route::get('roles', [UserRoleController::class, 'index'])->name('roles');
        Route::post('membres/{user}/reinitialiser-acces', [UserPasswordResetController::class, 'store'])
            ->name('members.reset-access');
    });

    Route::middleware('role:manager')->prefix('administration')->name('admin.')->group(function () {
        Route::patch('membres/{user}/role', [UserRoleController::class, 'update'])->name('roles.update');
        Route::get('caisse', [CashRegisterController::class, 'index'])->name('cash-register');
        Route::post('caisse/ouverture', [CashRegisterController::class, 'opening'])->name('cash-register.opening');
        Route::post('caisse/entrees', [CashRegisterController::class, 'income'])->name('cash-register.income');
        Route::post('caisse/depenses', [CashRegisterController::class, 'expense'])->name('cash-register.expense');
        Route::post('caisse/mouvements/{transaction}/corriger', [CashRegisterController::class, 'correct'])->name('cash-register.correct');
    });
});

require __DIR__.'/settings.php';
require __DIR__.'/auth.php';
