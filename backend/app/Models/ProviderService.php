<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ProviderService extends Model
{
    protected $table = 'provider_services';
    public $timestamps = false;

    protected $fillable = [
        'provider_id',
        'service_id',
    ];
}
