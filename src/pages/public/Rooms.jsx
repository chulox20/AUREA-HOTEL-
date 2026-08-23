import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Star,
  Users,
  BedDouble,
  Maximize,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';
import { useBooking } from '../../contexts/BookingContext';
import { roomService } from '../../services/roomService';
import { formatCurrency, cn } from '../../lib/utils';

const ROOM_TYPE_FILTERS = ['Todas', 'Standard', 'Deluxe', 'Suite', 'Presidential'];
const AMENITY_FILTERS = ['Wi-Fi', 'TV', 'Minibar', 'Aire acondicionado', 'Baño privado', 'Balcón', 'Vista al mar', 'Jacuzzi'];

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
};

export default function Rooms() {
  const navigate = useNavigate();
  const { checkIn, checkOut, adults, setSearchParams } = useBooking();

  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState('Todas');
  const [priceRange, setPriceRange] = useState(500);
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function loadRooms() {
      try {
        const data = await roomService.getRoomTypes();
        if (isMounted) {
          setRooms(data);
          // Set maximum price range from data
          const maxPrice = Math.max(...data.map((r) => Number(r.base_price) || 500), 500);
          setPriceRange(maxPrice);
        }
      } catch (err) {
        console.error('Error loading rooms:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadRooms();
    return () => {
      isMounted = false;
    };
  }, []);

  const toggleAmenity = (amenity) => {
    setSelectedAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  const filteredRooms = useMemo(() => {
    return rooms.filter((room) => {
      // Type filter
      if (typeFilter !== 'Todas') {
        const typeLower = typeFilter.toLowerCase();
        if (!room.name.toLowerCase().includes(typeLower)) return false;
      }
      // Price filter
      if (Number(room.base_price) > priceRange) return false;
      // Amenity filter
      if (selectedAmenities.length > 0) {
        const roomAmenities = room.amenities || [];
        const hasAll = selectedAmenities.every((a) => roomAmenities.includes(a));
        if (!hasAll) return false;
      }
      // Capacity filter
      if (room.capacity < adults) return false;
      return true;
    });
  }, [rooms, typeFilter, priceRange, selectedAmenities, adults]);

  const clearFilters = () => {
    setTypeFilter('Todas');
    setPriceRange(500);
    setSelectedAmenities([]);
  };

  const hasActiveFilters = typeFilter !== 'Todas' || priceRange < 500 || selectedAmenities.length > 0;

  return (
    <div className="page">
      <div className="container section-sm">
        {/* Page Header */}
        <div style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="text-overline" style={{ marginBottom: 'var(--space-xs)' }}>
            Nuestras habitaciones
          </div>
          <h1 className="heading-2">Encuentra tu habitación ideal</h1>
        </div>

        {/* Mobile filter toggle */}
        <button
          className="btn btn-secondary hide-desktop"
          style={{ marginBottom: 'var(--space-md)', width: '100%' }}
          onClick={() => setShowFilters(!showFilters)}
        >
          <SlidersHorizontal size={16} />
          Filtros
          {hasActiveFilters && (
            <span className="badge badge-gold" style={{ marginLeft: '0.5rem' }}>
              {selectedAmenities.length + (typeFilter !== 'Todas' ? 1 : 0)}
            </span>
          )}
        </button>

        <div className="rooms-page">
          {/* ── Filters Sidebar ── */}
          <aside className={cn('rooms-filters', showFilters ? '' : 'hide-mobile')}>
            <div className="rooms-filters-card">
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                <h3 style={{ fontFamily: 'var(--font-sans)', fontSize: 'var(--text-base)', fontWeight: 600 }}>
                  Filtros
                </h3>
                {hasActiveFilters && (
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={clearFilters}
                    style={{ textTransform: 'none', fontSize: 'var(--text-xs)' }}
                  >
                    Limpiar
                  </button>
                )}
              </div>

              {/* Dates */}
              <div className="filter-section">
                <h3>Fechas</h3>
                <div className="form-group" style={{ marginBottom: '0.5rem' }}>
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                    Check-in
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={checkIn}
                    onChange={(e) => setSearchParams({ checkIn: e.target.value })}
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label" style={{ fontSize: 'var(--text-xs)' }}>
                    Check-out
                  </label>
                  <input
                    type="date"
                    className="form-input"
                    value={checkOut}
                    onChange={(e) => setSearchParams({ checkOut: e.target.value })}
                    style={{ fontSize: 'var(--text-sm)' }}
                  />
                </div>
              </div>

              {/* Guests */}
              <div className="filter-section">
                <h3>Huéspedes</h3>
                <select
                  className="form-input form-select"
                  value={adults}
                  onChange={(e) => setSearchParams({ adults: Number(e.target.value) })}
                  style={{ fontSize: 'var(--text-sm)' }}
                >
                  <option value={1}>1 adulto</option>
                  <option value={2}>2 adultos</option>
                  <option value={3}>3 adultos</option>
                  <option value={4}>4 adultos</option>
                </select>
              </div>

              {/* Room Type */}
              <div className="filter-section">
                <h3>Tipo</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {ROOM_TYPE_FILTERS.map((type) => (
                    <label key={type} className="filter-checkbox">
                      <input
                        type="radio"
                        name="roomType"
                        checked={typeFilter === type}
                        onChange={() => setTypeFilter(type)}
                        style={{ accentColor: 'var(--gold)' }}
                      />
                      {type}
                    </label>
                  ))}
                </div>
              </div>

              {/* Price Range */}
              <div className="filter-section">
                <h3>Precio por noche</h3>
                <div className="price-range">
                  <input
                    type="range"
                    min={100}
                    max={600}
                    step={10}
                    value={priceRange}
                    onChange={(e) => setPriceRange(Number(e.target.value))}
                  />
                  <div className="price-range-labels">
                    <span>$100</span>
                    <span style={{ fontWeight: 600, color: 'var(--obsidian)' }}>
                      Hasta {formatCurrency(priceRange)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Amenities */}
              <div className="filter-section">
                <h3>Características</h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                  {AMENITY_FILTERS.map((amenity) => (
                    <label key={amenity} className="filter-checkbox">
                      <input
                        type="checkbox"
                        checked={selectedAmenities.includes(amenity)}
                        onChange={() => toggleAmenity(amenity)}
                      />
                      {amenity}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </aside>

          {/* ── Room Grid ── */}
          <div className="rooms-grid">
            <div className="rooms-header">
              <span className="rooms-count">
                {filteredRooms.length} habitación{filteredRooms.length !== 1 ? 'es' : ''} encontrada
                {filteredRooms.length !== 1 ? 's' : ''}
              </span>
            </div>

            {loading ? (
              <div className="flex items-center justify-center" style={{ minHeight: '300px' }}>
                <div className="spinner spinner-lg" />
              </div>
            ) : filteredRooms.length === 0 ? (
              <div className="empty-state">
                <BedDouble size={48} className="empty-state-icon" />
                <h3>No se encontraron habitaciones</h3>
                <p>Intenta ajustar los filtros para encontrar habitaciones disponibles.</p>
                <button className="btn btn-primary" onClick={clearFilters}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <motion.div
                className="grid grid-2 gap-lg"
                initial="hidden"
                animate="visible"
                variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
              >
                {filteredRooms.map((room) => (
                  <motion.div key={room.id} variants={fadeInUp}>
                    <div
                      className="room-card"
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/rooms/${room.slug}`)}
                    >
                      <div className="room-card-image">
                        <img
                          src={
                            room.images?.[0]?.url ||
                            'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=85'
                          }
                          alt={room.name}
                          loading="lazy"
                        />
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
                        <div className="flex items-center gap-xs" style={{ marginBottom: '0.5rem' }}>
                          <div className="star-rating">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                size={14}
                                className={`star ${i < 5 ? 'filled' : ''}`}
                                fill="var(--gold)"
                              />
                            ))}
                          </div>
                          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                            5.0 (Excelente)
                          </span>
                        </div>
                        <div className="room-card-price">
                          {formatCurrency(room.base_price)} <span>/ noche</span>
                        </div>
                        <div className="room-card-meta">
                          <div className="room-card-meta-item">
                            <Users size={16} /> {room.capacity}
                          </div>
                          <div className="room-card-meta-item">
                            <BedDouble size={16} /> {room.beds}
                          </div>
                          <div className="room-card-meta-item">
                            <Maximize size={16} /> {room.size} m²
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
        </div>
      </div>
    </div>
  );
}
