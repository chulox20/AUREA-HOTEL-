import { motion } from 'framer-motion';
import { Star, Eye, EyeOff } from 'lucide-react';
import { SAMPLE_REVIEWS } from '../../lib/mockData';
import { formatDate, getInitials } from '../../lib/utils';
import { useState } from 'react';

export default function AdminReviews() {
  const [reviews, setReviews] = useState(SAMPLE_REVIEWS.map((r) => ({ ...r })));

  const toggleVisibility = (id) => {
    setReviews((prev) =>
      prev.map((r) => r.id === id ? { ...r, is_visible: r.is_visible === false ? true : false } : r)
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Reseñas</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {reviews.length} reseñas totales
          </p>
        </div>
      </div>

      <motion.div className="flex flex-col gap-md" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {reviews.map((review) => (
          <div key={review.id} style={{
            background: '#fff', border: '1px solid var(--warm-gray)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)',
            opacity: review.is_visible === false ? 0.5 : 1,
            transition: 'opacity 0.2s',
          }}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-sm">
                <div className="avatar avatar-sm">{getInitials(review.user_name)}</div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{review.user_name}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    {review.room_type} · {formatDate(review.created_at)}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-sm">
                <div className="star-rating">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className={`star ${i < review.rating ? 'filled' : ''}`} fill={i < review.rating ? 'var(--gold)' : 'none'} />
                  ))}
                </div>
                <button
                  className="btn btn-ghost btn-icon btn-sm"
                  onClick={() => toggleVisibility(review.id)}
                  title={review.is_visible === false ? 'Mostrar' : 'Ocultar'}
                >
                  {review.is_visible === false ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            <p style={{ marginTop: 'var(--space-sm)', fontSize: 'var(--text-sm)', color: 'var(--muted-dark)', lineHeight: 'var(--leading-relaxed)' }}>
              "{review.comment}"
            </p>

            {review.verified && (
              <div style={{ marginTop: 'var(--space-xs)', fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 500 }}>
                ✓ Estancia verificada
              </div>
            )}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
