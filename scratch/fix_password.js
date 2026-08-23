import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function fixPassword() {
  const client = await pool.connect();
  try {
    await client.query(`
      UPDATE auth.users
      SET encrypted_password = crypt('Guest123!_Secure', gen_salt('bf', 10)),
          confirmation_token = '',
          recovery_token = '',
          email_change_token_new = '',
          email_change = '',
          email_change_token_current = '',
          phone_change = '',
          phone_change_token = '',
          reauthentication_token = '',
          raw_user_meta_data = json_build_object(
            'sub', id::text,
            'email', 'huesped@aureahotel.com',
            'full_name', 'Huésped Demostración',
            'email_verified', true,
            'phone_verified', false
          )
      WHERE email = 'huesped@aureahotel.com';
    `);
    console.log('✅ Huésped updated with 10-round bcrypt password and tokens');
  } finally {
    client.release();
    await pool.end();
  }
}

fixPassword().catch(console.error);
