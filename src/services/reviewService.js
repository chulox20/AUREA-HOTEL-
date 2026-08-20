import { supabase } from '../lib/supabase';

export const reviewService = {
  /**
   * Fetch visible reviews for a specific room type
   */
  async getReviewsForRoomType(roomTypeId) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('room_type_id', roomTypeId)
      .eq('is_visible', true)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching room reviews:', error);
      return [];
    }

    return (data || []).map((r) => ({
      ...r,
      user_name: r.profiles?.full_name || 'Huésped verificado',
      avatar_url: r.profiles?.avatar_url,
    }));
  },

  /**
   * Fetch top featured reviews for the Home page
   */
  async getFeaturedReviews(limit = 3) {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        profiles (
          full_name,
          avatar_url
        ),
        room_types (
          name
        )
      `)
      .eq('is_visible', true)
      .gte('rating', 4)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching featured reviews:', error);
      return [];
    }

    return (data || []).map((r) => ({
      ...r,
      user_name: r.profiles?.full_name || 'Huésped verificado',
      room_type: r.room_types?.name || 'Aurea Hotel',
      verified: true,
    }));
  },

  /**
   * Create a new verified review for a completed stay
   */
  async createReview({ userId, roomTypeId, reservationId, rating, comment }) {
    const { data, error } = await supabase
      .from('reviews')
      .insert([
        {
          user_id: userId,
          room_type_id: roomTypeId,
          reservation_id: reservationId,
          rating: Number(rating),
          comment: comment.trim(),
          is_visible: true,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating review:', error);
      throw error;
    }

    return data;
  },

  /**
   * ADMIN: Fetch all reviews
   */
  async getAdminReviews() {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        is_visible,
        created_at,
        profiles (
          id,
          full_name,
          email
        ),
        room_types (
          id,
          name
        )
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((r) => ({
      ...r,
      user_name: r.profiles?.full_name || r.profiles?.email || 'Huésped',
      room_type: r.room_types?.name || 'Habitación',
      verified: true,
    }));
  },

  /**
   * ADMIN: Toggle review visibility
   */
  async toggleReviewVisibility(reviewId, isVisible) {
    const { data, error } = await supabase
      .from('reviews')
      .update({ is_visible: isVisible })
      .eq('id', reviewId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};
