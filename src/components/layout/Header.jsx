import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, User, LogOut, Calendar, ChevronDown } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { getInitials, cn } from '../../lib/utils';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, profile, isAdmin, signOut } = useAuth();

  const isHome = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setMenuOpen(false);
    setDropdownOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const headerClass = cn(
    'header',
    isHome && !isScrolled ? 'header-transparent' : 'header-solid'
  );

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (err) {
      console.error('Sign out error:', err);
    }
  };

  const navLinks = [
    { to: '/', label: 'Inicio' },
    { to: '/rooms', label: 'Habitaciones' },
  ];

  return (
    <>
      <header className={headerClass}>
        <div className="header-inner">
          <Link to="/" className="header-logo">
            Aurea Hotel
          </Link>

          <nav className={cn('header-nav', menuOpen && 'open')}>
            <button
              className="menu-toggle hide-desktop"
              onClick={() => setMenuOpen(false)}
              style={{ alignSelf: 'flex-end', marginBottom: '1rem' }}
              aria-label="Cerrar menú"
            >
              <X size={24} />
            </button>

            {navLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) => (isActive ? 'active' : '')}
                end={link.to === '/'}
              >
                {link.label}
              </NavLink>
            ))}

            {/* Mobile-only auth links */}
            {isAuthenticated && (
              <div className="hide-desktop" style={{ marginTop: 'auto', width: '100%' }}>
                <div style={{ borderTop: '1px solid var(--warm-gray)', paddingTop: '1rem', marginTop: '1rem' }}>
                  <NavLink to="/account">Mi cuenta</NavLink>
                  <NavLink to="/account/bookings" style={{ marginTop: '0.5rem', display: 'block' }}>Mis reservas</NavLink>
                  {isAdmin && (
                    <NavLink to="/admin" style={{ marginTop: '0.5rem', display: 'block' }}>Panel admin</NavLink>
                  )}
                  <button onClick={handleSignOut} style={{ marginTop: '0.5rem', color: 'var(--error)', fontSize: 'var(--text-sm)' }}>
                    Cerrar sesión
                  </button>
                </div>
              </div>
            )}
          </nav>

          <div className="header-actions">
            {isAuthenticated ? (
              <div className="dropdown" ref={dropdownRef}>
                <button
                  className="flex items-center gap-xs"
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className={cn('avatar', 'avatar-sm')}>
                    {profile?.avatar_url ? (
                      <img src={profile.avatar_url} alt={profile.full_name} />
                    ) : (
                      getInitials(profile?.full_name)
                    )}
                  </div>
                  <span
                    className="hide-mobile"
                    style={{
                      fontSize: 'var(--text-sm)',
                      fontWeight: 500,
                      color: isHome && !isScrolled ? 'var(--ivory)' : 'var(--obsidian)',
                    }}
                  >
                    {profile?.full_name?.split(' ')[0]}
                  </span>
                  <ChevronDown
                    size={16}
                    style={{
                      color: isHome && !isScrolled ? 'var(--ivory)' : 'var(--muted)',
                      transition: 'transform 0.2s',
                      transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0)',
                    }}
                    className="hide-mobile"
                  />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      className="dropdown-menu"
                      initial={{ opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div style={{ padding: '0.5rem 0.75rem', borderBottom: '1px solid var(--warm-gray)', marginBottom: '0.25rem' }}>
                        <div style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>{profile?.full_name}</div>
                        <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{profile?.email}</div>
                      </div>
                      <Link to="/account" className="dropdown-item">
                        <User size={16} /> Mi cuenta
                      </Link>
                      <Link to="/account/bookings" className="dropdown-item">
                        <Calendar size={16} /> Mis reservas
                      </Link>
                      {isAdmin && (
                        <>
                          <div className="dropdown-divider" />
                          <Link to="/admin" className="dropdown-item">
                            <User size={16} /> Panel admin
                          </Link>
                        </>
                      )}
                      <div className="dropdown-divider" />
                      <button className="dropdown-item" onClick={handleSignOut} style={{ color: 'var(--error)' }}>
                        <LogOut size={16} /> Cerrar sesión
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <>
                <button
                  className="btn btn-ghost btn-sm hide-mobile"
                  onClick={() => navigate('/login')}
                >
                  Iniciar sesión
                </button>
                <button
                  className="btn btn-primary btn-sm hide-mobile"
                  onClick={() => navigate('/rooms')}
                >
                  Reservar
                </button>
              </>
            )}

            <button
              className="menu-toggle"
              onClick={() => setMenuOpen(true)}
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile overlay */}
      <div
        className={cn('menu-overlay', menuOpen && 'active')}
        onClick={() => setMenuOpen(false)}
      />
    </>
  );
}
