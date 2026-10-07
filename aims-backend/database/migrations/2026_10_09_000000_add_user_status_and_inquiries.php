<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Accounts are deactivated, never deleted, so the audit trail stays intact (blueprint, Authentication).
        Schema::table('users', function (Blueprint $table) {
            $table->boolean('is_active')->default(true)->after('avatar');
            $table->timestamp('last_login_at')->nullable()->after('is_active');
        });

        // Quotation requests from the public site (P05) and the client portal (C05).
        Schema::create('inquiries', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->foreignId('client_id')->nullable()->constrained('clients')->nullOnDelete();
            $table->string('name');
            $table->string('organization')->nullable();
            $table->string('email');
            $table->string('phone', 40)->nullable();
            $table->text('items');
            $table->date('needed_by')->nullable();
            $table->string('status', 30)->default('new'); // new, quoted, closed
            $table->text('staff_note')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('inquiries');
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn(['is_active', 'last_login_at']);
        });
    }
};
