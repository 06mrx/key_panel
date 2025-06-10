import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { updateRow, deleteRow, getRow, getRows } from '$lib/config/supabase';
import bcrypt from 'bcrypt';

// PUT /api/users/[id] - Update user
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const { username, password, email, role } = await request.json();
        const id = params.id;

        // Validasi input
        if (!username || !email) {
            return json(
                { error: 'Username dan email harus diisi' },
                { status: 400 }
            );
        }

        // Persiapkan data update
        const updateData: any = {
            username,
            email,
            role
        };

        // Jika password diisi, hash password baru
        if (password) {
            updateData.password = await bcrypt.hash(password, 10);
        }

        // Update user
        const result = await updateRow('users', { id }, updateData);

        return json({ 
            message: 'User berhasil diperbarui',
            user: {
                id: result.id,
                username: result.username,
                email: result.email,
                role: result.role
            }
        });
    } catch (error: any) {
        console.error('Error memperbarui user:', error);
        
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return json(
                { error: 'Username atau email sudah digunakan' },
                { status: 400 }
            );
        }

        return json(
            { error: 'Terjadi kesalahan saat memperbarui user' },
            { status: 500 }
        );
    }
};

// DELETE /api/users/[id] - Hapus user
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const id = params.id;

        // Cek apakah user yang akan dihapus adalah admin terakhir
        const user = await getRow('users', { id });
        if (user?.role === 'admin') {
            const admins = await getRows('users', { role: 'admin' });
            if (admins.length <= 1) {
                return json(
                    { error: 'Tidak dapat menghapus admin terakhir' },
                    { status: 400 }
                );
            }
        }

        // Hapus user
        await deleteRow('users', { id });

        return json({ message: 'User berhasil dihapus' });
    } catch (error) {
        console.error('Error menghapus user:', error);
        return json(
            { error: 'Terjadi kesalahan saat menghapus user' },
            { status: 500 }
        );
    }
}; 