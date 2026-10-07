<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Delivery extends Model
{
    protected $fillable = [
        'dr_no',
        'contract_id',
        'delivery_date',
        'delivered_by',
        'vehicle',
        'received_by_name',
        'status',
    ];

    protected $casts = [
        'delivery_date' => 'date',
    ];

    public function contract(): BelongsTo
    {
        return $this->belongsTo(Contract::class);
    }

    public function acceptances(): HasMany
    {
        return $this->hasMany(Acceptance::class);
    }

    public function deliveredBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'delivered_by');
    }
}
