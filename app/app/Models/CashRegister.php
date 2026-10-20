<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CashRegister extends Model
{
    protected $fillable = ['singleton_key', 'name', 'currency', 'current_balance', 'opened_at', 'opened_by'];

    protected function casts(): array
    {
        return ['current_balance' => 'integer', 'opened_at' => 'datetime'];
    }

    public function opener(): BelongsTo
    {
        return $this->belongsTo(User::class, 'opened_by');
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(CashTransaction::class);
    }
}
