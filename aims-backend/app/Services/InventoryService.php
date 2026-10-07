<?php

namespace App\Services;

use App\Enums\MovementType;
use App\Models\GoodsReceiptItem;
use App\Models\QaInspection;
use App\Models\StockMovement;
use Illuminate\Support\Facades\DB;

class InventoryService
{
    public function recordQaInspection(GoodsReceiptItem $grItem, int $passed, int $failed, ?string $defects = null, ?int $userId = null): QaInspection
    {
        return DB::transaction(function () use ($grItem, $passed, $failed, $defects, $userId) {
            $inspection = QaInspection::create([
                'goods_receipt_item_id' => $grItem->id,
                'inspected_by' => $userId,
                'inspected_at' => now(),
                'qty_passed' => $passed,
                'qty_failed' => $failed,
                'defects' => $defects,
            ]);

            // Insert QA_PASS movement record
            if ($passed > 0) {
                StockMovement::create([
                    'product_variant_id' => $grItem->product_variant_id,
                    'contract_item_id' => $grItem->contract_item_id,
                    'type' => MovementType::QaPass->value,
                    'quantity' => $passed,
                    'reference_type' => QaInspection::class,
                    'reference_id' => $inspection->id,
                    'user_id' => $userId,
                    'moved_at' => now(),
                ]);
            }

            // Insert QA_REJECT movement record
            if ($failed > 0) {
                StockMovement::create([
                    'product_variant_id' => $grItem->product_variant_id,
                    'contract_item_id' => $grItem->contract_item_id,
                    'type' => MovementType::QaReject->value,
                    'quantity' => -$failed,
                    'reference_type' => QaInspection::class,
                    'reference_id' => $inspection->id,
                    'user_id' => $userId,
                    'moved_at' => now(),
                ]);
            }

            return $inspection;
        });
    }
}