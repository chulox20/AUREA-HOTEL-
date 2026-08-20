import { motion } from 'framer-motion';
import { Users, Mail, Calendar, DollarSign } from 'lucide-react';
import { formatCurrency, getInitials } from '../../lib/utils';

const MOCK_CUSTOMERS = [
  { id: 'c1', full_name: 'Jesús Figueroa', email: 'jesus@example.com', total_bookings: 3, total_spent: 2845.00, last_stay: '2026-07-20' },
  { id: 'c2', full_name: 'María López', email: 'maria@example.com', total_bookings: 2, total_spent: 2195.20, last_stay: '2026-08-14' },
  { id: 'c3', full_name: 'Carlos Mendoza', email: 'carlos@example.com', total_bookings: 1, total_spent: 1975.60, last_stay: '2026-08-16' },
  { id: 'c4', full_name: 'Ana García', email: 'ana@example.com', total_bookings: 4, total_spent: 3560.00, last_stay: '2026-07-10' },
  { id: 'c5', full_name: 'Roberto Martínez', email: 'roberto@example.com', total_bookings: 2, total_spent: 1890.00, last_stay: '2026-06-28' },
];

export default function AdminCustomers() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Clientes</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {MOCK_CUSTOMERS.length} clientes registrados
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Email</th>
                <th>Reservas</th>
                <th>Gasto total</th>
                <th>Última estancia</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_CUSTOMERS.map((customer) => (
                <tr key={customer.id}>
                  <td>
                    <div className="flex items-center gap-sm">
                      <div className="avatar avatar-sm">{getInitials(customer.full_name)}</div>
                      <span style={{ fontWeight: 500 }}>{customer.full_name}</span>
                    </div>
                  </td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{customer.email}</td>
                  <td>
                    <div className="flex items-center gap-xs">
                      <Calendar size={14} style={{ color: 'var(--gold)' }} />
                      {customer.total_bookings}
                    </div>
                  </td>
                  <td style={{ fontWeight: 600 }}>{formatCurrency(customer.total_spent)}</td>
                  <td style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{customer.last_stay}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
