import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut as LogOutIcon, CheckCircle2, XCircle, Search } from 'lucide-react';
import { bookingService } from '../../services/bookingService';
import {
  formatDateRange,
  formatCurrency,
  getStatusBadgeClass,
  getStatusLabel,
  cn,
} from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminBookings() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const loadReservations = async () => {
    try {
      const data = await bookingService.getAdminReservations();
      setReservations(data);
    } catch (err) {
      console.error('Error fetching admin reservations:', err);
      toast.error('Error al cargar las reservas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReservations();
  }, []);

  const handleStatusChange = async (id, newStatus, label) => {
    try {
      await bookingService.updateReservationStatus(id, newStatus);
      toast.success(`Reserva actualizada a "${label}"`);
      setReservations((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
    } catch (err) {
      console.error('Error updating reservation status:', err);
      toast.error('Error al actualizar el estado de la reserva');
    }
  };

  const filtered = reservations.filter((r) => {
    if (statusFilter !== 'all' && r.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const codeMatch = r.reservation_code?.toLowerCase().includes(q);
      const guestMatch = r.guest?.full_name?.toLowerCase().includes(q);
      const emailMatch = r.guest?.email?.toLowerCase().includes(q);
      const roomMatch = String(r.room_number).includes(q);
      if (!codeMatch && !guestMatch && !emailMatch && !roomMatch) return false;
    }
    return true;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between flex-wrap gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Gestión de Reservas</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {reservations.length} reservas registradas en total
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-sm flex-wrap">
          <div className="flex items-center gap-xs" style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-md)', padding: '0.375rem 0.75rem' }}>
            <Search size={16} style={{ color: 'var(--muted)' }} />
            <input
              type="text"
              placeholder="Buscar por código, huésped, hab..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ border: 'none', outline: 'none', fontSize: 'var(--text-sm)', width: '220px' }}
            />
          </div>

          <select
            className="form-input form-select"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'auto', fontSize: 'var(--text-sm)' }}
          >
            <option value="all">Todos los estados</option>
            <option value="confirmed">Confirmadas</option>
            <option value="checked_in">Checked In</option>
            <option value="checked_out">Checked Out</option>
            <option value="cancelled">Canceladas</option>
          </select>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--muted)' }}>
              No se encontraron reservas con los filtros aplicados.
            </div>
          ) : (
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
                {filtered.map((res) => (
                  <tr key={res.id}>
                    <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{res.reservation_code}</td>
                    <td>
                      <div className="flex items-center gap-xs">
                        <div>
                          <div style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                            {res.guest?.full_name || '—'}
                          </div>
                          <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                            {res.guest?.email || '—'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 500 }}>Hab {res.room_number}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                        {res.room_type}
                      </div>
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
                      <span className={cn('badge', getStatusBadgeClass(res.payment?.status || 'paid'))}>
                        {getStatusLabel(res.payment?.status || 'paid')}
                      </span>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(res.total_amount)}</td>
                    <td>
                      <div className="flex items-center gap-xs">
                        {res.status === 'confirmed' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleStatusChange(res.id, 'checked_in', 'Check-in realizado')}
                            title="Realizar Check-in"
                            style={{ color: 'var(--success)', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
                          >
                            <LogIn size={14} /> Check-in
                          </button>
                        )}
                        {res.status === 'checked_in' && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleStatusChange(res.id, 'checked_out', 'Check-out completado')}
                            title="Realizar Check-out"
                            style={{ color: 'var(--info)', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
                          >
                            <LogOutIcon size={14} /> Check-out
                          </button>
                        )}
                        {['confirmed', 'pending'].includes(res.status) && (
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleStatusChange(res.id, 'cancelled', 'Cancelada')}
                            title="Cancelar reserva"
                            style={{ color: 'var(--error)', padding: '0.25rem 0.5rem', fontSize: 'var(--text-xs)' }}
                          >
                            <XCircle size={14} /> Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </motion.div>
    </div>
  );
}
