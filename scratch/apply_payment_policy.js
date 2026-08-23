import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function applyFixes() {
  const client = await pool.connect();
  try {
    console.log('Connected to PostgreSQL via pooler.');

    await client.query(`
      DROP POLICY IF EXISTS "Users can insert payments for their own reservations" ON payments;
      CREATE POLICY "Users can insert payments for their own reservations" ON payments
        FOR INSERT WITH CHECK (
          EXISTS (
            SELECT 1 FROM reservations
            WHERE reservations.id = reservation_id AND reservations.user_id = auth.uid()
          )
        );
    `);
    console.log('✅ Added "Users can insert payments for their own reservations" policy.');

    // Also verify if there is an admin user created in profiles
    const res = await client.query(`
      SELECT id, email, role, full_name FROM profiles;
    `);
    console.log('Current profiles in database:');
    res.rows.forEach((p) => {
      console.log(`- ${p.email} | Role: ${p.role} | Name: ${p.full_name}`);
    });
  } finally {
    client.release();
    await pool.end();
  }
}

applyFixes().catch(console.error);
