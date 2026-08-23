import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function inspectIdentities() {
  const client = await pool.connect();
  try {
    const users = await client.query('SELECT id, email FROM auth.users');
    console.log('Auth users:');
    users.rows.forEach((u) => console.log(`- ${u.email} (${u.id})`));

    const identities = await client.query('SELECT id, user_id, provider, identity_data FROM auth.identities');
    console.log('\nAuth identities:');
    identities.rows.forEach((i) => console.log(`- UserID: ${i.user_id} | Provider: ${i.provider} | Email: ${i.identity_data?.email}`));
  } finally {
    client.release();
    await pool.end();
  }
}

inspectIdentities().catch(console.error);
