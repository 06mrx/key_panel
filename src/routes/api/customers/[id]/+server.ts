import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { updateCustomer, deleteCustomer, updateCustomerDeviceInfo } from '$lib/database/db';

// PUT /api/customers/[id] - Update customer
export const PUT: RequestHandler = async ({ params, request }) => {
    const id = parseInt(params.id);
    const { 
        code, 
        expire_at, 
        maximum_device,
        device_name,
        os_version,
        fingerprint,
        devices 
    } = await request.json();

    if (!code) {
        return json({ error: 'Code harus diisi' }, { status: 400 });
    }

    try {
        // Update informasi dasar customer
        updateCustomer(id, code, expire_at || null, maximum_device);

        // Update informasi device jika ada
        if (devices || device_name || os_version || fingerprint) {
            updateCustomerDeviceInfo(
                id,
                devices || '[]',
                device_name || null,
                os_version || null,
                fingerprint || null
            );
        }

        return json({ success: true });
    } catch (error) {
        console.error('Error updating customer:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
};

// DELETE /api/customers/[id] - Hapus customer
export const DELETE: RequestHandler = async ({ params }) => {
    const id = parseInt(params.id);

    try {
        deleteCustomer(id);
        return json({ success: true });
    } catch (error) {
        console.error('Error deleting customer:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 