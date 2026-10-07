<?php

namespace Database\Seeders;

use App\Models\Setting;
use Illuminate\Database\Seeder;

class SettingsSeeder extends Seeder
{
    public function run(): void
    {
        $settings = [
            'company_name' => 'AIMFORCE Police and Military Supply',
            'vat_rate' => '12',
            'wvat_rate' => '5',
            'ewt_rate' => '1',
            'po_approval_threshold' => '100000',
            'margin_guard_threshold' => '90',
        ];

        foreach ($settings as $key => $value) {
            Setting::updateOrCreate(['key' => $key], ['value' => $value]);
        }
    }
}