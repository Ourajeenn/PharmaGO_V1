import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Supabase configuration
const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to wait
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

interface PharmacyData {
    region: string;
    department: string;
    city: string;
    category: string;
    name: string;
    manager_name: string;
    address: string;
    airp_source: boolean;
    verified: boolean;
}

// Extract pharmacies from AIRP page (Abidjan only)
async function extractAbidjanPharmacies(): Promise<PharmacyData[]> {
    console.log('\n🌐 Extracting Abidjan pharmacies from AIRP...');
    console.log('URL: https://airp.ci/datapharma/liste-des-etablissements/officines-privees-de-pharmacie');

    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
        const page = await browser.newPage();
        await page.goto(
            'https://airp.ci/datapharma/liste-des-etablissements/officines-privees-de-pharmacie',
            { waitUntil: 'networkidle2', timeout: 60000 }
        );

        console.log('⏳ Waiting for page to load...');
        await delay(5000);

        // Use the search function to filter for Abidjan
        console.log('🔍 Filtering for Abidjan pharmacies...');
        try {
            // Type "ABIDJAN" in the search box
            const searchInput = await page.$('input[type="search"]');
            if (searchInput) {
                await searchInput.type('ABIDJAN');
                await delay(2000); // Wait for filter to apply
            }
        } catch (error) {
            console.warn('⚠️  Could not use search filter');
        }

        // Try to select "Tous" to load all filtered results
        console.log('📊 Loading all Abidjan entries...');
        try {
            await page.click('.q-select');
            await delay(1000);

            // Click "Tous" option via JavaScript
            await page.evaluate(() => {
                const options = Array.from(document.querySelectorAll('.q-item__label'));
                const tousOption = options.find(el => el.textContent?.trim() === 'Tous');
                if (tousOption && tousOption.parentElement) {
                    (tousOption.parentElement as HTMLElement).click();
                }
            });

            console.log('⏳ Waiting for all data to load...');
            await delay(10000);
        } catch (error) {
            console.warn('⚠️  Could not select "Tous", will paginate through results');
        }

        // Extract all Abidjan pharmacies (handle pagination if needed)
        console.log('📥 Extracting pharmacy data...');
        const pharmacies: PharmacyData[] = [];
        let hasMorePages = true;
        let pageNumber = 1;
        const maxPages = 50; // Safety limit

        while (hasMorePages && pageNumber <= maxPages) {
            // Extract data from current page
            const pageData = await page.evaluate(() => {
                const results: any[] = [];
                const table = document.querySelector('table');
                if (!table) return results;

                const rows = table.querySelectorAll('tbody tr');
                rows.forEach(row => {
                    const cells = Array.from(row.querySelectorAll('td')).map(
                        td => td.textContent?.trim() || ''
                    );

                    if (cells.length >= 6) {
                        const region = cells[0] || '';

                        // Only include if region contains "ABIDJAN"
                        if (region.toUpperCase().includes('ABIDJAN')) {
                            results.push({
                                region: region,
                                department: cells[1] || '',
                                city: cells[2] || '',
                                category: cells[3] || 'OFFICINES PRIVEES DE PHARMACIE',
                                name: cells[4] || '',
                                manager_name: cells[5] || '',
                                address: cells[6] || cells[2] || '', // Use city as fallback if address is empty
                                airp_source: true,
                                verified: true
                            });
                        }
                    }
                });

                return results;
            });

            pharmacies.push(...pageData);
            console.log(`   Page ${pageNumber}: Extracted ${pageData.length} Abidjan pharmacies (Total: ${pharmacies.length})`);

            // Check if there's a next page
            const hasNext = await page.evaluate(() => {
                const nextButton = document.querySelector('.q-pagination__content button:last-child');
                return nextButton && !nextButton.hasAttribute('disabled');
            });

            if (hasNext && pageData.length > 0) {
                // Click next page
                try {
                    await page.evaluate(() => {
                        const nextButton = document.querySelector('.q-pagination__content button:last-child') as HTMLElement;
                        if (nextButton) nextButton.click();
                    });
                    await delay(2000);
                    pageNumber++;
                } catch (error) {
                    hasMorePages = false;
                }
            } else {
                hasMorePages = false;
            }
        }

        console.log(`✅ Extracted ${pharmacies.length} Abidjan pharmacies total`);
        return pharmacies;

    } finally {
        await browser.close();
    }
}

// Insert pharmacies into Supabase in batches
async function insertPharmacies(pharmacies: PharmacyData[]) {
    console.log(`\n💾 Inserting ${pharmacies.length} pharmacies into database...`);

    const batchSize = 50;
    let inserted = 0;
    let errors = 0;

    for (let i = 0; i < pharmacies.length; i += batchSize) {
        const batch = pharmacies.slice(i, i + batchSize);

        try {
            const { data, error } = await supabase
                .from('pharmacies')
                .insert(batch)
                .select();

            if (error) {
                console.error(`❌ Error inserting batch ${i / batchSize + 1}:`, error.message);
                errors += batch.length;
            } else {
                inserted += batch.length;
                console.log(`✅ Inserted batch ${i / batchSize + 1}/${Math.ceil(pharmacies.length / batchSize)} (${inserted}/${pharmacies.length})`);
            }
        } catch (error: any) {
            console.error(`❌ Exception inserting batch ${i / batchSize + 1}:`, error.message);
            errors += batch.length;
        }
    }

    console.log(`\n📊 Summary:`);
    console.log(`   ✅ Successfully inserted: ${inserted}`);
    console.log(`   ❌ Errors: ${errors}`);
    console.log(`   📈 Total processed: ${pharmacies.length}`);
}

// Main execution
async function main() {
    console.log('🚀 Starting AIRP Abidjan pharmacy data extraction...\n');
    console.log('='.repeat(60));

    try {
        // Extract Abidjan pharmacies
        const pharmacies = await extractAbidjanPharmacies();

        if (pharmacies.length === 0) {
            console.error('❌ No Abidjan pharmacies extracted. Please check the page structure.');
            process.exit(1);
        }

        // Insert into database
        await insertPharmacies(pharmacies);

        console.log('\n✅ Extraction and insertion completed successfully!');
        console.log('='.repeat(60));

    } catch (error: any) {
        console.error('\n❌ Fatal error:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Run the script
main();
