import { supabase } from '../lib/supabase';

export const bookingService = {
  /**
   * Create a full reservation with guest details and payment record in Supabase
   */
  async createReservation({
    userId,
    roomId,
    checkIn,
    checkOut,
    adults = 1,
    children = 0,
    totalAmount,
    taxAmount = 0,
    specialRequests = '',
    guest,
    payment,
  }) {
    // 1. Insert reservation
    const { data: reservation, error: resError } = await supabase
      .from('reservations')
      .insert([
        {
          user_id: userId,
          room_id: roomId,
          check_in: checkIn,
          check_out: checkOut,
          adults: Number(adults),
          children: Number(children),
          status: 'confirmed',
          total_amount: Number(totalAmount),
          tax_amount: Number(taxAmount),
          special_requests: specialRequests || null,
        },
      ])
      .select(`
        *,
        rooms (
          id,
          room_number,
          floor,
          room_types (
            id,
            name,
            slug,
            base_price
          )
        )
      `)
      .single();

    if (resError) {
      console.error('Error inserting reservation in Supabase:', resError);
      throw resError;
    }

    // 2. Insert primary guest
    if (guest) {
      const { error: guestError } = await supabase.from('reservation_guests').insert([
        {
          reservation_id: reservation.id,
          full_name: `${guest.firstName || ''} ${guest.lastName || ''}`.trim() || guest.full_name,
          email: guest.email,
          phone: guest.phone,
          country: guest.country,
          is_primary: true,
        },
      ]);

      if (guestError) {
        console.error('Error inserting reservation guest:', guestError);
      }
    }

    // 3. Insert payment record
    if (payment) {
      const { error: payError } = await supabase.from('payments').insert([
        {
          reservation_id: reservation.id,
          paypal_order_id: payment.paypalOrderId || payment.id,
          paypal_capture_id: payment.paypalCaptureId || null,
          amount: Number(totalAmount),
          currency: payment.currency || 'USD',
          status: payment.status || 'paid',
          paid_at: new Date().toISOString(),
        },
      ]);

      if (payError) {
        console.error('Error inserting payment record:', payError);
      }
    }

    return reservation;
  },

  /**
   * Fetch all reservations for a specific customer
   */
  async getUserReservations(userId) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms (
          id,
          room_number,
          floor,
          room_types (
            id,
            name,
            slug,
            base_price
          )
        ),
        reservation_guests (
          id,
          full_name,
          email,
          phone,
          country
        ),
        payments (
          id,
          amount,
          currency,
          status,
          paid_at,
          paypal_order_id
        ),
        reviews (
          id,
          rating,
          comment
        )
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching user reservations:', error);
      throw error;
    }

    return (data || []).map((res) => ({
      ...res,
      room_type: res.rooms?.room_types?.name || 'Habitación',
      room_number: res.rooms?.room_number || '—',
      guest: res.reservation_guests?.[0] || {},
      payment: res.payments?.[0] || { status: 'pending' },
      review: res.reviews?.[0] || null,
    }));
  },

  /**
   * Fetch single reservation by ID
   */
  async getReservationById(reservationId) {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        rooms (
          id,
          room_number,
          floor,
          room_types (
            id,
            name,
            slug,
            base_price,
            size,
            beds
          )
        ),
        reservation_guests (
          id,
          full_name,
          email,
          phone,
          country
        ),
        payments (
          id,
          amount,
          currency,
          status,
          paid_at,
          paypal_order_id
        ),
        reviews (
          id,
          rating,
          comment
        )
      `)
      .eq('id', reservationId)
      .single();

    if (error) {
      console.error('Error fetching reservation by ID:', error);
      throw error;
    }

    return {
      ...data,
      room_type: data.rooms?.room_types?.name || 'Habitación',
      room_type_id: data.rooms?.room_types?.id,
      room_number: data.rooms?.room_number || '—',
      guest: data.reservation_guests?.[0] || {},
      payment: data.payments?.[0] || { status: 'pending' },
      review: data.reviews?.[0] || null,
    };
  },

  /**
   * Cancel a reservation (customer or admin)
   */
  async cancelReservation(reservationId) {
    const { data, error } = await supabase
      .from('reservations')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
      })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('Error cancelling reservation:', error);
      throw error;
    }

    return data;
  },

  /**
   * ADMIN: Fetch all reservations with optional filters
   */
  async getAdminReservations() {
    const { data, error } = await supabase
      .from('reservations')
      .select(`
        *,
        profiles (
          id,
          full_name,
          email
        ),
        rooms (
          id,
          room_number,
          floor,
          room_types (
            id,
            name,
            slug
          )
        ),
        reservation_guests (
          id,
          full_name,
          email,
          phone,
          country
        ),
        payments (
          id,
          amount,
          status,
          paypal_order_id
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching admin reservations:', error);
      throw error;
    }

    return (data || []).map((res) => ({
      ...res,
      room_type: res.rooms?.room_types?.name || '—',
      room_number: res.rooms?.room_number || '—',
      guest: res.reservation_guests?.[0] || { full_name: res.profiles?.full_name, email: res.profiles?.email },
      payment: res.payments?.[0] || { status: 'pending' },
    }));
  },

  /**
   * ADMIN: Update status (e.g. checked_in, checked_out)
   */
  async updateReservationStatus(reservationId, newStatus) {
    const { data, error } = await supabase
      .from('reservations')
      .update({ status: newStatus })
      .eq('id', reservationId)
      .select()
      .single();

    if (error) {
      console.error('Error updating reservation status:', error);
      throw error;
    }

    return data;
  },
};
