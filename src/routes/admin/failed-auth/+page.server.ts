import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getRows } from '$lib/config/supabase';

interface Locals {
    user?: {
        role: string;
    };
}

export const load: PageServerLoad = async ({ locals }: { locals: Locals }) => {
    // Pastikan user sudah login sebagai admin
    if (!locals.user || locals.user.role !== 'admin') {
        throw redirect(303, '/login');
    }

    try {
        const failedAuths = await getRows('failed_customer_auth', {});

        return {
            failedAuths: failedAuths.sort((a, b) => 
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            )
        };
    } catch (err) {
        console.error('Error mengambil data failed auth:', err);
        throw error(500, 'Terjadi kesalahan saat mengambil data failed auth');
    }
}; 