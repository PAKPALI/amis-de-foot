<?php

namespace App\Enums;

enum UserRole: string
{
    case Member = 'member';
    case Administrator = 'administrator';
    case Manager = 'manager';

    public function hasAdministrationAccess(): bool
    {
        return $this !== self::Member;
    }

    public function canManageRoles(): bool
    {
        return $this === self::Manager;
    }
}
