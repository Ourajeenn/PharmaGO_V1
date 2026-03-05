import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || ''; // Use service role for real backend cron
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * Simulate a cron job that rotates pharmacy duty status
 * In a real production environment, this would be a Supabase Edge Function
 * or a scheduled worker that checks the official Ivoirian Pharmacy Council rosters.
 */
async function syncPharmacyDuty() {
    console.log('--- Starting Pharmacy Duty Sync ---');

    try {
        // 1. Fetch current pharmacies
        const { data: pharmacies, error: fetchError } = await supabase
            .from('pharmacies')
            .select('id, name, is_on_duty');

        if (fetchError) throw fetchError;
        if (!pharmacies) return;

        console.log(`Analyzing ${pharmacies.length} pharmacies...`);

        // 2. Logic simulation: Rotate duty 
        // (Here we just toggle some for demonstration, in reality, use a calendar)
        for (const pharmacy of pharmacies) {
            // Randomly toggle duty status to simulate rotation
            const newStatus = Math.random() > 0.7;

            const { error: updateError } = await supabase
                .from('pharmacies')
                .update({ is_on_duty: newStatus })
                .eq('id', pharmacy.id);

            if (updateError) {
                console.error(`Error updating ${pharmacy.name}:`, updateError.message);
            } else {
                console.log(`Updated ${pharmacy.name}: Duty Status -> ${newStatus}`);
            }
        }

        console.log('--- Sync Completed Successfully ---');
    } catch (error: any) {
        console.error('Critical sync failure:', error.message);
    }
}

syncPharmacyDuty();
