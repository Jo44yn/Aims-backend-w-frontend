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
                Schema::create('qa_inspections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('goods_receipt_item_id')->constrained('goods_receipt_items')->cascadeOnDelete();
            $table->foreignId('inspected_by')->nullable()->constrained('users')->nullOnDelete();
            $table->timestamp('inspected_at')->nullable();
            $table->unsignedInteger('qty_passed')->default(0);
            $table->unsignedInteger('qty_failed')->default(0);
            $table->text('defects')->nullable();
            $table->string('photo_path')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('qa_inspections');
    }
};
