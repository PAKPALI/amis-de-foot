<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contribution_periods', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->date('period_starts_on');
            $table->unsignedInteger('amount');
            $table->timestamp('paid_at')->nullable();
            $table->timestamps();

            $table->unique(['user_id', 'period_starts_on']);
            $table->index(['user_id', 'paid_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contribution_periods');
    }
};
