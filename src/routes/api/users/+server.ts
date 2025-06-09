import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { addUser, getAllUsers } from '$lib/database/db';

// GET /api/users - Mendapatkan semua users
export const GET: RequestHandler = async () => {
    try {
        const users = getAllUsers();
        return json({ users });
    } catch (error) {
        return json({ error: 'Terjadi kesalahan saat mengambil data users' }, { status: 500 });
    }
};

// POST /api/users - Menambah user baru
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password, email, role } = await request.json();

        if (!username || !password || !email) {
            return json(
                { error: 'Username, password, dan email harus diisi' },
                { status: 400 }
            );
        }

        const result = addUser(username, password, email, role);
        return json({ message: 'User berhasil ditambahkan', userId: result.lastInsertRowid });
    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return json(
                { error: 'Username atau email sudah digunakan' },
                { status: 400 }
            );
        }
        return json(
            { error: 'Terjadi kesalahan saat menambah user' },
            { status: 500 }
        );
    }
}; 