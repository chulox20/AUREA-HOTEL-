import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  BedDouble,
  Maximize,
  Wifi,
  Coffee,
  Clock,
  ShieldCheck,
  ArrowRight,
  ChevronRight,
  Waves,
  Dumbbell,
  UtensilsCrossed,
  Sparkles,
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { roomService } from '../../services/roomService';
import { reviewService } from '../../services/reviewService';
import { formatCurrency, getInitials } from '../../lib/utils';

const EXPERIENCES = [
  {
    id: 'exp-restaurant',
    name: 'Restaurante',
    description: 'Cocina mediterránea de autor con vistas panorámicas al océano.',
  },
  {
    id: 'exp-spa',
    name: 'Spa',
    description: 'Tratamientos holísticos y circuito termal para una relajación absoluta.',
  },
  {
    id: 'exp-pool',
    name: 'Piscina',
    description: 'Piscina infinita frente al mar con servicio exclusivo de coctelería.',
  },
  {
    id: 'exp-gym',
    name: 'Gimnasio',
    description: 'Equipamiento de última generación con vistas a los jardines privados.',
  },
];

const FEATURES = [
  {
    icon: 'Wifi',
    title: 'Alta Conectividad',
    description: 'Wi-Fi de ultra alta velocidad en todas las suites y áreas comunes.',
  },
  {
    icon: 'Coffee',
    title: 'Desayuno Gourmet',
    description: 'Selección artesanal preparada diariamente con ingredientes locales.',
  },
  {
    icon: 'Clock',
    title: 'Concierge 24/7',
    description: 'Atención personalizada para reservas, traslados y experiencias privadas.',
  },
  {
    icon: 'ShieldCheck',
    title: 'Estancia Garantizada',
    description: 'Privacidad absoluta, seguridad 24 horas y servicio de primera categoría.',
  },
];

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

  const [rooms, setRooms] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function loadData() {
      try {
        const [roomsData, reviewsData] = await Promise.all([
          roomService.getRoomTypes(),
          reviewService.getFeaturedReviews(3),
        ]);

        if (isMounted) {
          setRooms(roomsData);
          setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Error loading Home page data:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadData();
    return () => {
      isMounted = false;
    };
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate('/rooms');
  };

  return (
    <div className="page-hero">
      {/* ══ HERO ══ */}
      <section className="hero">
        <div className="hero-bg">
          <img
            src="https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=2000&q=85"
            alt="Aurea Hotel & Resort frente al mar"
            className="hero-img"
          />
        </div>
        <div className="hero-overlay" />

        <motion.div className="hero-content" initial="hidden" animate="visible" variants={stagger}>
          {/* 5-Star Luxury Pill Badge */}
          <motion.div variants={fadeInUp} className="hero-badge">
            <span className="flex items-center gap-xs">
              <Sparkles size={14} style={{ color: 'var(--gold)' }} />
              <span>DESTINO BOUTIQUE 5 ESTRELLAS</span>
              <span style={{ opacity: 0.4 }}>·</span>
              <span>COSTA ESMERALDA</span>
            </span>
          </motion.div>

          <motion.h1 variants={fadeInUp} className="hero-title">
            Una estancia diseñada para el <span className="text-gold-gradient">deleite absoluto</span>
          </motion.h1>

          <motion.p className="hero-subtitle" variants={fadeInUp}>
            Donde la arquitectura de vanguardia y la serenidad del mar convergen para crear experiencias inolvidables.
          </motion.p>

          <motion.div className="hero-actions" variants={fadeInUp}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/rooms')}>
              <BedDouble size={18} /> Explorar Habitaciones
            </button>
            <button
              className="btn btn-outline-gold btn-lg hero-btn-secondary"
              onClick={() => navigate('/rooms')}
            >
              Reservar Estancia <ArrowRight size={16} />
            </button>
          </motion.div>

          {/* Quick Features Chips Bar */}
          <motion.div variants={fadeInUp} className="hero-features-bar">
            <div className="hero-chip">
              <Waves size={14} /> Vista Panorámica al Mar
            </div>
            <div className="hero-chip">
              <UtensilsCrossed size={14} /> Gastronomía de Autor
            </div>
            <div className="hero-chip">
              <Sparkles size={14} /> Spa & Circuito Termal
            </div>
            <div className="hero-chip">
              <Clock size={14} /> Concierge 24/7
            </div>
          </motion.div>
        </motion.div>

        {/* Animated Mouse Scroll Indicator */}
        <motion.div
          className="hero-scroll-indicator"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2.2, ease: 'easeInOut' }}
          onClick={() => {
            const searchEl = document.querySelector('.search-bar-floating');
            if (searchEl) searchEl.scrollIntoView({ behavior: 'smooth' });
          }}
        >
          <div className="mouse-icon">
            <div className="mouse-wheel" />
          </div>
          <span>DESCUBRIR</span>
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

          {loading ? (
            <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
              <div className="spinner spinner-lg" />
            </div>
          ) : (
            <motion.div
              className="grid grid-4 gap-lg"
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-50px' }}
              variants={stagger}
            >
              {rooms.map((room) => (
                <motion.div key={room.id} variants={fadeInUp}>
                  <div className="room-card" onClick={() => navigate(`/rooms/${room.slug}`)}>
                    <div className="room-card-image">
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          background: `linear-gradient(135deg, ${
                            room.slug.includes('standard')
                              ? '#2c3e50, #3498db'
                              : room.slug.includes('deluxe')
                              ? '#2c3e50, #8e44ad'
                              : room.slug.includes('ocean')
                              ? '#0f3460, #16213e'
                              : '#1a1a2e, #b89b5e'
                          })`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'rgba(255,255,255,0.3)',
                          fontSize: 'var(--text-3xl)',
                        }}
                      >
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
          )}
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
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        background: `linear-gradient(135deg, ${
                          exp.id === 'exp-restaurant'
                            ? '#2d1b00, #5c3317'
                            : exp.id === 'exp-spa'
                            ? '#1a332e, #2d5248'
                            : exp.id === 'exp-pool'
                            ? '#003d5c, #0077b6'
                            : '#1a1a2e, #2d2d44'
                        })`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'rgba(255,255,255,0.15)',
                      }}
                    >
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
      {reviews.length > 0 && (
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
              {reviews.map((review) => (
                <motion.div key={review.id} variants={fadeInUp}>
                  <div className="testimonial-card">
                    <div className="testimonial-header">
                      <div className="avatar avatar-md">{getInitials(review.user_name)}</div>
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
                      <div
                        style={{
                          marginTop: '0.75rem',
                          fontSize: 'var(--text-xs)',
                          color: 'var(--success)',
                          fontWeight: 500,
                        }}
                      >
                        ✓ Estancia verificada
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>
      )}

      {/* ══ CTA ══ */}
      <section className="cta-section">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={stagger}>
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
