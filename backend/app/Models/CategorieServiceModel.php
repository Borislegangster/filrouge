<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class CategorieServiceModel extends Model
{
    protected $table = 'categorie_services';
    public $timestamps = false;

    protected $fillable = [
        'name',
        'description',
        'image',
    ];

    public function services(): HasMany
    {
        return $this->hasMany(Service::class);
    }
}
