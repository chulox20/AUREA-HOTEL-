import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  BedDouble,
  DollarSign,
  LogIn,
  LogOut,
  ArrowRight,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { adminService } from '../../services/adminService';
import { bookingService } from '../../services/bookingService';
import { roomService } from '../../services/roomService';
import {
  formatCurrency,
  formatDateRange,
  getStatusBadgeClass,
  getStatusLabel,
  cn,
} from '../../lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function AdminDashboard() {
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState({
    todayBookings: 0,
    occupancyRate: 0,
    monthRevenue: 0,
    checkInsToday: 0,
    checkOutsToday: 0,
    currentlyOccupied: 0,
    totalRooms: 16,
  });

  const [recentReservations, setRecentReservations] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadAdminData() {
      try {
        const [metricsData, reservationsData, roomsData] = await Promise.all([
          adminService.getDashboardMetrics(),
          bookingService.getAdminReservations(),
          roomService.getAdminRooms(),
        ]);

        if (isMounted) {
          setMetrics(metricsData);
          setRecentReservations((reservationsData || []).slice(0, 5));
          setRooms(roomsData || []);
        }
      } catch (err) {
        console.error('Error loading admin dashboard data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadAdminData();
    return () => {
      isMounted = false;
    };
  }, []);

  const statsList = [
    {
      label: 'Reservas hoy',
      value: String(metrics.todayBookings),
      icon: Calendar,
      color: 'var(--gold)',
      bg: 'var(--gold-50)',
    },
    {
      label: 'Ocupación',
      value: `${metrics.occupancyRate}%`,
      icon: BedDouble,
      color: 'var(--success)',
      bg: 'var(--success-light)',
    },
    {
      label: 'Ingresos del mes',
      value: formatCurrency(metrics.monthRevenue),
      icon: DollarSign,
      color: 'var(--info)',
      bg: 'var(--info-light)',
    },
    {
      label: 'Check-ins hoy',
      value: String(metrics.checkInsToday),
      icon: LogIn,
      color: 'var(--gold)',
      bg: 'var(--gold-50)',
    },
    {
      label: 'Check-outs hoy',
      value: String(metrics.checkOutsToday),
      icon: LogOut,
      color: 'var(--muted)',
      bg: 'var(--warm-gray)',
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* ── Stats Grid ── */}
      <motion.div
        className="grid grid-5 gap-md"
        style={{ marginBottom: 'var(--space-xl)' }}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {statsList.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <motion.div key={i} variants={fadeInUp}>
              <div className="stat-card">
                <div className="stat-icon" style={{ color: stat.color, background: stat.bg }}>
                  <Icon size={20} />
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Recent Reservations & Rooms Status ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 'var(--space-xl)' }}>
        {/* Recent Reservations */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 className="heading-5">Reservas recientes</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin/bookings')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Ver todas <ArrowRight size={14} />
            </button>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              overflow: 'hidden',
            }}
          >
            {recentReservations.length === 0 ? (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--muted)' }}>
                No hay reservas registradas en la base de datos.
              </div>
            ) : (
              <table className="table">
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Huésped</th>
                    <th>Habitación</th>
                    <th>Fechas</th>
                    <th>Estado</th>
                    <th>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {recentReservations.map((res) => (
                    <tr
                      key={res.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate('/admin/bookings')}
                    >
                      <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{res.reservation_code}</td>
                      <td>{res.guest?.full_name || 'Huésped'}</td>
                      <td>{res.room_type}</td>
                      <td style={{ fontSize: 'var(--text-xs)' }}>
                        {formatDateRange(res.check_in, res.check_out)}
                      </td>
                      <td>
                        <span className={cn('badge', getStatusBadgeClass(res.status))}>
                          {getStatusLabel(res.status)}
                        </span>
                      </td>
                      <td style={{ fontWeight: 600 }}>{formatCurrency(res.total_amount)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* Physical Rooms Status */}
        <div>
          <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
            <h3 className="heading-5">Estado de habitaciones</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => navigate('/admin/rooms')}
              style={{ fontSize: 'var(--text-xs)' }}
            >
              Gestionar
            </button>
          </div>

          <div
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-md)',
            }}
          >
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '0.5rem' }}>
              {rooms.map((room) => (
                <div
                  key={room.id}
                  style={{
                    padding: '0.625rem 0.25rem',
                    borderRadius: 'var(--radius-sm)',
                    textAlign: 'center',
                    border: '1px solid',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    background:
                      room.status === 'available'
                        ? 'var(--success-light)'
                        : room.status === 'maintenance'
                        ? 'var(--warning-light)'
                        : 'var(--warm-gray)',
                    borderColor:
                      room.status === 'available'
                        ? 'var(--success)'
                        : room.status === 'maintenance'
                        ? 'var(--warning)'
                        : 'var(--muted)',
                    color:
                      room.status === 'available'
                        ? 'var(--success)'
                        : room.status === 'maintenance'
                        ? 'var(--warning)'
                        : 'var(--muted)',
                  }}
                  title={`Habitación ${room.room_number} - ${room.room_types?.name || ''}`}
                >
                  {room.room_number}
                </div>
              ))}
            </div>

            <div
              className="flex items-center justify-between"
              style={{
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-sm)',
                borderTop: '1px solid var(--warm-gray)',
                fontSize: 'var(--text-xs)',
                color: 'var(--muted)',
              }}
            >
              <span className="flex items-center gap-xs">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--success)',
                    display: 'inline-block',
                  }}
                />
                Disponible
              </span>
              <span className="flex items-center gap-xs">
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: 'var(--warning)',
                    display: 'inline-block',
                  }}
                />
                Mantenimiento
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
