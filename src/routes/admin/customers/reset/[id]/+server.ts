import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRow, run } from '$lib/server/database';

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
        const customer = getRow('SELECT * FROM customers WHERE id = ?', [params.id]);
        if (!customer) {
            return json({ success: false, message: 'Customer tidak ditemukan' }, { status: 404 });
        }

        // Reset informasi device
        run(`
            UPDATE customers 
            SET devices = NULL,
                device_name = NULL,
                os_version = NULL,
                fingerprint = NULL,
                updated_at = DATETIME('now')
            WHERE id = ?
        `, [params.id]);

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