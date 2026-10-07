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
                Schema::create('contracts', function (Blueprint $table) {
            $table->id();
            $table->string('contract_no', 30)->unique();
            $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
            $table->string('title');
            $table->string('noa_no', 50);
            $table->date('noa_date');
            $table->date('contract_date')->nullable();
            $table->date('ntp_date')->nullable();
            $table->unsignedInteger('delivery_days');
            $table->date('delivery_deadline')->nullable();
            $table->decimal('contract_amount', 14, 2);
            $table->decimal('ld_rate', 5, 4)->default(0.0010); // 0.1% per day
            $table->string('status', 30)->default('awarded');
            $table->foreignId('created_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('contracts');
    }
};
