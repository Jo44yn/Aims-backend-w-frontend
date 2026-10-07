<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Client;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(): JsonResponse
    {
        $clients = Client::withCount('contracts')->orderBy('code')->get();

        return response()->json(['data' => $clients->map(fn ($c) => ApiPresent::client($c))]);
    }

    public function show(Client $client): JsonResponse
    {
        $client->load(['contracts.client', 'contracts.items']);

        return response()->json([
            'data' => array_merge(ApiPresent::client($client), [
                'contractRows' => $client->contracts->map(fn ($c) => ApiPresent::contract($c))->values(),
            ]),
        ]);
    }

    public function update(Request $request, Client $client): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch' => 'required|string|max:50',
            'type' => 'required|in:government,private',
            'tin' => 'nullable|string|max:30',
            'contact' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $client->update([
            'name' => $data['name'],
            'branch' => $data['branch'],
            'type' => $data['type'],
            'tin' => $data['tin'] ?? null,
            'contact_person' => $data['contact'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        return response()->json(['data' => ApiPresent::client($client)]);
    }

    public function store(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'branch' => 'required|string|max:50',
            'type' => 'required|in:government,private',
            'tin' => 'nullable|string|max:30',
            'contact' => 'required|string|max:255',
            'phone' => 'nullable|string|max:30',
            'email' => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $seq = str_pad((string) (Client::count() + 1), 3, '0', STR_PAD_LEFT);
        $client = Client::create([
            'code' => 'CL-'.$seq,
            'name' => $data['name'],
            'branch' => $data['branch'],
            'type' => $data['type'],
            'tin' => $data['tin'] ?? null,
            'contact_person' => $data['contact'],
            'phone' => $data['phone'] ?? null,
            'email' => $data['email'] ?? null,
            'address' => $data['address'] ?? null,
        ]);

        return response()->json(['data' => ApiPresent::client($client)], 201);
    }
}
