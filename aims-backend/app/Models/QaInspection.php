<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

use Illuminate\Database\Eloquent\Relations\BelongsTo;

class QaInspection extends Model
{
    protected $fillable = [
        'goods_receipt_item_id',
        'inspected_by',
        'inspected_at',
        'qty_passed',
        'qty_failed',
        'defects',
        'photo_path',
    ];

    protected $casts = [
        'inspected_at' => 'datetime',
    ];

    public function goodsReceiptItem(): BelongsTo
    {
        return $this->belongsTo(GoodsReceiptItem::class);
    }

    public function inspectedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'inspected_by');
    }
}
