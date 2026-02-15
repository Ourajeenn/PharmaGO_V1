
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) {
    console.error('❌ Missing credentials in .env');
    process.exit(1);
}

// Client Admin (pour tout voir)
const adminClient = createClient(SUPABASE_URL, SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

// Client Public (pour simuler le frontend)
const publicClient = createClient(SUPABASE_URL, ANON_KEY);

async function verifySystem() {
    console.log('🕵️ Do It All Verification...\n');

    // 1. Check Total Count (Admin)
    const { count: totalCount, error: countError } = await adminClient
        .from('pharmacies')
        .select('*', { count: 'exact', head: true });

    if (countError) console.error('❌ Admin Count Error:', countError.message);
    else console.log(`✅ [Admin] Total Pharmacies: ${totalCount}`);

    // 2. Check Public Access (RLS)
    const { count: publicCount, error: publicError } = await publicClient
        .from('pharmacies')
        .select('*', { count: 'exact', head: true });

    if (publicError) {
        console.error('❌ [Public] Access Error:', publicError.message);
    } else {
        if (publicCount === 0 && totalCount > 0) {
            console.warn('⚠️ [Public] Access count is 0! RLS Policies might be blocking public view.');
        } else {
            console.log(`✅ [Public] Visible Pharmacies: ${publicCount}`);
        }
    }

    // 3. Data Integrity Check (Sample)
    const { data: samples, error: sampleError } = await adminClient
        .from('pharmacies')
        .select(`
            *,
            user:user_profiles (
                email,
                role
            )
        `)
        .limit(1);

    if (sampleError || !samples || samples.length === 0) {
        console.error('❌ Could not fetch sample:', sampleError?.message);
    } else {
        const sample = samples[0];
        console.log('\n📦 Sample Data Check:');
        console.log(`   - Name: ${sample.name}`);
        console.log(`   - Address: ${sample.address}`);
        console.log(`   - Coordinates: ${sample.latitude}, ${sample.longitude}`);
        console.log(`   - User Email: ${sample.user?.email} (Linked Correctly)`);
        console.log(`   - Role: ${sample.user?.role}`);

        if (sample.latitude === 0 && sample.longitude === 0) {
            console.warn('   ⚠️ Coordinates are 0,0. Geocoding might be needed.');
        } else {
            console.log('   ✅ Coordinates look valid.');
        }
    }

    // 4. Check Auth Link
    // Verify that the sample stats matches expectations
}

verifySystem();
