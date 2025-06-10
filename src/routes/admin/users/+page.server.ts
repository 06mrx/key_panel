import { getRows } from '$lib/config/supabase';
import type { PageServerLoad } from './$types';
import { error } from '@sveltejs/kit';

export const load: PageServerLoad = async () => {
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

        return {
            users: safeUsers
        };
    } catch (err) {
        console.error('Error mengambil data users:', err);
        throw error(500, 'Terjadi kesalahan saat mengambil data users');
    }
}; 