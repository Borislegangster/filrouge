<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Checkout extends Model
{
    protected $fillable = [
        'equipment_id',
        'user_id',
        'checkout_date',
        'expected_return_date',
        'actual_return_date',
        'purpose',
        'status',
        'notes',
        'checked_out_by',
        'checked_in_by'
    ];

    protected $casts = [
        'checkout_date' => 'date',
        'expected_return_date' => 'date',
        'actual_return_date' => 'date',
    ];

    /**
     * Get the equipment that is being checked out.
     */
    public function equipment(): BelongsTo
    {
        return $this->belongsTo(Equipment::class);
    }

    /**
     * Get the user who has checked out this equipment.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the user who checked out the equipment.
     */
    public function checkedOutBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_out_by');
    }

    /**
     * Get the user who checked in the equipment.
     */
    public function checkedInBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'checked_in_by');
    }
}
