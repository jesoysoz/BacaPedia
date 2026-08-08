<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreLoanRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true; // Otorisasi role ditangani middleware & controller
    }

    public function rules(): array
    {
        return [
            'buku_id' => ['required', 'integer', 'exists:books,id'],
        ];
    }

    public function messages(): array
    {
        return [
            'buku_id.required' => 'Buku wajib dipilih.',
            'buku_id.exists' => 'Buku tidak ditemukan.',
        ];
    }
}