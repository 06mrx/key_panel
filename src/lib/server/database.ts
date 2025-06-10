import bcrypt from 'bcrypt';
import { supabase, getRow, getRows, insertRow, updateRow, deleteRow } from '$lib/config/supabase';

// User related functions
export async function getUserByUsername(username: string) {
    return await getRow('users', { username });
}

export async function addUser(username: string, password: string, email: string, role: string = 'user') {
    const hashedPassword = await bcrypt.hash(password, 10);
    return await insertRow('users', {
        username,
        password: hashedPassword,
        email,
        role
    });
}

// Customer related functions
export async function addCustomer(code: string, expireAt: string | null = null, maximumDevice: number = 1) {
    return await insertRow('customers', {
        code,
        expire_at: expireAt,
        maximum_device: maximumDevice,
        devices: '[]'
    });
}

export async function updateCustomer(id: number, data: any) {
    return await updateRow('customers', { id }, data);
}

export async function deleteCustomer(id: number) {
    return await deleteRow('customers', { id });
}

export async function getAllCustomers() {
    return await getRows('customers');
}

export async function getCustomerByCode(code: string) {
    return await getRow('customers', { code });
}

export async function updateCustomerDevices(id: number, devices: string) {
    return await updateRow('customers', { id }, { devices });
}

export async function logFailedAuth(
    code: string,
    deviceId: string | null,
    deviceName: string | null,
    osVersion: string | null,
    fingerprint: string | null,
    message: string
) {
    return await insertRow('failed_customer_auth', {
        code,
        device_id: deviceId,
        device_name: deviceName,
        os_version: osVersion,
        fingerprint,
        message
    });
}

export async function getFailedAuthLogs() {
    return await getRows('failed_customer_auth');
}

// Initialize admin user if it doesn't exist
async function initializeAdmin() {
    const adminUser = await getUserByUsername('admin');
    if (!adminUser) {
        await addUser('admin', 'admin123', 'admin@jkuis.com', 'admin');
    }
}

initializeAdmin(); 