import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkRLS() {
    console.log('🔍 Checking permissions for "medicines" table...');

    // Try a simple insert of one test record
    const testMed = {
        name: 'TEST_INSERT_' + Date.now(),
        amm_number: 'TEST_AMM',
        airp_source: true,
        product_type: 'medication',
        category: 'Test'
    };

    console.log('Attempting to insert test record:', testMed);
    const { data, error } = await supabase
        .from('medicines')
        .insert([testMed])
        .select();

    if (error) {
        console.error('❌ Insert failed!', error);
        if (error.code === '42501') {
            console.error('   Hint: This is an RLS permission error (Insufficient Privilege).');
        }
    } else {
        console.log('✅ Insert successful!', data);

        // Clean up
        const { error: deleteError } = await supabase
            .from('medicines')
            .delete()
            .eq('name', testMed.name);

        if (deleteError) {
            console.warn('⚠️ Cleanup failed (Normal if RLS allows insert but not delete)');
        }
    }
}

checkRLS();
