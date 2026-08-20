import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ROOMS, ROOM_TYPES, SAMPLE_RESERVATIONS } from '../../lib/mockData';
import {
  format, addMonths, subMonths, startOfMonth, endOfMonth,
  eachDayOfInterval, isToday, differenceInDays, parseISO, isBefore, isAfter,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '../../lib/utils';

export default function AdminCalendar() {
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const cellWidth = `${100 / days.length}%`;

  // Group rooms by type
  const roomsByType = useMemo(() => {
    const grouped = {};
    ROOMS.forEach((room) => {
      const type = ROOM_TYPES.find((t) => t.id === room.room_type_id);
      const typeName = type?.name || 'Otro';
      if (!grouped[typeName]) grouped[typeName] = [];
      grouped[typeName].push(room);
    });
    return grouped;
  }, []);

  // Calculate reservation blocks for a given room
  const getReservationBlocks = (roomId) => {
    return SAMPLE_RESERVATIONS
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

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Calendario</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            Vista de ocupación del hotel
          </p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="calendar-container">
          {/* Calendar header with month navigation */}
          <div className="calendar-header">
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}>
              <ChevronLeft size={20} />
            </button>
            <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-xl)', textTransform: 'capitalize' }}>
              {format(currentMonth, 'MMMM yyyy', { locale: es })}
            </h2>
            <button className="btn btn-ghost btn-icon" onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}>
              <ChevronRight size={20} />
            </button>
          </div>

          {/* Calendar grid */}
          <div className="calendar-grid" style={{ minWidth: Math.max(800, days.length * 45) }}>
            {/* Day headers */}
            <div className="calendar-row">
              <div className="calendar-room-label" style={{ fontWeight: 600, fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                HABITACIÓN
              </div>
              <div className="calendar-cells" style={{ display: 'flex' }}>
                {days.map((day) => (
                  <div
                    key={day.toISOString()}
                    className={cn('calendar-day-header', isToday(day) && 'today')}
                    style={{ flex: 1, minWidth: 40 }}
                  >
                    <div style={{ fontWeight: 600 }}>{format(day, 'd')}</div>
                    <div style={{ fontSize: '0.6rem', textTransform: 'uppercase' }}>{format(day, 'EEE', { locale: es })}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Room rows grouped by type */}
            {Object.entries(roomsByType).map(([typeName, rooms]) => (
              <div key={typeName}>
                {/* Type header */}
                <div className="calendar-row" style={{ background: 'var(--ivory-dark)' }}>
                  <div className="calendar-room-label" style={{
                    fontSize: 'var(--text-xs)', fontWeight: 700, textTransform: 'uppercase',
                    letterSpacing: '0.1em', color: 'var(--gold)', background: 'var(--ivory-dark)',
                  }}>
                    {typeName}
                  </div>
                  <div className="calendar-cells" style={{ background: 'var(--ivory-dark)' }} />
                </div>

                {/* Room rows */}
                {rooms.map((room) => {
                  const blocks = getReservationBlocks(room.id);
                  return (
                    <div key={room.id} className="calendar-row">
                      <div className="calendar-room-label">
                        <div>
                          <div style={{ fontWeight: 600 }}>Hab {room.room_number}</div>
                          {room.status === 'maintenance' && (
                            <span className="badge badge-maintenance" style={{ fontSize: '0.6rem', padding: '0 0.25rem' }}>
                              Mant.
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="calendar-cells" style={{ display: 'flex', position: 'relative' }}>
                        {/* Grid cells */}
                        {days.map((day) => (
                          <div
                            key={day.toISOString()}
                            className="calendar-cell"
                            style={{ flex: 1, minWidth: 40 }}
                          />
                        ))}

                        {/* Reservation blocks */}
                        {blocks.map((block) => (
                          <div
                            key={block.id}
                            className={cn('calendar-block', block.status)}
                            style={{ left: block.left, width: block.width }}
                            title={`${block.reservation_code} - ${block.guest.full_name}`}
                          >
                            {block.guest.full_name.split(' ')[0]}
                          </div>
                        ))}

                        {/* Maintenance overlay */}
                        {room.status === 'maintenance' && (
                          <div style={{
                            position: 'absolute', inset: 0,
                            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(0,0,0,0.03) 10px, rgba(0,0,0,0.03) 20px)',
                          }} />
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="flex gap-lg flex-wrap" style={{ marginTop: 'var(--space-lg)' }}>
          {[
            { label: 'Confirmada', className: 'confirmed' },
            { label: 'Check-in', className: 'checked-in' },
            { label: 'Check-out', className: 'checked-out' },
            { label: 'Pendiente', className: 'pending' },
            { label: 'Mantenimiento', className: 'maintenance' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-xs" style={{ fontSize: 'var(--text-sm)' }}>
              <div style={{
                width: 16, height: 16, borderRadius: 'var(--radius-sm)',
              }} className={cn('calendar-block', item.className)} />
              <span style={{ color: 'var(--muted-dark)' }}>{item.label}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
