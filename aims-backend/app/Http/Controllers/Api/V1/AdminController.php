<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Models\Setting;
use App\Models\User;
use App\Support\ApiPresent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Spatie\Permission\Models\Role;

// Users & roles and Settings (blueprint M12). Users are deactivated, never deleted.
class AdminController extends Controller
{
    private const SETTING_KEYS = ['company_name', 'vat_rate', 'wvat_rate', 'ewt_rate', 'po_approval_threshold', 'margin_guard_threshold'];

    public function users(): JsonResponse
    {
        $users = User::with('roles')->orderBy('name')->get();

        return response()->json([
            'data' => $users->map(fn ($u) => ApiPresent::user($u))->values(),
            'roles' => Role::orderBy('name')->pluck('name'),
        ]);
    }

    public function storeUser(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => ['required', Rule::exists('roles', 'name')],
            'client_id' => 'nullable|exists:clients,id',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => $data['password'],
            'client_id' => $data['role'] === 'client' ? ($data['client_id'] ?? null) : null,
        ]);
        $user->syncRoles([$data['role']]);

        return response()->json(['data' => ApiPresent::user($user->load('roles'))], 201);
    }

    public function updateUser(Request $request, User $user): JsonResponse
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'password' => 'nullable|string|min:8',
            'role' => ['required', Rule::exists('roles', 'name')],
            'client_id' => 'nullable|exists:clients,id',
            'is_active' => 'nullable|boolean',
        ]);

        $active = (bool) ($data['is_active'] ?? false);
        if ($user->id === $request->user()->id && (! $active || $data['role'] !== $user->getRoleNames()->first())) {
            return response()->json(['message' => 'You cannot deactivate yourself or change your own role.'], 422);
        }

        $user->fill([
            'name' => $data['name'],
            'email' => $data['email'],
            'client_id' => $data['role'] === 'client' ? ($data['client_id'] ?? null) : null,
            'is_active' => $active,
        ]);
        if (! empty($data['password'])) {
            $user->password = $data['password'];
        }
        $user->save();
        $user->syncRoles([$data['role']]);

        if (! $active) {
            $user->tokens()->delete(); // signs them out everywhere
        }

        return response()->json(['data' => ApiPresent::user($user->load('roles'))]);
    }

    public function settings(): JsonResponse
    {
        return response()->json(['data' => Setting::whereIn('key', self::SETTING_KEYS)->pluck('value', 'key')]);
    }

    public function updateSettings(Request $request): JsonResponse
    {
        $data = $request->validate([
            'company_name' => 'required|string|max:255',
            'vat_rate' => 'required|numeric|min:0|max:100',
            'wvat_rate' => 'required|numeric|min:0|max:100',
            'ewt_rate' => 'required|numeric|min:0|max:100',
            'po_approval_threshold' => 'required|numeric|min:0',
            'margin_guard_threshold' => 'required|numeric|min:0|max:100',
        ]);

        foreach ($data as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => (string) $value]);
        }

        return $this->settings();
    }
}
