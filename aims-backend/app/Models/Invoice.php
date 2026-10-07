<?php

namespace App\Models;

use App\Enums\InvoiceStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Invoice extends Model
{
    protected $fillable = [
        'bs_no',
        'official_invoice_no',
        'contract_id',
        'acceptance_id',
        'invoice_date',
        'gross_amount',
        'vat_amount',
        'wvat_amount',
        'ewt_amount',
        'net_receivable',
        'due_date',
        'status',
    ];

    protected $casts = [
        'invoice_date' => 'date',
        'due_date' => 'date',
        'status' => InvoiceStatus::class,
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function acceptance(): BelongsTo
    {
        return $this->belongsTo(Acceptance::class);
    }
}
