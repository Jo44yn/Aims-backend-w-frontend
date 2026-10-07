<?php

namespace App\Models;

use App\Enums\ContractStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Contract extends Model
{
    protected $fillable = ['contract_no', 'client_id', 'title', 'noa_no', 'noa_date', 'contract_date', 'ntp_date', 'delivery_days', 'delivery_deadline', 'contract_amount', 'ld_rate', 'status', 'created_by'];

    protected $casts = [
        'status' => ContractStatus::class,
        'noa_date' => 'date',
        'contract_date' => 'date',
        'ntp_date' => 'date',
        'delivery_deadline' => 'date',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function items(): HasMany
    {
        return $this->hasMany(ContractItem::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(Delivery::class);
    }

    public function invoices(): HasMany
    {
        return $this->hasMany(Invoice::class);
    }
}