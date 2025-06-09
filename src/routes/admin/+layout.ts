import { redirect } from '@sveltejs/kit';
import type { LayoutLoad } from './$types';
import { browser } from '$app/environment';

export const load: LayoutLoad = async () => {
    // Skip pada server-side rendering
    if (!browser) {
        return { user: null };
    }

    try {
        // Cek apakah user sudah login
        const userJson = sessionStorage.getItem('user');
        
        if (!userJson) {
            throw redirect(303, '/login');
        }

        const userData = JSON.parse(userJson);
        
        // Cek apakah user adalah admin
        if (userData.role !== 'admin') {
            // Hapus data user jika bukan admin
            sessionStorage.removeItem('user');
            throw redirect(303, '/login');
        }

        return {
            user: userData
        };
    } catch (error) {
        // Jika terjadi error parsing JSON atau lainnya, redirect ke login
        sessionStorage.removeItem('user');
        throw redirect(303, '/login');
    }
}; 