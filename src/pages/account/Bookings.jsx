import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BedDouble, ArrowRight } from 'lucide-react';
import { SAMPLE_RESERVATIONS } from '../../lib/mockData';
import { formatDateRange, formatCurrency, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

export default function Bookings() {
  const navigate = useNavigate();

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
        <h2 className="heading-4">Mis reservas</h2>
      </div>

      <motion.div
        className="flex flex-col gap-md"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        {SAMPLE_RESERVATIONS.map((res) => (
          <div
            key={res.id}
            className="card"
            style={{ cursor: 'pointer' }}
            onClick={() => navigate(`/account/bookings/${res.id}`)}
          >
            <div className="card-body">
              <div className="flex items-center justify-between flex-wrap gap-md">
                <div className="flex items-center gap-md">
                  <div style={{
                    width: 60, height: 45, borderRadius: 'var(--radius-md)',
                    background: 'linear-gradient(135deg, #2c3e50, #8e44ad)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    color: 'rgba(255,255,255,0.3)',
                  }}>
                    <BedDouble size={20} />
                  </div>
                  <div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--gold)', fontWeight: 600 }}>
                      {res.reservation_code}
                    </div>
                    <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>{res.room_type}</h3>
                    <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      {formatDateRange(res.check_in, res.check_out)} · Hab {res.room_number}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-lg">
                  <span className={cn('badge', getStatusBadgeClass(res.status))}>
                    {getStatusLabel(res.status)}
                  </span>
                  <span style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
                    {formatCurrency(res.total_amount)}
                  </span>
                  <ArrowRight size={18} style={{ color: 'var(--muted)' }} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
