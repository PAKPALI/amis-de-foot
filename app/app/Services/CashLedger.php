<?php

namespace App\Services;

use App\Models\CashRegister;
use App\Models\CashTransaction;
use App\Models\User;
use Carbon\CarbonImmutable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class CashLedger
{
    public function register(): CashRegister
    {
        return CashRegister::query()->where('singleton_key', 'club')->firstOrFail();
    }

    public function setOpening(User $actor, int $amount, CarbonImmutable $occurredAt, string $description): CashTransaction
    {
        return DB::transaction(function () use ($actor, $amount, $occurredAt, $description): CashTransaction {
            $register = CashRegister::query()->where('singleton_key', 'club')->lockForUpdate()->firstOrFail();
            if ($register->opened_at) {
                throw ValidationException::withMessages(['opening' => 'Le solde d’ouverture a déjà été enregistré.']);
            }

            $movement = CashTransaction::query()->create([
                'cash_register_id' => $register->id,
                'kind' => CashTransaction::KIND_OPENING,
                'direction' => CashTransaction::DIRECTION_IN,
                'amount' => $amount,
                'occurred_at' => $occurredAt->startOfDay(),
                'category' => 'opening_balance',
                'description' => $description,
                'source_type' => 'opening_balance',
                'source_id' => 1,
                'created_by' => $actor->id,
                'approved_by' => $actor->id,
                'approved_at' => now(),
                'affects_balance' => true,
            ]);

            $register->update([
                'current_balance' => $register->current_balance + $amount,
                'opened_at' => now(),
                'opened_by' => $actor->id,
            ]);

            return $movement;
        });
    }

    public function recordSourceIncome(
        User $actor,
        int $amount,
        CarbonImmutable $occurredAt,
        string $category,
        string $description,
        string $sourceType,
        int $sourceId,
        ?string $reference = null,
    ): CashTransaction {
        return DB::transaction(function () use ($actor, $amount, $occurredAt, $category, $description, $sourceType, $sourceId, $reference): CashTransaction {
            $register = CashRegister::query()->where('singleton_key', 'club')->lockForUpdate()->firstOrFail();
            $existing = CashTransaction::query()->where('source_type', $sourceType)->where('source_id', $sourceId)->first();
            if ($existing) {
                return $existing;
            }

            $movement = CashTransaction::query()->create([
                'cash_register_id' => $register->id,
                'kind' => $category === 'membership_fee' ? CashTransaction::KIND_MEMBERSHIP : CashTransaction::KIND_CONTRIBUTION,
                'direction' => CashTransaction::DIRECTION_IN,
                'amount' => $amount,
                'occurred_at' => $occurredAt,
                'category' => $category,
                'description' => $description,
                'reference' => $reference,
                'source_type' => $sourceType,
                'source_id' => $sourceId,
                'created_by' => $actor->id,
                'approved_by' => $actor->id,
                'approved_at' => $occurredAt,
                'affects_balance' => true,
            ]);

            $register->update(['current_balance' => $register->current_balance + $amount]);

            return $movement;
        });
    }

    public function recordManual(User $actor, array $values, string $kind): CashTransaction
    {
        return DB::transaction(function () use ($actor, $values, $kind): CashTransaction {
            $register = CashRegister::query()->where('singleton_key', 'club')->lockForUpdate()->firstOrFail();
            if (! $register->opened_at) {
                throw ValidationException::withMessages(['opening' => 'Enregistrez d’abord le solde d’ouverture de la caisse.']);
            }

            $amount = (int) $values['amount'];
            $direction = $kind === CashTransaction::KIND_EXPENSE ? CashTransaction::DIRECTION_OUT : CashTransaction::DIRECTION_IN;
            if ($direction === CashTransaction::DIRECTION_OUT && $amount > $register->current_balance) {
                throw ValidationException::withMessages(['amount' => 'Cette dépense dépasse le solde disponible de la caisse.']);
            }

            $movement = CashTransaction::query()->create([
                'cash_register_id' => $register->id,
                'kind' => $kind,
                'direction' => $direction,
                'amount' => $amount,
                'occurred_at' => CarbonImmutable::parse($values['occurred_at']),
                'category' => $values['category'],
                'description' => $values['description'],
                'reference' => $values['reference'] ?? null,
                'created_by' => $actor->id,
                'approved_by' => $actor->id,
                'approved_at' => now(),
                'affects_balance' => true,
            ]);

            $register->update(['current_balance' => $register->current_balance + ($direction === CashTransaction::DIRECTION_IN ? $amount : -$amount)]);

            return $movement;
        });
    }

    public function correct(User $actor, CashTransaction $transaction, array $values): array
    {
        return DB::transaction(function () use ($actor, $transaction, $values): array {
            $register = CashRegister::query()->where('singleton_key', 'club')->lockForUpdate()->firstOrFail();
            $original = CashTransaction::query()->lockForUpdate()->findOrFail($transaction->id);
            if ($original->cash_register_id !== $register->id) {
                throw ValidationException::withMessages(['transaction' => 'Ce mouvement ne correspond pas à la caisse du club.']);
            }
            if (CashTransaction::query()->where('reverses_transaction_id', $original->id)->exists()) {
                throw ValidationException::withMessages(['transaction' => 'Ce mouvement a déjà été corrigé.']);
            }

            $amount = (int) $values['amount'];
            $newDirection = $values['direction'];
            $balanceDeltaOriginal = $original->affects_balance
                ? ($original->direction === CashTransaction::DIRECTION_IN ? -$original->amount : $original->amount)
                : 0;
            $balanceDeltaReplacement = $original->affects_balance
                ? ($newDirection === CashTransaction::DIRECTION_IN ? $amount : -$amount)
                : 0;
            $afterReversal = $register->current_balance + $balanceDeltaOriginal;
            $newBalance = $afterReversal + $balanceDeltaReplacement;
            if ($newBalance < 0) {
                throw ValidationException::withMessages(['amount' => 'Cette correction ferait passer le solde de la caisse sous zéro.']);
            }

            $group = (string) Str::uuid();
            $now = now();
            $reversal = CashTransaction::query()->create([
                'cash_register_id' => $register->id,
                'kind' => CashTransaction::KIND_REVERSAL,
                'direction' => $original->direction === CashTransaction::DIRECTION_IN ? CashTransaction::DIRECTION_OUT : CashTransaction::DIRECTION_IN,
                'amount' => $original->amount,
                'occurred_at' => $now,
                'category' => 'correction',
                'description' => 'Contre-écriture du mouvement #'.$original->id.' — '.$values['reason'],
                'created_by' => $actor->id,
                'approved_by' => $actor->id,
                'approved_at' => $now,
                'affects_balance' => $original->affects_balance,
                'reverses_transaction_id' => $original->id,
                'correction_group_id' => $group,
            ]);
            $replacement = CashTransaction::query()->create([
                'cash_register_id' => $register->id,
                'kind' => $newDirection === CashTransaction::DIRECTION_OUT ? CashTransaction::KIND_EXPENSE : CashTransaction::KIND_INCOME,
                'direction' => $newDirection,
                'amount' => $amount,
                'occurred_at' => CarbonImmutable::parse($values['occurred_at']),
                'category' => $values['category'],
                'description' => $values['description'],
                'reference' => $values['reference'] ?? null,
                'created_by' => $actor->id,
                'approved_by' => $actor->id,
                'approved_at' => $now,
                'affects_balance' => $original->affects_balance,
                'correction_group_id' => $group,
            ]);

            $register->update(['current_balance' => $newBalance]);

            return [$reversal, $replacement];
        });
    }
}
