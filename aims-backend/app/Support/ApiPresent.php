<?php

namespace App\Support;

use App\Enums\ContractStatus;
use App\Models\Client;
use App\Models\Contract;
use App\Models\ContractItem;
use App\Models\Delivery;
use App\Models\GoodsReceipt;
use App\Models\Invoice;
use App\Models\JobOrder;
use App\Models\Material;
use App\Models\PatchDesign;
use App\Models\Payment;
use App\Models\PriceAgreement;
use App\Models\Product;
use App\Models\PurchaseOrder;
use App\Models\QaInspection;
use App\Models\ReturnToSupplier;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Str;

class ApiPresent
{
    public static function status(?string $value, array $aliases = []): string
    {
        if ($value === null || $value === '') {
            return '—';
        }

        $raw = $value instanceof \BackedEnum ? $value->value : (string) $value;
        $key = Str::of($raw)->lower()->replace('_', ' ')->toString();

        $defaults = [
            'in progress' => 'In progress',
            'for approval' => 'For approval',
            'partially received' => 'Partially received',
            'partial' => 'Partially paid',
            'in house' => 'In-house',
            'purchased' => 'Purchased',
            'brand partner' => 'Brand partner',
            'for qa' => 'For QA',
            'in production' => 'In production',
            'queued' => 'Queued',
            'done' => 'Done',
        ];

        return $aliases[$key] ?? $defaults[$key] ?? Str::of($key)->title()->toString();
    }

    public static function date(mixed $value): string
    {
        if (! $value) {
            return '—';
        }

        return Carbon::parse($value)->format('M j, Y');
    }

    public static function datetime(mixed $value): string
    {
        if (! $value) {
            return '—';
        }

        return Carbon::parse($value)->format('M j, Y H:i');
    }

    public static function client(Client $c): array
    {
        return [
            'id' => $c->id,
            'code' => $c->code,
            'name' => $c->name,
            'branch' => $c->branch,
            'type' => $c->type,
            'tin' => $c->tin,
            'contact' => $c->contact_person,
            'phone' => $c->phone,
            'email' => $c->email,
            'address' => $c->address,
            'contracts' => $c->relationLoaded('contracts') ? $c->contracts->count() : $c->contracts()->count(),
        ];
    }

    public static function supplier(Supplier $s): array
    {
        return [
            'id' => $s->id,
            'code' => $s->code,
            'name' => $s->name,
            'type' => $s->type,
            'tin' => $s->tin,
            'contact' => $s->contact_person,
            'email' => $s->email,
            'phone' => $s->phone,
            'terms' => $s->payment_terms_days,
            'lead' => $s->default_lead_time_days,
            'status' => self::status($s->status),
            'agreements' => $s->relationLoaded('priceAgreements') ? $s->priceAgreements->count() : null,
        ];
    }

    public static function product(Product $p): array
    {
        $variants = $p->relationLoaded('variants') ? $p->variants : $p->variants()->get();

        return [
            'id' => $p->id,
            'slug' => $p->slug,
            'code' => $p->code,
            'name' => $p->name,
            'category' => $p->category?->name ?? '—',
            'sourcing' => self::status($p->sourcing_type),
            'uom' => $p->uom,
            'sizes' => $variants->where('is_active', true)->pluck('size')->filter()->values()->all(),
            'spec' => $p->specifications,
            'active' => (bool) $p->is_active,
            'sourcingType' => $p->sourcing_type,
            'variants' => $variants->map(fn ($v) => [
                'id' => $v->id,
                'sku' => $v->sku,
                'size' => $v->size,
                'active' => (bool) $v->is_active,
            ])->all(),
        ];
    }

    public static function priceAgreement(PriceAgreement $p): array
    {
        $days = $p->valid_to ? (int) now()->startOfDay()->diffInDays($p->valid_to, false) : 0;
        $status = $p->status;
        if ($p->valid_to && $p->valid_to->isPast()) {
            $status = 'expired';
        } elseif ($days >= 0 && $days <= 30 && $status === 'active') {
            $status = 'expiring';
        }

        return [
            'id' => $p->id,
            'ref' => $p->reference_no,
            'supplier' => $p->supplier?->name ?? '—',
            'product' => trim(($p->variant?->product?->name ?? '—').($p->variant?->size ? ' ('.$p->variant->size.')' : '')),
            'cost' => (float) $p->unit_cost,
            'moq' => $p->min_order_qty,
            'lead' => $p->lead_time_days,
            'from' => self::date($p->valid_from),
            'to' => self::date($p->valid_to),
            'preferred' => $p->is_preferred ? 'Yes' : 'No',
            'status' => self::status($status),
            'days' => $days,
            'fromIso' => $p->valid_from?->toDateString(),
            'toIso' => $p->valid_to?->toDateString(),
            'isPreferred' => (bool) $p->is_preferred,
            'cancelled' => $p->status === 'cancelled',
        ];
    }

    public static function deadlineStatus(Contract $c): string
    {
        $status = $c->status instanceof ContractStatus ? $c->status : ContractStatus::tryFrom((string) $c->status);
        if (in_array($status, [ContractStatus::Closed, ContractStatus::Accepted, ContractStatus::Cancelled], true)) {
            return 'On track';
        }
        if (! $c->delivery_deadline) {
            return 'On track';
        }
        if ($c->delivery_deadline->isPast()) {
            return 'Delayed';
        }
        if ($c->delivery_deadline->diffInDays(now()) <= 14) {
            return 'At risk';
        }

        return 'On track';
    }

    public static function contract(Contract $c, bool $detail = false): array
    {
        $qty = $c->relationLoaded('items') ? $c->items->sum('quantity') : 0;
        $accepted = $c->relationLoaded('items') ? $c->items->sum('accepted_qty') : 0;
        $pct = $qty ? (int) round($accepted / $qty * 100) : 0;
        $left = $c->delivery_deadline ? (int) now()->startOfDay()->diffInDays($c->delivery_deadline, false) : 0;

        $row = [
            'id' => $c->id,
            'no' => $c->contract_no,
            'client' => $c->client?->name ?? '—',
            'clientId' => $c->client_id,
            'title' => $c->title,
            'noa' => $c->noa_no,
            'ntp' => self::date($c->ntp_date),
            'days' => $c->delivery_days,
            'deadline' => self::date($c->delivery_deadline),
            'amount' => (float) $c->contract_amount,
            'status' => self::status($c->status?->value ?? $c->status),
            'deadlineStatus' => self::deadlineStatus($c),
            'pct' => $pct,
            'left' => $left,
        ];

        if ($detail) {
            $row['items'] = $c->items->map(fn ($i) => self::contractItem($i))->values()->all();
            $row['purchaseOrders'] = $c->relationLoaded('purchaseOrders')
                ? $c->purchaseOrders->map(fn ($p) => self::purchaseOrder($p))->values()->all()
                : [];
            $row['deliveries'] = $c->relationLoaded('deliveries')
                ? $c->deliveries->map(fn ($d) => self::delivery($d))->values()->all()
                : [];
            $row['invoices'] = $c->relationLoaded('invoices')
                ? $c->invoices->map(fn ($i) => self::invoice($i))->values()->all()
                : [];
        }

        return $row;
    }

    public static function contractItem(ContractItem $i): array
    {
        $qty = (int) $i->quantity;
        $accepted = (int) $i->accepted_qty;
        $delivered = max(0, (int) $i->delivered_qty - $accepted);
        $awaiting = max(0, $qty - (int) $i->ordered_qty);
        $onOrder = max(0, (int) $i->ordered_qty - (int) $i->delivered_qty);
        $name = $i->variant?->product?->name ?? 'Item';
        $size = $i->variant?->size;
        $cost = (float) ($i->purchaseOrderItems->first()?->unit_cost ?? 0);

        return [
            'id' => $i->id,
            'line' => $i->id,
            'item' => $size ? "{$name}, {$size}" : $name,
            'qty' => $qty,
            'price' => (float) $i->unit_price,
            'cost' => $cost,
            'source' => $i->variant?->product?->sourcing_type === 'in_house' ? 'In-house' : 'Purchased',
            'b' => [
                'awaiting' => $awaiting + $onOrder,
                'forQa' => 0,
                'ready' => max(0, $qty - $accepted - $delivered - $awaiting - $onOrder),
                'delivered' => $delivered,
                'accepted' => $accepted,
            ],
        ];
    }

    public static function purchaseOrder(PurchaseOrder $p): array
    {
        $items = $p->relationLoaded('items') ? $p->items : collect();

        return [
            'id' => $p->id,
            'no' => $p->po_no,
            'supplier' => $p->supplier?->name ?? '—',
            'contract' => $p->contract?->contract_no ?? '—',
            'date' => self::date($p->po_date),
            'eta' => self::date($p->expected_date),
            'total' => (float) $p->total,
            'status' => self::status($p->status?->value ?? $p->status),
            'approver' => $p->approver?->name ?? ($p->approved_by ? 'Approved' : '—'),
            'lines' => $items->map(fn ($l) => [
                'sku' => $l->variant?->sku ?? '—',
                'desc' => $l->variant?->product?->name ?? 'Item',
                'size' => $l->variant?->size ?? '—',
                'qty' => (int) $l->quantity,
                'cost' => (float) $l->unit_cost,
            ])->all(),
        ];
    }

    public static function movement(StockMovement $m): array
    {
        return [
            'when' => self::datetime($m->moved_at),
            'type' => $m->type,
            'item' => $m->variant?->product?->name ?? '—',
            'contract' => $m->contractItem?->contract?->contract_no ?? '—',
            'qty' => (int) $m->quantity,
            'ref' => $m->reference_type ? class_basename($m->reference_type).' #'.$m->reference_id : '—',
            'user' => $m->user?->name ?? '—',
        ];
    }

    public static function invoice(Invoice $i): array
    {
        $age = $i->due_date ? (int) $i->due_date->startOfDay()->diffInDays(now()->startOfDay(), false) : 0;
        if ($age < 0) {
            $age = 0;
        }

        return [
            'id' => $i->id,
            'bs' => $i->bs_no,
            'oi' => $i->official_invoice_no ?: '—',
            'contract' => $i->contract?->contract_no ?? '—',
            'client' => $i->contract?->client?->name ?? '—',
            'date' => self::date($i->invoice_date),
            'gross' => (float) $i->gross_amount,
            'due' => self::date($i->due_date),
            'status' => self::status($i->status?->value ?? $i->status),
            'age' => $age,
            'vat' => (float) $i->vat_amount,
            'wvat' => (float) $i->wvat_amount,
            'ewt' => (float) $i->ewt_amount,
            'net' => (float) $i->net_receivable,
        ];
    }

    public static function payment(Payment $p): array
    {
        return [
            'date' => self::date($p->payment_date),
            'bs' => $p->invoice?->bs_no ?? '—',
            'amount' => (float) $p->amount,
            'mode' => $p->mode,
            'ref' => $p->reference_no,
            'f2307' => $p->form_2307_received ? 'Received' : 'Pending',
        ];
    }

    public static function goodsReceipt(GoodsReceipt $g): array
    {
        $qty = $g->relationLoaded('items') ? $g->items->sum('qty_received') : $g->items()->sum('qty_received');

        return [
            'id' => $g->id,
            'no' => $g->gr_no,
            'source' => $g->purchaseOrder?->po_no ?? '—',
            'contract' => $g->purchaseOrder?->contract?->contract_no ?? '—',
            'date' => self::date($g->received_date),
            'qty' => (int) $qty,
            'supplierDr' => $g->supplier_dr_no ?: '—',
            'by' => $g->receivedBy?->name ?? '—',
            'status' => 'Posted',
        ];
    }

    public static function qa(QaInspection $q): array
    {
        $item = $q->goodsReceiptItem;
        $received = (int) ($item?->qty_received ?? 0);
        $done = ((int) $q->qty_passed + (int) $q->qty_failed) >= $received && $received > 0;

        return [
            'id' => $q->id,
            'gr' => $item?->goodsReceipt?->gr_no ?? '—',
            'item' => $item?->variant?->product?->name ?? 'Item',
            'contract' => $item?->contractItem?->contract?->contract_no ?? '—',
            'received' => $received,
            'passed' => (int) $q->qty_passed,
            'failed' => (int) $q->qty_failed,
            'status' => $done ? 'Done' : 'For QA',
        ];
    }

    public static function rts(ReturnToSupplier $r): array
    {
        return [
            'id' => $r->id,
            'no' => $r->rts_no,
            'supplier' => $r->supplier?->name ?? '—',
            'po' => $r->purchaseOrderItem?->purchaseOrder?->po_no ?? '—',
            'qty' => (int) $r->quantity,
            'reason' => $r->reason,
            'date' => self::date($r->returned_at),
            'status' => 'Posted',
        ];
    }

    public static function material(Material $m): array
    {
        return [
            'id' => $m->id,
            'code' => $m->code,
            'name' => $m->name,
            'uom' => $m->uom,
            'onHand' => (float) $m->on_hand,
            'reorder' => (float) $m->reorder_point,
            'cost' => (float) $m->avg_unit_cost,
            'supplier' => $m->supplier?->name ?? '—',
            'supplierId' => $m->supplier_id,
        ];
    }

    public static function design(PatchDesign $d): array
    {
        return [
            'id' => $d->id,
            'name' => $d->name,
            'client' => $d->client?->name ?? '—',
            'size' => $d->size,
            'clientId' => $d->client_id,
            'colors' => $d->colors,
            'stitches' => (int) $d->stitch_count,
            'approved' => self::date($d->approved_by_client_at),
            'status' => $d->approved_by_client_at ? 'Approved' : 'Pending',
        ];
    }

    public static function jobOrder(JobOrder $j): array
    {
        return [
            'id' => $j->id,
            'no' => $j->jo_no,
            'contract' => $j->contractItem?->contract?->contract_no ?? '—',
            'design' => $j->patchDesign?->name ?? '—',
            'qty' => (int) $j->quantity,
            'due' => self::date($j->due_date),
            'machine' => $j->machine_no ?: '—',
            'machineNo' => $j->machine_no,
            'contractItemId' => $j->contract_item_id,
            'designId' => $j->patch_design_id,
            'startIso' => $j->start_date?->toDateString(),
            'dueIso' => $j->due_date?->toDateString(),
            'status' => self::status($j->status),
        ];
    }

    public static function delivery(Delivery $d): array
    {
        return [
            'id' => $d->id,
            'no' => $d->dr_no,
            'contract' => $d->contract?->contract_no ?? '—',
            'client' => $d->contract?->client?->name ?? '—',
            'date' => self::date($d->delivery_date),
            'qty' => $d->relationLoaded('acceptances') ? (int) $d->acceptances->sum('accepted_qty') : 0,
            'vehicle' => $d->vehicle,
            'status' => self::status($d->status),
            'received_by' => $d->received_by_name,
        ];
    }

    public static function user(User $u): array
    {
        return [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'role' => $u->getRoleNames()->first() ?: '—',
            'status' => $u->is_active ? 'Active' : 'Inactive',
            'active' => (bool) $u->is_active,
            'clientId' => $u->client_id,
            'phone' => $u->phone,
            'last' => $u->last_login_at ? self::datetime($u->last_login_at) : 'Never',
        ];
    }
}
