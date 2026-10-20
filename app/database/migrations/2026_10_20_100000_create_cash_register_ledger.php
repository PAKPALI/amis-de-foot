<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('cash_registers', function (Blueprint $table) {
            $table->id();
            $table->string('singleton_key', 24)->unique();
            $table->string('name', 120);
            $table->string('currency', 3)->default('XOF');
            $table->unsignedBigInteger('current_balance')->default(0);
            $table->timestamp('opened_at')->nullable();
            $table->foreignId('opened_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });

        $now = now();
        DB::table('cash_registers')->insert([
            'id' => 1,
            'singleton_key' => 'club',
            'name' => 'Caisse du club',
            'currency' => 'XOF',
            'current_balance' => 0,
            'created_at' => $now,
            'updated_at' => $now,
        ]);

        Schema::create('cash_transactions', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cash_register_id')->constrained('cash_registers')->restrictOnDelete();
            $table->string('kind', 32);
            $table->string('direction', 3);
            $table->unsignedBigInteger('amount');
            $table->timestamp('occurred_at');
            $table->string('category', 64);
            $table->text('description');
            $table->string('reference', 120)->nullable();
            $table->string('source_type', 64)->nullable();
            $table->unsignedBigInteger('source_id')->nullable();
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('approved_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('approved_at')->nullable();
            $table->foreignId('reverses_transaction_id')->nullable()->unique()->constrained('cash_transactions')->restrictOnDelete();
            $table->uuid('correction_group_id')->nullable()->index();
            $table->timestamps();

            $table->unique(['source_type', 'source_id']);
            $table->index(['cash_register_id', 'occurred_at']);
            $table->index(['cash_register_id', 'direction', 'kind']);
        });

        $memberships = DB::table('memberships')
            ->where('status', 'approved')
            ->whereNotNull('payment_confirmed_at')
            ->orderBy('payment_confirmed_at')
            ->get();

        foreach ($memberships as $membership) {
            DB::table('cash_transactions')->insert([
                'cash_register_id' => 1,
                'kind' => 'membership',
                'direction' => 'in',
                'amount' => $membership->fee_amount,
                'occurred_at' => $membership->payment_confirmed_at,
                'category' => 'membership_fee',
                'description' => 'Adhésion confirmée — membre #'.$membership->user_id,
                'source_type' => 'membership',
                'source_id' => $membership->id,
                'created_by' => $membership->payment_confirmed_by,
                'approved_by' => $membership->payment_confirmed_by,
                'approved_at' => $membership->payment_confirmed_at,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $contributions = DB::table('contribution_payment_batches')
            ->where('status', 'confirmed')
            ->orderBy('confirmed_at')
            ->get();

        foreach ($contributions as $batch) {
            DB::table('cash_transactions')->insert([
                'cash_register_id' => 1,
                'kind' => 'contribution',
                'direction' => 'in',
                'amount' => $batch->amount,
                'occurred_at' => $batch->confirmed_at ?? $batch->reported_at ?? $batch->created_at,
                'category' => 'monthly_contribution',
                'description' => 'Cotisation confirmée — membre #'.$batch->user_id,
                'reference' => $batch->receipt_number,
                'source_type' => 'contribution_batch',
                'source_id' => $batch->id,
                'created_by' => $batch->confirmed_by,
                'approved_by' => $batch->confirmed_by,
                'approved_at' => $batch->confirmed_at ?? $now,
                'created_at' => $now,
                'updated_at' => $now,
            ]);
        }

        $income = DB::table('cash_transactions')->where('direction', 'in')->sum('amount');
        $expense = DB::table('cash_transactions')->where('direction', 'out')->sum('amount');
        DB::table('cash_registers')->where('id', 1)->update(['current_balance' => max(0, $income - $expense)]);
    }

    public function down(): void
    {
        Schema::dropIfExists('cash_transactions');
        Schema::dropIfExists('cash_registers');
    }
};
