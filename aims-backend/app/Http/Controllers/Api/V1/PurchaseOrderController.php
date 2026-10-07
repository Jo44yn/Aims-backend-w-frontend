<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Contract;
use App\Models\PurchaseOrder;
use App\Services\PurchaseOrderService;
use Illuminate\Http\JsonResponse;

class PurchaseOrderController extends Controller
{
    public function __construct(protected PurchaseOrderService $poService) {}

    public function index(): JsonResponse
    {
        $pos = PurchaseOrder::with(['supplier', 'contract', 'items.variant.product'])->latest()->get();

        return response()->json(['data' => $pos]);
    }

    public function generate(Contract $contract): JsonResponse
    {
        $pos = $this->poService->generateForContract($contract);

        return response()->json([
            'message' => 'Purchase orders generated successfully.',
            'data' => $pos->load(['supplier', 'items']),
        ], 201);
    }
}