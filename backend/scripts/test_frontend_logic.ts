
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
    process.env.VITE_SUPABASE_URL!,
    process.env.VITE_SUPABASE_SERVICE_ROLE_KEY!
);

async function testFrontendLogic() {
    console.log('🧪 Testing Frontend Data Flow...');

    // 1. Test getAllPharmacies (Mocking PharmacyService logic)
    console.log('\n--- 1. Testing Pharmacy List (Map Data) ---');
    const { data: pharmacies, error: pharmError } = await supabase
        .from('pharmacies')
        .select(`
            *,
            pharmacy_inventory (
                price,
                quantity,
                medicine:medicines (
                    name,
                    generic_name,
                    category
                )
            )
        `)
        .limit(5);

    if (pharmError) {
        console.error('❌ Error fetching pharmacies:', pharmError);
    } else {
        console.log(`✅ Fetched ${pharmacies?.length} pharmacies.`);
        if (pharmacies && pharmacies.length > 0) {
            const sample = pharmacies[0];
            console.log('Sample Pharmacy:', {
                name: sample.name,
                inventoryCount: sample.pharmacy_inventory.length,
                firstItem: sample.pharmacy_inventory[0]
            });

            if (sample.pharmacy_inventory.length > 0 && sample.pharmacy_inventory[0].medicine) {
                console.log('✅ Inventory Join Successful');
            } else {
                console.log('⚠️ Inventory Join Empty or Malformed');
            }
        }
    }

    // 2. Test getRecommendations logic
    console.log('\n--- 2. Testing Recommendations (Home Page) ---');
    const { data: recommendations, error: recError } = await supabase
        .from('pharmacy_inventory')
        .select(`
            price,
            medicine:medicines (
                id,
                name,
                category,
                description
            )
        `)
        .gt('quantity', 0)
        .limit(5);

    if (recError) {
        console.error('❌ Error fetching recommendations:', recError);
    } else {
        console.log(`✅ Fetched ${recommendations?.length} recommendation items.`);
        if (recommendations && recommendations.length > 0) {
            console.log('Sample Recommendation:', recommendations[0]);
            if (recommendations[0].medicine) {
                console.log('✅ Medicine Join Successful');
            } else {
                console.log('⚠️ Medicine Join Failed');
            }
        }
    }
}

testFrontendLogic();
