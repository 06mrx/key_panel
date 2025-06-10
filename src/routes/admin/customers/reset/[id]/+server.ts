import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRow, updateRow } from '$lib/config/supabase';

interface Locals {
    user?: {
        role: string;
    };
}

export const POST: RequestHandler = async ({ params, locals }: { params: { id: string }, locals: Locals }) => {
    // Pastikan user adalah admin
    if (!locals.user || locals.user.role !== 'admin') {
        return json({ success: false, message: 'Unauthorized' }, { status: 403 });
    }

    try {
        // Cek apakah customer ada
        const customer = await getRow('customers', { id: params.id });
        if (!customer) {
            return json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 });
        }

        // Reset informasi device
        await updateRow(
            'customers',
            { id: params.id },
            {
                devices: null,
                device_name: null,
                os_version: null,
                fingerprint: null,
                updated_at: new Date().toISOString()
            }
        );

        return json({ 
            success: true, 
            message: 'Informasi device berhasil direset' 
        });
    } catch (error) {
        console.error('Error resetting customer device:', error);
        return json({ 
            success: false, 
            message: 'Terjadi kesalahan saat mereset informasi device' 
        }, { status: 500 });
    }
};