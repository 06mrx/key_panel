import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ cookies }) => {
    // Hapus session cookie dengan opsi yang sesuai
    cookies.delete('session', {
        path: '/',
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production'
    });
    
    // Redirect ke halaman login
    throw redirect(303, '/login');
}; 