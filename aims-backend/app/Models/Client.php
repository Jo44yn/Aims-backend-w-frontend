<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    protected $fillable = ['code', 'name', 'branch', 'type', 'tin', 'contact_person', 'phone', 'email', 'address'];

    public function contracts(): HasMany
    {
        return $this->hasMany(Contract::class);
    }
}