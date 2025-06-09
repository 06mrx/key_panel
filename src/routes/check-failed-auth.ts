import db from '$lib/database/db';

const failedAuths = db.prepare('SELECT * FROM failed_customer_auth').all();
console.log('Failed Auth Records:', failedAuths);

export {}; 