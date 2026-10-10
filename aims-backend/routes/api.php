<?php

use App\Http\Controllers\Api\V1\AdminController;
use App\Http\Controllers\Api\V1\AuthController;
use App\Http\Controllers\Api\V1\CatalogController;
use App\Http\Controllers\Api\V1\ClientController;
use App\Http\Controllers\Api\V1\ContractController;
use App\Http\Controllers\Api\V1\InquiryController;
use App\Http\Controllers\Api\V1\InventoryController;
use App\Http\Controllers\Api\V1\InvoiceController;
use App\Http\Controllers\Api\V1\ProductionController;
use App\Http\Controllers\Api\V1\PurchaseOrderController;
use Illuminate\Support\Facades\Route;

// Who may open staff data. Clients only get the portal endpoints below (BR-27).
$staff = 'admin|gm|bidding|purchasing|warehouse|production|qa|accounting';

Route::prefix('v1')->group(function () use ($staff) {
    // ── Public ─────────────────────────────────────────────────────────────
    Route::post('/auth/login', [AuthController::class, 'login'])->name('login')->middleware('throttle:10,1');
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::get('/public/products', [CatalogController::class, 'publicProducts']);
    Route::post('/public/inquiries', [InquiryController::class, 'storePublic'])->middleware('throttle:10,1');

    // ── Signed in (any role) ───────────────────────────────────────────────
    Route::middleware('auth:sanctum')->group(function () use ($staff) {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::put('/auth/avatar', [AuthController::class, 'updateAvatar']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);

        // Client portal
        Route::middleware('role:client')->group(function () {
            Route::get('/portal/inquiries', [InquiryController::class, 'mine']);
            Route::post('/portal/inquiries', [InquiryController::class, 'storePortal']);
        });

        // ── Staff: read ────────────────────────────────────────────────────
        Route::middleware('role:'.$staff)->group(function () {
            Route::get('/settings', [AdminController::class, 'settings']);
            Route::get('/clients', [ClientController::class, 'index']);
            Route::get('/clients/{client}', [ClientController::class, 'show']);
            Route::get('/inquiries', [InquiryController::class, 'index']);

            Route::get('/products', [CatalogController::class, 'products']);
            Route::get('/suppliers', [CatalogController::class, 'suppliers']);
            Route::get('/suppliers/{supplier}', [CatalogController::class, 'supplier']);
            Route::get('/price-agreements', [CatalogController::class, 'priceAgreements']);

            Route::get('/materials', [InventoryController::class, 'materials']);
            Route::get('/designs', [InventoryController::class, 'designs']);
            Route::get('/job-orders', [InventoryController::class, 'jobOrders']);
            Route::get('/job-orders/options', [ProductionController::class, 'jobOrderOptions']);

            Route::get('/contracts', [ContractController::class, 'index']);
            Route::get('/contracts/{contract}', [ContractController::class, 'show']);
            Route::get('/purchase-orders', [PurchaseOrderController::class, 'index']);
            Route::get('/inventory/movements', [InventoryController::class, 'movements']);
            Route::get('/invoices', [InvoiceController::class, 'index']);

            // ── Staff: write (blueprint role matrix; Admin and GM can do everything business-side) ──
            Route::middleware('role:admin|gm|bidding')->group(function () {
                Route::post('/clients', [ClientController::class, 'store']);
                Route::put('/clients/{client}', [ClientController::class, 'update']);
                Route::put('/inquiries/{inquiry}', [InquiryController::class, 'update']);
            });

            Route::middleware('role:admin|gm|purchasing')->group(function () {
                Route::post('/products', [CatalogController::class, 'storeProduct']);
                Route::put('/products/{product}', [CatalogController::class, 'updateProduct']);
                Route::post('/suppliers', [CatalogController::class, 'storeSupplier']);
                Route::put('/suppliers/{supplier}', [CatalogController::class, 'updateSupplier']);
                Route::post('/suppliers/{supplier}/approve', [CatalogController::class, 'approveSupplier']);
                Route::post('/price-agreements', [CatalogController::class, 'storePriceAgreement']);
                Route::put('/price-agreements/{priceAgreement}', [CatalogController::class, 'updatePriceAgreement']);
                Route::post('/contracts/{contract}/purchase-orders/generate', [PurchaseOrderController::class, 'generate']);
            });

            Route::middleware('role:admin|gm|production')->group(function () {
                Route::post('/materials', [ProductionController::class, 'storeMaterial']);
                Route::put('/materials/{material}', [ProductionController::class, 'updateMaterial']);
                Route::post('/materials/{material}/stock', [ProductionController::class, 'receiveMaterial']);
                Route::post('/designs', [ProductionController::class, 'storeDesign']);
                Route::put('/designs/{design}', [ProductionController::class, 'updateDesign']);
                Route::delete('/designs/{design}', [ProductionController::class, 'deleteDesign']);
                Route::post('/designs/{design}/approve', [ProductionController::class, 'approveDesign']);
                Route::post('/job-orders', [ProductionController::class, 'storeJobOrder']);
                Route::put('/job-orders/{jobOrder}', [ProductionController::class, 'updateJobOrder']);
                Route::delete('/job-orders/{jobOrder}', [ProductionController::class, 'deleteJobOrder']);
                Route::post('/job-orders/{jobOrder}/advance', [ProductionController::class, 'advanceJobOrder']);
            });

            Route::middleware('role:admin|gm')->group(function () {
                Route::get('/users', [AdminController::class, 'users']);
                Route::put('/settings', [AdminController::class, 'updateSettings']);
            });

            Route::middleware('role:admin')->group(function () {
                Route::post('/users', [AdminController::class, 'storeUser']);
                Route::put('/users/{user}', [AdminController::class, 'updateUser']);
            });
        });
    });
});
