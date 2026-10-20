<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class ContributionPaymentBatch extends Model
{
    use HasFactory;

    public const STATUS_AWAITING_CONFIRMATION = 'awaiting_confirmation';
    public const STATUS_CONFIRMED = 'confirmed';

    protected $fillable = ['user_id', 'amount', 'status', 'reported_at', 'confirmed_at', 'confirmed_by', 'receipt_number', 'reference', 'note'];

    protected function casts(): array
    {
        return ['amount' => 'integer', 'reported_at' => 'datetime', 'confirmed_at' => 'datetime'];
    }

    public function member(): BelongsTo { return $this->belongsTo(User::class, 'user_id'); }
    public function confirmer(): BelongsTo { return $this->belongsTo(User::class, 'confirmed_by'); }
    public function periods(): HasMany { return $this->hasMany(ContributionPeriod::class, 'payment_batch_id'); }
}
