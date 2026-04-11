const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// Read env 
const envFile = fs.readFileSync('.env', 'utf8');
const lines = envFile.split('\n');
const anonKeyLine = lines.find(l => l.includes('SUPABASE_PUBLISHABLE_KEY=') || l.includes('SUPABASE_ANON_KEY='));
const anonKey = anonKeyLine ? anonKeyLine.split('=')[1].replace(/\"/g, '').replace(/\r/g, '').trim() : '';

const supabaseUrl = 'https://ijcyeozyapwuneyjylij.supabase.co';
const supabase = createClient(supabaseUrl, anonKey);

async function run() {
    console.log("Checking pharmacies on duty...");
    const { data, error, count } = await supabase
        .from('pharmacies')
        .select('*', { count: 'exact', head: true })
        .eq('is_on_duty', true);

    console.log('Pharmacies On Duty:', count);

    if (count === 0) {
        console.log("Updating some pharmacies to be on duty...");
        // Let's set 5 pharmacies to on duty
        const { data: allPharmacies } = await supabase.from('pharmacies').select('id, name, commune').limit(15);

        if (allPharmacies && allPharmacies.length > 0) {
            const idsToUpdate = allPharmacies.slice(0, 15).map(p => p.id);

            for (const id of idsToUpdate) {
                await supabase.from('pharmacies').update({ is_on_duty: true }).eq('id', id);
            }
            console.log("Updated 15 pharmacies to be on duty.");
        }
    } else {
        console.log("There are already pharmacies on duty.");
    }
}

run();
