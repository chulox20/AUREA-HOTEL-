import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function setAdmin() {
  const client = await pool.connect();
  try {
    await client.query("UPDATE profiles SET role = 'admin' WHERE email = 'figueroamarialourdes718@gmail.com'");
    const res = await client.query("SELECT id, email, role, full_name FROM profiles");
    console.log("Updated profiles:");
    res.rows.forEach(p => console.log(`- ${p.email}: ${p.role}`));
  } finally {
    client.release();
    await pool.end();
  }
}

setAdmin().catch(console.error);
