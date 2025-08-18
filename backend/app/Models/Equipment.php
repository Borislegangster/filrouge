<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Equipment extends Model
{
    protected $table = 'equipment';

    protected $fillable = [
        'name',
        'type',
        'status',
        'serial_number',
        'description',
        'purchase_date',
        'last_maintenance',
        'next_maintenance',
        'room_id',
        'provider_id'
    ];

    protected $casts = [
        'purchase_date' => 'date',
        'last_maintenance' => 'date',
        'next_maintenance' => 'date',
    ];

    /**
     * Get the room where this equipment is located.
     */
    public function room(): BelongsTo
    {
        return $this->belongsTo(Room::class);
    }

    /**
     * Get the provider of this equipment.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the issues for this equipment.
     */
    public function issues(): HasMany
    {
        return $this->hasMany(Issue::class);
    }

    /**
     * Get the checkouts for this equipment.
     */
    public function checkouts(): HasMany
    {
        return $this->hasMany(Checkout::class);
    }

    /**
     * Get the acquisitions that include this equipment.
     */
    public function acquisitions(): BelongsToMany
    {
        return $this->belongsToMany(Acquisition::class, 'acquisition_equipment')
            ->withPivot('quantity')
            ->withTimestamps();
    }
}
