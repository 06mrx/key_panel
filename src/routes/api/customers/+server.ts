import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    getAllCustomers, 
    addCustomer, 
    updateCustomer,
    deleteCustomer 
} from '$lib/database/db';

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
    const customers = getAllCustomers();
    return json({ customers });
};

// POST /api/customers - Menambah customer baru
export const POST: RequestHandler = async ({ request }) => {
    const { code, expire_at, maximum_device } = await request.json();

    if (!code) {
        return json({ error: 'Code harus diisi' }, { status: 400 });
    }

    try {
        addCustomer(code, expire_at, maximum_device);
        return json({ success: true });
    } catch (error) {
        console.error('Error adding customer:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 