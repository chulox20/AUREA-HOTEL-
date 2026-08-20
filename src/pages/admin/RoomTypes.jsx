import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Edit2, Layers, X, Check } from 'lucide-react';
import { roomService } from '../../services/roomService';
import { formatCurrency } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminRoomTypes() {
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Edit Modal State
  const [selectedType, setSelectedType] = useState(null);
  const [saving, setSaving] = useState(false);

  const loadRoomTypes = async () => {
    try {
      const data = await roomService.getAdminRoomTypes();
      setRoomTypes(data);
    } catch (err) {
      console.error('Error loading room types:', err);
      toast.error('Error al cargar tipos de habitación');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRoomTypes();
  }, []);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!selectedType) return;

    setSaving(true);
    try {
      await roomService.updateRoomType(selectedType.id, {
        name: selectedType.name,
        base_price: Number(selectedType.base_price),
        capacity: Number(selectedType.capacity),
        size: Number(selectedType.size),
        beds: selectedType.beds,
        description: selectedType.description,
      });

      toast.success('Tipo de habitación actualizado correctamente');
      setSelectedType(null);
      await loadRoomTypes();
    } catch (err) {
      console.error('Error updating room type:', err);
      toast.error('Error al guardar los cambios');
    } finally {
      setSaving(false);
    }
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
          <h1 className="heading-3">Tipos de Habitación & Tarifas</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {roomTypes.length} categorías de habitación configuradas
          </p>
        </div>
      </div>

      <motion.div className="grid grid-2 gap-lg" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        {roomTypes.map((type) => (
          <div
            key={type.id}
            style={{
              background: '#fff',
              border: '1px solid var(--warm-gray)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--space-xl)',
            }}
          >
            <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-md)' }}>
              <div className="flex items-center gap-sm">
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 'var(--radius-md)',
                    background: 'var(--gold-50)',
                    color: 'var(--gold)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Layers size={18} />
                </div>
                <div>
                  <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 'var(--text-lg)' }}>
                    {type.name}
                  </h3>
                  <span className="badge badge-gold">{type.slug}</span>
                </div>
              </div>
              <button
                className="btn btn-ghost btn-icon btn-sm"
                onClick={() => setSelectedType(type)}
                title="Editar tarifas y detalles"
              >
                <Edit2 size={16} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 'var(--space-md)' }}>
              <div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>Precio base</div>
                <div style={{ fontWeight: 600, fontSize: 'var(--text-lg)' }}>
                  {formatCurrency(type.base_price)}
                </div>
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

            <div
              style={{
                marginTop: 'var(--space-md)',
                paddingTop: 'var(--space-md)',
                borderTop: '1px solid var(--warm-gray)',
              }}
            >
              <div
                style={{
                  fontSize: 'var(--text-xs)',
                  color: 'var(--muted)',
                  marginBottom: 'var(--space-xs)',
                }}
              >
                Amenidades
              </div>
              <div className="flex flex-wrap gap-xs">
                {(type.amenities || []).map((a) => (
                  <span
                    key={a}
                    style={{
                      fontSize: 'var(--text-xs)',
                      background: 'var(--ivory-dark)',
                      padding: '0.125rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      color: 'var(--muted-dark)',
                    }}
                  >
                    {a}
                  </span>
                ))}
              </div>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Edit Room Type Modal */}
      <AnimatePresence>
        {selectedType && (
          <div className="modal-backdrop">
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 className="heading-4">Editar {selectedType.name}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setSelectedType(null)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Nombre de Categoría</label>
                  <input
                    type="text"
                    className="form-input"
                    value={selectedType.name}
                    onChange={(e) => setSelectedType({ ...selectedType, name: e.target.value })}
                    required
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Precio base por noche ($ USD)</label>
                    <input
                      type="number"
                      step="0.01"
                      className="form-input"
                      value={selectedType.base_price}
                      onChange={(e) =>
                        setSelectedType({ ...selectedType, base_price: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Capacidad máxima</label>
                    <input
                      type="number"
                      min="1"
                      max="10"
                      className="form-input"
                      value={selectedType.capacity}
                      onChange={(e) =>
                        setSelectedType({ ...selectedType, capacity: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
                  <div className="form-group">
                    <label className="form-label">Tamaño (m²)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="form-input"
                      value={selectedType.size}
                      onChange={(e) => setSelectedType({ ...selectedType, size: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Camas</label>
                    <input
                      type="text"
                      className="form-input"
                      value={selectedType.beds || ''}
                      onChange={(e) => setSelectedType({ ...selectedType, beds: e.target.value })}
                      placeholder="1 cama King"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Descripción</label>
                  <textarea
                    className="form-input form-textarea"
                    rows={3}
                    value={selectedType.description || ''}
                    onChange={(e) =>
                      setSelectedType({ ...selectedType, description: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="flex justify-end gap-sm" style={{ marginTop: 'var(--space-lg)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setSelectedType(null)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <Check size={16} />}
                    Guardar Cambios
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
