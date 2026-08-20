import { NavLink, Outlet } from 'react-router-dom';
import { User, Calendar, Settings } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';
import { useAuth } from '../../contexts/AuthContext';
import Header from './Header';
import Footer from './Footer';

const accountLinks = [
  { to: '/account', icon: User, label: 'Mi cuenta', end: true },
  { to: '/account/bookings', icon: Calendar, label: 'Mis reservas' },
  { to: '/account/profile', icon: Settings, label: 'Perfil' },
];

export default function AccountLayout() {
  const { profile } = useAuth();

  return (
    <>
      <Header />
      <div className="page">
        <div className="account-layout">
          <aside className="account-sidebar">
            <div style={{ marginBottom: 'var(--space-md)' }}>
              <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-2xl)' }}>
                Hola, {profile?.full_name?.split(' ')[0] || 'Huésped'} 👋
              </h2>
            </div>
            <nav className="account-sidebar-nav">
              {accountLinks.map((link) => (
                <NavLink
                  key={link.to}
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cn('account-nav-link', isActive && 'active')
                  }
                >
                  <link.icon size={18} />
                  {link.label}
                </NavLink>
              ))}
            </nav>
          </aside>

          <div className="account-content">
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
