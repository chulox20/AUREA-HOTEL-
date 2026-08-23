import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function changeAdminEmail() {
  const client = await pool.connect();
  try {
    // 1. Update auth.users
    await client.query(`
      UPDATE auth.users
      SET email = 'admin@aureahotel.com',
          encrypted_password = crypt('Admin123!_Secure', gen_salt('bf')),
          email_confirmed_at = NOW(),
          raw_user_meta_data = jsonb_set(COALESCE(raw_user_meta_data, '{}'::jsonb), '{full_name}', '"Administrador Aurea"')
      WHERE email = 'figueroamarialourdes718@gmail.com' OR email = 'admin@aureahotel.com';
    `);

    // 2. Update profiles
    await client.query(`
      UPDATE profiles
      SET email = 'admin@aureahotel.com',
          full_name = 'Administrador Aurea',
          role = 'admin'
      WHERE email = 'figueroamarialourdes718@gmail.com' OR email = 'admin@aureahotel.com';
    `);

    const res = await client.query('SELECT id, email, full_name, role FROM profiles');
    console.log('✅ Admin email successfully changed to admin@aureahotel.com:');
    res.rows.forEach((p) => console.log(`- ${p.email} | Role: ${p.role} | Name: ${p.full_name}`));
  } finally {
    client.release();
    await pool.end();
  }
}

changeAdminEmail().catch(console.error);
