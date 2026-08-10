<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function index(Request $request)
    {
        // Hanya admin yang boleh melihat daftar user
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Anda tidak memiliki akses untuk mengelola user.'
            ], 403);
        }

        $users = User::latest()->get();

        return response()->json([
            'message' => 'Daftar user berhasil diambil.',
            'data' => $users
        ], 200);
    }

    public function store(Request $request)
    {
        // Hanya admin yang boleh menambahkan user
        if ($request->user()->role !== 'admin') {
            return response()->json([
                'message' => 'Hanya admin yang dapat menambahkan user.'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email',
            'password' => 'required|string|min:6',
            'role' => 'required|in:admin,petugas,anggota',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
            'role' => $validated['role'],
        ]);

        return response()->json([
            'message' => 'User berhasil ditambahkan.',
            'data' => $user
        ], 201);
    }
}