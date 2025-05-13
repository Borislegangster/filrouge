<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Casts\Attribute;

class Provider extends Model
{
    protected $fillable = [
        'name',
        'contact_name',
        'email',
        'phone',
        'address',
        'description',
        'services',
        'contract_end_date',
        'is_active'
    ];

    protected $casts = [
        'services' => 'array',
        'is_active' => 'boolean',
        'contract_end_date' => 'date'
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

    /**
     * Get the status as a human-readable text.
     */
    protected function status(): Attribute
    {
        return Attribute::make(
            get: fn () => $this->is_active ? 'Actif' : 'Inactif',
        );
    }
}