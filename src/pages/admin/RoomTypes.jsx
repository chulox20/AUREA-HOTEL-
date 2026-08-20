import { motion } from 'framer-motion';
import { Plus, Edit2, Layers } from 'lucide-react';
import { ROOM_TYPES } from '../../lib/mockData';
import { formatCurrency } from '../../lib/utils';

export default function AdminRoomTypes() {
  return (
    <div>
      <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-xl)' }}>
        <div>
          <h1 className="heading-3">Tipos de habitación</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {ROOM_TYPES.length} tipos configurados
          </p>
        </div>
        <button className="btn btn-primary">
          <Plus size={16} /> Agregar tipo
        </button>
      </div>

      <motion.div
        className="grid grid-2 gap-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {ROOM_TYPES.map((type) => (
          <div key={type.id} style={{
            background: '#fff', border: '1px solid var(--warm-gray)',
            borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)',
          }}>
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="flex items-center gap-sm">
                <div style={{
                  width: 40, height: 40, borderRadius: 'var(--radius-md)',
                  background: 'var(--gold-50)', color: 'var(--gold)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>{type.name}</h3>
                  <span className="badge badge-gold">{type.slug}</span>
                </div>
              </div>
              <button className="btn btn-ghost btn-icon btn-sm">
                <Edit2 size={14} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Precio base</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>{formatCurrency(type.base_price)}</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Capacidad</div>
                <div style={{ fontWeight: 600 }}>{type.capacity} huéspedes</div>
              </div>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Tamaño</div>
                <div style={{ fontWeight: 600 }}>{type.size} m²</div>
              </div>
            </div>

            <div style={{ marginTop: 'var(--space-md)', paddingTop: 'var(--space-md)', borderTop: '1px solid var(--warm-gray)' }}>
              <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginBottom: 'var(--space-xs)' }}>Amenidades</div>
              <div className="flex flex-wrap gap-xs">
                {type.amenities.slice(0, 6).map((a) => (
                  <span key={a} style={{
                    fontSize: 'var(--text-xs)', background: 'var(--ivory-dark)',
                    padding: '0.125rem 0.5rem', borderRadius: 'var(--radius-full)',
                    color: 'var(--muted-dark)',
                  }}>
                    {a}
                  </span>
                ))}
                {type.amenities.length > 6 && (
                  <span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>
                    +{type.amenities.length - 6} más
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </motion.div>
    </div>
  );
}
