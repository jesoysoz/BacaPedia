<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreLoanRequest;
use App\Http\Resources\LoanResource;
use App\Models\Book;
use App\Models\Loan;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Carbon\Carbon;

class LoanController extends Controller
{
    private const DENDA_PER_HARI = 2000; // Rp2.000/hari keterlambatan
    private const MASA_PINJAM_HARI = 7;

    public function index(Request $request)
    {
        $user = $request->user();

        if ($user->role === 'anggota') {
            $loans = Loan::with(['user', 'book'])
                ->where('user_id', $user->id)
                ->latest()
                ->get();
        } else {
            // admin & petugas
            $loans = Loan::with(['user', 'book'])->latest()->get();
        }

        return LoanResource::collection($loans);
    }

    public function store(StoreLoanRequest $request)
    {
        $user = $request->user();

        return DB::transaction(function () use ($request, $user) {
            $book = Book::lockForUpdate()->findOrFail($request->buku_id);

            if ($book->stok <= 0) {
                return response()->json([
                    'message' => 'Stok buku tidak tersedia.',
                    'errors' => [
                        'buku_id' => ['Stok buku habis.'],
                    ],
                ], 422);
            }

            $loan = Loan::create([
                'user_id' => $user->id,
                'buku_id' => $book->id,
                'tanggal_pinjam' => Carbon::today(),
                'tanggal_jatuh_tempo' => Carbon::today()->addDays(self::MASA_PINJAM_HARI),
                'tanggal_kembali' => null,
                'status' => 'dipinjam',
                'denda' => 0,
            ]);

            $book->decrement('stok');

            $loan->load(['user', 'book']);

            return response()->json([
                'message' => 'Peminjaman berhasil dibuat!',
                'data' => new LoanResource($loan),
            ], 201);
        });
    }

    public function show(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($user->role === 'anggota' && $loan->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak memiliki akses ke peminjaman ini.',
            ], 403);
        }

        $loan->load(['user', 'book']);

        return response()->json([
            'message' => 'Detail peminjaman berhasil diambil.',
            'data' => new LoanResource($loan),
        ], 200);
    }

    public function returnBook(Request $request, Loan $loan)
    {
        $user = $request->user();

        if ($user->role === 'anggota' && $loan->user_id !== $user->id) {
            return response()->json([
                'message' => 'Anda tidak dapat mengembalikan peminjaman milik user lain.',
            ], 403);
        }

        if ($loan->status !== 'dipinjam') {
            return response()->json([
                'message' => 'Peminjaman ini sudah dikembalikan sebelumnya.',
            ], 422);
        }

        return DB::transaction(function () use ($loan) {
            $today = Carbon::today();

            $denda = 0;
            if ($today->gt($loan->tanggal_jatuh_tempo)) {
                $telat = $today->diffInDays($loan->tanggal_jatuh_tempo);
                $denda = $telat * self::DENDA_PER_HARI;
            }

            $loan->update([
                'status' => 'dikembalikan',
                'tanggal_kembali' => $today,
                'denda' => $denda,
            ]);

            $book = Book::lockForUpdate()->find($loan->buku_id);
            $book->increment('stok');

            $loan->load(['user', 'book']);

            return response()->json([
                'message' => 'Pengembalian buku berhasil diproses.',
                'data' => new LoanResource($loan),
            ], 200);
        });
    }
}   