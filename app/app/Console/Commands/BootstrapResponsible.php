<?php

namespace App\Console\Commands;

use App\Enums\UserRole;
use App\Models\User;
use App\Models\UserRoleChange;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\DB;

class BootstrapResponsible extends Command
{
    protected $signature = 'amisdefoot:bootstrap-responsable {userId : Identifiant du compte qui recevra le rôle initial}';

    protected $description = 'Attribue le premier rôle de responsable habilité depuis la console de confiance';

    public function handle(): int
    {
        if (User::query()->where('role', UserRole::Manager->value)->exists()) {
            $this->error('Un responsable habilité existe déjà. Les rôles se gèrent depuis l’administration.');

            return self::FAILURE;
        }

        $user = User::query()->find($this->argument('userId'));

        if (! $user) {
            $this->error('Compte introuvable.');

            return self::FAILURE;
        }

        DB::transaction(function () use ($user): void {
            $oldRole = $user->role;
            $user->role = UserRole::Manager;
            $user->save();

            UserRoleChange::query()->create([
                'subject_user_id' => $user->id,
                'actor_user_id' => null,
                'subject_name' => $user->name,
                'actor_name' => 'Console de déploiement',
                'old_role' => $oldRole->value,
                'new_role' => UserRole::Manager->value,
                'reason' => 'Désignation initiale du responsable habilité.',
            ]);
        });

        $this->info("Le compte #{$user->id} est maintenant responsable habilité.");

        return self::SUCCESS;
    }
}
