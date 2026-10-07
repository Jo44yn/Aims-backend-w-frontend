<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Inquiry extends Model
{
    protected $fillable = ['user_id', 'client_id', 'name', 'organization', 'email', 'phone', 'items', 'needed_by', 'status', 'staff_note'];

    protected $casts = ['needed_by' => 'date'];
}
