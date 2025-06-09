import { getRows } from '$lib/server/database';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
    const users = getRows(`
        SELECT id, username, created_at, updated_at 
        FROM users 
        ORDER BY created_at DESC
    `);

    return {
        users
    };
}; 