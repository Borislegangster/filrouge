<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    protected $fillable = [
        'title',
        'message',
        'type',
        'is_read',
        'user_id',
        'related_type',
        'related_id'
    ];

    protected $casts = [
        'is_read' => 'boolean',
    ];

    /**
     * Get the user who owns this notification.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Get the related entity.
     */
    public function related()
    {
        if (!$this->related_type || !$this->related_id) {
            return null;
        }

        $model = 'App\\Models\\' . $this->related_type;
        return $model::find($this->related_id);
    }
}
