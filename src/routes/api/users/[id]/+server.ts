import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import db from '$lib/database/db';

// PUT /api/users/[id] - Update user
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const { username, email, role } = await request.json();
        const { id } = params;

        if (!username || !email || !role) {
            return json(
                { error: 'Username, email, dan role harus diisi' },
                { status: 400 }
            );
        }

        const stmt = db.prepare(
            'UPDATE users SET username = ?, email = ?, role = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?'
        );
        const result = stmt.run(username, email, role, id);

        if (result.changes === 0) {
            return json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        return json({ message: 'User berhasil diupdate' });
    } catch (error: any) {
        if (error.message?.includes('UNIQUE constraint failed')) {
            return json(
                { error: 'Username atau email sudah digunakan' },
                { status: 400 }
            );
        }
        return json(
            { error: 'Terjadi kesalahan saat mengupdate user' },
            { status: 500 }
        );
    }
};

// DELETE /api/users/[id] - Hapus user
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const { id } = params;
        const stmt = db.prepare('DELETE FROM users WHERE id = ?');
        const result = stmt.run(id);

        if (result.changes === 0) {
            return json({ error: 'User tidak ditemukan' }, { status: 404 });
        }

        return json({ message: 'User berhasil dihapus' });
    } catch (error) {
        return json(
            { error: 'Terjadi kesalahan saat menghapus user' },
            { status: 500 }
        );
    }
}; 