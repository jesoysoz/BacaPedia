<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class BookResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'judul' => $this->judul,
            'penulis' => $this->penulis,
            'penerbit' => $this->penerbit,
            'stok' => $this->stok,
            'tahun_terbit' => $this->tahun_terbit,
            'kategori' => [
                'id' => $this->category->id,
                'nama_kategori' => $this->category->nama_kategori,
            ],
            'created_at' => $this->created_at->toDateTimeString(),   
        ];
    }
}
