<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PriceAgreement extends Model
{
    protected $fillable = [
        'supplier_id',
        'product_variant_id',
        'reference_no',
        'unit_cost',
        'min_order_qty',
        'lead_time_days',
        'valid_from',
        'valid_to',
        'is_preferred',
        'status',
    ];

    protected $casts = [
        'valid_from' => 'date',
        'valid_to' => 'date',
        'is_preferred' => 'boolean',
    ];

    public function supplier(): BelongsTo
    {
        return $this->belongsTo(Supplier::class);
    }

    public function variant(): BelongsTo
    {
        return $this->belongsTo(ProductVariant::class, 'product_variant_id');
    }
}
