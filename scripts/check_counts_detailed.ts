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

async function checkCounts() {
    console.log('📊 Database Counts:');

    // Total
    const { count: total } = await supabase.from('medicines').select('*', { count: 'exact', head: true });
    console.log(`Total Medicines: ${total}`);

    // AIRP Source
    const { count: airpTotal } = await supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('airp_source', true);
    console.log(`AIRP Source (Total): ${airpTotal}`);

    // By Type
    const types = ['medication', 'phytomedicine', 'supplement'];
    for (const type of types) {
        const { count } = await supabase.from('medicines').select('*', { count: 'exact', head: true }).eq('product_type', type).eq('airp_source', true);
        console.log(`- AIRP ${type}: ${count}`);
    }

    // Recent entries sample
    const { data: recent } = await supabase.from('medicines').select('name, product_type, amm_number').eq('airp_source', true).order('created_at', { ascending: false }).limit(5);
    console.log('\nRecent AIRP entries:');
    recent?.forEach(r => console.log(`- ${r.name} (${r.product_type}) [AMM: ${r.amm_number}]`));
}

checkCounts();
