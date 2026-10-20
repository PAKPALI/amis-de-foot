<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CashTransaction;
use App\Services\CashLedger;
use Carbon\CarbonImmutable;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CashRegisterController extends Controller
{
    public function index(CashLedger $ledger): Response
    {
        $register = $ledger->register()->load('opener:id,name');
        $transactions = CashTransaction::query()
            ->with(['creator:id,name', 'approver:id,name', 'reversedTransaction:id,description'])
            ->latest('occurred_at')
            ->latest('id')
            ->limit(150)
            ->get();
        $correctedIds = CashTransaction::query()
            ->whereIn('reverses_transaction_id', $transactions->pluck('id'))
            ->pluck('reverses_transaction_id')
            ->all();
        $oldestMovementAt = CashTransaction::query()->min('occurred_at');
        $today = CarbonImmutable::today();
        $openingDate = $today->toDateString();

        return Inertia::render('admin/cash-register', [
            'register' => [
                'name' => $register->name,
                'currency' => $register->currency,
                'balance' => $register->current_balance,
                'openedAt' => $register->opened_at?->toIso8601String(),
                'openedBy' => $register->opener?->name,
            ],
            'transactions' => $transactions->map(fn (CashTransaction $transaction) => [
                'id' => $transaction->id,
                'kind' => $transaction->kind,
                'direction' => $transaction->direction,
                'amount' => $transaction->amount,
                'occurredAt' => $transaction->occurred_at->toIso8601String(),
                'category' => $transaction->category,
                'description' => $transaction->description,
                'reference' => $transaction->reference,
                'createdBy' => $transaction->creator?->name,
                'approvedBy' => $transaction->approver?->name,
                'reversesTransactionId' => $transaction->reverses_transaction_id,
                'alreadyCorrected' => in_array($transaction->id, $correctedIds, true),
            ]),
            'hasOpeningBalance' => (bool) $register->opened_at,
            'oldestMovementAt' => $oldestMovementAt,
            'openingDate' => $openingDate,
            'today' => $today->toDateString(),
        ]);
    }

    public function opening(Request $request, CashLedger $ledger): RedirectResponse
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:0', 'max:999999999'],
            'occurred_at' => ['required', 'date'],
            'description' => ['required', 'string', 'min:5', 'max:500'],
        ]);

        $ledger->setOpening($request->user(), (int) $validated['amount'], CarbonImmutable::parse($validated['occurred_at']), $validated['description']);

        return to_route('admin.cash-register')->with('status', 'Solde d’ouverture enregistré.');
    }

    public function income(Request $request, CashLedger $ledger): RedirectResponse
    {
        $validated = $this->validateMovement($request);
        $ledger->recordManual($request->user(), $validated, CashTransaction::KIND_INCOME);

        return to_route('admin.cash-register')->with('status', 'Entrée de caisse enregistrée.');
    }

    public function expense(Request $request, CashLedger $ledger): RedirectResponse
    {
        $validated = $this->validateMovement($request);
        $ledger->recordManual($request->user(), $validated, CashTransaction::KIND_EXPENSE);

        return to_route('admin.cash-register')->with('status', 'Dépense enregistrée et approuvée par le responsable.');
    }

    public function correct(Request $request, CashTransaction $transaction, CashLedger $ledger): RedirectResponse
    {
        $validated = $request->validate([
            'direction' => ['required', 'in:in,out'],
            'amount' => ['required', 'integer', 'min:1', 'max:999999999'],
            'occurred_at' => ['required', 'date'],
            'category' => ['required', 'string', 'max:64'],
            'description' => ['required', 'string', 'min:5', 'max:500'],
            'reason' => ['required', 'string', 'min:5', 'max:1000'],
            'reference' => ['nullable', 'string', 'max:120'],
        ]);

        $ledger->correct($request->user(), $transaction, $validated);

        return to_route('admin.cash-register')->with('status', 'Mouvement corrigé par contre-écriture ; l’historique d’origine est conservé.');
    }

    private function validateMovement(Request $request): array
    {
        return $request->validate([
            'amount' => ['required', 'integer', 'min:1', 'max:999999999'],
            'occurred_at' => ['required', 'date'],
            'category' => ['required', 'string', 'max:64'],
            'description' => ['required', 'string', 'min:5', 'max:500'],
            'reference' => ['nullable', 'string', 'max:120'],
        ]);
    }
}
