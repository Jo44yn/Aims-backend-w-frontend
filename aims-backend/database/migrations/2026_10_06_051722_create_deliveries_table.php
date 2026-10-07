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
                Schema::create('deliveries', function (Blueprint $table) {
            $table->id();
            $table->string('dr_no', 30)->unique();
            $table->foreignId('contract_id')->constrained('contracts')->restrictOnDelete();
            $table->date('delivery_date');
            $table->foreignId('delivered_by')->nullable()->constrained('users')->nullOnDelete();
            $table->string('vehicle')->nullable();
            $table->string('received_by_name')->nullable();
            $table->string('status', 30)->default('scheduled');
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('deliveries');
    }
};
