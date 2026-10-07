<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Delivery;
use App\Models\GoodsReceipt;
use App\Models\JobOrder;
use App\Models\Material;
use App\Models\PatchDesign;
use App\Models\QaInspection;
use App\Models\ReturnToSupplier;
use App\Models\StockMovement;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;

class InventoryController extends Controller
{
    public function movements(): JsonResponse
    {
        $movements = StockMovement::with(['variant.product', 'contractItem.contract', 'user'])
            ->latest('moved_at')
            ->get();

        return response()->json(['data' => $movements->map(fn ($m) => ApiPresent::movement($m))]);
    }

    public function receipts(): JsonResponse
    {
        $rows = GoodsReceipt::with(['purchaseOrder.contract', 'receivedBy', 'items'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($g) => ApiPresent::goodsReceipt($g))]);
    }

    public function qa(): JsonResponse
    {
        $rows = QaInspection::with([
            'goodsReceiptItem.goodsReceipt',
            'goodsReceiptItem.variant.product',
            'goodsReceiptItem.contractItem.contract',
        ])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($q) => ApiPresent::qa($q))]);
    }

    public function returns(): JsonResponse
    {
        $rows = ReturnToSupplier::with(['supplier', 'purchaseOrderItem.purchaseOrder'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($r) => ApiPresent::rts($r))]);
    }

    public function materials(): JsonResponse
    {
        $rows = Material::with('supplier')->orderBy('code')->get();

        return response()->json(['data' => $rows->map(fn ($m) => ApiPresent::material($m))]);
    }

    public function designs(): JsonResponse
    {
        $rows = PatchDesign::with('client')->latest()->get();

        return response()->json(['data' => $rows->map(fn ($d) => ApiPresent::design($d))]);
    }

    public function jobOrders(): JsonResponse
    {
        $rows = JobOrder::with(['contractItem.contract', 'patchDesign'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($j) => ApiPresent::jobOrder($j))]);
    }

    public function deliveries(): JsonResponse
    {
        $rows = Delivery::with(['contract.client', 'acceptances'])->latest()->get();

        return response()->json(['data' => $rows->map(fn ($d) => ApiPresent::delivery($d))]);
    }
}
