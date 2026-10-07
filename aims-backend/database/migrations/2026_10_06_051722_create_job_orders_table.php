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
                Schema::create('job_orders', function (Blueprint $table) {
            $table->id();
            $table->string('jo_no', 30)->unique();
            $table->foreignId('contract_item_id')->constrained('contract_items')->restrictOnDelete();
            $table->foreignId('patch_design_id')->constrained('patch_designs')->restrictOnDelete();
            $table->unsignedInteger('quantity');
            $table->date('start_date')->nullable();
            $table->date('due_date')->nullable();
            $table->string('machine_no', 30)->nullable();
            $table->string('status', 30)->default('queued'); // queued, in_production, for_qa, done
            $table->unsignedInteger('output_qty')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('job_orders');
    }
};
