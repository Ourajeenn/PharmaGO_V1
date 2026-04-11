
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs';
import path from 'path';

// Load environment variables
dotenv.config();

// Configuration Supabase
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
    auth: {
        autoRefreshToken: false,
        persistSession: false
    }
});

const DEFAULT_PASSWORD = 'password123!';
const LOG_FILE = 'seed_insurances.log';
const DATA_FILE_PATH = 'c:\\Users\\jenra\\Downloads\\PHARMA-GO_FINALE\\pharma-go-express-main\\frontend\\src\\data\\insurances.json';

function log(message: string) {
    console.log(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

async function seedInsurances() {
    log(`Current CWD: ${process.cwd()}`);
    log('🚀 Starting Insurance Import...');

    // Read JSON file
    let insuranceNames: string[] = [];
    try {
        log(`Checking path: ${DATA_FILE_PATH}`);
        if (!fs.existsSync(DATA_FILE_PATH)) {
            log(`❌ File not found at ${DATA_FILE_PATH}`);
            // Try alternate path just in case
            const altPath = path.resolve(process.cwd(), '../frontend/src/data/insurances.json');
            log(`Trying alternate: ${altPath}`);
            if (fs.existsSync(altPath)) {
                const fileContent = fs.readFileSync(altPath, 'utf-8');
                insuranceNames = JSON.parse(fileContent);
            } else {
                return;
            }
        } else {
            const fileContent = fs.readFileSync(DATA_FILE_PATH, 'utf-8');
            insuranceNames = JSON.parse(fileContent);
        }
    } catch (e) {
        log(`❌ Failed to read data file: ${e}`);
        return;
    }

    log(`📊 Found ${insuranceNames.length} insurances in JSON file.`);

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Get existing insurances to avoid duplicates
    const { data: existingInsurances } = await supabase
        .from('insurers')
        .select('company_name');

    // Normalize names for comparison (simple check)
    const existingNames = new Set(existingInsurances?.map(i => i.company_name) || []);

    for (const name of insuranceNames) {
        if (existingNames.has(name)) {
            skippedCount++;
            process.stdout.write('s');
            continue;
        }

        // Generate ID and Email
        // Simple hash or random ID for email ensuring uniqueness
        const idSuffix = Math.floor(Math.random() * 1000000);
        const email = `assurance_${idSuffix}@pharmago.ci`;

        // 1. Create User (Admin API)
        let userId: string | null = null;

        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
                name: name,
                role: 'insurer',
            }
        });

        if (createError) {
            log(`\n❌ Failed to create user for ${name}: ${createError.message}`);
            errorCount++;
            continue;
        } else if (userData.user) {
            userId = userData.user.id;
        }

        if (!userId) {
            errorCount++;
            continue;
        }

        // 2. Insert into Insurers Table
        const { error: insertError } = await supabase
            .from('insurers')
            .insert({
                user_id: userId,
                company_name: name,
                license_number: `INS-${idSuffix}`,
                verified: true
            });

        if (insertError) {
            log(`\n❌ Error inserting insurer ${name}: ${insertError.message}`);
            errorCount++;
        } else {
            // Also update user_profile just in case trigger didn't catch everything or we want ensuring role
            await supabase.from('user_profiles').upsert({
                id: userId,
                email: email,
                role: 'insurer',
                name: name,
                verified: true
            });

            process.stdout.write('.');
            importedCount++;
        }

        // Small delay
        await new Promise(r => setTimeout(r, 100));
    }

    log('\n==========================================');
    log(`🎉 Import Summary`);
    log(`Total in File: ${insuranceNames.length}`);
    log(`✅ Imported: ${importedCount}`);
    log(`⏭️ Skipped: ${skippedCount}`);
    log(`❌ Errors: ${errorCount}`);
    log('==========================================');
}

seedInsurances().catch(console.error);
