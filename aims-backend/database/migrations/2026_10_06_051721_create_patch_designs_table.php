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
            Schema::create('patch_designs', function (Blueprint $table) {
        $table->id();
        $table->foreignId('client_id')->constrained('clients')->restrictOnDelete();
        $table->string('name');
        $table->string('size', 30);
        $table->string('colors')->nullable();
        $table->unsignedInteger('stitch_count')->default(0);
        $table->string('design_file')->nullable();
        $table->timestamp('approved_by_client_at')->nullable();
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('patch_designs');
    }
};
