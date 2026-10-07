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
        Schema::create('price_agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('supplier_id')->constrained('suppliers')->restrictOnDelete();
            $table->foreignId('product_variant_id')->constrained('product_variants')->restrictOnDelete();
            $table->string('reference_no', 50)->nullable();
            $table->decimal('unit_cost', 14, 2);
            $table->unsignedInteger('min_order_qty')->default(1);
            $table->unsignedSmallInteger('lead_time_days')->default(0);
            $table->date('valid_from');
            $table->date('valid_to');
            $table->boolean('is_preferred')->default(false);
            $table->string('status', 30)->default('active');
            $table->timestamps();

            $table->index(['product_variant_id', 'is_preferred', 'valid_to']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('price_agreements');
    }
};
