<?php

namespace Database\Seeders;

use App\Enums\ContractStatus;
use App\Enums\InvoiceStatus;
use App\Enums\MovementType;
use App\Enums\PoStatus;
use App\Models\Client;
use App\Models\Contract;
use App\Models\ContractItem;
use App\Models\Invoice;
use App\Models\Material;
use App\Models\PriceAgreement;
use App\Models\Product;
use App\Models\ProductCategory;
use App\Models\ProductVariant;
use App\Models\PurchaseOrder;
use App\Models\PurchaseOrderItem;
use App\Models\StockMovement;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Seed Users & Assign Roles
        $usersData = [
            ['name' => 'Ana Reyes', 'email' => 'admin@aimforce.example', 'role' => 'admin'],
            ['name' => 'Admin User', 'email' => 'admin@aims.local', 'role' => 'admin'],
            ['name' => 'Gen. Manager', 'email' => 'gm@aimforce.example', 'role' => 'gm'],
            ['name' => 'Bea Navarro', 'email' => 'bidding@aimforce.example', 'role' => 'bidding'],
            ['name' => 'Paolo Lim', 'email' => 'purchasing@aimforce.example', 'role' => 'purchasing'],
            ['name' => 'Wilma Mendoza', 'email' => 'warehouse@aimforce.example', 'role' => 'warehouse'],
            ['name' => 'Pedro Dizon', 'email' => 'production@aimforce.example', 'role' => 'production'],
            ['name' => 'Carla Ramos', 'email' => 'qa@aimforce.example', 'role' => 'qa'],
            ['name' => 'Ria Santos', 'email' => 'accounting@aimforce.example', 'role' => 'accounting'],
            ['name' => 'Maj. R. Dela Cruz', 'email' => 'client@1id.example', 'role' => 'client'],
        ];

        $users = [];
        foreach ($usersData as $data) {
            $user = User::firstOrCreate(
                ['email' => $data['email']],
                [
                    'name' => $data['name'],
                    'password' => Hash::make('password'),
                ]
            );
            $user->syncRoles([$data['role']]);
            $users[$data['email']] = $user;
        }

        // 2. Clients
        $clientsData = [
            [
                'code' => 'CL-001',
                'name' => 'Philippine Army – 1st Infantry Division',
                'branch' => 'Army',
                'type' => 'government',
                'tin' => '000-123-456-000',
                'contact_person' => 'Maj. R. Dela Cruz',
                'phone' => '0917 555 0101',
                'email' => 'supply@1id.example',
                'address' => 'Fort Gen. Mateo Capinpin, Tanay, Rizal',
            ],
            [
                'code' => 'CL-002',
                'name' => 'PNP Region IV-A Logistics Office',
                'branch' => 'PNP',
                'type' => 'government',
                'tin' => '000-222-333-000',
                'contact_person' => 'PMaj. L. Santos',
                'phone' => '0918 555 0102',
                'email' => 'logistics@pnp4a.example',
                'address' => 'Camp Vicente Lim, Calamba, Laguna',
            ],
            [
                'code' => 'CL-003',
                'name' => 'Philippine Air Force – 505th Wing',
                'branch' => 'Air Force',
                'type' => 'government',
                'tin' => '000-333-444-000',
                'contact_person' => 'Capt. M. Reyes',
                'phone' => '0919 555 0103',
                'email' => 'supply@505w.example',
                'address' => 'Villamor Air Base, Pasay City',
            ],
            [
                'code' => 'CL-004',
                'name' => 'Sentinel Security Services Inc.',
                'branch' => 'Private',
                'type' => 'private',
                'tin' => '009-444-555-000',
                'contact_person' => 'A. Villanueva',
                'phone' => '0920 555 0104',
                'email' => 'ops@sentinel.example',
                'address' => 'Makati City',
            ],
        ];

        $clients = [];
        foreach ($clientsData as $c) {
            $clients[$c['code']] = Client::updateOrCreate(['code' => $c['code']], $c);
        }

        // 3. Suppliers
        $suppliersData = [
            [
                'code' => 'SP-001',
                'name' => 'Propper USA (PH distributor)',
                'type' => 'brand_partner',
                'tin' => '111-222-333-000',
                'contact_person' => 'J. Tan',
                'email' => 'orders@propper-ph.example',
                'phone' => '0917 111 2233',
                'payment_terms_days' => 30,
                'default_lead_time_days' => 21,
                'status' => 'approved',
                'approved_at' => now(),
            ],
            [
                'code' => 'SP-002',
                'name' => 'Rudy Project Philippines',
                'type' => 'brand_partner',
                'tin' => '222-333-444-000',
                'contact_person' => 'M. Lim',
                'email' => 'b2b@rudyproject-ph.example',
                'phone' => '0917 222 3344',
                'payment_terms_days' => 30,
                'default_lead_time_days' => 14,
                'status' => 'approved',
                'approved_at' => now(),
            ],
            [
                'code' => 'SP-003',
                'name' => 'Under Armour Philippines',
                'type' => 'brand_partner',
                'tin' => '333-444-555-000',
                'contact_person' => 'K. Cruz',
                'email' => 'govsales@ua-ph.example',
                'phone' => '0917 333 4455',
                'payment_terms_days' => 45,
                'default_lead_time_days' => 28,
                'status' => 'approved',
                'approved_at' => now(),
            ],
            [
                'code' => 'SP-004',
                'name' => '361 Degrees Philippines',
                'type' => 'brand_partner',
                'tin' => '444-555-666-000',
                'contact_person' => 'R. Go',
                'email' => 'sales@361ph.example',
                'phone' => '0917 444 5566',
                'payment_terms_days' => 30,
                'default_lead_time_days' => 21,
                'status' => 'approved',
                'approved_at' => now(),
            ],
            [
                'code' => 'SP-005',
                'name' => 'Luzon Thread & Fabrics',
                'type' => 'local',
                'tin' => '555-666-777-000',
                'contact_person' => 'E. Bautista',
                'email' => 'sales@luzonthread.example',
                'phone' => '0917 555 6677',
                'payment_terms_days' => 15,
                'default_lead_time_days' => 5,
                'status' => 'approved',
                'approved_at' => now(),
            ],
        ];

        $suppliers = [];
        foreach ($suppliersData as $s) {
            $suppliers[$s['code']] = Supplier::updateOrCreate(['code' => $s['code']], $s);
        }

        // 4. Product Categories
        $categoriesList = ['Patches', 'Uniforms', 'Footwear', 'Eyewear', 'Body Armor', 'PPE', 'Bags', 'Accessories'];
        $categories = [];
        foreach ($categoriesList as $name) {
            $categories[$name] = ProductCategory::firstOrCreate(['name' => $name]);
        }

        // 5. Products & Variants
        $patchProd = Product::firstOrCreate(
            ['code' => 'PT-001'],
            [
                'category_id' => $categories['Patches']->id,
                'slug' => 'embroidered-unit-patch',
                'name' => 'Embroidered Unit Patch',
                'specifications' => 'Multi-head embroidery on twill, merrow edge, hook-and-loop backing.',
                'uom' => 'pc',
                'sourcing_type' => 'in_house',
                'is_active' => true,
            ]
        );
        $patchVar3 = ProductVariant::firstOrCreate(['sku' => 'PT-001-3IN'], ['product_id' => $patchProd->id, 'size' => '3 in', 'is_active' => true]);
        $patchVar4 = ProductVariant::firstOrCreate(['sku' => 'PT-001-4IN'], ['product_id' => $patchProd->id, 'size' => '4 in', 'is_active' => true]);

        $bootProd = Product::firstOrCreate(
            ['code' => 'FW-001'],
            [
                'category_id' => $categories['Footwear']->id,
                'slug' => 'tactical-boots',
                'name' => 'Tactical Boots',
                'specifications' => '8-inch leather and nylon upper, slip-resistant outsole, zippered side.',
                'uom' => 'pair',
                'sourcing_type' => 'purchased',
                'is_active' => true,
            ]
        );
        $bootVar9 = ProductVariant::firstOrCreate(['sku' => 'FW-001-9'], ['product_id' => $bootProd->id, 'size' => '9', 'is_active' => true]);
        $bootVar8 = ProductVariant::firstOrCreate(['sku' => 'FW-001-8'], ['product_id' => $bootProd->id, 'size' => '8', 'is_active' => true]);

        $eyeProd = Product::firstOrCreate(
            ['code' => 'EY-001'],
            [
                'category_id' => $categories['Eyewear']->id,
                'slug' => 'ballistic-eyewear',
                'name' => 'Ballistic Eyewear',
                'specifications' => 'ANSI Z87.1 rated polycarbonate lens, anti-fog coating.',
                'uom' => 'pc',
                'sourcing_type' => 'purchased',
                'is_active' => true,
            ]
        );
        $eyeVar = ProductVariant::firstOrCreate(['sku' => 'EY-001-OS'], ['product_id' => $eyeProd->id, 'size' => 'One size', 'is_active' => true]);

        $bagProd = Product::firstOrCreate(
            ['code' => 'BG-001'],
            [
                'category_id' => $categories['Bags']->id,
                'slug' => 'tactical-backpack',
                'name' => 'Tactical Backpack 35L',
                'specifications' => 'MOLLE webbing, water-resistant 600D fabric.',
                'uom' => 'pc',
                'sourcing_type' => 'purchased',
                'is_active' => true,
            ]
        );
        $bagVar = ProductVariant::firstOrCreate(['sku' => 'BG-001-OS'], ['product_id' => $bagProd->id, 'size' => 'One size', 'is_active' => true]);

        // 6. Price Agreements
        $pa1 = PriceAgreement::firstOrCreate(
            ['reference_no' => 'PA-2026-001'],
            [
                'supplier_id' => $suppliers['SP-001']->id,
                'product_variant_id' => $bootVar9->id,
                'unit_cost' => 5600,
                'min_order_qty' => 50,
                'lead_time_days' => 21,
                'valid_from' => '2026-01-01',
                'valid_to' => '2026-12-31',
                'is_preferred' => true,
                'status' => 'active',
            ]
        );

        $pa2 = PriceAgreement::firstOrCreate(
            ['reference_no' => 'PA-2026-004'],
            [
                'supplier_id' => $suppliers['SP-002']->id,
                'product_variant_id' => $eyeVar->id,
                'unit_cost' => 4150,
                'min_order_qty' => 20,
                'lead_time_days' => 14,
                'valid_from' => '2026-02-01',
                'valid_to' => '2026-12-31',
                'is_preferred' => true,
                'status' => 'active',
            ]
        );

        // 7. Materials
        Material::updateOrCreate(['code' => 'MT-001'], [
            'name' => 'Embroidery thread, navy (cone)',
            'uom' => 'cone',
            'on_hand' => 42,
            'reorder_point' => 20,
            'avg_unit_cost' => 185.50,
            'supplier_id' => $suppliers['SP-005']->id,
        ]);
        Material::updateOrCreate(['code' => 'MT-002'], [
            'name' => 'Embroidery thread, gold (cone)',
            'uom' => 'cone',
            'on_hand' => 18,
            'reorder_point' => 20,
            'avg_unit_cost' => 192.00,
            'supplier_id' => $suppliers['SP-005']->id,
        ]);

        // 8. Contracts & Contract Items
        $contract1 = Contract::updateOrCreate(
            ['contract_no' => 'CT-2026-0012'],
            [
                'client_id' => $clients['CL-001']->id,
                'title' => 'Supply of patches, tactical boots and ballistic eyewear',
                'noa_no' => 'NOA-2026-0345',
                'noa_date' => '2026-10-01',
                'contract_date' => '2026-10-03',
                'ntp_date' => '2026-10-05',
                'delivery_days' => 60,
                'delivery_deadline' => '2026-12-04',
                'contract_amount' => 2885000,
                'ld_rate' => 0.001,
                'status' => ContractStatus::InProgress,
                'created_by' => $users['admin@aimforce.example']->id,
            ]
        );

        $cItem1 = ContractItem::updateOrCreate(
            ['contract_id' => $contract1->id, 'product_variant_id' => $patchVar3->id],
            [
                'quantity' => 2000,
                'unit_price' => 85.00,
                'ordered_qty' => 0,
                'delivered_qty' => 2000,
                'accepted_qty' => 2000,
                'status' => 'awarded',
            ]
        );

        $cItem2 = ContractItem::updateOrCreate(
            ['contract_id' => $contract1->id, 'product_variant_id' => $bootVar9->id],
            [
                'quantity' => 300,
                'unit_price' => 6800.00,
                'ordered_qty' => 300,
                'delivered_qty' => 296,
                'accepted_qty' => 296,
                'status' => 'awarded',
            ]
        );

        $cItem3 = ContractItem::updateOrCreate(
            ['contract_id' => $contract1->id, 'product_variant_id' => $eyeVar->id],
            [
                'quantity' => 150,
                'unit_price' => 4500.00,
                'ordered_qty' => 0,
                'delivered_qty' => 0,
                'accepted_qty' => 0,
                'status' => 'awarded',
            ]
        );

        // 9. Purchase Orders & PO Items
        $po1 = PurchaseOrder::updateOrCreate(
            ['po_no' => 'PO-2026-0031'],
            [
                'supplier_id' => $suppliers['SP-001']->id,
                'contract_id' => $contract1->id,
                'po_date' => '2026-10-06',
                'expected_date' => '2026-10-27',
                'subtotal' => 1680000.00,
                'total' => 1680000.00,
                'status' => PoStatus::PartiallyReceived,
                'approved_by' => $users['gm@aimforce.example']->id,
                'approved_at' => '2026-10-06 14:02:00',
                'sent_at' => '2026-10-06 14:30:00',
            ]
        );

        PurchaseOrderItem::updateOrCreate(
            ['purchase_order_id' => $po1->id, 'contract_item_id' => $cItem2->id],
            [
                'product_variant_id' => $bootVar9->id,
                'price_agreement_id' => $pa1->id,
                'quantity' => 300,
                'unit_cost' => 5600.00,
                'received_qty' => 300,
            ]
        );

        // 10. Stock Movements
        StockMovement::create([
            'product_variant_id' => $bootVar9->id,
            'contract_item_id' => $cItem2->id,
            'type' => MovementType::Receive->value,
            'quantity' => 300,
            'unit_cost' => 5600.00,
            'user_id' => $users['warehouse@aimforce.example']->id,
            'moved_at' => '2026-10-20 10:05:00',
        ]);

        StockMovement::create([
            'product_variant_id' => $bootVar9->id,
            'contract_item_id' => $cItem2->id,
            'type' => MovementType::QaPass->value,
            'quantity' => 296,
            'unit_cost' => 5600.00,
            'user_id' => $users['qa@aimforce.example']->id,
            'moved_at' => '2026-10-21 15:40:00',
        ]);

        StockMovement::create([
            'product_variant_id' => $patchVar3->id,
            'contract_item_id' => $cItem1->id,
            'type' => MovementType::Produce->value,
            'quantity' => 2000,
            'unit_cost' => 28.00,
            'user_id' => $users['production@aimforce.example']->id,
            'moved_at' => '2026-10-18 16:30:00',
        ]);

        // 11. Invoices
        Invoice::updateOrCreate(
            ['bs_no' => 'BS-2026-0020'],
            [
                'official_invoice_no' => 'OR-001245',
                'contract_id' => $contract1->id,
                'invoice_date' => '2026-10-28',
                'gross_amount' => 2182800.00,
                'vat_amount' => 233871.43,
                'wvat_amount' => 97446.43,
                'ewt_amount' => 19489.29,
                'net_receivable' => 2065864.28,
                'due_date' => '2026-11-27',
                'status' => InvoiceStatus::Unpaid,
            ]
        );
    }
}
