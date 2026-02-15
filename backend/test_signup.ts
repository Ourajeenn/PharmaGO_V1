
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) process.exit(1);

const supabase = createClient(supabaseUrl, supabaseKey);

import * as fs from 'fs';

const LOG_FILE = 'signup_test.log';
function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(LOG_FILE, msg + '\n');
}

async function testSignup() {
    log('🧪 Testing Signup...');

    // 1. Test Patient
    const patientEmail = `test_patient_${Date.now()}@pharmago.ci`;
    log(`\n1. Trying Patient Signup: ${patientEmail}`);

    const { data: pData, error: pError } = await supabase.auth.signUp({
        email: patientEmail,
        password: 'password123!',
        options: {
            data: {
                name: 'Test Patient',
                role: 'patient'
            }
        }
    });

    if (pError) log(`   ❌ Failed: ${pError.message}`);
    else log(`   ✅ Success: User ID ${pData.user?.id}`);

    // 2. Test Pharmacy
    const pharmacyEmail = `test_pharmacy_${Date.now()}@pharmago.ci`;
    log(`\n2. Trying Pharmacy Signup: ${pharmacyEmail}`);

    const { data: phData, error: phError } = await supabase.auth.signUp({
        email: pharmacyEmail,
        password: 'password123!',
        options: {
            data: {
                name: 'Test Pharmacy',
                role: 'pharmacy'
            }
        }
    });

    if (phError) log(`   ❌ Failed: ${phError.message}`);
    else log(`   ✅ Success: User ID ${phData.user?.id}`);

    // 3. Test Pharmacy without metadata
    const pharmaNoMetaEmail = `test_pharmacy_nometa_${Date.now()}@pharmago.ci`;
    log(`\n3. Trying Pharmacy Signup (No Metadata): ${pharmaNoMetaEmail}`);

    const { data: pmData, error: pmError } = await supabase.auth.signUp({
        email: pharmaNoMetaEmail,
        password: 'password123!'
    });

    if (pmError) log(`   ❌ Failed: ${pmError.message}`);
    else log(`   ✅ Success: User ID ${pmData.user?.id}`);
}

testSignup();
