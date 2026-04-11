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

async function verify() {
    console.log('🔍 Thorough database verification...');

    // Total count
    const { count: totalCount, error: countError } = await supabase
        .from('medicines')
        .select('*', { count: 'exact', head: true });

    if (countError) {
        console.error('❌ Error fetching total count:', countError);
    } else {
        console.log(`📊 Total medicines in table: ${totalCount}`);
    }

    // AIRP count
    const { count: airpCount, error: airpError } = await supabase
        .from('medicines')
        .select('*', { count: 'exact', head: true })
        .eq('airp_source', true);

    if (airpError) {
        console.error('❌ Error fetching AIRP count:', airpError);
    } else {
        console.log(`📊 Total AIRP medicines: ${airpCount}`);
    }

    // List some recent entries
    const { data: recent, error: recentError } = await supabase
        .from('medicines')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

    if (recentError) {
        console.error('❌ Error fetching recent:', recentError);
    } else {
        console.log('\n📅 Recent entries:');
        recent.forEach((r, i) => {
            console.log(`[${i + 1}] ${r.name} (Source: ${r.airp_source}, AMM: ${r.amm_number})`);
        });
    }
}

verify();
