<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Acquisition extends Model
{
    protected $fillable = [
        'title',
        'description',
        'provider_id',
        'amount',
        'status',
        'request_date',
        'approval_date',
        'delivery_date',
        'requested_by',
        'approved_by',
        'urgency'
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'request_date' => 'date',
        'approval_date' => 'date',
        'delivery_date' => 'date',
    ];

    /**
     * Get the provider for this acquisition.
     */
    public function provider(): BelongsTo
    {
        return $this->belongsTo(Provider::class);
    }

    /**
     * Get the user who requested this acquisition.
     */
    public function requester(): BelongsTo
    {
        return $this->belongsTo(User::class, 'requested_by');
    }

    /**
     * Get the user who approved this acquisition.
     */
    public function approver(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    /**
     * Get the equipment included in this acquisition.
     */
    public function equipment(): BelongsToMany
    {
        return $this->belongsToMany(Equipment::class, 'acquisition_equipment')
        ->withPivot(['quantity', 'provider_id'])
        ->withTimestamps();
    }

    // Scopes pour filtrer par rôle
    public function scopeForUser($query, $user)
    {
        if ($user->role === 'formateur') {
            return $query->where('requested_by', $user->id);
        }
        return $query;
    }

    /**
     * Check if the acquisition can be modified by the given user.
     */
    public function canBeModifiedBy($user): bool
    {
        if ($this->status !== 'En attente') {
            return false;
        }

        if ($user->role === 'administrateur') {
            return true;
        }

        return $this->requested_by === $user->id;
    }

    /**
     * Check if the acquisition can be deleted by the given user.
     */
    public function canBeDeletedBy($user): bool
    {
        if ($this->status !== 'En attente') {
            return false;
        }

        if ($user->role === 'administrateur') {
            return true;
        }

        return $this->requested_by === $user->id;
    }
}

