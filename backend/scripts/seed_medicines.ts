
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as fs from 'fs'; // Just in case, though unused here

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

const MEDICATIONS_CATALOG = [
    { name: 'Doliprane 500mg', genericName: 'Paracétamol', category: 'Antalgique' },
    { name: 'Doliprane 1000mg', genericName: 'Paracétamol', category: 'Antalgique' },
    { name: 'Amoxicilline 500mg', genericName: 'Amoxicilline', category: 'Antibiotique' },
    { name: 'Amoxicilline 1g', genericName: 'Amoxicilline', category: 'Antibiotique' },
    { name: 'Efferalgan 500mg', genericName: 'Paracétamol', category: 'Antalgique' },
    { name: 'Ibuprofène 400mg', genericName: 'Ibuprofène', category: 'Anti-inflammatoire' },
    { name: 'Vitamines C 1000mg', genericName: 'Acide ascorbique', category: 'Vitamines' },
    { name: 'Oméprazole 20mg', genericName: 'Oméprazole', category: 'Antiacide' },
    { name: 'Metformine 500mg', genericName: 'Metformine', category: 'Antidiabétique' },
    { name: 'Amlodipine 5mg', genericName: 'Amlodipine', category: 'Antihypertenseur' },
    { name: 'Ciprofloxacine 500mg', genericName: 'Ciprofloxacine', category: 'Antibiotique' },
    { name: 'Prednisolone 20mg', genericName: 'Prednisolone', category: 'Corticoïde' },
];

async function seed() {
    console.log('💊 Seeding Medicines & Inventory...');

    // 1. Insert Medicines
    console.log('... Checking existing medicines');
    const { data: existingMeds } = await supabase.from('medicines').select('name, id');
    const existingNames = new Set(existingMeds?.map(m => m.name) || []);

    const newMeds = MEDICATIONS_CATALOG.filter(m => !existingNames.has(m.name));

    if (newMeds.length > 0) {
        console.log(`... Inserting ${newMeds.length} new medicines`);
        const { error: insertError } = await supabase
            .from('medicines')
            .insert(
                newMeds.map(m => ({
                    name: m.name,
                    generic_name: m.genericName,
                    category: m.category,
                    requires_prescription: m.category === 'Antibiotique' || m.category === 'Corticoïde'
                }))
            );

        if (insertError) {
            console.error('❌ Error creating medicines:', insertError);
            return;
        }
    } else {
        console.log('... All medicines already exist.');
    }

    // Refresh medicines list
    const { data: medicines, error: fetchError } = await supabase.from('medicines').select('*');
    if (fetchError || !medicines) {
        console.error('❌ Failed to fetch medicines for inventory assignment');
        return;
    }

    // 2. Assign Inventory to Random Pharmacies
    console.log('... Assigning Inventory to Pharmacies');

    // Get all pharmacies
    const { data: pharmacies } = await supabase.from('pharmacies').select('id');

    if (!pharmacies || pharmacies.length === 0) {
        console.error('❌ No pharmacies found to assign inventory to.');
        return;
    }

    let inventoryCount = 0;

    // For each pharmacy, assign some random medicines
    for (const pharmacy of pharmacies) {
        // Randomly select 3-8 medicines
        const numMeds = Math.floor(Math.random() * 6) + 3;
        const shuffled = [...medicines!].sort(() => 0.5 - Math.random());
        const selectedMeds = shuffled.slice(0, numMeds);

        const inventoryItems = selectedMeds.map(med => ({
            pharmacy_id: pharmacy.id,
            medicine_id: med.id,
            price: Math.floor(Math.random() * 5000) + 500, // 500 - 5500 FCFA
            quantity: Math.floor(Math.random() * 50) + 5,  // 5 - 55 units
            batch_number: `BATCH-${Math.floor(Math.random() * 10000)}`,
            expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() // +1 year
        }));

        // Check for existing items to avoid duplicates manually since upsert failed
        const { data: existingInv } = await supabase
            .from('pharmacy_inventory')
            .select('medicine_id')
            .eq('pharmacy_id', pharmacy.id);

        const existingMedIds = new Set(existingInv?.map(i => i.medicine_id) || []);
        const newItems = inventoryItems.filter(i => !existingMedIds.has(i.medicine_id));

        if (newItems.length > 0) {
            const { error: invError } = await supabase
                .from('pharmacy_inventory')
                .insert(newItems);

            if (invError) {
                console.log(`⚠️ Failed to set inventory for pharmacy ${pharmacy.id}:`, invError.message);
            } else {
                inventoryCount += newItems.length;
            }
        }

        // Progress dot
        process.stdout.write('.');
    }

    console.log(`\n✅ Seeded ${medicines?.length} medicines.`);
    console.log(`✅ Created ${inventoryCount} inventory records across ${pharmacies.length} pharmacies.`);
}

seed();
