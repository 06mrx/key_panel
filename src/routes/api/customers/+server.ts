import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getRows, insertRow } from '$lib/config/supabase';

interface Customer {
    id: number;
    code: string;
    expire_at: string | null;
    maximum_device: number;
    devices: string | null;
    device_name: string | null;
    os_version: string | null;
    fingerprint: string | null;
    created_at: string;
    updated_at: string;
}

// GET /api/customers - Mendapatkan semua customers
export const GET: RequestHandler = async () => {
    try {
        const customers = await getRows('customers', {});
        
        return json({ 
            customers: customers.map(customer => ({
                ...customer,
                devices: customer.devices ? JSON.parse(customer.devices) : []
            }))
        });
    } catch (error) {
        console.error('Error mengambil data customers:', error);
        return json({ error: 'Terjadi kesalahan saat mengambil data customers' }, { status: 500 });
    }
};

// POST /api/customers - Menambah customer baru
export const POST: RequestHandler = async ({ request }) => {
    try {
        const { 
            code, 
            expire_at, 
            maximum_device = 1,
            device_name = null,
            os_version = null,
            fingerprint = null
        } = await request.json();

        if (!code) {
            return json(
                { error: 'Code harus diisi' },
                { status: 400 }
            );
        }

        // Insert customer baru
        const result = await insertRow('customers', {
            code,
            expire_at,
            maximum_device,
            devices: '[]',
            device_name,
            os_version,
            fingerprint
        });

        return json({ 
            message: 'Customer berhasil ditambahkan',
            customer: {
                ...result,
                devices: []
            }
        });
    } catch (error: any) {
        console.error('Error menambah customer:', error);
        
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return json(
                { error: 'Code sudah digunakan' },
                { status: 400 }
            );
        }
        
        return json(
            { error: 'Terjadi kesalahan saat menambah customer' },
            { status: 500 }
        );
    }
}; 