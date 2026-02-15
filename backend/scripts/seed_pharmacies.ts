
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import { realPharmacies } from '../../frontend/src/data/pharmacyData';
import * as fs from 'fs';

// Load environment variables
dotenv.config();

// Configuration Supabase
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

const LOG_FILE = 'seed_errors.log';

const EXPORT_FILE_PATH = 'c:\\Users\\jenra\\Downloads\\PHARMA-GO_FINALE\\export_pharmacies_20260210_121639.json';

function logError(message: string) {
    console.error(message);
    fs.appendFileSync(LOG_FILE, message + '\n');
}

async function seedPharmacies() {
    console.log('🚀 Starting Pharmacy Import (Full JSON Strategy)...');

    // Read JSON file
    let pharmaciesData = [];
    try {
        const fileContent = fs.readFileSync(EXPORT_FILE_PATH, 'utf-8');
        const jsonData = JSON.parse(fileContent);
        // Check if array or object wrapper
        if (Array.isArray(jsonData)) {
            pharmaciesData = jsonData;
        } else if (jsonData.pharmacies) {
            pharmaciesData = jsonData.pharmacies;
        } else if (jsonData.communes) {
            // Handle nested structure if needed, but export usually flat
            // base_pharmacies_abidjan.json had communes array
            // Let's assume export is flat list or we adapt
            console.log('Unknown JSON structure, keys:', Object.keys(jsonData));
            return;
        }
    } catch (e) {
        console.error('Failed to read export file:', e);
        return;
    }

    console.log(`📊 Found ${pharmaciesData.length} pharmacies in JSON file.`);

    let importedCount = 0;
    let skippedCount = 0;
    let errorCount = 0;

    // Get existing pharmacies to avoid duplicates (by name)
    const { data: existingPharmacies } = await supabase
        .from('pharmacies')
        .select('name');
    const existingNames = new Set(existingPharmacies?.map(p => p.name) || []);

    for (const pharmacy of pharmaciesData) {
        const pharmacyName = pharmacy.nom || pharmacy.name || pharmacy.legalName || "Pharmacie Inconnue";
        // Ensure ID or Generate generic ID
        const pharmacyId = pharmacy.id || Math.floor(Math.random() * 1000000);
        const email = `pharmacie_${pharmacyId}@pharmago.ci`;

        if (existingNames.has(pharmacyName)) {
            // console.log(`Skipping existing: ${pharmacyName}`);
            skippedCount++;
            process.stdout.write('s');
            continue;
        }

        // 1. Get or Create User (Admin API)
        let userId: string | null = null;

        // Try getting by email first to avoid error
        const { data: existingUser } = await supabase.auth.admin.listUsers();
        // listing all users might be slow if many, but for 500 it's ok-ish or we just try create and catch error
        // Actually listUsers is paginated. Better to try create and catch "already registered"

        // Better strategy: Try to create. If fails with "already exists", try to get user by email is hard without listUsers filter? 
        // Admin API doesn't have getUserByEmail directly in all versions, let's check.
        // It does usually. But for now, let's just try create.

        const { data: userData, error: createError } = await supabase.auth.admin.createUser({
            email: email,
            password: DEFAULT_PASSWORD,
            email_confirm: true,
            user_metadata: {
                name: pharmacyName,
                role: 'pharmacy',
                phone: pharmacy.telephone || 'N/A',
                license_number: `LIC-${pharmacyId}`,
                clinic_address: pharmacy.adresse || pharmacy.commune || 'Abidjan',
                owner_name: 'Admin Pharmago',
            }
        });

        if (createError) {
            // If user already exists, we need their ID to link pharmacy
            // The error message for existing user is usually "User already registered"
            if (createError.message.includes('already registered') || createError.status === 422) {
                // We can't easily get ID of existing user via Admin API without listing or signing in.
                // Let's sign in to get ID! (Since we know password)
                const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
                    email: email,
                    password: DEFAULT_PASSWORD,
                });

                if (loginData.user) {
                    userId = loginData.user.id;
                } else {
                    logError(`\n❌ User ${email} exists but cannot login to retrieve ID: ${loginError?.message}`);
                    errorCount++;
                    continue;
                }
            } else {
                logError(`\n❌ Failed to create admin user for ${pharmacyName}: ${createError.message}`);
                errorCount++;
                continue;
            }
        } else if (userData.user) {
            userId = userData.user.id;
        }

        if (!userId) {
            logError(`\n❌ Could not get user ID for ${pharmacyName}`);
            errorCount++;
            continue;
        }

        // 2. Ensure Profile
        // Trigger should handle it, but we explicit update to be sure of role
        const { error: profileError } = await supabase
            .from('user_profiles')
            .upsert({
                id: userId,
                email: email,
                role: 'pharmacy',
                verified: true,
                name: pharmacyName
            });

        // 3. Insert Pharmacy
        const dbPharmacy = {
            user_id: userId,
            name: pharmacyName,
            address: pharmacy.address || `${pharmacy.commune}, Abidjan`,
            latitude: pharmacy.coordinates?.lat || 0,
            longitude: pharmacy.coordinates?.lng || 0,
            is_on_duty: pharmacy.isOnGuard || false,
            verified: true,
            opening_hours: {
                hours: pharmacy.hours,
                phone: pharmacy.phone,
                services: pharmacy.services
            }
        };

        const { error: insertError } = await supabase
            .from('pharmacies')
            .insert(dbPharmacy);

        if (insertError) {
            // If error is duplicate key on user_id, it means this user already has a pharmacy.
            // We might have skipped the name check but hit the DB check.
            if (insertError.message.includes('pharmacies_user_id_key')) {
                skippedCount++;
                process.stdout.write('s');
            } else {
                logError(`\n❌ Error inserting pharmacy ${pharmacyName}: ${insertError.message}`);
                errorCount++;
            }
        } else {
            process.stdout.write('.');
            importedCount++;
        }

        // Small delay to be nice to the API
        await new Promise(r => setTimeout(r, 250));
    }

    console.log('\n==========================================');
    console.log(`🎉 Import Summary`);
    console.log(`Total in File: ${realPharmacies.length}`);
    console.log(`✅ Imported: ${importedCount}`);
    console.log(`⏭️ Skipped: ${skippedCount}`);
    console.log(`❌ Errors: ${errorCount}`);
    console.log('==========================================');
}

seedPharmacies().catch(console.error);
