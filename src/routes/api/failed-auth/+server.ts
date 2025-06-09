import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db from '$lib/database/db';

interface Locals {
    user?: {
        role: string;
    };
}

export const GET: RequestHandler = async ({ locals }: { locals: Locals }) => {
    // Pastikan user sudah login sebagai admin
    if (!locals.user || locals.user.role !== 'admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const stmt = db.prepare(`
            SELECT * FROM failed_customer_auth 
            ORDER BY created_at DESC 
            LIMIT 100
        `);
        const failedAuths = stmt.all();

        return json({ failedAuths });
    } catch (error) {
        console.error('Error fetching failed auth data:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 