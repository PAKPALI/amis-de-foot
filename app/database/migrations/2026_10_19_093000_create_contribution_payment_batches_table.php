<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contribution_payment_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->cascadeOnDelete();
            $table->unsignedInteger('amount');
            $table->string('status', 32)->default('awaiting_confirmation');
            $table->timestamp('reported_at')->nullable();
            $table->timestamp('confirmed_at')->nullable();
            $table->foreignId('confirmed_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('receipt_number', 48)->nullable()->unique();
            $table->string('reference', 120)->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
        });

        Schema::table('contribution_periods', function (Blueprint $table) {
            $table->foreignId('payment_batch_id')->nullable()->after('user_id')->constrained('contribution_payment_batches')->nullOnDelete();
            $table->timestamp('payment_reported_at')->nullable()->after('amount');
            $table->index('payment_batch_id');
        });
    }

    public function down(): void
    {
        Schema::table('contribution_periods', function (Blueprint $table) {
            $table->dropIndex(['payment_batch_id']);
            $table->dropConstrainedForeignId('payment_batch_id');
            $table->dropColumn('payment_reported_at');
        });

        Schema::dropIfExists('contribution_payment_batches');
    }
};
