import { createClient } from '@supabase/supabase-js'

import * as dotenv from 'dotenv';

dotenv.config();

// Configuration Supabase depuis .env
const supabaseUrl = process.env.VITE_SUPABASE_URL
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('🔍 Vérification de la base de données Supabase...\n')
console.log('URL:', supabaseUrl)
console.log('')

async function checkDatabase() {
    const results: { tables: any[], triggers: any[], functions: any[] } = {
        tables: [],
        triggers: [],
        functions: []
    }

    // Vérifier les tables
    console.log('📋 Vérification des tables...')
    const tables = ['user_profiles', 'doctors', 'pharmacies', 'drivers', 'patients', 'insurers', 'notifications']

    for (const table of tables) {
        try {
            const { data, error } = await supabase.from(table).select('id').limit(1)
            if (error) {
                console.log(`  ❌ ${table}: N'EXISTE PAS`)
                console.log(`     Erreur: ${error.message}`)
                results.tables.push({ name: table, exists: false, error: error.message })
            } else {
                console.log(`  ✅ ${table}: EXISTE`)
                results.tables.push({ name: table, exists: true })
            }
        } catch (err: any) {
            console.log(`  ❌ ${table}: ERREUR`)
            console.log(`     ${err.message}`)
            results.tables.push({ name: table, exists: false, error: err.message })
        }
    }

    console.log('\n📊 Résumé:')
    const existing = results.tables.filter(t => t.exists).length
    const missing = results.tables.filter(t => !t.exists).length
    console.log(`  ✅ Tables existantes: ${existing}/${tables.length}`)
    console.log(`  ❌ Tables manquantes: ${missing}/${tables.length}`)

    if (missing > 0) {
        console.log('\n⚠️  ACTION REQUISE:')
        console.log('  Les tables Supabase ne sont pas créées!')
        console.log('  Suivez le guide: doctor_registration_fix.md')
        console.log('\n  1. Allez sur https://supabase.com')
        console.log('  2. SQL Editor → New Query')
        console.log('  3. Copiez/collez EXECUTE_THIS_FIRST.sql')
        console.log('  4. Cliquez Run')
    } else {
        console.log('\n✅ Toutes les tables sont créées!')
        console.log('   L\'inscription devrait fonctionner.')
    }
}

checkDatabase().catch(console.error)
