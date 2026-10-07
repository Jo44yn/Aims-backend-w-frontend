<?php

namespace App\Models;

use App\Enums\PoStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PurchaseOrder extends Model
{
    protected $fillable = ['po_no', 'supplier_id', 'contract_id', 'po_date', 'expected_date', 'subtotal', 'total', 'status', 'approved_by', 'approved_at', 'sent_at', 'pdf_path', 'cancel_reason'];

    protected $casts = [
        'status' => PoStatus::class,
        'po_date' => 'date',
        'expected_date' => 'date',
        'approved_at' => 'datetime',
        'sent_at' => 'datetime',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(PurchaseOrderItem::class);
    }

    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }
}