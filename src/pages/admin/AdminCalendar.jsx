import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  BedDouble,
  Users,
  CreditCard,
  X,
  Phone,
  Mail,
} from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  isWeekend,
  differenceInDays,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { adminService } from '../../services/adminService';
import { formatCurrency, formatDateRange, getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ rooms: [], reservations: [], roomTypes: [] });
  const [loading, setLoading] = useState(true);
  const [selectedRes, setSelectedRes] = useState(null);

  useEffect(() => {
    let isMounted = true;

    async function loadCalendar() {
      try {
        const data = await adminService.getCalendarData();
        if (isMounted) setCalendarData(data);
      } catch (err) {
        console.error('Error fetching calendar data:', err);
        toast.error('Error al cargar datos del calendario');
      } finally {
        if (isMounted) setLoading(false);
      }
    }

    loadCalendar();
    return () => {
      isMounted = false;
    };
  }, []);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const totalDays = days.length;

  // Group rooms by type
  const roomsByType = useMemo(() => {
    const grouped = {};
    (calendarData.rooms || []).forEach((room) => {
      const type = (calendarData.roomTypes || []).find((t) => t.id === room.room_type_id);
      const typeName = type?.name || 'Habitaciones';
      if (!grouped[typeName]) grouped[typeName] = [];
      grouped[typeName].push(room);
    });
    return grouped;
  }, [calendarData.rooms, calendarData.roomTypes]);

  // Active reservations in this month
  const monthReservations = useMemo(() => {
    return (calendarData.reservations || []).filter((r) => {
      if (r.status === 'cancelled') return false;
      const cIn = parseISO(r.check_in);
      const cOut = parseISO(r.check_out);
      return !isAfter(cIn, monthEnd) && !isBefore(cOut, monthStart);
    });
  }, [calendarData.reservations, monthStart, monthEnd]);

  // Calculate reservation blocks for a given room
  const getReservationBlocks = (roomId) => {
    return monthReservations
      .filter((r) => r.room_id === roomId)
      .map((res) => {
        const checkIn = parseISO(res.check_in);
        const checkOut = parseISO(res.check_out);

        // Clamp to current month bounds
        const startDay = isBefore(checkIn, monthStart) ? 0 : differenceInDays(checkIn, monthStart);
        const endDay = isAfter(checkOut, monthEnd) ? totalDays : differenceInDays(checkOut, monthStart);

        const leftPercent = (startDay / totalDays) * 100;
        const widthPercent = ((Math.max(1, endDay - startDay)) / totalDays) * 100;

        return {
          ...res,
          left: `calc(${leftPercent}% + 2px)`,
          width: `calc(${widthPercent}% - 4px)`,
          startDay,
          endDay,
        };
      });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center" style={{ minHeight: '400px' }}>
        <div className="spinner spinner-lg" />
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-md" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Calendario de Ocupación</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Diagrama Gantt interactivo por habitación en tiempo real
          </p>
        </div>

        {/* Quick Stats Chips */}
        <div className="flex items-center gap-sm flex-wrap">
          <div className="badge badge-gold" style={{ padding: '0.4rem 0.75rem', fontSize: 'var(--text-xs)' }}>
            <BedDouble size={14} style={{ marginRight: '0.25rem' }} /> {calendarData.rooms.length} Habitaciones
          </div>
          <div className="badge badge-info" style={{ padding: '0.4rem 0.75rem', fontSize: 'var(--text-xs)' }}>
            <CalendarIcon size={14} style={{ marginRight: '0.25rem' }} /> {monthReservations.length} Reservas este mes
          </div>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="calendar-gantt-card">
          {/* Toolbar */}
          <div className="calendar-header-toolbar">
            <div className="calendar-month-title">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </div>
            <div className="flex items-center gap-xs">
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft size={16} /> Mes anterior
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoy
              </button>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                Mes siguiente <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Gantt Matrix */}
          <div className="calendar-gantt-scroll">
            <div className="gantt-table">
              {/* Header: Days row */}
              <div className="gantt-header-row">
                <div className="gantt-room-header-col">Habitación</div>
                <div className="gantt-days-header-wrapper">
                  {days.map((day) => {
                    const today = isToday(day);
                    const weekend = isWeekend(day);
                    return (
                      <div
                        key={day.toISOString()}
                        className={cn(
                          'gantt-day-header-cell',
                          today && 'is-today',
                          weekend && 'is-weekend'
                        )}
                      >
                        <span className="day-name">{format(day, 'EE', { locale: es })}</span>
                        <span className="day-num">{format(day, 'd')}</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Grouped rows by category */}
              {Object.entries(roomsByType).map(([typeName, typeRooms]) => (
                <div key={typeName}>
                  <div className="gantt-category-row">
                    {typeName} · {typeRooms.length} habitaciones
                  </div>

                  {typeRooms.map((room) => {
                    const blocks = getReservationBlocks(room.id);
                    return (
                      <div key={room.id} className="gantt-room-row">
                        {/* Sticky Room Label */}
                        <div className="gantt-room-col">
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 'var(--text-sm)' }}>
                              Hab {room.room_number}
                            </div>
                            <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                              Piso {room.floor}
                            </div>
                          </div>
                          <span
                            className={cn(
                              'badge',
                              room.status === 'available' ? 'badge-success' : 'badge-warning'
                            )}
                            style={{ fontSize: '10px', padding: '1px 6px' }}
                          >
                            {room.status === 'available' ? 'Libre' : 'Mant.'}
                          </span>
                        </div>

                        {/* Timeline Track with Background Grid and Reservation Blocks */}
                        <div className="gantt-timeline-track">
                          {days.map((day) => (
                            <div
                              key={day.toISOString()}
                              className={cn(
                                'gantt-day-bg-cell',
                                isToday(day) && 'is-today',
                                isWeekend(day) && 'is-weekend'
                              )}
                            />
                          ))}

                          {/* Reservation Overlays */}
                          {blocks.map((block) => (
                            <div
                              key={block.id}
                              className={cn('gantt-reservation-pill', block.status)}
                              style={{
                                left: block.left,
                                width: block.width,
                              }}
                              onClick={() => setSelectedRes(block)}
                              title={`Click para ver: ${block.reservation_code} - ${block.guest?.full_name}`}
                            >
                              <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                {block.reservation_code} · {block.guest?.full_name?.split(' ')[0] || 'Huésped'}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>

          {/* Legend */}
          <div
            style={{
              padding: '1rem 1.5rem',
              borderTop: '1px solid var(--warm-gray)',
              background: 'var(--ivory)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-dark)',
            }}
          >
            <div className="flex items-center gap-md">
              <span className="flex items-center gap-xs">
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg, #0984e3, #74b9ff)', display: 'inline-block' }} />
                Confirmada
              </span>
              <span className="flex items-center gap-xs">
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg, #00b894, #55efc4)', display: 'inline-block' }} />
                Checked In
              </span>
              <span className="flex items-center gap-xs">
                <span style={{ width: 12, height: 12, borderRadius: 3, background: 'linear-gradient(135deg, #636e72, #b2bec3)', display: 'inline-block' }} />
                Checked Out
              </span>
            </div>
            <span style={{ color: 'var(--muted)', fontStyle: 'italic' }}>
              💡 Haz clic sobre cualquier barra para ver el detalle de la reserva
            </span>
          </div>
        </div>
      </motion.div>

      {/* Reservation Details Modal */}
      <AnimatePresence>
        {selectedRes && (
          <div className="modal-backdrop" onClick={() => setSelectedRes(null)}>
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              style={{ maxWidth: '480px' }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
                <div>
                  <div className="text-overline" style={{ color: 'var(--gold)' }}>
                    Reserva {selectedRes.reservation_code}
                  </div>
                  <h3 className="heading-4" style={{ margin: 0 }}>
                    {selectedRes.guest?.full_name || 'Huésped'}
                  </h3>
                </div>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedRes(null)}>
                  <X size={20} />
                </button>
              </div>

              <div className="flex flex-col gap-sm" style={{ marginBottom: 'var(--space-lg)' }}>
                <div className="flex items-center justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--warm-gray)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>ESTADO</span>
                  <span className={cn('badge', getStatusBadgeClass(selectedRes.status))}>
                    {getStatusLabel(selectedRes.status)}
                  </span>
                </div>

                <div className="flex items-center justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--warm-gray)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>ESTANCIA</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 600 }}>
                    {formatDateRange(selectedRes.check_in, selectedRes.check_out)}
                  </span>
                </div>

                <div className="flex items-center justify-between" style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--warm-gray)' }}>
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>TOTAL</span>
                  <span style={{ fontSize: 'var(--text-sm)', fontWeight: 700, color: 'var(--obsidian)' }}>
                    {formatCurrency(selectedRes.total_amount)}
                  </span>
                </div>

                {selectedRes.guest?.email && (
                  <div className="flex items-center gap-xs" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-dark)', marginTop: '0.25rem' }}>
                    <Mail size={14} style={{ color: 'var(--gold)' }} /> {selectedRes.guest.email}
                  </div>
                )}

                {selectedRes.guest?.phone && (
                  <div className="flex items-center gap-xs" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted-dark)' }}>
                    <Phone size={14} style={{ color: 'var(--gold)' }} /> {selectedRes.guest.phone}
                  </div>
                )}
              </div>

              <div className="flex justify-end">
                <button className="btn btn-secondary btn-sm" onClick={() => setSelectedRes(null)}>
                  Cerrar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
