import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getRow } from '$lib/config/supabase';
import bcrypt from 'bcrypt';

interface User {
    id: string;
    username: string;
    password: string;
    role: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { username, password } = await request.json();

    try {
        // Find user by username
        const user = await getRow('users', { username }) as User | undefined;

        if (!user) {
            return json({
                success: false,
                message: 'Username atau password salah'
            }, { status: 401 });
        }

        // Verify password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return json({
                success: false,
                message: 'Username atau password salah'
            }, { status: 401 });
        }

        // Verify role
        if (user.role !== 'admin') {
            return json({
                success: false,
                message: 'Akses ditolak. Hanya admin yang diperbolehkan login.'
            }, { status: 403 });
        }

        // Set session cookie with user UUID
        cookies.set('session', user.id, {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Return success response
        return json({
            success: true,
            redirect: '/admin'
        });
    } catch (error) {
        console.error('Login error:', error);
        return json({
            success: false,
            message: 'Terjadi kesalahan saat login'
        }, { status: 500 });
    }
}; 