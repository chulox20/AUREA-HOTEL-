import { supabase } from '../lib/supabase';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export const adminService = {
  /**
   * Calculate live hotel metrics for the admin dashboard
   */
  async getDashboardMetrics() {
    const today = format(new Date(), 'yyyy-MM-dd');
    const monthStart = format(startOfMonth(new Date()), 'yyyy-MM-dd');
    const monthEnd = format(endOfMonth(new Date()), 'yyyy-MM-dd');

    // 1. Fetch all physical rooms count
    const { count: totalRooms } = await supabase
      .from('rooms')
      .select('*', { count: 'exact', head: true });

    // 2. Fetch all reservations
    const { data: reservations, error: resError } = await supabase
      .from('reservations')
      .select('id, check_in, check_out, status, total_amount, created_at');

    if (resError) throw resError;

    const allRes = reservations || [];

    // Metrics calculations
    const todayCreatedCount = allRes.filter(
      (r) => r.created_at && r.created_at.startsWith(today)
    ).length;

    const checkInsToday = allRes.filter(
      (r) => r.check_in === today && r.status === 'confirmed'
    ).length;

    const checkOutsToday = allRes.filter(
      (r) => r.check_out === today && r.status === 'checked_in'
    ).length;

    // Currently occupied rooms (checked_in or active stay today)
    const currentlyOccupied = allRes.filter(
      (r) =>
        (r.status === 'checked_in' || r.status === 'confirmed') &&
        r.check_in <= today &&
        r.check_out > today
    ).length;

    const occupancyRate = totalRooms > 0 ? Math.round((currentlyOccupied / totalRooms) * 100) : 0;

    // Revenue this month (from non-cancelled reservations)
    const monthRevenue = allRes
      .filter((r) => r.status !== 'cancelled' && r.check_in >= monthStart && r.check_in <= monthEnd)
      .reduce((sum, r) => sum + Number(r.total_amount || 0), 0);

    return {
      todayBookings: todayCreatedCount,
      occupancyRate,
      monthRevenue,
      checkInsToday,
      checkOutsToday,
      currentlyOccupied,
      totalRooms: totalRooms || 16,
    };
  },

  /**
   * Fetch customer directory with aggregated statistics
   */
  async getCustomersDirectory() {
    const { data: profiles, error: pError } = await supabase
      .from('profiles')
      .select(`
        id,
        full_name,
        email,
        phone,
        country,
        created_at,
        reservations (
          id,
          total_amount,
          status,
          check_in,
          check_out
        )
      `)
      .order('created_at', { ascending: false });

    if (pError) throw pError;

    return (profiles || []).map((p) => {
      const userRes = (p.reservations || []).filter((r) => r.status !== 'cancelled');
      const totalSpent = userRes.reduce((sum, r) => sum + Number(r.total_amount || 0), 0);
      const sortedStays = [...userRes].sort((a, b) => (b.check_in > a.check_in ? 1 : -1));
      const lastStay = sortedStays[0]?.check_out || '—';

      return {
        id: p.id,
        full_name: p.full_name || 'Sin nombre',
        email: p.email,
        phone: p.phone || '—',
        country: p.country || '—',
        total_bookings: userRes.length,
        total_spent: totalSpent,
        last_stay: lastStay,
      };
    });
  },

  /**
   * Fetch rooms and reservations for the Gantt occupancy calendar
   */
  async getCalendarData() {
    const [roomsRes, reservationsRes, roomTypesRes] = await Promise.all([
      supabase.from('rooms').select('*').order('room_number', { ascending: true }),
      supabase.from('reservations').select(`
        id,
        reservation_code,
        room_id,
        check_in,
        check_out,
        status,
        reservation_guests (
          full_name
        ),
        profiles (
          full_name
        )
      `).neq('status', 'cancelled'),
      supabase.from('room_types').select('id, name, slug').order('base_price', { ascending: true }),
    ]);

    if (roomsRes.error) throw roomsRes.error;
    if (reservationsRes.error) throw reservationsRes.error;
    if (roomTypesRes.error) throw roomTypesRes.error;

    const formattedReservations = (reservationsRes.data || []).map((res) => ({
      ...res,
      guest: {
        full_name: res.reservation_guests?.[0]?.full_name || res.profiles?.full_name || 'Huésped',
      },
    }));

    return {
      rooms: roomsRes.data || [],
      reservations: formattedReservations,
      roomTypes: roomTypesRes.data || [],
    };
  },
};
