import type { PageServerLoad } from './$types';
import { error, redirect } from '@sveltejs/kit';
import { getRows } from '$lib/server/database';

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
        const failedAuths = getRows(`
            SELECT * FROM failed_customer_auth 
            ORDER BY created_at DESC 
            LIMIT 100
        `);

        return {
            failedAuths
        };
    } catch (err) {
        console.error('Error fetching failed auth data:', err);
        throw error(500, 'Internal Server Error');
    }
}; 