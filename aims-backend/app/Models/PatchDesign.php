<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PatchDesign extends Model
{
    protected $fillable = [
        'client_id',
        'name',
        'size',
        'colors',
        'stitch_count',
        'design_file',
        'approved_by_client_at',
    ];

    protected $casts = [
        'approved_by_client_at' => 'datetime',
    ];

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class);
    }

    public function jobOrders(): HasMany
    {
        return $this->hasMany(JobOrder::class);
    }
}
