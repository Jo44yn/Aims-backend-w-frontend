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
                Schema::create('suppliers', function (Blueprint $table) {
            $table->id();
            $table->string('code', 30)->unique();
            $table->string('name');
            $table->enum('type', ['brand_partner', 'local', 'subcontractor']);
            $table->string('tin', 30)->nullable();
            $table->string('contact_person');
            $table->string('email');
            $table->string('phone', 30)->nullable();
            $table->unsignedInteger('payment_terms_days')->default(30);
            $table->unsignedInteger('default_lead_time_days')->default(14);
            $table->enum('status', ['pending', 'approved', 'suspended'])->default('pending');
            $table->timestamp('approved_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('suppliers');
    }
};
