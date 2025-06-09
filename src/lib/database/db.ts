import Database from 'better-sqlite3';
import bcrypt from 'bcrypt';
import { DB_PATH } from '$lib/config/env';
import fs from 'fs';
import path from 'path';

console.log('Initializing database...');

// Ensure database directory exists
const dbDir = path.dirname(DB_PATH);
if (!fs.existsSync(dbDir)) {
    console.log(`Creating database directory: ${dbDir}`);
    fs.mkdirSync(dbDir, { recursive: true });
}

// Inisialisasi database
const db = new Database(DB_PATH, { verbose: console.log });

console.log('Creating tables if they don\'t exist...');

// Buat tabel users jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role TEXT NOT NULL DEFAULT 'user',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Buat tabel customers jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    expire_at DATETIME,
    maximum_device INTEGER DEFAULT 1,
    devices TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Migrasi: Tambah kolom device_name, os_version, dan fingerprint ke tabel customers
try {
    console.log('Checking for device columns in customers table...');
    // Cek apakah kolom device_name sudah ada
    const result = db.prepare(`
        SELECT COUNT(*) as count 
        FROM pragma_table_info('customers') 
        WHERE name = 'device_name'
    `).get() as { count: number };

    // Jika belum ada, tambahkan kolom-kolom baru
    if (result.count === 0) {
        console.log('Adding device columns to customers table...');
        db.exec(`
            ALTER TABLE customers ADD COLUMN device_name TEXT;
            ALTER TABLE customers ADD COLUMN os_version TEXT;
            ALTER TABLE customers ADD COLUMN fingerprint TEXT;
        `);
        console.log('Added device columns to customers table');
    } else {
        console.log('Device columns already exist in customers table');
    }
} catch (error) {
    console.error('Error during migration:', error);
}

console.log('Creating failed_customer_auth table if it doesn\'t exist...');

// Buat tabel failed_customer_auth jika belum ada
db.exec(`
  CREATE TABLE IF NOT EXISTS failed_customer_auth (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT NOT NULL,
    device_id TEXT,
    device_name TEXT,
    os_version TEXT,
    fingerprint TEXT,
    message TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Fungsi untuk menambahkan user
export function addUser(username: string, password: string, email: string, role: string = 'user') {
  const hashedPassword = bcrypt.hashSync(password, 10);
  const stmt = db.prepare('INSERT INTO users (username, password, email, role) VALUES (?, ?, ?, ?)');
  return stmt.run(username, hashedPassword, email, role);
}

// Fungsi untuk mendapatkan user berdasarkan username
export function getUserByUsername(username: string) {
  const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
  return stmt.get(username);
}

// Fungsi untuk verifikasi password
export function verifyPassword(password: string, hashedPassword: string) {
  return bcrypt.compareSync(password, hashedPassword);
}

// Fungsi untuk mendapatkan semua users
export function getAllUsers() {
  const stmt = db.prepare('SELECT id, username, email, role, created_at, updated_at FROM users');
  return stmt.all();
}

// Fungsi untuk customers
export function addCustomer(code: string, expireAt: string | null = null, maximumDevice: number = 1) {
  const stmt = db.prepare(
    'INSERT INTO customers (code, expire_at, maximum_device) VALUES (?, ?, ?)'
  );
  return stmt.run(code, expireAt, maximumDevice);
}

export function updateCustomer(id: number, code: string, expireAt: string | null = null, maximumDevice: number = 1) {
  const stmt = db.prepare(`
    UPDATE customers 
    SET code = ?, expire_at = ?, maximum_device = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `);
  return stmt.run(code, expireAt, maximumDevice, id);
}

export function deleteCustomer(id: number) {
  const stmt = db.prepare('DELETE FROM customers WHERE id = ?');
  return stmt.run(id);
}

export function getAllCustomers() {
  const stmt = db.prepare('SELECT * FROM customers');
  return stmt.all();
}

export function getCustomerByCode(code: string) {
  const stmt = db.prepare('SELECT * FROM customers WHERE code = ?');
  return stmt.get(code);
}

export function updateCustomerDevices(id: number, devices: string) {
  const stmt = db.prepare('UPDATE customers SET devices = ? WHERE id = ?');
  return stmt.run(devices, id);
}

export function updateCustomerDeviceInfo(
  id: number, 
  devices: string | null = null, 
  deviceName: string | null = null, 
  osVersion: string | null = null, 
  fingerprint: string | null = null
) {
  const stmt = db.prepare(`
    UPDATE customers 
    SET devices = ?, 
        device_name = ?, 
        os_version = ?, 
        fingerprint = ?,
        updated_at = CURRENT_TIMESTAMP 
    WHERE id = ?
  `);
  return stmt.run(devices, deviceName, osVersion, fingerprint, id);
}

export function logFailedAuth(
  code: string,
  deviceId: string | null,
  deviceName: string | null,
  osVersion: string | null,
  fingerprint: string | null,
  message: string
) {
  console.log('Attempting to log failed auth:', {
    code,
    deviceId,
    deviceName,
    osVersion,
    fingerprint,
    message
  });
  
  try {
    // First, verify the table exists
    const tableExists = db.prepare(`
      SELECT name 
      FROM sqlite_master 
      WHERE type='table' AND name='failed_customer_auth'
    `).get();

    if (!tableExists) {
      console.error('Failed customer auth table does not exist, creating it...');
      db.exec(`
        CREATE TABLE IF NOT EXISTS failed_customer_auth (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          code TEXT NOT NULL,
          device_id TEXT,
          device_name TEXT,
          os_version TEXT,
          fingerprint TEXT,
          message TEXT NOT NULL,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
      `);
    }

    // Now try to insert the record
    const stmt = db.prepare(`
      INSERT INTO failed_customer_auth 
      (code, device_id, device_name, os_version, fingerprint, message)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    const result = stmt.run(code, deviceId, deviceName, osVersion, fingerprint, message);
    console.log('Failed auth logged successfully:', result);
    
    // Verify the record was inserted
    const inserted = db.prepare('SELECT * FROM failed_customer_auth WHERE id = ?').get(result.lastInsertRowid);
    console.log('Inserted record:', inserted);
    
    return result;
  } catch (error) {
    console.error('Error logging failed auth:', error);
    console.error('Database state:', {
      open: db.open,
      memory: db.memory,
      readonly: db.readonly,
      name: db.name
    });
    throw error;
  }
}

// Inisialisasi admin user jika belum ada
const adminUser = getUserByUsername('admin');
if (!adminUser) {
  addUser('admin', 'admin123', 'admin@jkuis.com', 'admin');
}

export default db; 