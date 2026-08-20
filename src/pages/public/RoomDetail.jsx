import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  BedDouble,
  Maximize,
  ArrowRight,
  Check,
  Wifi,
  Tv,
  Wine,
  Snowflake,
  Bath,
  DoorOpen,
  Waves,
  Droplets,
  Sofa,
  Lock,
  Wind,
  ConciergeBell,
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { roomService } from '../../services/roomService';
import { reviewService } from '../../services/reviewService';
import { formatCurrency, formatDate, calculateNights, cn, getInitials } from '../../lib/utils';
import toast from 'react-hot-toast';

const iconMap = {
  Wifi,
  Tv,
  Wine,
  Snowflake,
  Bath,
  DoorOpen,
  Waves,
  Droplets,
  Sofa,
  Lock,
  Wind,
  ConciergeBell,
};

function getAmenityIcon(amenityName) {
  const normalized = amenityName.toLowerCase();
  if (normalized.includes('wifi') || normalized.includes('wi-fi')) return Wifi;
  if (normalized.includes('tv')) return Tv;
  if (normalized.includes('minibar')) return Wine;
  if (normalized.includes('aire') || normalized.includes('ac')) return Snowflake;
  if (normalized.includes('baño') || normalized.includes('ducha')) return Bath;
  if (normalized.includes('balcón')) return DoorOpen;
  if (normalized.includes('mar') || normalized.includes('vista')) return Waves;
  if (normalized.includes('jacuzzi')) return Droplets;
  if (normalized.includes('sala') || normalized.includes('sofá')) return Sofa;
  if (normalized.includes('caja')) return Lock;
  if (normalized.includes('secador')) return Wind;
  if (normalized.includes('servicio')) return ConciergeBell;
  return Check;
}

export default function RoomDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { checkIn, checkOut, adults, setSearchParams, selectRoom } = useBooking();

  const [room, setRoom] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);

  useEffect(() => {
    let isMounted = true;

    async function loadRoomDetail() {
      try {
        const roomData = await roomService.getRoomTypeBySlug(id);
        if (isMounted) {
          setRoom(roomData);
          const reviewsData = await reviewService.getReviewsForRoomType(roomData.id);
          if (isMounted) setReviews(reviewsData);
        }
      } catch (err) {
        console.error('Error fetching room detail:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRoomDetail();
    return () => {
      isMounted = false;
    };
  }, [id]);

  const nights = calculateNights(checkIn, checkOut);
  const subtotal = room ? Number(room.base_price) * nights : 0;
  const tax = subtotal * 0.1;
  const total = subtotal + tax;

  const handleBookNow = async () => {
    if (!room) return;

    if (nights <= 0) {
      toast.error('Por favor, selecciona fechas válidas de estancia.');
      return;
    }

    setCheckingAvailability(true);
    try {
      // Check real-time physical availability in PostgreSQL
      const availableRooms = await roomService.checkRoomAvailability(room.id, checkIn, checkOut, adults);

      if (availableRooms.length === 0) {
        toast.error('Lo sentimos, no hay habitaciones disponibles de este tipo para las fechas seleccionadas.');
        return;
      }

      // Select first available physical room
      const assignedRoom = availableRooms[0];
      selectRoom(room, assignedRoom);
      navigate('/booking');
    } catch (err) {
      console.error('Error checking room availability:', err);
      toast.error('No se pudo verificar la disponibilidad en este momento.');
    } finally {
      setCheckingAvailability(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <div className="container section flex items-center justify-center" style={{ minHeight: '60vh' }}>
          <div className="spinner spinner-lg" />
        </div>
      </div>
    );
  }

  if (!room) {
    return (
      <div className="page">
        <div className="container section">
          <div className="empty-state">
            <BedDouble size={48} className="empty-state-icon" />
            <h3>Habitación no encontrada</h3>
            <p>La habitación que buscas no existe o no está disponible.</p>
            <button className="btn btn-primary" onClick={() => navigate('/rooms')}>
              Ver todas las habitaciones
            </button>
          </div>
        </div>
      </div>
    );
  }

  const galleryImages = [
    `linear-gradient(135deg, ${
      room.slug.includes('standard')
        ? '#2c3e50, #3498db'
        : room.slug.includes('deluxe')
        ? '#2c3e50, #8e44ad'
        : room.slug.includes('ocean')
        ? '#0f3460, #16213e'
        : '#1a1a2e, #b89b5e'
    })`,
    'linear-gradient(135deg, #2d3436, #636e72)',
    'linear-gradient(135deg, #0c3547, #1a6b8a)',
    'linear-gradient(135deg, #2c2c2c, #4a4a4a)',
  ];

  return (
    <div className="page">
      <div className="container section-sm">
        {/* Breadcrumb */}
        <div style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', marginBottom: 'var(--space-lg)' }}>
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/')}>
            Inicio
          </span>
          {' / '}
          <span style={{ cursor: 'pointer' }} onClick={() => navigate('/rooms')}>
            Habitaciones
          </span>
          {' / '}
          <span style={{ color: 'var(--obsidian)' }}>{room.name}</span>
        </div>

        <div className="room-detail">
          {/* ── Left: Gallery + Info ── */}
          <div>
            {/* Gallery */}
            <motion.div className="room-gallery" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="room-gallery-main">
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    background: galleryImages[selectedImage],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'rgba(255,255,255,0.2)',
                    fontSize: '3rem',
                  }}
                >
                  <BedDouble size={80} />
                </div>
              </div>
              <div className="room-gallery-thumbs">
                {galleryImages.map((bg, i) => (
                  <div
                    key={i}
                    className={cn('room-gallery-thumb', selectedImage === i && 'active')}
                    onClick={() => setSelectedImage(i)}
                  >
                    <div style={{ width: '100%', height: '100%', background: bg }} />
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Room Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              style={{ marginTop: 'var(--space-2xl)' }}
            >
              <div className="text-overline" style={{ marginBottom: 'var(--space-xs)' }}>
                {room.name.split(' ')[0]}
              </div>
              <h1 className="heading-2" style={{ marginBottom: 'var(--space-sm)' }}>
                {room.name}
              </h1>

              <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="flex items-center gap-xs">
                  <div className="star-rating">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} className="star filled" fill="var(--gold)" />
                    ))}
                  </div>
                  <span style={{ fontWeight: 600 }}>5.0</span>
                  <span style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>
                    ({reviews.length} reseñas verificadas)
                  </span>
                </div>
              </div>

              <div className="flex gap-xl" style={{ marginBottom: 'var(--space-xl)' }}>
                <div className="flex items-center gap-xs" style={{ color: 'var(--muted-dark)' }}>
                  <Users size={18} style={{ color: 'var(--gold)' }} />
                  <span>{room.capacity} huéspedes</span>
                </div>
                <div className="flex items-center gap-xs" style={{ color: 'var(--muted-dark)' }}>
                  <BedDouble size={18} style={{ color: 'var(--gold)' }} />
                  <span>{room.beds}</span>
                </div>
                <div className="flex items-center gap-xs" style={{ color: 'var(--muted-dark)' }}>
                  <Maximize size={18} style={{ color: 'var(--gold)' }} />
                  <span>{room.size} m²</span>
                </div>
              </div>

              <div className="divider divider-left" />

              {/* Description */}
              <h3 className="heading-5" style={{ marginBottom: 'var(--space-sm)' }}>
                Descripción
              </h3>
              <p
                style={{
                  color: 'var(--muted-dark)',
                  lineHeight: 'var(--leading-relaxed)',
                  marginBottom: 'var(--space-xl)',
                }}
              >
                {room.description}
              </p>

              {/* Amenities */}
              <h3 className="heading-5" style={{ marginBottom: 'var(--space-md)' }}>
                Características y amenidades
              </h3>
              <div className="room-amenities">
                {(room.amenities || []).map((amenity) => {
                  const Icon = getAmenityIcon(amenity);
                  return (
                    <div key={amenity} className="room-amenity">
                      <Icon size={18} />
                      {amenity}
                    </div>
                  );
                })}
              </div>

              {/* Reviews */}
              {reviews.length > 0 && (
                <div style={{ marginTop: 'var(--space-2xl)' }}>
                  <h3 className="heading-5" style={{ marginBottom: 'var(--space-md)' }}>
                    Reseñas de huéspedes
                  </h3>
                  <div className="flex flex-col gap-md">
                    {reviews.map((review) => (
                      <div key={review.id} className="testimonial-card">
                        <div className="testimonial-header">
                          <div className="avatar avatar-sm">{getInitials(review.user_name)}</div>
                          <div className="testimonial-info">
                            <h4>{review.user_name}</h4>
                            <span>{formatDate(review.created_at)}</span>
                          </div>
                        </div>
                        <div className="testimonial-rating">
                          <div className="star-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`star ${i < review.rating ? 'filled' : ''}`}
                                fill="var(--gold)"
                              />
                            ))}
                          </div>
                        </div>
                        <p>"{review.comment}"</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>
          </div>

          {/* ── Right: Booking Sidebar ── */}
          <div className="room-info-sidebar">
            <motion.div
              className="room-booking-card"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className="room-card-price" style={{ fontSize: 'var(--text-3xl)' }}>
                {formatCurrency(room.base_price)} <span>/ noche</span>
              </div>

              <div
                style={{
                  borderTop: '1px solid var(--warm-gray)',
                  paddingTop: 'var(--space-md)',
                  marginTop: 'var(--space-md)',
                }}
              >
                <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={checkIn}
                    onChange={(e) => setSearchParams({ checkIn: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-sm)' }}>
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={checkOut}
                    onChange={(e) => setSearchParams({ checkOut: e.target.value })}
                  />
                </div>
                <div className="form-group" style={{ marginBottom: 'var(--space-md)' }}>
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                    Huéspedes
                  </label>
                  <select
                    className="form-input form-select"
                    value={adults}
                    onChange={(e) => setSearchParams({ adults: Number(e.target.value) })}
                  >
                    {Array.from({ length: room.capacity || 2 }).map((_, i) => (
                      <option key={i + 1} value={i + 1}>
                        {i + 1} adulto{i > 0 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Price breakdown */}
              {nights > 0 && (
                <div
                  style={{
                    borderTop: '1px solid var(--warm-gray)',
                    paddingTop: 'var(--space-md)',
                    marginTop: 'var(--space-sm)',
                  }}
                >
                  <div className="booking-summary-row">
                    <span>
                      {nights} noche{nights > 1 ? 's' : ''} × {formatCurrency(room.base_price)}
                    </span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="booking-summary-row">
                    <span>Impuestos (10%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="booking-summary-total">
                    <span>Total</span>
                    <span>{formatCurrency(total)}</span>
                  </div>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: 'var(--space-md)' }}
                onClick={handleBookNow}
                disabled={checkingAvailability}
              >
                {checkingAvailability ? (
                  <>
                    <span className="spinner spinner-sm" /> Comprobando disponibilidad...
                  </>
                ) : (
                  <>
                    Reservar ahora <ArrowRight size={18} />
                  </>
                )}
              </button>

              <p
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted)',
                  textAlign: 'center',
                  marginTop: 'var(--space-sm)',
                }}
              >
                Disponibilidad garantizada y confirmación inmediata
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
}
