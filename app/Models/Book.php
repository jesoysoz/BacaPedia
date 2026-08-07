<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;


class Book extends Model
{
    protected $fillable = [
        'judul',
        'penulis',
        'penerbit',
        'category_id',
        'stok',
        'tahun_terbit',
    ];

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function loans(): HasMany
    {
        return $this->hasMany(Loan::class, 'buku_id');
    }
}
