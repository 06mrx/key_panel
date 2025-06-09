const fs = require('fs').promises;
const Database = require('better-sqlite3');

async function checkDatabase() {
    try {
        // Check if database file exists
        const dbPath = 'src/lib/database/jkuis.db';
        const stats = await fs.stat(dbPath);
        console.log('Database file exists:', {
            size: stats.size,
            permissions: stats.mode,
            created: stats.birthtime,
            modified: stats.mtime
        });

        // Initialize database connection
        const db = new Database(dbPath, { verbose: console.log });

        // Try to write a test record
        const testStmt = db.prepare(`
            INSERT INTO failed_customer_auth 
            (code, device_id, device_name, os_version, fingerprint, message)
            VALUES (?, ?, ?, ?, ?, ?)
        `);
        const result = testStmt.run(
            'test',
            'test',
            'test',
            'test',
            'test',
            'Test message'
        );
        console.log('Test write successful:', result);

        // Read all records
        const records = db.prepare('SELECT * FROM failed_customer_auth').all();
        console.log('All records:', records);

    } catch (error) {
        console.error('Database check error:', error);
    }
}

checkDatabase(); 