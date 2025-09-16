<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Service extends Model
{
    protected $table = 'services';
    public $timestamps = false;

    protected $fillable = [
        'categorie_id',
        'name',
        'description',
        'icon',
    ];
    public function categorie(): BelongsTo
    {
        return $this->belongsTo(CategorieServiceModel::class, 'categorie_id');
    }

    public function providers(): BelongsToMany
    {
        return $this->belongsToMany(Provider::class, 'provider_services', 'service_id', 'provider_id');
    }
}
