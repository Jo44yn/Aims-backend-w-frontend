<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PriceAgreement;
use App\Models\Product;
use App\Models\Supplier;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CatalogController extends Controller
{
    public function products(): JsonResponse
    {
        $products = Product::with(['category', 'variants'])->orderBy('code')->get();

        return response()->json(['data' => $products->map(fn ($p) => ApiPresent::product($p))]);
    }

    public function suppliers(): JsonResponse
    {
        $rows = Supplier::withCount('priceAgreements')->orderBy('code')->get();

        return response()->json(['data' => $rows->map(fn ($s) => ApiPresent::supplier($s))]);
    }

    public function supplier(Supplier $supplier): JsonResponse
    {
        $supplier->load(['priceAgreements.variant.product', 'purchaseOrders.contract']);

        return response()->json([
            'data' => array_merge(ApiPresent::supplier($supplier), [
                'priceAgreements' => $supplier->priceAgreements->map(fn ($p) => ApiPresent::priceAgreement($p)),
                'purchaseOrders' => $supplier->purchaseOrders->map(fn ($p) => ApiPresent::purchaseOrder($p)),
            ]),
        ]);
    }

    public function storeSupplier(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:brand_partner,local,subcontractor',
            'tin' => 'nullable|string|max:30',
            'contact' => 'required|string|max:255',
            'email' => 'required|email',
            'terms' => 'nullable|integer|min:0',
            'lead' => 'nullable|integer|min:0',
        ]);

        $seq = str_pad((string) (Supplier::count() + 1), 3, '0', STR_PAD_LEFT);
        $supplier = Supplier::create([
            'code' => 'SP-'.$seq,
            'name' => $data['name'],
            'type' => $data['type'],
            'tin' => $data['tin'] ?? null,
            'contact_person' => $data['contact'],
            'email' => $data['email'],
            'phone' => null,
            'payment_terms_days' => $data['terms'] ?? 30,
            'default_lead_time_days' => $data['lead'] ?? 14,
            'status' => 'pending',
        ]);

        return response()->json(['data' => ApiPresent::supplier($supplier)], 201);
    }

    public function priceAgreements(): JsonResponse
    {
        $rows = PriceAgreement::with(['supplier', 'variant.product'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($p) => ApiPresent::priceAgreement($p))]);
    }
}
