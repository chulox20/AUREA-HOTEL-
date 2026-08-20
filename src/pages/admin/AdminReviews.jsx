import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, Eye, EyeOff } from 'lucide-react';
import { reviewService } from '../../services/reviewService';
import { formatDate, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadReviews = async () => {
    try {
      const data = await reviewService.getAdminReviews();
      setReviews(data);
    } catch (err) {
      console.error('Error fetching admin reviews:', err);
      toast.error('Error al cargar las reseñas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const toggleVisibility = async (id, currentVisibility) => {
    const nextVisibility = !currentVisibility;
    try {
      await reviewService.toggleReviewVisibility(id, nextVisibility);
      setReviews((prev) =>
        prev.map((r) => (r.id === id ? { ...r, is_visible: nextVisibility } : r))
      );
      toast.success(`Reseña ${nextVisibility ? 'visible' : 'oculta'} públicamente`);
    } catch (err) {
      console.error('Error toggling review visibility:', err);
      toast.error('No se pudo actualizar la visibilidad');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Moderación de Reseñas</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {reviews.length} opiniones de huéspedes registradas
          </p>
        </div>
      </div>

      <motion.div className="flex flex-col gap-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {reviews.length === 0 ? (
          <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--muted)' }}>
            No hay reseñas publicadas todavía.
          </div>
        ) : (
          reviews.map((review) => (
            <div
              key={review.id}
              style={{
                background: '#fff',
                border: '1px solid var(--warm-gray)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--space-lg)',
                opacity: review.is_visible === false ? 0.5 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-sm">
                  <div className="avatar avatar-sm">{getInitials(review.user_name)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>
                      {review.user_name}
                    </div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                      {review.room_type} · {formatDate(review.created_at)}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-sm">
                  <div className="star-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={14}
                        className={`star ${i < review.rating ? 'filled' : ''}`}
                        fill={i < review.rating ? 'var(--gold)' : 'none'}
                      />
                    ))}
                  </div>
                  <button
                    className="btn btn-ghost btn-icon btn-sm"
                    onClick={() => toggleVisibility(review.id, review.is_visible)}
                    title={review.is_visible === false ? 'Mostrar públicamente' : 'Ocultar'}
                  >
                    {review.is_visible === false ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <p style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--muted-dark)' }}>
                "{review.comment}"
              </p>
            </div>
          ))
        )}
      </motion.div>
    </div>
  );
}
