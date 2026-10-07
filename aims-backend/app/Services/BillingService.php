<?php

namespace App\Services;

use App\Enums\InvoiceStatus;
use App\Models\Acceptance;
use App\Models\Invoice;
use App\Models\Setting;
use Illuminate\Support\Facades\DB;

class BillingService
{
    public function __construct(protected NumberingService $numbering) {}

    public function createInvoiceFromAcceptance(Acceptance $acceptance, float $grossAmount, bool $isGovernment = true): Invoice
    {
        return DB::transaction(function () use ($acceptance, $grossAmount, $isGovernment) {
            $vatRate = (float) (Setting::where('key', 'vat_rate')->value('value') ?? 12) / 100;
            $wvatRate = (float) (Setting::where('key', 'wvat_rate')->value('value') ?? 5) / 100;
            $ewtRate = (float) (Setting::where('key', 'ewt_rate')->value('value') ?? 1) / 100;

            $baseAmount = $grossAmount / (1 + $vatRate);
            $vatAmount = $grossAmount - $baseAmount;
            $wvatAmount = $isGovernment ? ($baseAmount * $wvatRate) : 0;
            $ewtAmount = $isGovernment ? ($baseAmount * $ewtRate) : 0;
            $netReceivable = $grossAmount - $wvatAmount - $ewtAmount;

            $delivery = $acceptance->delivery;

            return Invoice::create([
                'bs_no' => $this->numbering->next('BS'),
                'contract_id' => $delivery->contract_id,
                'acceptance_id' => $acceptance->id,
                'invoice_date' => today(),
                'gross_amount' => $grossAmount,
                'vat_amount' => $vatAmount,
                'wvat_amount' => $wvatAmount,
                'ewt_amount' => $ewtAmount,
                'net_receivable' => $netReceivable,
                'due_date' => today()->addDays(30),
                'status' => InvoiceStatus::Unpaid,
            ]);
        });
    }
}