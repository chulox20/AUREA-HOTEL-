import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Calendar,
  Users,
  CreditCard,
  MapPin,
  BedDouble,
  AlertTriangle,
  Star,
  Send,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { bookingService } from '../../services/bookingService';
import { reviewService } from '../../services/reviewService';
import {
  formatDate,
  formatCurrency,
  calculateNights,
  getStatusBadgeClass,
  getStatusLabel,
  cn,
} from '../../lib/utils';
import toast from 'react-hot-toast';

export default function BookingDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [reservation, setReservation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancel, setShowCancel] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  // Review form states
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadReservation() {
      try {
        const data = await bookingService.getReservationById(id);
        if (isMounted) setReservation(data);
      } catch (err) {
        console.error('Error fetching reservation details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadReservation();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleCancelReservation = async () => {
    setCancelling(true);
    try {
      await bookingService.cancelReservation(id);
      toast.success('Reserva cancelada correctamente');
      setReservation((prev) => ({ ...prev, status: 'cancelled' }));
      setShowCancel(false);
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      toast.error('No se pudo cancelar la reserva.');
    } finally {
      setCancelling(false);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!comment.trim()) {
      toast.error('Por favor escribe un comentario.');
      return;
    }

    setSubmittingReview(true);
    try {
      const newReview = await reviewService.createReview({
        userId: user.id,
        roomTypeId: reservation.room_type_id,
        reservationId: reservation.id,
        rating,
        comment,
      });

      setReservation((prev) => ({ ...prev, review: newReview }));
      toast.success('¡Gracias por compartir tu experiencia!');
    } catch (err) {
      console.error('Error creating review:', err);
      toast.error(err.message || 'No se pudo registrar la reseña.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
        <div className="spinner spinner-md" />
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="empty-state">
        <BedDouble size={48} className="empty-state-icon" />
        <h3>Reserva no encontrada</h3>
        <p>No se encontró la reserva solicitada en tu cuenta.</p>
        <button className="btn btn-primary" onClick={() => navigate('/account/bookings')}>
          Ver mis reservas
        </button>
      </div>
    );
  }

  const nights = calculateNights(reservation.check_in, reservation.check_out);
  const canCancel = ['pending', 'confirmed'].includes(reservation.status);
  const isCompleted = reservation.status === 'checked_out';

  return (
    <div>
      <button
        className="btn btn-ghost"
        onClick={() => navigate('/account/bookings')}
        style={{ marginBottom: 'var(--space-lg)' }}
      >
        <ArrowLeft size={16} /> Volver a mis reservas
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div
          className="flex items-center justify-between flex-wrap gap-md"
          style={{ marginBottom: 'var(--space-xl)' }}
        >
          <div>
            <div className="text-overline" style={{ marginBottom: '0.125rem' }}>
              Reserva {reservation.reservation_code}
            </div>
            <h2 className="heading-3">{reservation.room_type}</h2>
          </div>
          <span
            className={cn('badge', getStatusBadgeClass(reservation.status))}
            style={{ fontSize: 'var(--text-sm)', padding: '0.375rem 0.75rem' }}
          >
            {getStatusLabel(reservation.status)}
          </span>
        </div>

        {/* Details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--muted)',
                marginBottom: 'var(--space-md)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Estancia
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-xs">
                <Calendar size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Check-in:</strong> {formatDate(reservation.check_in)}
                </span>
              </div>
              <div className="flex items-center gap-xs">
                <Calendar size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Check-out:</strong> {formatDate(reservation.check_out)}
                </span>
              </div>
              <div className="flex items-center gap-xs">
                <BedDouble size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Habitación:</strong> {reservation.room_number}
                </span>
              </div>
              <div className="flex items-center gap-xs">
                <Users size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}>
                  <strong>Huéspedes:</strong> {reservation.adults} adulto
                  {reservation.adults > 1 ? 's' : ''}
                </span>
              </div>
            </div>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
            }}
          >
            <h3
              style={{
                fontFamily: 'var(--font-sans)',
                fontSize: 'var(--text-sm)',
                fontWeight: 600,
                color: 'var(--muted)',
                marginBottom: 'var(--space-md)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}
            >
              Pago
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="booking-summary-row">
                <span>
                  {nights} noche{nights > 1 ? 's' : ''}
                </span>
                <span>
                  {formatCurrency(reservation.total_amount - (reservation.tax_amount || 0))}
                </span>
              </div>
              <div className="booking-summary-row">
                <span>Impuestos</span>
                <span>{formatCurrency(reservation.tax_amount || 0)}</span>
              </div>
              <div className="booking-summary-total">
                <span>Total</span>
                <span>{formatCurrency(reservation.total_amount)}</span>
              </div>
              <div className="flex items-center gap-xs" style={{ marginTop: 'var(--space-xs)' }}>
                <CreditCard size={14} style={{ color: 'var(--gold)' }} />
                <span className={cn('badge', getStatusBadgeClass(reservation.payment?.status))}>
                  {getStatusLabel(reservation.payment?.status || 'paid')}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest info */}
        <div
          style={{
            background: '#fff',
            border: '1px solid var(--warm-gray)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--space-lg)',
            marginBottom: 'var(--space-xl)',
          }}
        >
          <h3
            style={{
              fontFamily: 'var(--font-sans)',
              fontSize: 'var(--text-sm)',
              fontWeight: 600,
              color: 'var(--muted)',
              marginBottom: 'var(--space-md)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
            }}
          >
            Huésped principal
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-md)' }}>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Nombre</span>
              <br />
              {reservation.guest?.full_name || '—'}
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Email</span>
              <br />
              {reservation.guest?.email || '—'}
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Teléfono</span>
              <br />
              {reservation.guest?.phone || '—'}
            </div>
            <div>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>País</span>
              <br />
              <div className="flex items-center gap-xs">
                <MapPin size={14} />
                {reservation.guest?.country || '—'}
              </div>
            </div>
          </div>
          {reservation.special_requests && (
            <div
              style={{
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-md)',
                borderTop: '1px solid var(--warm-gray)',
              }}
            >
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                Solicitud especial
              </span>
              <p style={{ fontSize: 'var(--text-sm)', marginTop: '0.25rem' }}>
                {reservation.special_requests}
              </p>
            </div>
          )}
        </div>

        {/* Verified Review Section (Available if stay is checked_out) */}
        {isCompleted && (
          <div
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-lg)',
              marginBottom: 'var(--space-xl)',
            }}
          >
            <h3 className="heading-5" style={{ marginBottom: 'var(--space-sm)' }}>
              Tu reseña de la estancia
            </h3>

            {reservation.review ? (
              <div>
                <div className="flex items-center gap-xs" style={{ marginBottom: '0.5rem' }}>
                  <div className="star-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        size={16}
                        className={`star ${i < reservation.review.rating ? 'filled' : ''}`}
                        fill={i < reservation.review.rating ? 'var(--gold)' : 'none'}
                      />
                    ))}
                  </div>
                  <span style={{ fontWeight: 600 }}>{reservation.review.rating}/5</span>
                </div>
                <p style={{ color: 'var(--muted-dark)', fontStyle: 'italic' }}>
                  "{reservation.review.comment}"
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmitReview} className="flex flex-col gap-md">
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                  Como has completado tu estancia, puedes dejar una reseña verificada para este tipo de habitación.
                </p>
                <div>
                  <label className="form-label">Calificación</label>
                  <div className="flex gap-xs" style={{ cursor: 'pointer' }}>
                    {[1, 2, 3, 4, 5].map((val) => (
                      <Star
                        key={val}
                        size={24}
                        onClick={() => setRating(val)}
                        fill={val <= rating ? 'var(--gold)' : 'none'}
                        color={val <= rating ? 'var(--gold)' : 'var(--muted-light)'}
                      />
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Tu experiencia</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={3}
                    placeholder="Cuéntanos qué te pareció la habitación, el servicio y la estancia..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  />
                </div>
                <button
                  type="submit"
                  className="btn btn-primary"
                  style={{ alignSelf: 'flex-start' }}
                  disabled={submittingReview}
                >
                  {submittingReview ? (
                    <span className="spinner spinner-sm" />
                  ) : (
                    <>
                      <Send size={16} /> Publicar reseña
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Cancel button */}
        {canCancel && (
          <div>
            {!showCancel ? (
              <button className="btn btn-danger" onClick={() => setShowCancel(true)}>
                <AlertTriangle size={16} /> Cancelar reserva
              </button>
            ) : (
              <div
                style={{
                  background: 'var(--error-light)',
                  border: '1px solid var(--error)',
                  borderRadius: 'var(--radius-lg)',
                  padding: 'var(--space-lg)',
                }}
              >
                <h4 style={{ color: 'var(--error)', marginBottom: 'var(--space-xs)' }}>
                  ¿Estás seguro de cancelar esta reserva?
                </h4>
                <p
                  style={{
                    fontSize: 'var(--text-sm)',
                    color: 'var(--muted-dark)',
                    marginBottom: 'var(--space-md)',
                  }}
                >
                  Esta acción liberará la habitación para otros huéspedes.
                </p>
                <div className="flex gap-sm">
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleCancelReservation}
                    disabled={cancelling}
                  >
                    {cancelling ? <span className="spinner spinner-sm" /> : 'Confirmar cancelación'}
                  </button>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => setShowCancel(false)}
                    disabled={cancelling}
                  >
                    No, mantener reserva
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
