import { redirect, type Handle } from '@sveltejs/kit';
import { getRow } from '$lib/config/supabase';

interface User {
    id: string; // Changed to string since Supabase uses UUID
    username: string;
    role: string;
}

// Cache untuk menyimpan session yang valid
const sessionCache = new Map<string, {
    user: { username: string; role: string };
    timestamp: number;
}>();

// Waktu cache dalam milidetik (5 menit)
const CACHE_DURATION = 5 * 60 * 1000;

export const handle: Handle = async ({ event, resolve }) => {
    try {
        const path = event.url.pathname;
        
        // Skip session check for static assets and non-page requests
        if (path.startsWith('/assets') || 
            path.startsWith('/_app') || 
            path.startsWith('/favicon') ||
            path.includes('.')) {
            return await resolve(event);
        }

        // Allow public access to specific API endpoints
        if (path.startsWith('/api/customer-auth') || 
            path.startsWith('/api/failed-auth')) {
            return await resolve(event);
        }

        const session = event.cookies.get('session');
        console.log('Checking path:', path);
        
        const isAuthRoute = path.startsWith('/auth');
        const isLoginPage = path === '/login';
        const isPublicRoute = path === '/';
        const isAdminRoute = path.startsWith('/admin');
        let isValidSession = false;

        // Jika ada session, cek cache dulu sebelum query ke database
        if (session) {
            const cachedSession = sessionCache.get(session);
            const now = Date.now();

            // Jika ada di cache dan masih valid
            if (cachedSession && (now - cachedSession.timestamp) < CACHE_DURATION) {
                event.locals.user = cachedSession.user;
                isValidSession = true;
                
                // Redirect dari login ke admin hanya jika user mencoba akses login page
                if (isLoginPage) {
                    throw redirect(303, '/admin');
                }
            } else {
                try {
                    const user = await getRow('users', { id: session }) as User | undefined;
                    
                    if (user) {
                        // Update cache
                        const userData = {
                            username: user.username,
                            role: user.role
                        };
                        sessionCache.set(session, {
                            user: userData,
                            timestamp: now
                        });
                        
                        event.locals.user = userData;
                        isValidSession = true;
                        
                        // Redirect dari login ke admin hanya jika user mencoba akses login page
                        if (isLoginPage) {
                            throw redirect(303, '/admin');
                        }
                    } else {
                        // Session tidak valid, hapus cookie dan cache
                        event.cookies.delete('session', { path: '/' });
                        sessionCache.delete(session);
                        event.locals.user = undefined;
                        
                        if (!isPublicRoute && !isAuthRoute && !isLoginPage) {
                            throw redirect(303, '/login');
                        }
                    }
                } catch (dbError) {
                    console.error('Database error:', dbError);
                    event.cookies.delete('session', { path: '/' });
                    sessionCache.delete(session);
                    event.locals.user = undefined;
                    if (!isPublicRoute && !isAuthRoute && !isLoginPage) {
                        throw redirect(303, '/login');
                    }
                }
            }
        } else {
            // Tidak ada session
            event.locals.user = undefined;
            if (!isPublicRoute && !isAuthRoute && !isLoginPage) {
                throw redirect(303, '/login');
            }
        }

        // Jika mencoba akses halaman admin
        if (isAdminRoute) {
            // Cek session valid
            if (!isValidSession) {
                throw redirect(303, '/login');
            }
            // Cek role admin
            if (event.locals.user?.role !== 'admin') {
                throw redirect(303, '/login');
            }
            // Jika valid, lanjutkan ke halaman admin
            return await resolve(event);
        }

        const response = await resolve(event);
        return response;
    } catch (error) {
        if (error instanceof Response && error.status === 303) {
            return error;
        }
        throw error;
    }
}; 