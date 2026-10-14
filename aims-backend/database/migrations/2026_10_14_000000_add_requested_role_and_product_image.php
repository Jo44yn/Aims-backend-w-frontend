<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Department a staff member asked for at sign-up; cleared once an admin approves them.
            $table->string('requested_role', 30)->nullable()->after('is_active');
        });

        Schema::table('products', function (Blueprint $table) {
            // Path of the product photo on the "local" disk (storage/app/private/products/...).
            $table->string('image_path')->nullable()->after('specifications');
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropColumn('image_path');
        });

        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('requested_role');
        });
    }
};
