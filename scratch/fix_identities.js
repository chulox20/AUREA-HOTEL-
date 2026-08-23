import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function fixIdentities() {
  const client = await pool.connect();
  try {
    const guestUser = (await client.query("SELECT id FROM auth.users WHERE email = 'huesped@aureahotel.com'")).rows[0];
    if (guestUser) {
      await client.query("DELETE FROM auth.identities WHERE user_id = $1::uuid", [guestUser.id]);
      await client.query(`
        INSERT INTO auth.identities (
          id,
          user_id,
          identity_data,
          provider,
          provider_id,
          last_sign_in_at,
          created_at,
          updated_at
        ) VALUES (
          $1::uuid,
          $1::uuid,
          json_build_object('sub', $1::text, 'email', 'huesped@aureahotel.com', 'email_verified', true),
          'email',
          $1::text,
          NOW(),
          NOW(),
          NOW()
        )
      `, [guestUser.id]);
      console.log('✅ Huésped identity inserted successfully with UUID id');
    }
  } finally {
    client.release();
    await pool.end();
  }
}

fixIdentities().catch(console.error);
