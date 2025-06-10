import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getRows, insertRow } from '$lib/config/supabase';
import bcrypt from 'bcrypt';

// GET /api/users - Mendapatkan semua users
export const GET: RequestHandler = async () => {
    try {
        const users = await getRows('users', {});
        
        // Hapus field password dari response untuk keamanan
        const safeUsers = users.map(user => ({
            id: user.id,
            username: user.username,
            email: user.email,
            role: user.role,
            created_at: user.created_at,
            updated_at: user.updated_at
        }));

        return json({ users: safeUsers });
    } catch (error) {
        console.error('Error mengambil data users:', error);
        return json({ error: 'Terjadi kesalahan saat mengambil data users' }, { status: 500 });
    }
};

// POST /api/users - Menambah user baru
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { username, password, email, role = 'user' } = await request.json();

        if (!username || !password || !email) {
            return json(
                { error: 'Username, password, dan email harus diisi' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Insert user baru
        const result = await insertRow('users', {
            username,
            password: hashedPassword,
            email,
            role
        });

        return json({ 
            message: 'User berhasil ditambahkan', 
            user: {
                id: result.id,
                username: result.username,
                email: result.email,
                role: result.role
            }
        });
    } catch (error: any) {
        console.error('Error menambah user:', error);
        
        if (error.code === '23505') { // PostgreSQL unique constraint violation
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