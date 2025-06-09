import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { 
    getCustomerByCode, 
    updateCustomerDeviceInfo,
    logFailedAuth 
} from '$lib/database/db';

interface Customer {
    id: number;
    code: string;
    expire_at: string | null;
    maximum_device: number;
    devices: string | null;
    device_name: string | null;
    os_version: string | null;
    fingerprint: string | null;
    created_at: string;
    updated_at: string;
}

interface AuthRequest {
    code: string;
    device_id: string;
    device_name?: string;
    os_version?: string;
    fingerprint?: string;
}

export const POST: RequestHandler = async ({ request }) => {
    const { 
        code, 
        device_id, 
        device_name, 
        os_version, 
        fingerprint 
    } = await request.json() as AuthRequest;

    // Validasi input
    if (!code || !device_id) {
        const message = 'Code dan device ID harus diisi';
        logFailedAuth(
            code || '', 
            device_id || null, 
            device_name || null, 
            os_version || null, 
            fingerprint || null, 
            message
        );
        return json({ 
            success: false, 
            message 
        }, { status: 400 });
    }

    // Cek kode customer
    const customer = getCustomerByCode(code) as Customer | undefined;
    
    if (!customer) {
        const message = 'Code tidak valid';
        logFailedAuth(
            code, 
            device_id, 
            device_name || null, 
            os_version || null, 
            fingerprint || null, 
            message
        );
        return json({ 
            success: false, 
            message 
        }, { status: 401 });
    }

    // Cek expired
    if (customer.expire_at && new Date(customer.expire_at) < new Date()) {
        const message = 'Code sudah expired';
        logFailedAuth(
            code, 
            device_id, 
            device_name || null, 
            os_version || null, 
            fingerprint || null, 
            message
        );
        return json({ 
            success: false, 
            message 
        }, { status: 401 });
    }

    // Cek devices
    const devices = customer.devices ? JSON.parse(customer.devices) : [];
    
    if (customer.maximum_device === 1) {
        // Jika maximum_device 1, device harus sama dengan yang terdaftar
        if (devices.length === 0) {
            // Device pertama, daftarkan dengan informasi lengkap
            updateCustomerDeviceInfo(
                customer.id, 
                JSON.stringify([device_id]),
                device_name,
                os_version,
                fingerprint
            );
        } else {
            // Cek device ID dan informasi device
            const deviceMatches = devices.includes(device_id);
            const deviceInfoMatches = (
                (!customer.device_name || customer.device_name === device_name) &&
                (!customer.os_version || customer.os_version === os_version) &&
                (!customer.fingerprint || customer.fingerprint === fingerprint)
            );

            if (!deviceMatches || !deviceInfoMatches) {
                const message = !deviceMatches 
                    ? 'Device ID tidak sesuai dengan yang terdaftar'
                    : 'Informasi device tidak sesuai dengan yang terdaftar';
                logFailedAuth(
                    code, 
                    device_id, 
                    device_name || null, 
                    os_version || null, 
                    fingerprint || null, 
                    message
                );
                return json({ 
                    success: false, 
                    message 
                }, { status: 401 });
            }
        }
    } else {
        // Jika maximum_device > 1, cek jumlah device
        if (!devices.includes(device_id)) {
            if (devices.length >= customer.maximum_device) {
                const message = 'Jumlah device sudah mencapai batas maksimum';
                logFailedAuth(
                    code, 
                    device_id, 
                    device_name || null, 
                    os_version || null, 
                    fingerprint || null, 
                    message
                );
                return json({ 
                    success: false, 
                    message 
                }, { status: 401 });
            }
            // Tambahkan device baru dengan informasi lengkap
            devices.push(device_id);
            updateCustomerDeviceInfo(
                customer.id,
                JSON.stringify(devices),
                device_name,
                os_version,
                fingerprint
            );
        } else {
            // Device sudah terdaftar, cek informasi device
            const deviceInfoMatches = (
                (!customer.device_name || customer.device_name === device_name) &&
                (!customer.os_version || customer.os_version === os_version) &&
                (!customer.fingerprint || customer.fingerprint === fingerprint)
            );

            if (!deviceInfoMatches) {
                const message = 'Informasi device tidak sesuai dengan yang terdaftar';
                logFailedAuth(
                    code, 
                    device_id, 
                    device_name || null, 
                    os_version || null, 
                    fingerprint || null, 
                    message
                );
                return json({ 
                    success: false, 
                    message 
                }, { status: 401 });
            }
        }
    }

    // Login berhasil
    return json({
        success: true,
        customer: {
            code: customer.code,
            expire_at: customer.expire_at,
            maximum_device: customer.maximum_device,
            device_name: customer.device_name,
            os_version: customer.os_version,
            fingerprint: customer.fingerprint
        }
    });
}; 