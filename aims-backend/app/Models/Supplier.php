<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Supplier extends Model
{
    protected $fillable = ['code', 'name', 'type', 'tin', 'contact_person', 'email', 'phone', 'payment_terms_days', 'default_lead_time_days', 'status', 'approved_at'];

    public function priceAgreements(): HasMany
    {
        return $this->hasMany(PriceAgreement::class);
    }

    public function purchaseOrders(): HasMany
    {
        return $this->hasMany(PurchaseOrder::class);
    }
}