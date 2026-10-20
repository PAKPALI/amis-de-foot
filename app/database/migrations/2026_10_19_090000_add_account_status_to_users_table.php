<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('account_status', 16)->default('active')->after('role');
            $table->timestamp('account_deactivated_at')->nullable()->after('account_status');
            $table->foreignId('account_deactivated_by')->nullable()->after('account_deactivated_at')->constrained('users')->nullOnDelete();
            $table->string('account_deactivation_reason', 1000)->nullable()->after('account_deactivated_by');
            $table->index('account_status');
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropConstrainedForeignId('account_deactivated_by');
            $table->dropIndex(['account_status']);
            $table->dropColumn(['account_status', 'account_deactivated_at', 'account_deactivation_reason']);
        });
    }
};
