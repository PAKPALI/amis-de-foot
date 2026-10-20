<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ContributionPayment extends Model
{
    use HasFactory;

    protected $fillable = [
        'contribution_period_id',
        'user_id',
        'amount',
        'received_at',
        'recorded_by',
        'receipt_number',
        'reference',
        'note',
    ];

    protected function casts(): array
    {
        return [
            'amount' => 'integer',
            'received_at' => 'datetime',
        ];
    }

    public function period(): BelongsTo
    {
        return $this->belongsTo(ContributionPeriod::class, 'contribution_period_id');
    }

    public function member(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function recorder(): BelongsTo
    {
        return $this->belongsTo(User::class, 'recorded_by');
    }
}
