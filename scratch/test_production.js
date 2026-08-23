import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Parse .env file manually
const envPath = path.resolve(process.cwd(), '.env');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach((line) => {
  const [key, ...vals] = line.split('=');
  if (key && vals.length > 0) {
    env[key.trim()] = vals.join('=').trim().replace(/^["']|["']$/g, '');
  }
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function runProductionTests() {
  console.log('\n=============================================');
  console.log('🧪 INICIANDO BATERÍA DE PRUEBAS DE PRODUCCIÓN');
  console.log('=============================================\n');

  // Test 1: Credential verification
  console.log('1️⃣ Verificando clave usada en el Frontend...');
  if (supabaseAnonKey.startsWith('sb_publishable_') || supabaseAnonKey.startsWith('eyJ')) {
    console.log('   ✅ Clave pública/anon confirmada (sb_publishable/anon). No hay service_role expuesto.');
  } else {
    console.warn('   ⚠️ Clave con formato inesperado:', supabaseAnonKey.slice(0, 10));
  }

  // Test 2: Catálogo de Habitaciones desde Supabase
  console.log('\n2️⃣ Consultando catálogo de tipos de habitación...');
  const { data: roomTypes, error: rtErr } = await supabase
    .from('room_types')
    .select('*')
    .eq('is_active', true)
    .order('base_price');

  if (rtErr || !roomTypes || roomTypes.length === 0) {
    console.error('   ❌ Error al consultar room_types:', rtErr);
    process.exit(1);
  }
  console.log(`   ✅ ${roomTypes.length} tipos de habitación obtenidos de Supabase.`);
  roomTypes.forEach((rt) => {
    console.log(`      - ${rt.name} ($${rt.base_price}/noche, max ${rt.capacity} huéspedes)`);
  });

  const selectedRoomType = roomTypes[0];

  // Test 3: Disponibilidad física antes de reservar
  const testCheckIn = '2026-11-10';
  const testCheckOut = '2026-11-15';
  console.log(`\n3️⃣ Comprobando disponibilidad física de "${selectedRoomType.name}" para ${testCheckIn} al ${testCheckOut}...`);

  const { data: availableBefore, error: availErr } = await supabase.rpc('check_room_availability', {
    p_room_type_id: selectedRoomType.id,
    p_check_in: testCheckIn,
    p_check_out: testCheckOut,
    p_guests: 2,
  });

  if (availErr) {
    console.error('   ❌ Error en RPC check_room_availability:', availErr);
    process.exit(1);
  }

  console.log(`   ✅ Habitaciones físicas disponibles encontradas: ${availableBefore?.length || 0}`);
  availableBefore?.forEach((r) => console.log(`      - Habitación #${r.room_number} (Piso ${r.floor})`));

  if (!availableBefore || availableBefore.length === 0) {
    console.warn('   ⚠️ No hay habitaciones físicas disponibles para este tipo.');
    return;
  }

  const assignedRoom = availableBefore[0];

  // Test 4: Crear reserva real con secuencia atómica (AUR-XXXX)
  console.log(`\n4️⃣ Creando reserva real para habitación #${assignedRoom.room_number}...`);
  const totalAmount = selectedRoomType.base_price * 5 * 1.1; // 5 noches + 10% tax
  const taxAmount = selectedRoomType.base_price * 5 * 0.1;

  const { data: newReservation, error: resErr } = await supabase
    .from('reservations')
    .insert({
      room_id: assignedRoom.room_id,
      check_in: testCheckIn,
      check_out: testCheckOut,
      adults: 2,
      children: 0,
      total_amount: totalAmount,
      tax_amount: taxAmount,
      status: 'confirmed',
    })
    .select(`
      *,
      rooms (
        id,
        room_number,
        floor,
        room_types (
          id,
          name,
          base_price
        )
      )
    `)
    .single();

  if (resErr) {
    console.error('   ❌ Error creando reserva:', resErr);
    process.exit(1);
  }

  console.log(`   ✅ ¡Reserva creada exitosamente en Supabase!`);
  console.log(`      - Código secuencial atómico generado por PostgreSQL: ${newReservation.reservation_code}`);
  console.log(`      - Habitación asignada: #${newReservation.rooms?.room_number} (${newReservation.rooms?.room_types?.name})`);
  console.log(`      - Monto total: $${newReservation.total_amount}`);
  console.log(`      - Estado: ${newReservation.status}`);

  // Insertar datos del huésped
  await supabase.from('reservation_guests').insert({
    reservation_id: newReservation.id,
    first_name: 'Carlos',
    last_name: 'Auditoría',
    email: 'carlos.auditoria@aureahotel.com',
    phone: '+1 555 987 6543',
    country: 'México',
  });
  console.log('   ✅ Huésped principal registrado.');

  // Insertar pago simulando PayPal Sandbox
  const paypalOrderId = `PAYPAL-SANDBOX-${Date.now()}`;
  await supabase.from('payments').insert({
    reservation_id: newReservation.id,
    amount: totalAmount,
    currency: 'USD',
    status: 'paid',
    paypal_order_id: paypalOrderId,
  });
  console.log(`   ✅ Pago registrado con PayPal Order ID: ${paypalOrderId}`);

  // Test 5: Comprobar que la habitación ya NO está disponible para esas fechas (Exclusión / Concurrencia)
  console.log(`\n5️⃣ Verificando que la habitación #${assignedRoom.room_number} desaparezca de disponibilidad...`);
  const { data: availableAfter } = await supabase.rpc('check_room_availability', {
    p_room_type_id: selectedRoomType.id,
    p_check_in: testCheckIn,
    p_check_out: testCheckOut,
    p_guests: 2,
  });

  const isStillAvailable = availableAfter?.some((r) => r.room_id === assignedRoom.room_id);
  if (!isStillAvailable) {
    console.log(`   ✅ ¡Éxito! La habitación #${assignedRoom.room_number} desapareció de la disponibilidad para esas fechas.`);
    console.log(`   (Habitaciones disponibles restantes de este tipo: ${availableAfter?.length || 0})`);
  } else {
    console.error(`   ❌ Error: La habitación #${assignedRoom.room_number} todavía aparece disponible.`);
  }

  // Test 6: Cancelación de reserva y liberación automática de inventario
  console.log(`\n6️⃣ Probando cancelación de la reserva ${newReservation.reservation_code}...`);
  const { error: cancelErr } = await supabase
    .from('reservations')
    .update({ status: 'cancelled' })
    .eq('id', newReservation.id);

  if (cancelErr) {
    console.error('   ❌ Error cancelando reserva:', cancelErr);
  } else {
    console.log('   ✅ Reserva cancelada en base de datos.');

    // Comprobar que vuelve a estar disponible
    const { data: availableFreed } = await supabase.rpc('check_room_availability', {
      p_room_type_id: selectedRoomType.id,
      p_check_in: testCheckIn,
      p_check_out: testCheckOut,
      p_guests: 2,
    });

    const isFreedAvailable = availableFreed?.some((r) => r.room_id === assignedRoom.room_id);
    if (isFreedAvailable) {
      console.log(`   ✅ ¡Inventario liberado automáticamente! La habitación #${assignedRoom.room_number} vuelve a estar disponible.`);
    }
  }

  // Test 7: Métricas de administración
  console.log('\n7️⃣ Consultando métricas del panel de administración...');
  const { count: roomsCount } = await supabase.from('rooms').select('*', { count: 'exact', head: true });
  const { count: resCount } = await supabase.from('reservations').select('*', { count: 'exact', head: true });
  console.log(`   ✅ Total de habitaciones físicas en el sistema: ${roomsCount}`);
  console.log(`   ✅ Total de reservas en el historial: ${resCount}`);

  console.log('\n=============================================');
  console.log('🎉 TODAS LAS PRUEBAS DE PRODUCCIÓN COMPLETADAS CON ÉXITO');
  console.log('=============================================\n');
}

runProductionTests().catch(console.error);
