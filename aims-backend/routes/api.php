<?php

use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\PurchaseOrderController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    // Public Auth Endpoint
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login');

    // Protected Routes (Sanctum)
    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Contracts
        Route::get('/contracts', [ContractController::class, 'index']);
        Route::get('/contracts/{contract}', [ContractController::class, 'show']);

        // Purchase Orders
        Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
        Route::post('/contracts/{contract}/purchase-orders/generate', [PurchaseOrderController::class, 'generate']);

        // Inventory Movements
        Route::get('/inventory/movements', [InventoryController::class, 'movements']);

        // Invoices
        Route::get('/invoices', [InvoiceController::class, 'index']);
    });
});