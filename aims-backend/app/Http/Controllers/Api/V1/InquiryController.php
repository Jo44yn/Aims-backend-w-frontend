<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Inquiry;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

// Quotation requests (RFQ) from the public site and the client portal.
class InquiryController extends Controller
{
    private function present(Inquiry $i): array
    {
        return [
            'id' => $i->id,
            'date' => ApiPresent::date($i->created_at),
            'name' => $i->name,
            'org' => $i->organization ?: '—',
            'email' => $i->email,
            'phone' => $i->phone,
            'items' => $i->items,
            'neededBy' => $i->needed_by ? ApiPresent::date($i->needed_by) : '—',
            'status' => ApiPresent::status($i->status),
            'note' => $i->staff_note,
        ];
    }

    // Public form (no login). Throttled in routes/api.php.
    public function storePublic(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'org' => 'required|string|max:255',
            'email' => 'required|email|max:255',
            'phone' => 'nullable|string|max:40',
            'items' => 'required|string|max:4000',
        ]);

        $inquiry = Inquiry::create([
            'name' => $data['name'], 'organization' => $data['org'], 'email' => $data['email'],
            'phone' => $data['phone'] ?? null, 'items' => $data['items'], 'status' => 'new',
        ]);

        return response()->json(['data' => $this->present($inquiry)], 201);
    }

    // Signed-in client: the name and email come from the account.
    public function storePortal(Request $request): JsonResponse
    {
        $data = $request->validate([
            'items' => 'required|string|max:4000',
            'needed_by' => 'nullable|date',
        ]);

        $user = $request->user();
        $inquiry = Inquiry::create([
            'user_id' => $user->id, 'client_id' => $user->client_id, 'name' => $user->name,
            'organization' => $user->organization, 'email' => $user->email, 'phone' => $user->phone,
            'items' => $data['items'], 'needed_by' => $data['needed_by'] ?? null, 'status' => 'new',
        ]);

        return response()->json(['data' => $this->present($inquiry)], 201);
    }

    public function mine(Request $request): JsonResponse
    {
        $rows = Inquiry::where('user_id', $request->user()->id)->latest()->get();

        return response()->json(['data' => $rows->map(fn ($i) => $this->present($i))]);
    }

    public function index(): JsonResponse
    {
        return response()->json(['data' => Inquiry::latest()->get()->map(fn ($i) => $this->present($i))]);
    }

    public function update(Request $request, Inquiry $inquiry): JsonResponse
    {
        $data = $request->validate([
            'status' => 'required|in:new,quoted,closed',
            'staff_note' => 'nullable|string|max:2000',
        ]);
        $inquiry->update(['status' => $data['status'], 'staff_note' => $data['staff_note'] ?? $inquiry->staff_note]);

        return response()->json(['data' => $this->present($inquiry)]);
    }
}
