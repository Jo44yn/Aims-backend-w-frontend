<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
                Schema::create('invoices', function (Blueprint $table) {
            $table->id();
            $table->string('bs_no', 30)->unique();
            $table->string('official_invoice_no', 50)->nullable();
            $table->foreignId('contract_id')->constrained('contracts')->restrictOnDelete();
            $table->foreignId('acceptance_id')->nullable()->constrained('acceptances')->nullOnDelete();
            $table->date('invoice_date');
            $table->decimal('gross_amount', 14, 2);
            $table->decimal('vat_amount', 14, 2);
            $table->decimal('wvat_amount', 14, 2)->default(0);
            $table->decimal('ewt_amount', 14, 2)->default(0);
            $table->decimal('net_receivable', 14, 2);
            $table->date('due_date');
            $table->string('status', 30)->default('unpaid');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('invoices');
    }
};
