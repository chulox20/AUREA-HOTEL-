import { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, ToggleLeft, ToggleRight, BedDouble } from 'lucide-react';
import { ROOMS, ROOM_TYPES } from '../../lib/mockData';
import { getStatusBadgeClass, getStatusLabel, cn } from '../../lib/utils';

export default function AdminRooms() {
  const [rooms] = useState(ROOMS);

  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Habitaciones</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {rooms.length} habitaciones registradas
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Agregar habitación
        </button>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Habitación</th>
                <th>Tipo</th>
                <th>Piso</th>
                <th>Precio base</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {rooms.map((room) => {
                const roomType = ROOM_TYPES.find((t) => t.id === room.room_type_id);
                return (
                  <tr key={room.id}>
                    <td>
                      <div className="flex items-center gap-sm">
                        <div style={{
                          width: 40, height: 40, borderRadius: 'var(--radius-md)',
                          background: 'var(--gold-50)', color: 'var(--gold)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          <BedDouble size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>Hab {room.room_number}</span>
                      </div>
                    </td>
                    <td>{roomType?.name || '—'}</td>
                    <td>Piso {room.floor}</td>
                    <td>${roomType?.base_price || '—'}</td>
                    <td>
                      <span className={cn('badge', getStatusBadgeClass(room.status))}>
                        {getStatusLabel(room.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-xs">
                        <button className="btn btn-ghost btn-icon btn-sm" title="Editar">
                          <Edit2 size={14} />
                        </button>
                        <button className="btn btn-ghost btn-icon btn-sm" title={room.status === 'available' ? 'Desactivar' : 'Activar'}>
                          {room.status === 'available' ? <ToggleRight size={14} style={{ color: 'var(--success)' }} /> : <ToggleLeft size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
