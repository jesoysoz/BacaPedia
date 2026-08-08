<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class StoreBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'judul' => 'required|string|max:255',
            'penulis' => 'required|string|max:255',
            'penerbit' => 'required|string|max:255',
            'category_id' => 'required|exists:categories,id',
            'stok' => 'required|integer|min:0',
            'tahun_terbit' => 'required|digits:4|integer|min:1900|max:' . date('Y'),
        ];
    }

    public function messages(): array
    {
        return [
            'judul.required' => 'Judul buku wajib diisi.',
            'penulis.required' => 'Nama penulis wajib diisi.',
            'penerbit.required' => 'Nama penerbit wajib diisi.',
            'category_id.required' => 'Kategori buku wajib dipilih.',
            'category_id.exists' => 'Kategori buku yang dipilih tidak ditemukan.',
            'stok.required' => 'Stok buku wajib diisi.',
            'stok.min' => 'Stok buku tidak boleh kurang dari 0.',
            'tahun_terbit.required' => 'Tahun terbit wajib diisi.',
            'tahun_terbit.digits' => 'Tahun terbit wajib terdiri dari 4 digit.',
            'tahun_terbit.integer' => 'Tahun terbit wajib berupa angka.',
        ];
    }
}
