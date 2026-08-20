import { motion } from 'framer-motion';
import { Calendar, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { SAMPLE_RESERVATIONS } from '../../lib/mockData';
import { formatDateRange, formatCurrency, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

export default function AccountDashboard() {
  const { profile } = useAuth();
  const navigate = useNavigate();

  const upcomingReservations = SAMPLE_RESERVATIONS.filter(
    (r) => r.status === 'confirmed' || r.status === 'pending'
  );
  const pastReservations = SAMPLE_RESERVATIONS.filter(
    (r) => r.status === 'checked_out' || r.status === 'cancelled'
  );

  return (
    <div>
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Upcoming Reservations */}
        <h2 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Próximas reservas</h2>

        {upcomingReservations.length === 0 ? (
          <div style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)', textAlign: 'center', marginBottom: 'var(--space-xl)' }}>
            <Calendar size={32} style={{ color: 'var(--muted-light)', margin: '0 auto var(--space-sm)' }} />
            <p style={{ color: 'var(--muted)' }}>No tienes reservas próximas</p>
            <button className="btn btn-primary btn-sm" style={{ marginTop: 'var(--space-sm)' }} onClick={() => navigate('/rooms')}>
              Explorar habitaciones
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
            {upcomingReservations.map((res) => (
              <div key={res.id} className="card" style={{ cursor: 'pointer' }} onClick={() => navigate(`/account/bookings/${res.id}`)}>
                <div className="card-body">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-overline" style={{ marginBottom: '0.125rem' }}>Aurea Hotel</div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>{res.room_type}</h3>
                      <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginTop: '0.25rem' }}>
                        {formatDateRange(res.check_in, res.check_out)} · Hab {res.room_number}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-xs">
                      <span className={cn('badge', getStatusBadgeClass(res.status))}>
                        {getStatusLabel(res.status)}
                      </span>
                      <span style={{ fontWeight: 600 }}>{formatCurrency(res.total_amount)}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Past Reservations */}
        {pastReservations.length > 0 && (
          <>
            <h2 className="heading-4" style={{ marginBottom: 'var(--space-md)' }}>Reservas anteriores</h2>
            <div className="flex flex-col gap-md">
              {pastReservations.map((res) => (
                <div key={res.id} className="card" style={{ opacity: 0.7, cursor: 'pointer' }} onClick={() => navigate(`/account/bookings/${res.id}`)}>
                  <div className="card-body">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>{res.room_type}</h3>
                        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                          {formatDateRange(res.check_in, res.check_out)}
                        </div>
                      </div>
                      <span className={cn('badge', getStatusBadgeClass(res.status))}>
                        {getStatusLabel(res.status)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}
