import Database from 'better-sqlite3';
// import { DB_PATH } from '$lib/config/env';

const db = new Database("src/lib/database/jkuis.db", { verbose: console.log });

// Helper function untuk get single row
export function getRow(sql: string, params: any[] = []) {
    return db.prepare(sql).get(params);
}

// Helper function untuk get multiple rows
export function getRows(sql: string, params: any[] = []) {
    return db.prepare(sql).all(params);
}

// Helper function untuk insert/update/delete
export function run(sql: string, params: any[] = []) {
    return db.prepare(sql).run(params);
}

export default db; 