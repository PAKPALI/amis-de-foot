<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class CashTransaction extends Model
{
    public const KIND_OPENING = 'opening';
    public const KIND_INCOME = 'income';
    public const KIND_EXPENSE = 'expense';
    public const KIND_REVERSAL = 'reversal';
    public const KIND_MEMBERSHIP = 'membership';
    public const KIND_CONTRIBUTION = 'contribution';

    public const DIRECTION_IN = 'in';
    public const DIRECTION_OUT = 'out';

    protected $fillable = [
        'cash_register_id', 'kind', 'direction', 'amount', 'occurred_at', 'category', 'description', 'reference',
        'source_type', 'source_id', 'created_by', 'approved_by', 'approved_at', 'reverses_transaction_id', 'correction_group_id', 'affects_balance',
    ];

    protected function casts(): array
    {
        return ['amount' => 'integer', 'occurred_at' => 'datetime', 'approved_at' => 'datetime', 'affects_balance' => 'boolean'];
    }

    public function register(): BelongsTo
    {
        return $this->belongsTo(CashRegister::class, 'cash_register_id');
    }

    public function creator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'created_by');
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function reversedTransaction(): BelongsTo
    {
        return $this->belongsTo(self::class, 'reverses_transaction_id');
    }
}
