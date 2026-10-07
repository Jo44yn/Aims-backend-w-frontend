<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\ContractItem;
use App\Models\JobOrder;
use App\Models\Material;
use App\Models\PatchDesign;
use App\Services\NumberingService;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProductionController extends Controller
{
    // ── Raw materials ──────────────────────────────────────────────────────
    public function storeMaterial(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'uom' => 'required|string|max:20',
            'on_hand' => 'nullable|numeric|min:0',
            'reorder_point' => 'nullable|numeric|min:0',
            'avg_unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $n = Material::count() + 1;
        do {
            $code = 'MT-'.str_pad((string) $n++, 3, '0', STR_PAD_LEFT);
        } while (Material::where('code', $code)->exists());

        $material = Material::create([
            'code' => $code,
            'name' => $data['name'],
            'uom' => $data['uom'],
            'on_hand' => $data['on_hand'] ?? 0,
            'reorder_point' => $data['reorder_point'] ?? 0,
            'avg_unit_cost' => $data['avg_unit_cost'] ?? 0,
            'supplier_id' => $data['supplier_id'] ?? null,
        ])->load('supplier');

        return response()->json(['data' => ApiPresent::material($material)], 201);
    }

    // ── Patch designs ──────────────────────────────────────────────────────
    public function storeDesign(Request $request): JsonResponse
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'size' => 'required|string|max:30',
            'colors' => 'nullable|string|max:255',
            'stitch_count' => 'nullable|integer|min:0',
            'approved' => 'nullable|boolean',
        ]);

        $design = PatchDesign::create([
            'client_id' => $data['client_id'],
            'name' => $data['name'],
            'size' => $data['size'],
            'colors' => $data['colors'] ?? null,
            'stitch_count' => $data['stitch_count'] ?? 0,
            'approved_by_client_at' => ! empty($data['approved']) ? now() : null,
        ])->load('client');

        return response()->json(['data' => ApiPresent::design($design)], 201);
    }

    // Record that the client signed off the design (BR-20: a job order needs an approved design).
    public function approveDesign(PatchDesign $design): JsonResponse
    {
        $design->update(['approved_by_client_at' => now()]);

        return response()->json(['data' => ApiPresent::design($design->load('client'))]);
    }

    // ── Job orders ─────────────────────────────────────────────────────────
    // Choices for the "New job order" form: in-house contract lines and approved designs.
    public function jobOrderOptions(): JsonResponse
    {
        $items = ContractItem::with(['contract', 'variant.product'])
            ->whereHas('variant.product', fn ($q) => $q->where('sourcing_type', 'in_house'))
            ->get()
            ->map(fn ($i) => [
                'id' => $i->id,
                'label' => ($i->contract?->contract_no ?? '—').' · '.($i->variant?->product?->name ?? 'Item')
                    .($i->variant?->size ? ', '.$i->variant->size : '').' ('.number_format($i->quantity).' pcs)',
                'quantity' => (int) $i->quantity,
            ])->values();

        $designs = PatchDesign::with('client')->whereNotNull('approved_by_client_at')->orderBy('name')->get()
            ->map(fn ($d) => ['id' => $d->id, 'label' => $d->name.' — '.($d->client?->name ?? '—')])->values();

        return response()->json(['contractItems' => $items, 'designs' => $designs]);
    }

    public function storeJobOrder(Request $request, NumberingService $numbering): JsonResponse
    {
        $data = $request->validate([
            'contract_item_id' => 'required|exists:contract_items,id',
            'patch_design_id' => 'required|exists:patch_designs,id',
            'quantity' => 'required|integer|min:1',
            'start_date' => 'nullable|date',
            'due_date' => 'required|date',
            'machine_no' => 'nullable|string|max:30',
        ]);

        $design = PatchDesign::findOrFail($data['patch_design_id']);
        if (! $design->approved_by_client_at) {
            return response()->json([
                'message' => 'The design must be approved by the client first.',
                'errors' => ['patch_design_id' => ['Design is not client-approved yet.']],
            ], 422);
        }

        $item = ContractItem::findOrFail($data['contract_item_id']);
        if ($data['quantity'] > $item->quantity) {
            return response()->json([
                'message' => 'Quantity is more than the contract line.',
                'errors' => ['quantity' => ['Cannot exceed the contract line quantity ('.$item->quantity.').']],
            ], 422);
        }

        $job = JobOrder::create([
            'jo_no' => $numbering->next('JO'),
            'contract_item_id' => $item->id,
            'patch_design_id' => $design->id,
            'quantity' => $data['quantity'],
            'start_date' => $data['start_date'] ?? null,
            'due_date' => $data['due_date'],
            'machine_no' => $data['machine_no'] ?? null,
            'status' => 'queued',
        ])->load(['contractItem.contract', 'patchDesign']);

        return response()->json(['data' => ApiPresent::jobOrder($job)], 201);
    }

    public function updateMaterial(Request $request, Material $material): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'uom' => 'required|string|max:20',
            'reorder_point' => 'nullable|numeric|min:0',
            'avg_unit_cost' => 'nullable|numeric|min:0',
            'supplier_id' => 'nullable|exists:suppliers,id',
        ]);

        $material->update([
            'name' => $data['name'],
            'uom' => $data['uom'],
            'reorder_point' => $data['reorder_point'] ?? 0,
            'avg_unit_cost' => $data['avg_unit_cost'] ?? $material->avg_unit_cost,
            'supplier_id' => $data['supplier_id'] ?? null,
        ]);

        return response()->json(['data' => ApiPresent::material($material->load('supplier'))]);
    }

    // Stock in (a purchase) or a counted correction. Keeps the moving weighted-average cost when a cost is given.
    public function receiveMaterial(Request $request, Material $material): JsonResponse
    {
        $data = $request->validate([
            'quantity' => 'required|numeric|not_in:0',
            'unit_cost' => 'nullable|numeric|min:0',
        ]);

        $qty = (float) $data['quantity'];
        if ($qty < 0 && $material->on_hand + $qty < 0) {
            return response()->json([
                'message' => 'Not enough stock to remove that quantity.',
                'errors' => ['quantity' => ['Only '.(float) $material->on_hand.' '.$material->uom.' on hand.']],
            ], 422);
        }

        if ($qty > 0 && isset($data['unit_cost'])) {
            $newTotal = $material->on_hand + $qty;
            $material->avg_unit_cost = $newTotal > 0
                ? (($material->on_hand * $material->avg_unit_cost) + ($qty * $data['unit_cost'])) / $newTotal
                : $data['unit_cost'];
        }
        $material->on_hand = $material->on_hand + $qty;
        $material->save();

        return response()->json(['data' => ApiPresent::material($material->load('supplier'))]);
    }

    public function updateDesign(Request $request, PatchDesign $design): JsonResponse
    {
        $data = $request->validate([
            'client_id' => 'required|exists:clients,id',
            'name' => 'required|string|max:255',
            'size' => 'required|string|max:30',
            'colors' => 'nullable|string|max:255',
            'stitch_count' => 'nullable|integer|min:0',
            'approved' => 'nullable|boolean',
        ]);

        $approvedAt = $design->approved_by_client_at;
        if (! empty($data['approved']) && ! $approvedAt) {
            $approvedAt = now();
        } elseif (empty($data['approved'])) {
            $approvedAt = null; // client withdrew approval: new job orders are blocked again (BR-20)
        }

        $design->update([
            'client_id' => $data['client_id'],
            'name' => $data['name'],
            'size' => $data['size'],
            'colors' => $data['colors'] ?? null,
            'stitch_count' => $data['stitch_count'] ?? 0,
            'approved_by_client_at' => $approvedAt,
        ]);

        return response()->json(['data' => ApiPresent::design($design->load('client'))]);
    }

    // A design that no job order uses yet can simply be removed.
    public function deleteDesign(PatchDesign $design): JsonResponse
    {
        if ($design->jobOrders()->exists()) {
            return response()->json(['message' => 'This design is used by a job order. Edit it instead of deleting.'], 422);
        }
        $design->delete();

        return response()->json(['message' => 'Design deleted.']);
    }

    // Change quantity, dates or machine while the job has not finished.
    public function updateJobOrder(Request $request, JobOrder $jobOrder): JsonResponse
    {
        if (in_array($jobOrder->status, ['for_qa', 'done'], true)) {
            return response()->json(['message' => 'A job order that already went to QA cannot be edited.'], 422);
        }

        $data = $request->validate([
            'quantity' => 'required|integer|min:1',
            'start_date' => 'nullable|date',
            'due_date' => 'required|date',
            'machine_no' => 'nullable|string|max:30',
        ]);

        $line = $jobOrder->contractItem;
        if ($line && $data['quantity'] > $line->quantity) {
            return response()->json([
                'message' => 'Quantity is more than the contract line.',
                'errors' => ['quantity' => ['Cannot exceed the contract line quantity ('.$line->quantity.').']],
            ], 422);
        }

        $jobOrder->update([
            'quantity' => $data['quantity'],
            'start_date' => $data['start_date'] ?? null,
            'due_date' => $data['due_date'],
            'machine_no' => $data['machine_no'] ?? null,
        ]);

        return response()->json(['data' => ApiPresent::jobOrder($jobOrder->load(['contractItem.contract', 'patchDesign']))]);
    }

    // Only a job that has not started can be cancelled.
    public function deleteJobOrder(JobOrder $jobOrder): JsonResponse
    {
        if ($jobOrder->status !== 'queued') {
            return response()->json(['message' => 'Only queued job orders can be cancelled.'], 422);
        }
        $jobOrder->delete();

        return response()->json(['message' => 'Job order cancelled.']);
    }

    // Move a job along: queued -> in_production -> for_qa.
    public function advanceJobOrder(JobOrder $jobOrder): JsonResponse
    {
        $next = ['queued' => 'in_production', 'in_production' => 'for_qa'][$jobOrder->status] ?? null;
        if (! $next) {
            return response()->json(['message' => 'This job order cannot move further here.'], 422);
        }

        $jobOrder->status = $next;
        if ($next === 'for_qa') {
            $jobOrder->output_qty = $jobOrder->quantity;
        }
        $jobOrder->save();

        return response()->json(['data' => ApiPresent::jobOrder($jobOrder->load(['contractItem.contract', 'patchDesign']))]);
    }
}
