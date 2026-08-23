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
    name: 'Restaurante de Autor',
    category: 'ALTA GASTRONOMÍA',
    description: 'Cocina mediterránea y fusión marina con los mejores maridajes frente al mar.',
    image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'exp-spa',
    name: 'Spa & Circuito Termal',
    category: 'BIENESTAR HOLÍSTICO',
    description: 'Rituales ancestrales, masajes terapéuticos y baños de hidromasaje relajantes.',
    image: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'exp-pool',
    name: 'Infinity Pool & Lounge',
    category: 'EXCLUSIVIDAD',
    description: 'Piscina infinita suspendida sobre el océano con servicio de mixología premium.',
    image: 'https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?auto=format&fit=crop&w=1200&q=85',
  },
  {
    id: 'exp-gym',
    name: 'Fitness & Yoga Sanctuary',
    category: 'SALUD & ENERGÍA',
    description: 'Equipamiento Technogym de última generación y sesiones de yoga al amanecer.',
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=85',
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
            src="https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=2880&q=95"
            alt="Aurea Hotel & Resort de Lujo 5 Estrellas"
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
              {rooms.map((room) => {
                const primaryImage =
                  room.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85';
                return (
                  <motion.div key={room.id} variants={fadeInUp}>
                    <div className="room-card" onClick={() => navigate(`/rooms/${room.slug}`)}>
                      <div className="room-card-image">
                        <img src={primaryImage} alt={room.name} loading="lazy" />
                        <div className="room-card-badge">
                          <span
                            style={{
                              fontSize: '10px',
                              fontWeight: 700,
                              letterSpacing: '0.08em',
                              background: 'rgba(23, 23, 23, 0.75)',
                              color: 'var(--gold-light)',
                              padding: '3px 8px',
                              borderRadius: '4px',
                              backdropFilter: 'blur(6px)',
                              border: '1px solid rgba(184, 155, 94, 0.3)',
                              textTransform: 'uppercase',
                            }}
                          >
                            {room.name.split(' ')[0]}
                          </span>
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
                );
              })}
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
            <div className="text-overline">Experiencias & Servicios</div>
            <h2>Vive momentos inolvidables</h2>
            <div className="divider" />
            <p>Descubre un santuario de alta gastronomía, bienestar termal y espacios diseñados para deleitar tus sentidos.</p>
          </motion.div>

          <motion.div
            className="grid grid-4 gap-lg"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
            variants={stagger}
          >
            {EXPERIENCES.map((exp) => (
              <motion.div key={exp.id} variants={fadeInUp}>
                <div className="experience-card" onClick={() => navigate('/rooms')}>
                  <img
                    src={exp.image}
                    alt={exp.name}
                    className="experience-card-img"
                    loading="lazy"
                  />
                  <div className="experience-card-overlay">
                    <span className="experience-card-cat">{exp.category}</span>
                    <h3>{exp.name}</h3>
                    <p>{exp.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
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
