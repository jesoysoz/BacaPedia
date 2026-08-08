<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;
use App\Models\Loan;

class LoanResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'user' => [
                'id' => $this->user->id,
                'name' => $this->user->name,
                'email' => $this->user->email,
            ],
            'book' => [
                'id' => $this->book->id,
                'judul' => $this->book->judul ?? $this->book->title ?? null,
            ],
            'tanggal_pinjam' => $this->tanggal_pinjam?->format('Y-m-d'),
            'tanggal_jatuh_tempo' => $this->tanggal_jatuh_tempo?->format('Y-m-d'),
            'tanggal_kembali' => $this->tanggal_kembali?->format('Y-m-d'),
            'status' => $this->status,
            'denda' => $this->denda,
        ];
    }
}