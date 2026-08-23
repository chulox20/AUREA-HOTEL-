import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const envContent = fs.readFileSync(path.resolve(process.cwd(), '.env'), 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length > 0) {
    env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testLogins() {
  console.log('🧪 Probando login de Admin...');
  const { data: adminData, error: adminErr } = await supabase.auth.signInWithPassword({
    email: 'admin@aureahotel.com',
    password: 'Admin123!_Secure',
  });
  if (adminErr) console.error('❌ Error Admin:', adminErr);
  else console.log('✅ Admin login exitoso! User ID:', adminData.user.id);

  console.log('\n🧪 Probando login de Huésped...');
  const { data: guestData, error: guestErr } = await supabase.auth.signInWithPassword({
    email: 'huesped@aureahotel.com',
    password: 'Guest123!_Secure',
  });
  if (guestErr) console.error('❌ Error Huésped:', guestErr);
  else console.log('✅ Huésped login exitoso! User ID:', guestData.user.id);
}

testLogins().catch(console.error);
