import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { updateRow, deleteRow } from '$lib/config/supabase';

// PUT /api/customers/[id] - Update customer
export const PUT: RequestHandler = async ({ params, request }) => {
    try {
        const { 
            code, 
            expire_at, 
            maximum_device, 
            devices,
            device_name,
            os_version,
            fingerprint
        } = await request.json();
        const id = params.id;

        // Validasi input
        if (!code) {
            return json(
                { error: 'Code harus diisi' },
                { status: 400 }
            );
        }

        // Update customer
        const result = await updateRow('customers', { id }, {
            code,
            expire_at,
            maximum_device,
            devices: Array.isArray(devices) ? JSON.stringify(devices) : devices,
            device_name: device_name || null,
            os_version: os_version || null,
            fingerprint: fingerprint || null
        });

        return json({ 
            message: 'Customer berhasil diperbarui',
            customer: {
                ...result,
                devices: result.devices ? JSON.parse(result.devices) : []
            }
        });
    } catch (error: any) {
        console.error('Error memperbarui customer:', error);
        
        if (error.code === '23505') { // PostgreSQL unique constraint violation
            return json(
                { error: 'Code sudah digunakan' },
                { status: 400 }
            );
        }

        return json(
            { error: 'Terjadi kesalahan saat memperbarui customer' },
            { status: 500 }
        );
    }
};

// DELETE /api/customers/[id] - Hapus customer
export const DELETE: RequestHandler = async ({ params }) => {
    try {
        const id = params.id;

        // Hapus customer
        await deleteRow('customers', { id });

        return json({ message: 'Customer berhasil dihapus' });
    } catch (error) {
        console.error('Error menghapus customer:', error);
        return json(
            { error: 'Terjadi kesalahan saat menghapus customer' },
            { status: 500 }
        );
    }
}; 