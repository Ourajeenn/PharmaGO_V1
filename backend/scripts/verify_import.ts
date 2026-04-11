
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

const EXPORT_FILE_PATH = 'c:\\Users\\jenra\\Downloads\\PHARMA-GO_FINALE\\export_pharmacies_20260210_121639.json';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function verify() {
    console.log('🔍 Verifying Pharmacies Import...');

    const { count, error } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact', head: true });

    if (error) {
        console.error('❌ Error counting pharmacies:', error.message);
        return;
    }

    // Read local file for expected count
    let expectedCount = 0;
    try {
        const fileContent = fs.readFileSync(EXPORT_FILE_PATH, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        if (Array.isArray(jsonData)) expectedCount = jsonData.length;
        else if (jsonData.pharmacies) expectedCount = jsonData.pharmacies.length;
    } catch (e) { console.log('Could not read export file for count'); }

    console.log(`COUNT:${count}`);
}

verify();
