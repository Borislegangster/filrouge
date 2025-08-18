<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provider extends Model
{
    protected $fillable = [
        'name',
        'contact_name',
        'email',
        'phone',
        'address',
        'description',
        'is_active'
    ];

    /**
     * Get the equipment from this provider.
     */
    public function equipment(): HasMany
    {
        return $this->hasMany(Equipment::class);
    }

    /**
     * Get the acquisitions from this provider.
     */
    public function acquisitions(): HasMany
    {
        return $this->hasMany(Acquisition::class);
    }
}