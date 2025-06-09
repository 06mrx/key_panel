import db from '$lib/database/db';

// Test data
const testData = {
    code: 'mrx',
    device_id: 'ddd',
    device_name: 'ddd',
    os_version: 'ddd',
    fingerprint: 'ddd'
};

// Make the request to the customer auth endpoint
fetch('http://localhost:5173/api/customer-auth', {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(testData)
})
.then(response => response.json())
.then(data => {
    console.log('Response:', data);
    
    // Check the failed auth records
    const failedAuths = db.prepare('SELECT * FROM failed_customer_auth').all();
    console.log('Failed Auth Records:', failedAuths);
})
.catch(error => {
    console.error('Error:', error);
}); 