<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Ces lignes provenaient de l'ancien aperçu automatique de 12 mois.
        // Aucun paiement ni signalement n'y est associé.
        DB::table('contribution_periods')
            ->whereNull('paid_at')
            ->whereNull('payment_batch_id')
            ->whereNull('payment_reported_at')
            ->delete();
    }

    public function down(): void
    {
        // Les périodes supprimées sont des aperçus non sélectionnés, sans donnée métier à restaurer.
    }
};
