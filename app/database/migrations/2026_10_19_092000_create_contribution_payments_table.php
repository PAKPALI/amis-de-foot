<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contribution_payments', function (Blueprint $table) {
            $table->id();
            $table->foreignId('contribution_period_id')->constrained()->cascadeOnDelete();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->timestamp('received_at');
            $table->foreignId('recorded_by')->constrained('users')->restrictOnDelete();
            $table->string('receipt_number', 48)->unique();
            $table->string('reference', 120)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->unique('contribution_period_id');
            $table->index(['user_id', 'received_at']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contribution_payments');
    }
};
