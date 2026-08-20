import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link to="/" className="header-logo">
              Aurea Hotel
            </Link>
            <p>
              Una estancia diseñada para recordar. Donde el lujo se encuentra con la
              tranquilidad para crear momentos inolvidables.
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '1rem', fontSize: 'var(--text-sm)', color: 'var(--muted-light)' }}>
              <MapPin size={14} />
              <span>Av. del Mar 1234, Costa Esmeralda</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'var(--muted-light)' }}>
              <Phone size={14} />
              <span>+52 800 AUREA</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginTop: '0.25rem', fontSize: 'var(--text-sm)', color: 'var(--muted-light)' }}>
              <Mail size={14} />
              <span>reservas@aureahotel.com</span>
            </div>
          </div>

          <div className="footer-col">
            <h4>Hotel</h4>
            <Link to="/rooms">Habitaciones</Link>
            <Link to="/#experiencias">Experiencias</Link>
            <Link to="/#galeria">Galería</Link>
            <a href="#">Restaurante</a>
            <a href="#">Spa & Bienestar</a>
          </div>

          <div className="footer-col">
            <h4>Información</h4>
            <a href="#">Sobre nosotros</a>
            <a href="#">Políticas</a>
            <a href="#">Términos y condiciones</a>
            <a href="#">Privacidad</a>
            <a href="#">FAQ</a>
          </div>

          <div className="footer-col">
            <h4>Mi Cuenta</h4>
            <Link to="/login">Iniciar sesión</Link>
            <Link to="/register">Registrarse</Link>
            <Link to="/account/bookings">Mis reservas</Link>
            <Link to="/account">Mi perfil</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <p>© {new Date().getFullYear()} Aurea Hotel. Todos los derechos reservados.</p>
          <div className="footer-social">
            <a href="#" aria-label="Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a href="#" aria-label="Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
            </a>
            <a href="#" aria-label="Twitter">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4l11.733 16h4.267l-11.733-16z"/><path d="M4 20l6.768-6.768m2.46-2.46L20 4"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
