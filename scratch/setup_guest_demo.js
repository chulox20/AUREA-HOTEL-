import pg from 'pg';
import crypto from 'crypto';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

async function setupGuestDemo() {
  const client = await pool.connect();
  try {
    // 1. Delete personal email
    await client.query("DELETE FROM profiles WHERE email = 'jmfiguera90@gmail.com'");
    await client.query("DELETE FROM auth.users WHERE email = 'jmfiguera90@gmail.com'");
    console.log('✅ Correo personal removido de la base de datos.');

    // 2. Create huesped@aureahotel.com
    const email = 'huesped@aureahotel.com';
    const password = 'Guest123!_Secure';
    const fullName = 'Huésped Demostración';

    const check = await client.query("SELECT id FROM auth.users WHERE email = $1", [email]);
    let userId = check.rows[0]?.id;

    if (userId) {
      await client.query(`
        UPDATE auth.users
        SET encrypted_password = crypt($1, gen_salt('bf')),
            email_confirmed_at = NOW()
        WHERE id = $2
      `, [password, userId]);
    } else {
      userId = crypto.randomUUID();
      await client.query(`
        INSERT INTO auth.users (
          id,
          instance_id,
          email,
          encrypted_password,
          email_confirmed_at,
          created_at,
          updated_at,
          raw_app_meta_data,
          raw_user_meta_data,
          aud,
          role
        ) VALUES (
          $1,
          '00000000-0000-0000-0000-000000000000',
          $2,
          crypt($3, gen_salt('bf')),
          NOW(),
          NOW(),
          NOW(),
          '{"provider":"email","providers":["email"]}',
          json_build_object('full_name', $4::text),
          'authenticated',
          'authenticated'
        )
      `, [userId, email, password, fullName]);
    }

    await client.query(`
      INSERT INTO profiles (
        id,
        email,
        full_name,
        role
      ) VALUES (
        $1,
        $2,
        $3,
        'customer'
      )
      ON CONFLICT (id) DO UPDATE
      SET email = $2,
          full_name = $3;
    `, [userId, email, fullName]);

    console.log(`✅ Cuenta de Huésped Demo creada:`);
    console.log(`- Email: ${email}`);
    console.log(`- Password: ${password}`);
  } finally {
    client.release();
    await pool.end();
  }
}

setupGuestDemo().catch(console.error);
