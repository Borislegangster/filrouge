<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class provider extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            "id" => $this->id,
            "name" => $this->name,
            "contact_name" => $this->contact_name ?? null,
            "email" => $this->email ?? null,
            "phone" => $this->phone ?? null,
            "phone2" => $this->phone2 ?? null,
            "website" => $this->website ?? null,
            "address" => $this->address ?? null,
            "description" => $this->description ?? null,
            "is_active" => $this->is_active ? true : false,
            "services" => service::collection($this->services),
        ];
    }
}
