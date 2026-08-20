import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star, Users, BedDouble, Maximize,
  Wifi, Coffee, Clock, ShieldCheck,
  ArrowRight, ChevronRight, Waves, Dumbbell, UtensilsCrossed, Sparkles,
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { ROOM_TYPES, EXPERIENCES, FEATURES, SAMPLE_REVIEWS } from '../../lib/mockData';
import { formatCurrency, getInitials } from '../../lib/utils';

const featureIcons = { Wifi, Coffee, Clock, ShieldCheck };

const experienceIcons = {
  Restaurante: UtensilsCrossed,
  Spa: Sparkles,
  Piscina: Waves,
  Gimnasio: Dumbbell,
};

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } },
};

const stagger = {
  visible: {
    transition: { staggerChildren: 0.1 },
  },
};

export default function Home() {
  const navigate = useNavigate();
  const { checkIn, checkOut, adults, setSearchParams } = useBooking();

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms');
  };

  return (
    <div className="page-hero">
      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-bg">
          <div
            style={{
              width: '100%',
              height: '100%',
              background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 30%, #0f3460 60%, #1a1a2e 100%)',
            }}
          />
        </div>
        <div className="hero-overlay" />

        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div className="hero-overline" variants={fadeInUp}>
            Bienvenido a Aurea Hotel
          </motion.div>
          <motion.h1 variants={fadeInUp}>
            Una estancia diseñada para recordar
          </motion.h1>
          <motion.p className="hero-subtitle" variants={fadeInUp}>
            Donde cada detalle ha sido cuidadosamente pensado para crear
            momentos extraordinarios frente al mar.
          </motion.p>
          <motion.div className="hero-actions" variants={fadeInUp}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/rooms')}>
              Explorar habitaciones
            </button>
            <button className="btn btn-outline-gold btn-lg" style={{ borderColor: 'rgba(250,249,246,0.4)', color: 'var(--ivory)' }} onClick={() => navigate('/rooms')}>
              Reservar ahora
            </button>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          style={{
            position: 'absolute', bottom: '2rem', left: '50%', transform: 'translateX(-50%)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem',
            color: 'rgba(250,249,246,0.5)', fontSize: 'var(--text-xs)', letterSpacing: '0.1em',
          }}
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span>DESCUBRIR</span>
          <ChevronRight size={16} style={{ transform: 'rotate(90deg)' }} />
        </motion.div>
      </section>

      {/* ══ SEARCH BAR ══ */}
      <div className="container search-bar-floating">
        <form className="search-bar" onSubmit={handleSearch}>
          <div className="form-group">
            <label className="form-label">Check-in</label>
            <input
              type="date"
              className="form-input"
              value={checkIn}
              onChange={(e) => setSearchParams({ checkIn: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Check-out</label>
            <input
              type="date"
              className="form-input"
              value={checkOut}
              onChange={(e) => setSearchParams({ checkOut: e.target.value })}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Huéspedes</label>
            <select
              className="form-input form-select"
              value={adults}
              onChange={(e) => setSearchParams({ adults: Number(e.target.value) })}
            >
              <option value={1}>1 adulto</option>
              <option value={2}>2 adultos</option>
              <option value={3}>3 adultos</option>
              <option value={4}>4 adultos</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-lg">
            Buscar disponibilidad
          </button>
        </form>
      </div>

      {/* ══ FEATURED ROOMS ══ */}
      <section className="section" style={{ paddingTop: 'var(--space-xl)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="text-overline">Nuestras habitaciones</div>
            <h2>Habitaciones destacadas</h2>
            <div className="divider" />
            <p>Cada habitación ha sido diseñada para ofrecer una experiencia única de confort y elegancia.</p>
          </motion.div>

          <motion.div
            className="grid grid-4 gap-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {ROOM_TYPES.map((room) => (
              <motion.div key={room.id} variants={fadeInUp}>
                <div className="room-card" onClick={() => navigate(`/rooms/${room.slug}`)}>
                  <div className="room-card-image">
                    <div style={{
                      width: '100%', height: '100%',
                      background: `linear-gradient(135deg, ${room.id === 'rt-standard' ? '#2c3e50, #3498db' : room.id === 'rt-deluxe' ? '#2c3e50, #8e44ad' : room.id === 'rt-suite' ? '#0f3460, #16213e' : '#1a1a2e, #b89b5e'})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.3)', fontSize: 'var(--text-3xl)',
                    }}>
                      <BedDouble size={48} />
                    </div>
                  </div>
                  <div className="room-card-body">
                    <div className="room-card-type">{room.name.split(' ')[0]}</div>
                    <h3 className="room-card-name">{room.name}</h3>
                    <div className="room-card-price">
                      {formatCurrency(room.base_price)} <span>/ noche</span>
                    </div>
                    <div className="room-card-meta">
                      <div className="room-card-meta-item">
                        <Users size={16} />
                        {room.capacity} huéspedes
                      </div>
                      <div className="room-card-meta-item">
                        <BedDouble size={16} />
                        {room.beds}
                      </div>
                      <div className="room-card-meta-item">
                        <Maximize size={16} />
                        {room.size} m²
                      </div>
                    </div>
                  </div>
                  <div className="room-card-footer">
                    <button className="btn btn-outline-gold" style={{ width: '100%' }}>
                      Ver habitación <ArrowRight size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ EXPERIENCES ══ */}
      <section className="section" style={{ background: 'var(--ivory-dark)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="text-overline">Experiencias</div>
            <h2>Vive momentos inolvidables</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="grid grid-4 gap-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {EXPERIENCES.map((exp) => {
              const Icon = experienceIcons[exp.name] || Sparkles;
              return (
                <motion.div key={exp.id} variants={fadeInUp}>
                  <div className="experience-card">
                    <div style={{
                      width: '100%', height: '100%',
                      background: `linear-gradient(135deg, ${exp.id === 'exp-restaurant' ? '#2d1b00, #5c3317' : exp.id === 'exp-spa' ? '#1a332e, #2d5248' : exp.id === 'exp-pool' ? '#003d5c, #0077b6' : '#1a1a2e, #2d2d44'})`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'rgba(255,255,255,0.15)',
                    }}>
                      <Icon size={64} />
                    </div>
                    <div className="experience-card-overlay">
                      <h3>{exp.name}</h3>
                      <p>{exp.description}</p>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ WHY AUREA ══ */}
      <section className="section">
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="text-overline">¿Por qué elegirnos?</div>
            <h2>La experiencia Aurea</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="grid grid-4 gap-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {FEATURES.map((feature) => {
              const Icon = featureIcons[feature.icon] || ShieldCheck;
              return (
                <motion.div key={feature.title} variants={fadeInUp}>
                  <div className="feature-card">
                    <div className="feature-icon">
                      <Icon size={24} />
                    </div>
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ══ TESTIMONIALS ══ */}
      <section className="section" style={{ background: 'var(--ivory-dark)' }}>
        <div className="container">
          <motion.div
            className="section-header"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-100px' }}
            variants={fadeInUp}
          >
            <div className="text-overline">Testimonios</div>
            <h2>Lo que dicen nuestros huéspedes</h2>
            <div className="divider" />
          </motion.div>

          <motion.div
            className="grid grid-3 gap-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {SAMPLE_REVIEWS.slice(0, 3).map((review) => (
              <motion.div key={review.id} variants={fadeInUp}>
                <div className="testimonial-card">
                  <div className="testimonial-header">
                    <div className="avatar avatar-md">
                      {getInitials(review.user_name)}
                    </div>
                    <div className="testimonial-info">
                      <h4>{review.user_name}</h4>
                      <span>{review.room_type}</span>
                    </div>
                  </div>
                  <div className="testimonial-rating">
                    <div className="star-rating">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={16}
                          className={`star ${i < review.rating ? 'filled' : ''}`}
                          fill={i < review.rating ? 'var(--gold)' : 'none'}
                        />
                      ))}
                    </div>
                  </div>
                  <p>"{review.comment}"</p>
                  {review.verified && (
                    <div style={{ marginTop: '0.75rem', fontSize: 'var(--text-xs)', color: 'var(--success)', fontWeight: 500 }}>
                      ✓ Estancia verificada
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
        >
          <motion.div className="text-overline" variants={fadeInUp} style={{ marginBottom: '1rem' }}>
            Tu próxima aventura
          </motion.div>
          <motion.h2 className="heading-2" variants={fadeInUp}>
            Tu próxima estancia comienza aquí
          </motion.h2>
          <motion.p variants={fadeInUp} style={{ maxWidth: '500px', margin: '0 auto 2rem' }}>
            Reserva ahora y descubre por qué nuestros huéspedes vuelven una y otra vez.
          </motion.p>
          <motion.div variants={fadeInUp}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/rooms')}>
              Reservar habitación <ArrowRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
