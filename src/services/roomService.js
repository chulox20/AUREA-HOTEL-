import { supabase } from '../lib/supabase';

export const roomService = {
  /**
   * Fetch all active room types with their amenities and images
   */
  async getRoomTypes() {
    const { data: roomTypes, error: rtError } = await supabase
      .from('room_types')
      .select(`
        *,
        room_type_amenities (
          amenities (
            id,
            name,
            icon,
            category
          )
        ),
        room_images (
          id,
          url,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq('is_active', true)
      .order('base_price', { ascending: true });

    if (rtError) {
      console.error('Error fetching room types:', rtError);
      throw rtError;
    }

    // Format amenities and images as clean arrays
    return (roomTypes || []).map((rt) => ({
      ...rt,
      amenities: (rt.room_type_amenities || [])
        .map((rta) => rta.amenities?.name)
        .filter(Boolean),
      amenityDetails: (rt.room_type_amenities || [])
        .map((rta) => rta.amenities)
        .filter(Boolean),
      images: (rt.room_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    }));
  },

  /**
   * Fetch single room type by slug
   */
  async getRoomTypeBySlug(slug) {
    const { data, error } = await supabase
      .from('room_types')
      .select(`
        *,
        room_type_amenities (
          amenities (
            id,
            name,
            icon,
            category
          )
        ),
        room_images (
          id,
          url,
          alt_text,
          is_primary,
          sort_order
        )
      `)
      .eq('slug', slug)
      .single();

    if (error) {
      console.error(`Error fetching room type with slug ${slug}:`, error);
      throw error;
    }

    return {
      ...data,
      amenities: (data.room_type_amenities || [])
        .map((rta) => rta.amenities?.name)
        .filter(Boolean),
      amenityDetails: (data.room_type_amenities || [])
        .map((rta) => rta.amenities)
        .filter(Boolean),
      images: (data.room_images || []).sort((a, b) => (a.sort_order || 0) - (b.sort_order || 0)),
    };
  },

  /**
   * Check real-time room availability for selected dates using PostgreSQL RPC
   */
  async checkRoomAvailability(roomTypeId, checkIn, checkOut, guests = 1) {
    const { data, error } = await supabase.rpc('check_room_availability', {
      p_room_type_id: roomTypeId,
      p_check_in: checkIn,
      p_check_out: checkOut,
      p_guests: Number(guests),
    });

    if (error) {
      console.error('Error checking room availability RPC:', error);
      throw error;
    }

    return data || []; // Array of available physical rooms: [{ room_id, room_number, floor }]
  },

  /**
   * ADMIN: Fetch all physical rooms
   */
  async getAdminRooms() {
    const { data, error } = await supabase
      .from('rooms')
      .select(`
        *,
        room_types (
          id,
          name,
          slug,
          base_price,
          capacity
        )
      `)
      .order('room_number', { ascending: true });

    if (error) {
      console.error('Error fetching admin rooms:', error);
      throw error;
    }

    return data || [];
  },

  /**
   * ADMIN: Create a new physical room
   */
  async createRoom(roomData) {
    const { data, error } = await supabase
      .from('rooms')
      .insert([roomData])
      .select(`
        *,
        room_types (
          id,
          name,
          slug,
          base_price
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * ADMIN: Update a physical room
   */
  async updateRoom(roomId, updates) {
    const { data, error } = await supabase
      .from('rooms')
      .update(updates)
      .eq('id', roomId)
      .select(`
        *,
        room_types (
          id,
          name,
          slug,
          base_price
        )
      `)
      .single();

    if (error) throw error;
    return data;
  },

  /**
   * ADMIN: Delete a physical room
   */
  async deleteRoom(roomId) {
    const { error } = await supabase
      .from('rooms')
      .delete()
      .eq('id', roomId);

    if (error) throw error;
    return true;
  },

  /**
   * ADMIN: Fetch all room types for administration
   */
  async getAdminRoomTypes() {
    const { data, error } = await supabase
      .from('room_types')
      .select(`
        *,
        room_type_amenities (
          amenity_id,
          amenities (
            id,
            name,
            icon
          )
        )
      `)
      .order('base_price', { ascending: true });

    if (error) throw error;

    return (data || []).map((rt) => ({
      ...rt,
      amenities: (rt.room_type_amenities || []).map((rta) => rta.amenities?.name).filter(Boolean),
    }));
  },

  /**
   * ADMIN: Update room type details
   */
  async updateRoomType(roomTypeId, updates) {
    const { data, error } = await supabase
      .from('room_types')
      .update(updates)
      .eq('id', roomTypeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
