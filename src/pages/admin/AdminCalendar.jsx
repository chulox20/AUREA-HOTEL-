import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  format,
  addMonths,
  subMonths,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  differenceInDays,
  parseISO,
  isBefore,
  isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { adminService } from '../../services/adminService';
import { cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState({ rooms: [], reservations: [], roomTypes: [] });
  const [loading, setLoading] = useState(true);

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

  const cellWidth = `${100 / days.length}%`;

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

  // Calculate reservation blocks for a given room
  const getReservationBlocks = (roomId) => {
    return (calendarData.reservations || [])
      .filter((r) => r.room_id === roomId && r.status !== 'cancelled')
      .map((res) => {
        const checkIn = parseISO(res.check_in);
        const checkOut = parseISO(res.check_out);

        // Calculate position within this month
        const startDay = isBefore(checkIn, monthStart) ? 0 : differenceInDays(checkIn, monthStart);
        const endDay = isAfter(checkOut, monthEnd) ? days.length : differenceInDays(checkOut, monthStart);

        const left = `${(startDay / days.length) * 100}%`;
        const width = `${((endDay - startDay) / days.length) * 100}%`;

        return {
          ...res,
          left,
          width,
          startDay,
          endDay,
          visible: endDay > 0 && startDay < days.length,
        };
      })
      .filter((b) => b.visible);
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
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Calendario de Ocupación</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Diagrama Gantt de reservas por habitación en tiempo real
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="calendar-gantt">
          {/* Controls */}
          <div className="calendar-controls">
            <div className="calendar-title">
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </div>
            <div className="flex gap-xs">
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
              >
                <ChevronLeft size={16} />
              </button>
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setCurrentMonth(new Date())}
              >
                Hoy
              </button>
              <button
                className="btn btn-ghost btn-sm btn-icon"
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Timeline Grid */}
          <div className="calendar-grid">
            {/* Days header */}
            <div className="calendar-row header-row">
              <div className="calendar-room-col">Habitación</div>
              <div className="calendar-days-col">
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn('calendar-day-header', isToday(day) && 'today')}
                    style={{ width: cellWidth }}
                  >
                    <span className="day-name">{format(day, 'EEE', { locale: es })}</span>
                    <span className="day-number">{format(day, 'd')}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Room rows grouped by type */}
            {Object.entries(roomsByType).map(([typeName, typeRooms]) => (
              <div key={typeName}>
                {/* Type header separator */}
                <div
                  style={{
                    padding: '0.5rem 1rem',
                    background: 'var(--ivory-dark)',
                    borderBottom: '1px solid var(--warm-gray)',
                    fontSize: 'var(--text-xs)',
                    fontWeight: 600,
                    color: 'var(--muted-dark)',
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                  }}
                >
                  {typeName} ({typeRooms.length} habitaciones)
                </div>

                {typeRooms.map((room) => {
                  const blocks = getReservationBlocks(room.id);
                  return (
                    <div key={room.id} className="calendar-row">
                      <div className="calendar-room-col">
                        <div className="flex items-center gap-xs">
                          <span style={{ fontWeight: 600 }}>Hab {room.room_number}</span>
                          <span
                            style={{
                              fontSize: '10px',
                              padding: '1px 4px',
                              borderRadius: '4px',
                              background:
                                room.status === 'available'
                                  ? 'var(--success-light)'
                                  : 'var(--warning-light)',
                              color:
                                room.status === 'available'
                                  ? 'var(--success)'
                                  : 'var(--warning)',
                            }}
                          >
                            Piso {room.floor}
                          </span>
                        </div>
                      </div>

                      <div className="calendar-days-col">
                        {/* Day grid lines */}
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className={cn('calendar-day-cell', isToday(day) && 'today')}
                            style={{ width: cellWidth }}
                          />
                        ))}

                        {/* Reservation blocks */}
                        {blocks.map((block) => (
                          <div
                            key={block.id}
                            className={cn('calendar-block', block.status)}
                            style={{
                              left: block.left,
                              width: block.width,
                            }}
                            title={`${block.reservation_code} - ${block.guest?.full_name} (${block.check_in} a ${block.check_out})`}
                          >
                            <span className="block-text">
                              {block.reservation_code} · {block.guest?.full_name}
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

          {/* Legend */}
          <div
            style={{
              padding: '1rem',
              borderTop: '1px solid var(--warm-gray)',
              display: 'flex',
              gap: '1.5rem',
              fontSize: 'var(--text-xs)',
              color: 'var(--muted)',
            }}
          >
            <span className="flex items-center gap-xs">
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: 'var(--info)',
                  display: 'inline-block',
                }}
              />
              Confirmada
            </span>
            <span className="flex items-center gap-xs">
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: 'var(--success)',
                  display: 'inline-block',
                }}
              />
              Checked In
            </span>
            <span className="flex items-center gap-xs">
              <span
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: 'var(--muted)',
                  display: 'inline-block',
                }}
              />
              Checked Out
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
