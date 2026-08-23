import pg from 'pg';

const pool = new pg.Pool({
  host: 'aws-0-us-east-2.pooler.supabase.com',
  port: 6543,
  user: 'postgres.nzwyvgsdiywdaufweame',
  password: 'AuroaHotel10066117',
  database: 'postgres',
  ssl: { rejectUnauthorized: false },
});

const ROOM_PHOTOS = {
  'standard-room': [
    'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=1600&q=85',
  ],
  'deluxe-room': [
    'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1566665797739-1674de7a421a?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
  ],
  'suite-ocean-view': [
    'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=1600&q=85',
  ],
  'presidential-suite': [
    'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1590381105924-c72589b9ef3f?auto=format&fit=crop&w=1600&q=85',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=1600&q=85',
  ],
};

async function seedRoomImages() {
  const client = await pool.connect();
  try {
    const roomTypes = await client.query('SELECT id, slug, name FROM room_types');
    console.log(`Found ${roomTypes.rows.length} room types.`);

    // Clear existing room_images
    await client.query('DELETE FROM room_images');

    for (const rt of roomTypes.rows) {
      const photos = ROOM_PHOTOS[rt.slug] || ROOM_PHOTOS['standard-room'];
      for (let i = 0; i < photos.length; i++) {
        await client.query(`
          INSERT INTO room_images (
            room_type_id,
            url,
            alt_text,
            is_primary,
            sort_order
          ) VALUES ($1, $2, $3, $4, $5)
        `, [
          rt.id,
          photos[i],
          `${rt.name} - Vista ${i + 1}`,
          i === 0,
          i,
        ]);
      }
      console.log(`✅ Seeded ${photos.length} HD photos for ${rt.name}`);
    }
  } finally {
    client.release();
    await pool.end();
  }
}

seedRoomImages().catch(console.error);
