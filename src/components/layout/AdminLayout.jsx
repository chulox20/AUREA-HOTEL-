import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  BedDouble,
  Layers,
  CalendarDays,
  CalendarRange,
  Users,
  Star,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { cn } from '../../lib/utils';

const navItems = [
  { section: 'General', items: [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  ]},
  { section: 'Hotel', items: [
    { to: '/admin/rooms', icon: BedDouble, label: 'Habitaciones' },
    { to: '/admin/room-types', icon: Layers, label: 'Tipos' },
    { to: '/admin/calendar', icon: CalendarRange, label: 'Calendario' },
  ]},
  { section: 'Gestión', items: [
    { to: '/admin/bookings', icon: CalendarDays, label: 'Reservas' },
    { to: '/admin/customers', icon: Users, label: 'Clientes' },
    { to: '/admin/reviews', icon: Star, label: 'Reseñas' },
  ]},
];

import Logo from '../common/Logo';

export default function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { profile, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="admin-layout">
      {/* Sidebar */}
      <aside className={cn('admin-sidebar', sidebarOpen && 'open')}>
        <div className="admin-sidebar-header">
          <Logo variant="light" size="sm" to="/admin" />
          <span style={{ fontSize: '11px', color: 'var(--gold)', letterSpacing: '0.05em', textTransform: 'uppercase', marginTop: '4px' }}>
            Panel de Administración
          </span>
        </div>

        <nav className="admin-sidebar-nav">
          {navItems.map((section) => (
            <div key={section.section} className="admin-nav-section">
              <div className="admin-nav-section-title">{section.section}</div>
              {section.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn('admin-nav-link', isActive && 'active')
                  }
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="nav-icon" size={20} />
                  {item.label}
                </NavLink>
              ))}
            </div>
          ))}
        </nav>

        <div style={{ padding: 'var(--space-md) var(--space-xs)', borderTop: '1px solid var(--obsidian-lighter)' }}>
          <button className="admin-nav-link" onClick={handleSignOut}>
            <LogOut className="nav-icon" size={20} />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="menu-overlay active"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main content */}
      <div className="admin-main">
        <header className="admin-header">
          <div className="flex items-center gap-md">
            <button
              className="admin-sidebar-toggle btn btn-ghost btn-icon"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>

          <div className="flex items-center gap-sm">
            <NavLink to="/" className="btn btn-ghost btn-sm" style={{ textTransform: 'none' }}>
              Ver sitio <ChevronRight size={14} />
            </NavLink>
            <div className="flex items-center gap-xs">
              <div className="avatar avatar-sm">
                {profile?.full_name?.[0] || 'A'}
              </div>
              <span className="hide-mobile" style={{ fontSize: 'var(--text-sm)', fontWeight: 500 }}>
                {profile?.full_name}
              </span>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Outlet />
          </motion.div>
        </main>
      </div>
    </div>
  );
}
