import { motion } from 'framer-motion';
import { LogIn, LogOut as LogOutIcon, Eye } from 'lucide-react';
import { SAMPLE_RESERVATIONS } from '../../lib/mockData';
import { formatDateRange, formatCurrency, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

export default function AdminBookings() {
  const handleCheckIn = (id) => {
    console.log('Check-in:', id);
  };

  const handleCheckOut = (id) => {
    console.log('Check-out:', id);
  };

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Reservas</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Gestión de todas las reservas
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Reserva</th>
                <th>Cliente</th>
                <th>Habitación</th>
                <th>Fechas</th>
                <th>Estado</th>
                <th>Pago</th>
                <th>Total</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {SAMPLE_RESERVATIONS.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{res.reservation_code}</td>
                  <td>
                    <div className="flex items-center gap-xs">
                      <div className="avatar avatar-sm">{res.guest.full_name[0]}</div>
                      <div>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>{res.guest.full_name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{res.guest.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: 500 }}>Hab {res.room_number}</div>
                    <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{res.room_type}</div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', whiteSpace: 'nowrap' }}>
                    {formatDateRange(res.check_in, res.check_out)}
                  </td>
                  <td>
                    <span className={cn('badge', getStatusBadgeClass(res.status))}>
                      {getStatusLabel(res.status)}
                    </span>
                  </td>
                  <td>
                    <span className={cn('badge', getStatusBadgeClass(res.payment.status))}>
                      {getStatusLabel(res.payment.status)}
                    </span>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(res.total_amount)}</td>
                  <td>
                    <div className="flex gap-xs">
                      <button className="btn btn-ghost btn-icon btn-sm" title="Ver detalle">
                        <Eye size={14} />
                      </button>
                      {res.status === 'confirmed' && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Check-in"
                          onClick={() => handleCheckIn(res.id)}
                          style={{ color: 'var(--success)' }}
                        >
                          <LogIn size={14} />
                        </button>
                      )}
                      {res.status === 'checked_in' && (
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          title="Check-out"
                          onClick={() => handleCheckOut(res.id)}
                          style={{ color: 'var(--info)' }}
                        >
                          <LogOutIcon size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
