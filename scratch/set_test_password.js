import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function setPassword() {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS pgcrypto;
      UPDATE auth.users
      SET encrypted_password = crypt('Admin123!_Secure', gen_salt('bf')),
          email_confirmed_at = NOW()
      WHERE email = 'figueroamarialourdes718@gmail.com';
    `);
    console.log('✅ Updated password and confirmed email for figueroamarialourdes718@gmail.com');
  } finally {
    client.release();
    await pool.end();
  }
}

setPassword().catch(console.error);
