<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ContributionPeriod extends Model
{
    use HasFactory;

    protected $fillable = ['user_id', 'payment_batch_id', 'period_starts_on', 'amount', 'payment_reported_at', 'paid_at'];

    protected function casts(): array
    {
        return [
            'period_starts_on' => 'date',
            'amount' => 'integer',
            'paid_at' => 'datetime',
            'payment_reported_at' => 'datetime',
        ];
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function payment(): HasOne
    {
        return $this->hasOne(ContributionPayment::class);
    }

    public function paymentBatch(): BelongsTo
    {
        return $this->belongsTo(ContributionPaymentBatch::class, 'payment_batch_id');
    }

    public function isPaid(): bool
    {
        return $this->paid_at !== null;
    }
}
