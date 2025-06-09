import { json, redirect } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import db, { getRow } from '$lib/server/database';
import bcrypt from 'bcrypt';

interface User {
    id: number;
    username: string;
    password: string;
    role: string;
}

export const POST: RequestHandler = async ({ request, cookies }) => {
    const { username, password } = await request.json();

    try {
        // Cari user berdasarkan username
        const user = getRow('SELECT * FROM users WHERE username = ?', [username]) as User | undefined;

        if (!user) {
            return json({
                success: false,
                message: 'Username atau password salah'
            }, { status: 401 });
        }

        // Verifikasi password
        const validPassword = await bcrypt.compare(password, user.password);

        if (!validPassword) {
            return json({
                success: false,
                message: 'Username atau password salah'
            }, { status: 401 });
        }

        // Verifikasi role
        if (user.role !== 'admin') {
            return json({
                success: false,
                message: 'Akses ditolak. Hanya admin yang diperbolehkan login.'
            }, { status: 403 });
        }

        // Set session cookie dengan user ID
        cookies.set('session', user.id.toString(), {
            path: '/',
            httpOnly: true,
            sameSite: 'strict',
            secure: process.env.NODE_ENV === 'production',
            maxAge: 60 * 60 * 24 // 24 hours
        });

        // Return success response instead of redirect
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