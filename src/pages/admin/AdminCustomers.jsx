import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Search } from 'lucide-react';
import { adminService } from '../../services/adminService';
import { formatCurrency, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    let isMounted = true;

    async function loadCustomers() {
      try {
        const data = await adminService.getCustomersDirectory();
        if (isMounted) setCustomers(data);
      } catch (err) {
        console.error('Error fetching customers directory:', err);
        toast.error('Error al cargar directorio de clientes');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCustomers();
    return () => {
      isMounted = false;
    };
  }, []);

  const filtered = customers.filter((c) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.full_name?.toLowerCase().includes(q) ||
      c.email?.toLowerCase().includes(q) ||
      c.phone?.toLowerCase().includes(q)
    );
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
      <div
        className="flex items-center justify-between flex-wrap gap-md"
        style={{ marginBottom: 'var(--space-xl)' }}
      >
        <div>
          <h1 className="heading-3">Directorio de Clientes</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {customers.length} perfiles de huéspedes registrados
          </p>
        </div>

        <div
          className="flex items-center gap-xs"
          style={{
            background: '#fff',
            border: '1px solid var(--warm-gray)',
            borderRadius: 'var(--radius-md)',
            padding: '0.375rem 0.75rem',
          }}
        >
          <Search size={16} style={{ color: 'var(--muted)' }} />
          <input
            type="text"
            placeholder="Buscar por nombre, email o teléfono..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ border: 'none', outline: 'none', fontSize: 'var(--text-sm)', width: '250px' }}
          />
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="table-container">
          {filtered.length === 0 ? (
            <div style={{ padding: 'var(--space-2xl)', textAlign: 'center', color: 'var(--muted)' }}>
              No se encontraron clientes registrados.
            </div>
          ) : (
            <table className="table">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Email</th>
                  <th>Teléfono</th>
                  <th>País</th>
                  <th>Reservas</th>
                  <th>Gasto total</th>
                  <th>Última estancia</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((customer) => (
                  <tr key={customer.id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div className="avatar avatar-sm">{getInitials(customer.full_name)}</div>
                        <span style={{ fontWeight: 500 }}>{customer.full_name}</span>
                      </div>
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      {customer.email}
                    </td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{customer.phone}</td>
                    <td style={{ fontSize: 'var(--text-sm)' }}>{customer.country}</td>
                    <td>
                      <div className="flex items-center gap-xs">
                        <Calendar size={14} style={{ color: 'var(--gold)' }} />
                        {customer.total_bookings}
                      </div>
                    </td>
                    <td style={{ fontWeight: 600 }}>{formatCurrency(customer.total_spent)}</td>
                    <td style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                      {customer.last_stay}
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
