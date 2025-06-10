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
        const customers = await getRows('customers', {});

        return {
            customers: customers.map(customer => ({
                ...customer,
                devices: customer.devices ? JSON.parse(customer.devices) : []
            }))
        };
    } catch (err) {
        console.error('Error mengambil data customers:', err);
        throw error(500, 'Terjadi kesalahan saat mengambil data customers');
    }
}; 