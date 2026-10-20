<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->boolean('affects_balance')->default(true)->after('amount');
        });

        // Keep pre-launch receipts for audit without adding them to the opening balance.
        DB::table('cash_transactions')->whereIn('kind', ['membership', 'contribution'])->update(['affects_balance' => false]);
        $income = DB::table('cash_transactions')->where('affects_balance', true)->where('direction', 'in')->sum('amount');
        $expense = DB::table('cash_transactions')->where('affects_balance', true)->where('direction', 'out')->sum('amount');
        DB::table('cash_registers')->where('singleton_key', 'club')->update(['current_balance' => max(0, $income - $expense)]);
    }

    public function down(): void
    {
        Schema::table('cash_transactions', function (Blueprint $table) {
            $table->dropColumn('affects_balance');
        });
    }
};
