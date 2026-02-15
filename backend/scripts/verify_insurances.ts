
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function verify() {
    console.log('🔍 Verifying Insurance Import...');

    const { count, error } = await supabase
        .from('insurers')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error:', error.message);
    } else {
        console.log(`✅ Total Insurers in DB: ${count}`);
    }
}

verify();
