import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function run() {
  const client = await pool.connect();
  try {
    const res = await client.query("SELECT id, email, email_confirmed_at FROM auth.users WHERE email = 'jmfiguera90@gmail.com'");
    console.log('User found in auth.users:', res.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

run().catch(console.error);
