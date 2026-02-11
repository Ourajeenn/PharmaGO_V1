import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials in .env file');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

function formatAIRPDate(dateStr: string) {
    if (!dateStr || !dateStr.includes('-')) return null;
    const parts = dateStr.split('-');
    if (parts.length === 3) {
        // Assume DD-MM-YYYY (AIRP format) -> YYYY-MM-DD (Postgres format)
        // Check if first part is a year (YYYY-MM-DD already)
        if (parts[0].length === 4) return dateStr;
        return `${parts[2]}-${parts[1]}-${parts[0]}`;
    }
    return dateStr;
}

async function selectRowsPerPage(page: any, target: string = '50') {
    return await page.evaluate(async (target: string) => {
        try {
            const selects = Array.from(document.querySelectorAll('.q-select, .q-table__select')) as HTMLElement[];
            if (selects.length > 0) {
                selects[0].click();
                await new Promise(r => setTimeout(r, 1000));
                const options = Array.from(document.querySelectorAll('.q-item, [role="option"]'));
                const opt = options.find(el => el.textContent?.trim() === target) as HTMLElement;
                if (opt) {
                    opt.click();
                    return true;
                }
            }
        } catch (e) { }
        return false;
    }, target);
}

async function uploadBatch(items: any[]) {
    if (items.length === 0) return;

    const uniqueItems = Array.from(new Map(items.map(item => [item.amm_number, item])).values());

    const { error } = await supabase.from('medicines').insert(uniqueItems.map(item => ({
        ...item,
        amm_acquisition_date: formatAIRPDate(item.amm_acquisition_date),
        amm_expiration_date: formatAIRPDate(item.amm_expiration_date),
        requires_prescription: item.product_type === 'medication',
        category: item.product_type === 'medication' ? 'Médicaments' : 'Parapharmacie'
    })));

    if (error) {
        console.error(`   ❌ Upload error: ${error.message}`);
        if (error.details) console.error(`      Details: ${error.details}`);
    } else {
        console.log(`   ✅ Uploaded batch of ${uniqueItems.length} items`);
    }
}

async function extractFromUrl(url: string, type: string) {
    console.log(`\n🌐 URL: ${url}`);
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });

    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
        await delay(5000);

        await selectRowsPerPage(page, '50');
        await delay(3000);

        let pageNum = 1;
        let hasNextPage = true;
        let totalFound = 0;

        while (hasNextPage) {
            console.log(`   📄 Page ${pageNum}...`);

            const batch = await page.evaluate((productType) => {
                const rows = Array.from(document.querySelectorAll('tbody tr'));
                return rows.map(row => {
                    const cells = Array.from(row.querySelectorAll('td')).map(c => c.textContent?.trim() || '');
                    if (cells.length < 4) return null;
                    const med: any = {
                        amm_number: cells[0],
                        amm_acquisition_date: cells[1],
                        amm_expiration_date: cells[2],
                        name: cells[3],
                        product_type: productType,
                        airp_source: true
                    };
                    const headers = Array.from(document.querySelectorAll('thead th')).map(th => th.textContent?.trim() || '');
                    const dciIdx = headers.findIndex(h => h.toLowerCase().includes('dci'));
                    const labIdx = headers.findIndex(h => h.toLowerCase().includes('titulaire'));
                    const countryIdx = headers.findIndex(h => h.toLowerCase().includes('pays'));
                    if (dciIdx !== -1) med.dci = cells[dciIdx] || null;
                    if (labIdx !== -1) med.manufacturer = cells[labIdx] || null;
                    if (countryIdx !== -1) med.country_of_origin = cells[countryIdx] || null;
                    return med;
                }).filter(m => m !== null);
            }, type);

            if (batch.length > 0) {
                await uploadBatch(batch);
                totalFound += batch.length;
                console.log(`      Current items in DB for this segment: ${totalFound}`);
            }

            const nextClicked = await page.evaluate(async () => {
                try {
                    const controls = Array.from(document.querySelectorAll('.q-table__control'));
                    const paginationCtrl = controls.find(c => c.textContent?.includes(' sur '));
                    if (paginationCtrl) {
                        const btns = paginationCtrl.querySelectorAll('.q-btn');
                        const next = btns[2] as HTMLElement;
                        if (next && !next.getAttribute('disabled') && !next.classList.contains('disabled')) {
                            next.click();
                            return true;
                        }
                    }
                } catch (e) { }
                return false;
            });

            if (nextClicked) {
                pageNum++;
                await delay(2500);
                if (pageNum % 5 === 0) await selectRowsPerPage(page, '50');
            } else {
                hasNextPage = false;
                console.log('      Reached last page.');
            }
        }
    } finally {
        await browser.close();
    }
}

async function main() {
    console.log('🚀 Starting AIRP Clean Extraction (with date parsing)...');
    try {
        console.log('🧹 Cleaning existing AIRP data...');
        await supabase.from('medicines').delete().eq('airp_source', true);

        const url1 = 'https://airp.ci/datapharma/liste-des-medicaments-enregistres';
        const url2 = 'https://airp.ci/datapharma/liste-des-phytomedicaments-enregistres-et-complenments-alimentaires';

        await extractFromUrl(url1, 'medication');
        await extractFromUrl(url2, 'phytomedicine');

        console.log('\n✨ All data successfully imported!');
    } catch (err: any) {
        console.error('\n❌ Fatal Error:', err.message);
    }
}

main();
