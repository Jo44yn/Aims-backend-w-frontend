<?php

namespace App\Http\Controllers\Api\V1;

use App\Enums\ContractStatus;
use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\Product;
use App\Services\NumberingService;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ContractController extends Controller
{
    public function __construct(protected NumberingService $numbering) {}

    public function index(Request $request): JsonResponse
    {
        $query = Contract::with(['client', 'items']);

        if ($request->user()?->hasRole('client') && $request->user()->client_id) {
            $query->where('client_id', $request->user()->client_id);
        }

        $contracts = $query->latest()->get();

        return response()->json(['data' => $contracts->map(fn ($c) => ApiPresent::contract($c))]);
    }

    public function show(Request $request, Contract $contract): JsonResponse
    {
        if ($request->user()?->hasRole('client') && $request->user()->client_id !== $contract->client_id) {
            abort(403);
        }

        $contract->load([
            'client',
            'items.variant.product',
            'items.purchaseOrderItems',
            'purchaseOrders.supplier',
            'purchaseOrders.contract',
            'purchaseOrders.items.variant.product',
            'purchaseOrders.approver',
            'deliveries.contract.client',
            'invoices.contract.client',
        ]);

        return response()->json(['data' => ApiPresent::contract($contract, true)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client' => 'required|string',
            'title' => 'required|string|max:255',
            'noa_no' => 'required|string|max:50',
            'noa_date' => 'required|date',
            'contract_date' => 'nullable|date',
            'ntp_date' => 'nullable|date',
            'delivery_days' => 'required|integer|min:1',
            'ld_rate' => 'nullable|numeric',
            'lines' => 'nullable|array',
            'lines.*.product' => 'nullable|string',
            'lines.*.size' => 'nullable|string',
            'lines.*.qty' => 'nullable|numeric',
            'lines.*.price' => 'nullable|numeric',
        ]);

        $client = \App\Models\Client::where('name', $data['client'])->firstOrFail();
        $ntp = $data['ntp_date'] ?? null;
        $deadline = $ntp ? now()->parse($ntp)->addDays((int) $data['delivery_days']) : null;
        $amount = 0;
        $lines = collect($data['lines'] ?? [])->filter(fn ($l) => ($l['qty'] ?? 0) > 0);

        foreach ($lines as $line) {
            $amount += ((float) $line['qty']) * ((float) ($line['price'] ?? 0));
        }

        $contract = Contract::create([
            'contract_no' => $this->numbering->next('CT'),
            'client_id' => $client->id,
            'title' => $data['title'],
            'noa_no' => $data['noa_no'],
            'noa_date' => $data['noa_date'],
            'contract_date' => $data['contract_date'] ?? null,
            'ntp_date' => $ntp,
            'delivery_days' => $data['delivery_days'],
            'delivery_deadline' => $deadline,
            'contract_amount' => $amount,
            'ld_rate' => isset($data['ld_rate']) ? ((float) $data['ld_rate']) / 100 : 0.001,
            'status' => ContractStatus::Awarded,
            'created_by' => $request->user()?->id,
        ]);

        foreach ($lines as $line) {
            $product = Product::with('variants')->where('name', $line['product'] ?? '')->first();
            $variant = $product?->variants->first(fn ($v) => ! ($line['size'] ?? '') || strcasecmp((string) $v->size, (string) $line['size']) === 0)
                ?? $product?->variants->first();
            if (! $variant) {
                continue;
            }
            $contract->items()->create([
                'product_variant_id' => $variant->id,
                'quantity' => (int) $line['qty'],
                'unit_price' => (float) ($line['price'] ?? 0),
            ]);
        }

        $contract->load(['client', 'items']);

        return response()->json(['data' => ApiPresent::contract($contract, true)], 201);
    }
}
