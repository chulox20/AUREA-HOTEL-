import { motion } from 'framer-motion';
import {
  Calendar, BedDouble, DollarSign, LogIn, LogOut,
  TrendingUp, ArrowUpRight, ArrowDownRight,
} from 'lucide-react';
import { SAMPLE_RESERVATIONS, ROOMS } from '../../lib/mockData';
import { formatCurrency, formatDateRange, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

const stats = [
  {
    label: 'Reservas hoy',
    value: '12',
    change: '+8%',
    positive: true,
    icon: Calendar,
    color: 'var(--gold)',
    bg: 'var(--gold-50)',
  },
  {
    label: 'Ocupación',
    value: '68%',
    change: '+5%',
    positive: true,
    icon: BedDouble,
    color: 'var(--success)',
    bg: 'var(--success-light)',
  },
  {
    label: 'Ingresos del mes',
    value: '$48,200',
    change: '+12%',
    positive: true,
    icon: DollarSign,
    color: 'var(--info)',
    bg: 'var(--info-light)',
  },
  {
    label: 'Check-ins hoy',
    value: '7',
    change: '',
    positive: true,
    icon: LogIn,
    color: 'var(--gold)',
    bg: 'var(--gold-50)',
  },
  {
    label: 'Check-outs hoy',
    value: '5',
    change: '',
    positive: true,
    icon: LogOut,
    color: 'var(--muted)',
    bg: 'var(--warm-gray)',
  },
];

export default function AdminDashboard() {
  const occupiedRooms = ROOMS.filter((r) => r.status !== 'available').length;
  const totalRooms = ROOMS.length;

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Dashboard</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Resumen general del hotel
          </p>
        </div>
      </div>

      {/* Stats Cards */}
      <motion.div
        className="grid gap-md"
        style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))' }}
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
      >
        {stats.map((stat) => (
          <motion.div key={stat.label} variants={fadeInUp}>
            <div className="stat-card">
              <div className="stat-card-header">
                <span>{stat.label}</span>
                <div className="stat-card-icon" style={{ background: stat.bg, color: stat.color }}>
                  <stat.icon size={20} />
                </div>
              </div>
              <div className="stat-card-value">{stat.value}</div>
              {stat.change && (
                <div className={cn('stat-card-change', stat.positive ? 'positive' : 'negative')}>
                  {stat.positive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {stat.change} vs mes anterior
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </motion.div>

      {/* Recent Reservations */}
      <div style={{ marginTop: 'var(--space-2xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
          Reservas recientes
        </h2>

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
              </tr>
            </thead>
            <tbody>
              {SAMPLE_RESERVATIONS.map((res) => (
                <tr key={res.id}>
                  <td style={{ fontWeight: 600, color: 'var(--gold)' }}>{res.reservation_code}</td>
                  <td>
                    <div className="flex items-center gap-xs">
                      <div className="avatar avatar-sm">{res.guest.full_name[0]}</div>
                      <span>{res.guest.full_name}</span>
                    </div>
                  </td>
                  <td>
                    <div>
                      <div style={{ fontWeight: 500 }}>Hab {res.room_number}</div>
                      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{res.room_type}</div>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)' }}>{formatDateRange(res.check_in, res.check_out)}</td>
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Room status overview */}
      <div style={{ marginTop: 'var(--space-2xl)' }}>
        <h2 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-lg)', fontWeight: 600, marginBottom: 'var(--space-md)' }}>
          Estado de habitaciones
        </h2>
        <div className="grid grid-4 gap-sm">
          {ROOMS.slice(0, 8).map((room) => {
            const roomType = room.room_type_id.replace('rt-', '');
            return (
              <div key={room.id} style={{
                background: '#fff', border: '1px solid var(--warm-gray)',
                borderRadius: 'var(--radius-md)', padding: 'var(--space-sm) var(--space-md)',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>Hab {room.room_number}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', textTransform: 'capitalize' }}>{roomType}</div>
                </div>
                <span className={cn('badge', getStatusBadgeClass(room.status))}>
                  {getStatusLabel(room.status)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
