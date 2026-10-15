<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class UserPasswordReset extends Model
{
    protected $fillable = [
        'subject_user_id',
        'actor_user_id',
        'subject_name',
        'actor_name',
        'reason',
    ];
}
