import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Calendar, Users, CreditCard, MapPin, BedDouble, AlertTriangle } from 'lucide-react';
import { useState } from 'react';
import { SAMPLE_RESERVATIONS } from '../../lib/mockData';
import { formatDateRange, formatDate, formatCurrency, calculateNights, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

export default function BookingDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showCancel, setShowCancel] = useState(false);

  const reservation = SAMPLE_RESERVATIONS.find((r) => r.id === id);

  if (!reservation) {
    return (
      <div className="empty-state">
        <BedDouble size={48} className="empty-state-icon" />
        <h3>Reserva no encontrada</h3>
        <button className="btn btn-primary" onClick={() => navigate('/account/bookings')}>
          Ver mis reservas
        </button>
      </div>
    );
  }

  const nights = calculateNights(reservation.check_in, reservation.check_out);
  const canCancel = ['pending', 'confirmed'].includes(reservation.status);

  return (
    <div>
      <button className="btn btn-ghost" onClick={() => navigate('/account/bookings')} style={{ marginBottom: 'var(--space-lg)' }}>
        <ArrowLeft size={16} /> Volver a mis reservas
      </button>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
          <div>
            <div className="text-overline" style={{ marginBottom: '0.125rem' }}>Reserva {reservation.reservation_code}</div>
            <h2 className="heading-3">{reservation.room_type}</h2>
          </div>
          <span className={cn('badge', getStatusBadgeClass(reservation.status))} style={{ fontSize: 'var(--text-sm)', padding: '0.375rem 0.75rem' }}>
            {getStatusLabel(reservation.status)}
          </span>
        </div>

        {/* Details grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--muted)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Estancia
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="flex items-center gap-xs">
                <Calendar size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}><strong>Check-in:</strong> {formatDate(reservation.check_in)}</span>
              </div>
              <div className="flex items-center gap-xs">
                <Calendar size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}><strong>Check-out:</strong> {formatDate(reservation.check_out)}</span>
              </div>
              <div className="flex items-center gap-xs">
                <BedDouble size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}><strong>Habitación:</strong> {reservation.room_number}</span>
              </div>
              <div className="flex items-center gap-xs">
                <Users size={16} style={{ color: 'var(--gold)' }} />
                <span style={{ fontSize: 'var(--text-sm)' }}><strong>Huéspedes:</strong> {reservation.adults} adulto{reservation.adults > 1 ? 's' : ''}</span>
              </div>
            </div>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
            <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--muted)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
              Pago
            </h3>
            <div className="flex flex-col gap-sm">
              <div className="booking-summary-row">
                <span>{nights} noche{nights > 1 ? 's' : ''}</span>
                <span>{formatCurrency(reservation.total_amount - reservation.tax_amount)}</span>
              </div>
              <div className="booking-summary-row">
                <span>Impuestos</span>
                <span>{formatCurrency(reservation.tax_amount)}</span>
              </div>
              <div className="booking-summary-total">
                <span>Total</span>
                <span>{formatCurrency(reservation.total_amount)}</span>
              </div>
              <div className="flex items-center gap-xs" style={{ marginTop: 'var(--space-xs)' }}>
                <CreditCard size={14} style={{ color: 'var(--gold)' }} />
                <span className={cn('badge', getStatusBadgeClass(reservation.payment.status))}>
                  {getStatusLabel(reservation.payment.status)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Guest info */}
        <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)', marginBottom: 'var(--space-xl)' }}>
          <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-sm)', fontWeight: 600, color: 'var(--muted)', marginBottom: 'var(--space-md)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Huésped principal
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Nombre</span><br />{reservation.guest.full_name}</div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Email</span><br />{reservation.guest.email}</div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Teléfono</span><br />{reservation.guest.phone}</div>
            <div><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>País</span><br /><div className="flex items-center gap-xs"><MapPin size={14} />{reservation.guest.country}</div></div>
          </div>
          {reservation.special_requests && (
            <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--warm-gray)' }}>
              <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Solicitud especial</span>
              <p style={{ fontSize: 'var(--text-sm)' }}>{reservation.special_requests}</p>
            </div>
          )}
        </div>

        {/* Cancel button */}
        {canCancel && (
          <div>
            {!showCancel ? (
              <button className="btn btn-danger" onClick={() => setShowCancel(true)}>
                <AlertTriangle size={16} /> Cancelar reserva
              </button>
            ) : (
              <div style={{ background: 'var(--error-light)', border: '1px solid var(--error)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-lg)' }}>
                <h4 style={{ color: 'var(--error)', marginBottom: 'var(--space-xs)' }}>¿Estás seguro?</h4>
                <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-dark)', marginBottom: 'var(--space-md)' }}>
                  Esta acción no se puede deshacer. Se procesará un reembolso completo.
                </p>
                <div className="flex gap-sm">
                  <button className="btn btn-danger btn-sm">Confirmar cancelación</button>
                  <button className="btn btn-ghost btn-sm" onClick={() => setShowCancel(false)}>No, mantener reserva</button>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
