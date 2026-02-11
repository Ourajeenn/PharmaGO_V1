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
    console.log('🔍 Verifying AIRP data in Supabase (Simple)...');

    // Get samples
    const { data: samples, error: sampleError } = await supabase
        .from('medicines')
        .select('name, amm_number, dci, country_of_origin')
        .eq('airp_source', true)
        .limit(5);

    if (sampleError) {
        console.error('❌ Error fetching samples:', sampleError);
        return;
    }

    if (!samples || samples.length === 0) {
        console.log('⚠️ No AIRP medicines found.');
        return;
    }

    console.log('\n🧪 Data Samples:');
    samples.forEach((s, i) => {
        console.log(`\n[${i + 1}] ${s.name}`);
        console.log(`    AMM: ${s.amm_number}`);
        console.log(`    DCI: ${s.dci}`);
        console.log(`    Origin: ${s.country_of_origin}`);
    });

    console.log('\n✅ Verification sample successful!');
}

verify();
