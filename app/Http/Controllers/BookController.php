<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Http\Resources\BookResource;
use App\Models\Book;
use Illuminate\Http\JsonResponse;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(): JsonResponse
    {
        $books = Book::with('category')->get();

        return response()->json([
            'message' => 'Daftar buku berhasil diambil!',
            'data' => BookResource::collection($books),
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreBookRequest $request): JsonResponse
    {
        $book = Book::create($request->validated());
        $book->load('category');

        return response()->json([
            'message' => 'Buku berhasil ditambahkan!',
            'data' => new BookResource($book),
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Book $book): JsonResponse
    {
        $book->load('category');

        return response()->json([
            'message' => 'Detail buku berhasil diambil!',
            'data' => new BookResource($book),
        ]);
    }

    public function update(UpdateBookRequest $request, Book $book): JsonResponse
    {
        $book->update($request->validated());
        $book->load('category');

        return response()->json([
            'message' => 'Buku berhasil diperbarui!',
            'data' => new BookResource($book),
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Book $book): JsonResponse
    {
        $book->delete();

        return response()->json([
            'message' => 'Buku berhasil dihapus!',
        ]);
    }
}
