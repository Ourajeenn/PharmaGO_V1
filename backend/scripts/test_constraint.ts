
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) { process.exit(1); }

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConstraint() {
    console.log('🧪 Testing 1-to-Many Constraint...');

    // 1. Get Admin User
    const { data: { users }, error } = await supabase.auth.admin.listUsers();
    // Wait, anon key cannot list users usually.
    // We'll just sign in as admin again.

    const ADMIN_EMAIL = 'admin@pharmago.ci';
    const ADMIN_PASSWORD = 'supersecureadminpassword123!';

    const { data: loginData } = await supabase.auth.signInWithPassword({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
    });

    if (!loginData.user) {
        console.log('❌ Could not log in as admin to test.');
        return;
    }

    const userId = loginData.user.id;
    console.log(`👤 Admin ID: ${userId}`);

    // 2. Try to insert two dummy pharmacies
    const p1 = {
        user_id: userId,
        name: "Test Pharma 1",
        address: "Test Address 1",
        latitude: 0,
        longitude: 0,
        is_on_duty: false,
        verified: true,
        opening_hours: {}
    };

    const p2 = {
        user_id: userId,
        name: "Test Pharma 2",
        address: "Test Address 2",
        latitude: 0,
        longitude: 0,
        is_on_duty: false,
        verified: true,
        opening_hours: {}
    };

    // Insert 1
    const { error: e1 } = await supabase.from('pharmacies').insert(p1);
    if (e1) console.log(`❌ Insert 1 failed: ${e1.message}`);
    else console.log('✅ Insert 1 success');

    // Insert 2
    const { error: e2 } = await supabase.from('pharmacies').insert(p2);
    if (e2) {
        console.log(`❌ Insert 2 failed: ${e2.message}`);
        console.log('ℹ️  Constraint Confirmed: 1 User = 1 Pharmacy');
    } else {
        console.log('✅ Insert 2 success');
        console.log('ℹ️  No Constraint: 1 User = Many Pharmacies');

        // Cleanup if success
        await supabase.from('pharmacies').delete().eq('name', 'Test Pharma 1');
        await supabase.from('pharmacies').delete().eq('name', 'Test Pharma 2');
    }
}

testConstraint();
