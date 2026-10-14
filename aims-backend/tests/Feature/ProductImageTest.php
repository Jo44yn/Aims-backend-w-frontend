<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\RolesAndPermissionsSeeder;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Facades\Storage;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ProductImageTest extends TestCase
{
    use RefreshDatabase;

    // 1x1 transparent PNG (no GD needed).
    private function png(string $name = 'photo.png'): UploadedFile
    {
        return UploadedFile::fake()->createWithContent($name, base64_decode(
            'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='
        ));
    }

    private function actingAsRole(string $role): User
    {
        $this->seed(RolesAndPermissionsSeeder::class);
        $user = User::factory()->create();
        $user->assignRole($role);
        Sanctum::actingAs($user);

        return $user;
    }

    public function test_admin_creates_a_product_and_uploads_a_photo(): void
    {
        Storage::fake('local');
        $this->actingAsRole('admin');

        $id = $this->postJson('/api/v1/products', [
            'name' => 'Combat Boots', 'category' => 'Footwear', 'sourcing_type' => 'purchased', 'sizes' => '8, 9, 10',
        ])->assertCreated()->assertJsonPath('data.image', null)->json('data.id');

        $image = $this->post("/api/v1/products/{$id}/image", ['image' => $this->png()], ['Accept' => 'application/json'])
            ->assertOk()->json('data.image');
        $this->assertStringContainsString("/api/v1/public/products/{$id}/image", $image);

        $path = \App\Models\Product::find($id)->image_path;
        Storage::disk('local')->assertExists($path);

        // Public endpoint serves it without a token, and the public catalog lists the URL.
        $this->get("/api/v1/public/products/{$id}/image")->assertOk();
        $this->getJson('/api/v1/public/products')->assertJsonPath('data.0.image', $image);

        // Replacing deletes the old file; removing clears it.
        $this->post("/api/v1/products/{$id}/image", ['image' => $this->png('new.png')], ['Accept' => 'application/json'])->assertOk();
        Storage::disk('local')->assertMissing($path);

        $this->deleteJson("/api/v1/products/{$id}/image")->assertOk()->assertJsonPath('data.image', null);
        $this->get("/api/v1/public/products/{$id}/image")->assertNotFound();
    }

    public function test_rejects_non_images(): void
    {
        Storage::fake('local');
        $this->actingAsRole('admin');
        $id = $this->postJson('/api/v1/products', ['name' => 'Cap', 'category' => 'Headwear', 'sourcing_type' => 'in_house'])->json('data.id');

        $this->post("/api/v1/products/{$id}/image", ['image' => UploadedFile::fake()->createWithContent('notes.txt', 'not an image')], ['Accept' => 'application/json'])
            ->assertUnprocessable()->assertJsonValidationErrors('image');
    }

    public function test_other_roles_cannot_upload(): void
    {
        Storage::fake('local');
        $this->actingAsRole('admin');
        $id = $this->postJson('/api/v1/products', ['name' => 'Belt', 'category' => 'Accessories', 'sourcing_type' => 'purchased'])->json('data.id');

        $warehouse = User::factory()->create();
        $warehouse->assignRole('warehouse');
        Sanctum::actingAs($warehouse);

        $this->post("/api/v1/products/{$id}/image", ['image' => $this->png()], ['Accept' => 'application/json'])->assertForbidden();
    }
}
