<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class JobOrder extends Model
{
    protected $fillable = [
        'jo_no',
        'contract_item_id',
        'patch_design_id',
        'quantity',
        'start_date',
        'due_date',
        'machine_no',
        'status',
        'output_qty',
    ];

    protected $casts = [
        'start_date' => 'date',
        'due_date' => 'date',
    ];

    public function contractItem(): BelongsTo
    {
        return $this->belongsTo(ContractItem::class);
    }

    public function patchDesign(): BelongsTo
    {
        return $this->belongsTo(PatchDesign::class);
    }
}
