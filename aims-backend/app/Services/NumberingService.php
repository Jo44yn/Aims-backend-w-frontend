<?php

namespace App\Services;

use App\Models\Contract;
use App\Models\Delivery;
use App\Models\GoodsReceipt;
use App\Models\Invoice;
use App\Models\JobOrder;
use App\Models\PurchaseOrder;
use App\Models\ReturnToSupplier;

class NumberingService
{
    public function next(string $type): string
    {
        $year = date('Y');

        $count = match ($type) {
            'CT' => Contract::whereYear('created_at', $year)->count(),
            'PO' => PurchaseOrder::whereYear('created_at', $year)->count(),
            'GR' => GoodsReceipt::whereYear('created_at', $year)->count(),
            'RTS' => ReturnToSupplier::whereYear('created_at', $year)->count(),
            'JO' => JobOrder::whereYear('created_at', $year)->count(),
            'DR' => Delivery::whereYear('created_at', $year)->count(),
            'BS' => Invoice::whereYear('created_at', $year)->count(),
            default => 0,
        };

        $sequence = str_pad($count + 1, 4, '0', STR_PAD_LEFT);

        return "{$type}-{$year}-{$sequence}";
    }
}