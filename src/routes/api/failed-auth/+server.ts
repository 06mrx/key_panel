import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRows } from '$lib/config/supabase';

interface Locals {
    user?: {
        role: string;
    };
}

export const GET: RequestHandler = async ({ locals }: { locals: Locals }) => {
    // Ensure user is logged in as admin
    if (!locals.user || locals.user.role !== 'admin') {
        return json({ error: 'Unauthorized' }, { status: 401 });
    }

    try {
        const failedAuths = await getRows('failed_customer_auth', {});

        return json({ failedAuths });
    } catch (error) {
        console.error('Error fetching failed auth data:', error);
        return json({ error: 'Internal server error' }, { status: 500 });
    }
}; 