import * as dotenv from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../.env') });

console.log('VITE_SUPABASE_URL:', process.env.VITE_SUPABASE_URL ? '✅ Loaded' : '❌ Missing');
console.log('VITE_SUPABASE_ANON_KEY:', process.env.VITE_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing');
console.log('Keys found:', Object.keys(process.env).filter(k => k.includes('SUPABASE')));
