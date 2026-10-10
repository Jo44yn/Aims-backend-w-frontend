<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\PriceAgreement;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\Supplier;
use Illuminate\Support\Str;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CatalogController extends Controller
{
    public function products(): JsonResponse
    {
        $products = Product::with(['category', 'variants'])->orderBy('code')->get();

        return response()->json(['data' => $products->map(fn ($p) => ApiPresent::product($p))]);
    }

    public function storeProduct(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'sourcing_type' => 'required|in:in_house,purchased',
            'uom' => 'nullable|string|max:20',
            'specifications' => 'nullable|string',
            'sizes' => 'nullable|string|max:500', // comma separated, e.g. "S, M, L"
            'code' => 'nullable|string|max:30|unique:products,code',
        ]);

        $product = DB::transaction(function () use ($data) {
            $category = ProductCategory::firstOrCreate(['name' => trim($data['category'])]);

            $code = $data['code'] ?? null;
            if (! $code) {
                $prefix = strtoupper(substr(preg_replace('/[^A-Za-z]/', '', $category->name), 0, 2)) ?: 'PR';
                $n = Product::where('category_id', $category->id)->count() + 1;
                do {
                    $code = $prefix.'-'.str_pad((string) $n++, 3, '0', STR_PAD_LEFT);
                } while (Product::where('code', $code)->exists());
            }

            $slug = Str::slug($data['name']);
            if (Product::where('slug', $slug)->exists()) {
                $slug .= '-'.Str::lower($code);
            }

            $product = Product::create([
                'category_id' => $category->id,
                'code' => $code,
                'slug' => $slug,
                'name' => $data['name'],
                'specifications' => $data['specifications'] ?? null,
                'uom' => ($data['uom'] ?? null) ?: 'pc',
                'sourcing_type' => $data['sourcing_type'],
                'is_active' => true,
            ]);

            $sizes = collect(explode(',', (string) ($data['sizes'] ?? '')))->map(fn ($s) => trim($s))->filter()->unique()->values();
            if ($sizes->isEmpty()) {
                $sizes = collect(['One size']);
            }
            foreach ($sizes as $size) {
                $product->variants()->create(['sku' => $code.'-'.strtoupper(Str::slug($size)), 'size' => $size, 'is_active' => true]);
            }

            return $product;
        });

        $product->load(['category', 'variants']);

        return response()->json(['data' => ApiPresent::product($product)], 201);
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

    // Public catalog: only products that are currently available (no prices, no login).
    public function publicProducts(): JsonResponse
    {
        $products = Product::with(['category', 'variants'])->where('is_active', true)->orderBy('name')->get();

        return response()->json(['data' => $products->map(fn ($p) => ApiPresent::product($p))]);
    }

    // Edit a product: change sourcing (in-house <-> purchased), mark unavailable, rename, change sizes.
    // Sizes that are removed are switched off, not deleted, so old orders keep their variant.
    public function updateProduct(Request $request, Product $product): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'category' => 'required|string|max:100',
            'sourcing_type' => 'required|in:in_house,purchased',
            'uom' => 'nullable|string|max:20',
            'specifications' => 'nullable|string',
            'sizes' => 'nullable|string|max:500',
            'is_active' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($data, $product) {
            $category = ProductCategory::firstOrCreate(['name' => trim($data['category'])]);
            $product->update([
                'category_id' => $category->id,
                'name' => $data['name'],
                'sourcing_type' => $data['sourcing_type'],
                'uom' => ($data['uom'] ?? null) ?: 'pc',
                'specifications' => $data['specifications'] ?? null,
                'is_active' => (bool) ($data['is_active'] ?? false),
            ]);

            if (array_key_exists('sizes', $data) && $data['sizes'] !== null) {
                $sizes = collect(explode(',', $data['sizes']))->map(fn ($s) => trim($s))->filter()->unique()->values();
                if ($sizes->isEmpty()) {
                    $sizes = collect(['One size']);
                }
                foreach ($product->variants as $variant) {
                    $variant->update(['is_active' => $sizes->contains($variant->size)]);
                }
                foreach ($sizes as $size) {
                    $existing = $product->variants()->where('size', $size)->first();
                    if (! $existing) {
                        $product->variants()->create(['sku' => $product->code.'-'.strtoupper(Str::slug($size)), 'size' => $size, 'is_active' => true]);
                    }
                }
            }
        });

        return response()->json(['data' => ApiPresent::product($product->fresh(['category', 'variants']))]);
    }

    public function updateSupplier(Request $request, Supplier $supplier): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'type' => 'required|in:brand_partner,local,subcontractor',
            'tin' => 'nullable|string|max:30',
            'contact' => 'required|string|max:255',
            'email' => 'required|email',
            'phone' => 'nullable|string|max:40',
            'terms' => 'nullable|integer|min:0',
            'lead' => 'nullable|integer|min:0',
            'status' => 'required|in:pending,approved,suspended',
        ]);

        $supplier->update([
            'name' => $data['name'],
            'type' => $data['type'],
            'tin' => $data['tin'] ?? null,
            'contact_person' => $data['contact'],
            'email' => $data['email'],
            'phone' => $data['phone'] ?? null,
            'payment_terms_days' => $data['terms'] ?? $supplier->payment_terms_days,
            'default_lead_time_days' => $data['lead'] ?? $supplier->default_lead_time_days,
            'status' => $data['status'],
        ]);

        return response()->json(['data' => ApiPresent::supplier($supplier)]);
    }

    // Edit the terms of an agreement, or cancel it (status = cancelled) when a supplier withdraws a price.
    public function updatePriceAgreement(Request $request, PriceAgreement $priceAgreement): JsonResponse
    {
        $data = $request->validate([
            'reference_no' => 'nullable|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'min_order_qty' => 'nullable|integer|min:1',
            'lead_time_days' => 'nullable|integer|min:0',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after_or_equal:valid_from',
            'is_preferred' => 'nullable|boolean',
            'status' => 'required|in:active,cancelled',
        ]);

        DB::transaction(function () use ($data, $priceAgreement) {
            if (! empty($data['is_preferred']) && $data['status'] === 'active') {
                PriceAgreement::where('product_variant_id', $priceAgreement->product_variant_id)
                    ->where('id', '!=', $priceAgreement->id)->where('status', 'active')->update(['is_preferred' => false]);
            }
            $priceAgreement->update([
                'reference_no' => $data['reference_no'] ?? $priceAgreement->reference_no,
                'unit_cost' => $data['unit_cost'],
                'min_order_qty' => $data['min_order_qty'] ?? 1,
                'lead_time_days' => $data['lead_time_days'] ?? 0,
                'valid_from' => $data['valid_from'],
                'valid_to' => $data['valid_to'],
                'is_preferred' => $data['status'] === 'active' && ! empty($data['is_preferred']),
                'status' => $data['status'],
            ]);
        });

        return response()->json(['data' => ApiPresent::priceAgreement($priceAgreement->load(['supplier', 'variant.product']))]);
    }

    // Vetting done: only approved suppliers can receive POs / price agreements (BR-06).
    public function approveSupplier(Supplier $supplier): JsonResponse
    {
        $supplier->update(['status' => 'approved']);

        return response()->json(['data' => ApiPresent::supplier($supplier)]);
    }

    public function priceAgreements(): JsonResponse
    {
        $rows = PriceAgreement::with(['supplier', 'variant.product'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($p) => ApiPresent::priceAgreement($p))]);
    }

    public function storePriceAgreement(Request $request): JsonResponse
    {
        $data = $request->validate([
            'supplier_id' => 'required|exists:suppliers,id',
            'product_variant_id' => 'required|exists:product_variants,id',
            'reference_no' => 'nullable|string|max:50',
            'unit_cost' => 'required|numeric|min:0',
            'min_order_qty' => 'nullable|integer|min:1',
            'lead_time_days' => 'nullable|integer|min:0',
            'valid_from' => 'required|date',
            'valid_to' => 'required|date|after_or_equal:valid_from',
            'is_preferred' => 'nullable|boolean',
        ]);

        // BR-06: only approved suppliers can be used on agreements.
        $supplier = Supplier::findOrFail($data['supplier_id']);
        if (strtolower((string) $supplier->status) !== 'approved') {
            return response()->json([
                'message' => 'Only approved suppliers can have price agreements.',
                'errors' => ['supplier_id' => ['Supplier is not approved yet.']],
            ], 422);
        }

        $agreement = DB::transaction(function () use ($data) {
            // BR-07: a variant has at most one preferred active agreement.
            if (! empty($data['is_preferred'])) {
                PriceAgreement::where('product_variant_id', $data['product_variant_id'])
                    ->where('status', 'active')->update(['is_preferred' => false]);
            }

            return PriceAgreement::create([
                'supplier_id' => $data['supplier_id'],
                'product_variant_id' => $data['product_variant_id'],
                'reference_no' => $data['reference_no'] ?? 'PA-'.now()->format('Y').'-'.str_pad((string) (PriceAgreement::count() + 1), 3, '0', STR_PAD_LEFT),
                'unit_cost' => $data['unit_cost'],
                'min_order_qty' => $data['min_order_qty'] ?? 1,
                'lead_time_days' => $data['lead_time_days'] ?? 0,
                'valid_from' => $data['valid_from'],
                'valid_to' => $data['valid_to'],
                'is_preferred' => (bool) ($data['is_preferred'] ?? false),
                'status' => 'active',
            ]);
        });

        $agreement->load(['supplier', 'variant.product']);

        return response()->json(['data' => ApiPresent::priceAgreement($agreement)], 201);
    }
}
