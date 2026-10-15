<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Model;

class UserRoleChange extends Model
{
    protected $fillable = [
        'subject_user_id',
        'actor_user_id',
        'subject_name',
        'actor_name',
        'old_role',
        'new_role',
        'reason',
    ];

    public function subject(): BelongsTo
    {
        return $this->belongsTo(User::class, 'subject_user_id');
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
