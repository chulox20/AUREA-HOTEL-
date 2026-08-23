import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function compareUsers() {
  const client = await pool.connect();
  try {
    const users = await client.query('SELECT * FROM auth.users');
    console.log('--- USERS ---');
    console.log(users.rows);

    const identities = await client.query('SELECT * FROM auth.identities');
    console.log('--- IDENTITIES ---');
    console.log(identities.rows);
  } finally {
    client.release();
    await pool.end();
  }
}

compareUsers().catch(console.error);
