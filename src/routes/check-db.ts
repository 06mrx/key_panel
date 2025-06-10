import { supabase } from '$lib/config/supabase';

async function checkDatabase() {
    try {
        // Test connection
        const { data: testData, error: testError } = await supabase
            .from('failed_customer_auth')
            .insert({
                code: 'test',
                device_id: 'test',
                device_name: 'test',
                os_version: 'test',
                fingerprint: 'test',
                message: 'Test message'
            })
            .select()
            .single();

        if (testError) {
            console.error('Test write error:', testError);
            return;
        }

        console.log('Test write successful:', testData);

        // Read all records
        const { data: records, error: readError } = await supabase
            .from('failed_customer_auth')
            .select('*');

        if (readError) {
            console.error('Read error:', readError);
            return;
        }

        console.log('All records:', records);

    } catch (error) {
        console.error('Database check error:', error);
    }
}

checkDatabase(); 