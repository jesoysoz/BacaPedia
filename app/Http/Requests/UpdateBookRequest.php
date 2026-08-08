<?php

namespace App\Http\Requests;

use Illuminate\Contracts\Validation\ValidationRule;
use Illuminate\Foundation\Http\FormRequest;

class UpdateBookRequest extends FormRequest
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
            'judul' => 'sometimes|string|max:255',
            'penulis' => 'sometimes|string|max:255',
            'penerbit' => 'sometimes|string|max:255',
            'category_id' => 'sometimes|exists:categories,id',
            'stok' => 'sometimes|integer|min:0',
            'tahun_terbit' => 'sometimes|digits:4|integer|min:1900|max:' . date('Y'),
        ];
    }
}
