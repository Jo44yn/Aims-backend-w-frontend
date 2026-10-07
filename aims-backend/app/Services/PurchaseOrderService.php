<?php

namespace App\Services;

use App\Enums\PoStatus;
use App\Models\Contract;
use App\Models\ContractItem;
use App\Models\PriceAgreement;
use App\Models\PurchaseOrder;
use App\Models\Setting;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\DB;

class PurchaseOrderService
{
    public function __construct(protected NumberingService $numbering) {}

    public function generateForContract(Contract $contract): Collection
    {
        return DB::transaction(function () use ($contract) {
            // Select lines requiring vendor purchases where ordered_qty < contract qty
            $lines = $contract->items()
                ->whereColumn('ordered_qty', '<', 'quantity')
                ->whereHas('variant.product', fn ($q) => $q->where('sourcing_type', 'purchased'))
                ->lockForUpdate()
                ->get();

            // Group lines by preferred supplier
            $bySupplier = $lines->groupBy(function (ContractItem $line) {
                $agreement = PriceAgreement::where('product_variant_id', $line->product_variant_id)
                    ->where('is_preferred', true)
                    ->where('status', 'active')
                    ->whereDate('valid_from', '<=', today())
                    ->whereDate('valid_to', '>=', today())
                    ->firstOrFail();

                $line->setRelation('agreement', $agreement);

                return $agreement->supplier_id;
            });

            $threshold = (float) (Setting::where('key', 'po_approval_threshold')->value('value') ?? 100000);

            return $bySupplier->map(function ($lines, $supplierId) use ($contract, $threshold) {
                $po = PurchaseOrder::create([
                    'po_no' => $this->numbering->next('PO'),
                    'supplier_id' => $supplierId,
                    'contract_id' => $contract->id,
                    'po_date' => today(),
                    'status' => PoStatus::Draft,
                ]);

                $total = 0;

                foreach ($lines as $line) {
                    $qty = $line->quantity - $line->ordered_qty;
                    $cost = $line->agreement->unit_cost;
                    $itemTotal = $qty * $cost;
                    $total += $itemTotal;

                    $po->items()->create([
                        'contract_item_id' => $line->id,
                        'product_variant_id' => $line->product_variant_id,
                        'price_agreement_id' => $line->agreement->id,
                        'quantity' => $qty,
                        'unit_cost' => $cost,
                    ]);

                    $line->increment('ordered_qty', $qty);
                }

                $po->update([
                    'subtotal' => $total,
                    'total' => $total,
                    'status' => $total > $threshold ? PoStatus::ForApproval : PoStatus::Approved,
                ]);

                return $po;
            })->values();
        });
    }
}