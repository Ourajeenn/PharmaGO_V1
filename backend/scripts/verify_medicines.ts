
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(process.env.VITE_SUPABASE_URL!, process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!);

async function verify() {
    console.log('🔍 Verifying Medicines & Inventory...');

    const { count: medCount } = await supabase.from('medicines').select('*', { count: 'exact', head: true });
    const { count: invCount } = await supabase.from('pharmacy_inventory').select('*', { count: 'exact', head: true });

    console.log(`💊 Medicines Catalog: ${medCount}`);
    console.log(`📦 Inventory Records: ${invCount}`);
}

verify();
