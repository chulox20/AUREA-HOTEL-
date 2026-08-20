import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft, ArrowRight, Check, BedDouble, Calendar,
  Users, CreditCard, MapPin,
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { useAuth } from '../../contexts/AuthContext';
import { formatCurrency, formatDateRange, calculateNights, cn } from '../../lib/utils';

const guestSchema = z.object({
  firstName: z.string().min(2, 'Mínimo 2 caracteres'),
  lastName: z.string().min(2, 'Mínimo 2 caracteres'),
  email: z.string().email('Email no válido'),
  phone: z.string().min(8, 'Teléfono no válido'),
  country: z.string().min(2, 'Selecciona un país'),
  specialRequests: z.string().optional(),
});

const steps = [
  { id: 1, label: 'Resumen', icon: BedDouble },
  { id: 2, label: 'Datos', icon: Users },
  { id: 3, label: 'Pago', icon: CreditCard },
  { id: 4, label: 'Confirmación', icon: Check },
];

export default function BookingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, profile, devLogin } = useAuth();
  const {
    roomType, checkIn, checkOut, adults, children, pricing,
    guest, currentStep, setStep, setGuestInfo, setReservation,
  } = useBooking();

  const nights = calculateNights(checkIn, checkOut);

  const {
    register, handleSubmit, formState: { errors },
  } = useForm({
    resolver: zodResolver(guestSchema),
    defaultValues: {
      firstName: profile?.full_name?.split(' ')[0] || guest.firstName,
      lastName: profile?.full_name?.split(' ').slice(1).join(' ') || guest.lastName,
      email: profile?.email || guest.email,
      phone: profile?.phone || guest.phone,
      country: profile?.country || guest.country,
      specialRequests: guest.specialRequests,
    },
  });

  if (!roomType) {
    return (
      <div className="page">
        <div className="container section">
          <div className="empty-state">
            <BedDouble size={48} className="empty-state-icon" />
            <h3>No has seleccionado una habitación</h3>
            <p>Por favor, selecciona una habitación antes de continuar con la reserva.</p>
            <button className="btn btn-primary" onClick={() => navigate('/rooms')}>
              Ver habitaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="page">
        <div className="container section">
          <div className="empty-state">
            <Users size={48} className="empty-state-icon" />
            <h3>Inicia sesión para reservar</h3>
            <p>Necesitas una cuenta para completar tu reserva.</p>
            <div className="flex gap-md justify-center">
              <button className="btn btn-primary" onClick={() => devLogin('customer')}>
                Iniciar sesión (demo)
              </button>
              <button className="btn btn-secondary" onClick={() => navigate('/rooms')}>
                Volver
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const onGuestSubmit = (data) => {
    setGuestInfo(data);
    setStep(3);
  };

  const handlePayment = () => {
    // Simulate PayPal payment
    const reservation = {
      id: 'res-demo',
      reservation_code: `AUR-${Math.floor(1000 + Math.random() * 9000)}`,
      room_type: roomType.name,
      room_number: '201',
      check_in: checkIn,
      check_out: checkOut,
      adults,
      children,
      total_amount: pricing.total,
      tax_amount: pricing.tax,
      status: 'confirmed',
      payment_status: 'paid',
      created_at: new Date().toISOString(),
    };
    setReservation(reservation);
    setStep(4);
  };

  return (
    <div className="page">
      <div className="container section-sm">
        <div className="booking-page">
          {/* Steps indicator */}
          <div className="booking-steps">
            {steps.map((step, i) => (
              <div key={step.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-sm)' }}>
                <div className={cn('booking-step', currentStep === step.id && 'active', currentStep > step.id && 'completed')}>
                  <div className="booking-step-number">
                    {currentStep > step.id ? <Check size={14} /> : step.id}
                  </div>
                  <span>{step.label}</span>
                </div>
                {i < steps.length - 1 && (
                  <div className={cn('booking-step-line', currentStep > step.id && 'completed')} />
                )}
              </div>
            ))}
          </div>

          <div className="booking-layout">
            {/* ── Main Content ── */}
            <div>
              {/* Step 1: Summary */}
              {currentStep === 1 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="heading-4" style={{ marginBottom: 'var(--space-lg)' }}>Resumen de tu reserva</h2>
                  <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                    <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
                      <div style={{
                        width: 80, height: 60, borderRadius: 'var(--radius-md)', overflow: 'hidden',
                        background: 'linear-gradient(135deg, #2c3e50, #8e44ad)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)',
                      }}>
                        <BedDouble size={24} />
                      </div>
                      <div>
                        <div className="text-overline" style={{ marginBottom: '0.125rem' }}>{roomType.name.split(' ')[0]}</div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)' }}>{roomType.name}</h3>
                      </div>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '0.25rem' }}>FECHAS</div>
                        <div className="flex items-center gap-xs">
                          <Calendar size={16} style={{ color: 'var(--gold)' }} />
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{formatDateRange(checkIn, checkOut)}</span>
                        </div>
                        <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{nights} noche{nights > 1 ? 's' : ''}</span>
                      </div>
                      <div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: '0.25rem' }}>HUÉSPEDES</div>
                        <div className="flex items-center gap-xs">
                          <Users size={16} style={{ color: 'var(--gold)' }} />
                          <span style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{adults} adulto{adults > 1 ? 's' : ''}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
                    <button className="btn btn-ghost" onClick={() => navigate(-1)}>
                      <ArrowLeft size={16} /> Volver
                    </button>
                    <button className="btn btn-primary" onClick={() => setStep(2)}>
                      Continuar <ArrowRight size={16} />
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Guest Info */}
              {currentStep === 2 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="heading-4" style={{ marginBottom: 'var(--space-lg)' }}>Información del huésped</h2>
                  <form onSubmit={handleSubmit(onGuestSubmit)} style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Nombre *</label>
                        <input className={cn('form-input', errors.firstName && 'error')} {...register('firstName')} placeholder="Nombre" />
                        {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">Apellido *</label>
                        <input className={cn('form-input', errors.lastName && 'error')} {...register('lastName')} placeholder="Apellido" />
                        {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                      <label className="form-label">Email *</label>
                      <input className={cn('form-input', errors.email && 'error')} {...register('email')} placeholder="correo@ejemplo.com" />
                      {errors.email && <span className="form-error">{errors.email.message}</span>}
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                      <div className="form-group">
                        <label className="form-label">Teléfono *</label>
                        <input className={cn('form-input', errors.phone && 'error')} {...register('phone')} placeholder="+52 555 123 4567" />
                        {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                      </div>
                      <div className="form-group">
                        <label className="form-label">País *</label>
                        <select className={cn('form-input form-select', errors.country && 'error')} {...register('country')}>
                          <option value="">Seleccionar</option>
                          <option value="México">México</option>
                          <option value="España">España</option>
                          <option value="Colombia">Colombia</option>
                          <option value="Argentina">Argentina</option>
                          <option value="Chile">Chile</option>
                          <option value="Perú">Perú</option>
                          <option value="Estados Unidos">Estados Unidos</option>
                          <option value="Otro">Otro</option>
                        </select>
                        {errors.country && <span className="form-error">{errors.country.message}</span>}
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: 'var(--space-md)' }}>
                      <label className="form-label">Solicitud especial (opcional)</label>
                      <textarea className="form-input form-textarea" {...register('specialRequests')} placeholder="Ej: Habitación alejada del ascensor" rows={3} />
                    </div>

                    <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
                      <button type="button" className="btn btn-ghost" onClick={() => setStep(1)}>
                        <ArrowLeft size={16} /> Volver
                      </button>
                      <button type="submit" className="btn btn-primary">
                        Continuar al pago <ArrowRight size={16} />
                      </button>
                    </div>
                  </form>
                </motion.div>
              )}

              {/* Step 3: Payment */}
              {currentStep === 3 && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <h2 className="heading-4" style={{ marginBottom: 'var(--space-lg)' }}>Pago</h2>
                  <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
                    <p style={{ color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>
                      Completa tu pago de forma segura con PayPal.
                    </p>

                    {/* PayPal placeholder */}
                    <div style={{
                      border: '2px dashed var(--warm-gray)', borderRadius: 'var(--radius-lg)',
                      padding: 'var(--space-2xl)', textAlign: 'center',
                    }}>
                      <CreditCard size={48} style={{ color: 'var(--muted-light)', margin: '0 auto var(--space-md)' }} />
                      <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                        Aquí se mostrará el botón de PayPal cuando configures las credenciales.
                      </p>
                      <button className="btn btn-primary btn-lg" onClick={handlePayment}>
                        Simular pago con PayPal
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between" style={{ marginTop: 'var(--space-xl)' }}>
                    <button className="btn btn-ghost" onClick={() => setStep(2)}>
                      <ArrowLeft size={16} /> Volver
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Step 4: Confirmation */}
              {currentStep === 4 && (
                <motion.div
                  className="confirmation-page"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <motion.div
                    className="confirmation-check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                  >
                    <Check size={40} />
                  </motion.div>

                  <h2 className="heading-3">¡Reserva confirmada!</h2>
                  <p style={{ color: 'var(--muted)', marginTop: 'var(--space-xs)' }}>
                    Tu reserva ha sido procesada exitosamente.
                  </p>

                  <div className="confirmation-details">
                    <div className="text-overline" style={{ marginBottom: 'var(--space-sm)' }}>AUREA HOTEL</div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', marginBottom: 'var(--space-md)' }}>
                      Reserva #{bookingData?.reservation?.reservation_code || 'AUR-XXXX'}
                    </h3>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      <div className="booking-summary-row">
                        <span style={{ color: 'var(--muted)' }}>Habitación</span>
                        <span style={{ fontWeight: 500 }}>{roomType.name}</span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: 'var(--muted)' }}>Fechas</span>
                        <span style={{ fontWeight: 500 }}>{formatDateRange(checkIn, checkOut)}</span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: 'var(--muted)' }}>Noches</span>
                        <span style={{ fontWeight: 500 }}>{nights}</span>
                      </div>
                      <div className="booking-summary-row">
                        <span style={{ color: 'var(--muted)' }}>Huéspedes</span>
                        <span style={{ fontWeight: 500 }}>{adults} adulto{adults > 1 ? 's' : ''}</span>
                      </div>
                      <div className="booking-summary-total">
                        <span>Total</span>
                        <span>{formatCurrency(pricing?.total || 0)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-md justify-center">
                    <button className="btn btn-primary" onClick={() => navigate('/account/bookings')}>
                      Ver mi reserva
                    </button>
                    <button className="btn btn-secondary" onClick={() => navigate('/')}>
                      Volver al inicio
                    </button>
                  </div>
                </motion.div>
              )}
            </div>

            {/* ── Booking Summary Sidebar ── */}
            {currentStep < 4 && (
              <div className="booking-summary">
                <div className="booking-summary-image">
                  <div style={{
                    width: '100%', height: '100%',
                    background: 'linear-gradient(135deg, #2c3e50, #8e44ad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'rgba(255,255,255,0.3)',
                  }}>
                    <BedDouble size={32} />
                  </div>
                </div>

                <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)', marginBottom: 'var(--space-xs)' }}>
                  {roomType.name}
                </h3>
                <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--space-md)' }}>
                  {formatDateRange(checkIn, checkOut)} · {nights} noche{nights > 1 ? 's' : ''}
                </div>

                <div style={{ borderTop: '1px solid var(--warm-gray)', paddingTop: 'var(--space-sm)' }}>
                  <div className="booking-summary-row">
                    <span>Habitación</span>
                    <span>{formatCurrency(pricing?.subtotal || 0)}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Impuestos (10%)</span>
                    <span>{formatCurrency(pricing?.tax || 0)}</span>
                  </div>
                  <div className="booking-summary-total">
                    <span>Total</span>
                    <span>{formatCurrency(pricing?.total || 0)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// We need to access the booking data in the confirmation step
// Let's use a wrapper to avoid the variable reference issue
const bookingData = {};
