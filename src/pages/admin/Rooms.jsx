import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ToggleLeft,
  ToggleRight,
  BedDouble,
  X,
  Check,
  Edit2,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { roomService } from '../../services/roomService';
import { getStatusBadgeClass, getStatusLabel, formatCurrency, cn } from '../../lib/utils';
import toast from 'react-hot-toast';

export default function AdminRooms() {
  const [rooms, setRooms] = useState([]);
  const [roomTypes, setRoomTypes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [deletingRoom, setDeletingRoom] = useState(null);

  const [saving, setSaving] = useState(false);
  const [newRoom, setNewRoom] = useState({
    room_number: '',
    floor: 1,
    room_type_id: '',
    status: 'available',
  });

  const loadData = async () => {
    try {
      const [roomsData, typesData] = await Promise.all([
        roomService.getAdminRooms(),
        roomService.getAdminRoomTypes(),
      ]);
      setRooms(roomsData);
      setRoomTypes(typesData);
      if (typesData.length > 0 && !newRoom.room_type_id) {
        setNewRoom((prev) => ({ ...prev, room_type_id: typesData[0].id }));
      }
    } catch (err) {
      console.error('Error loading rooms data:', err);
      toast.error('Error al cargar las habitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleToggleStatus = async (room) => {
    const nextStatus = room.status === 'available' ? 'maintenance' : 'available';
    try {
      await roomService.updateRoom(room.id, { status: nextStatus });
      setRooms((prev) =>
        prev.map((r) => (r.id === room.id ? { ...r, status: nextStatus } : r))
      );
      toast.success(`Habitación ${room.room_number} cambiada a ${getStatusLabel(nextStatus)}`);
    } catch (err) {
      console.error('Error updating room status:', err);
      toast.error('No se pudo actualizar el estado');
    }
  };

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoom.room_number.trim()) {
      toast.error('Ingresa el número de habitación');
      return;
    }

    setSaving(true);
    try {
      await roomService.createRoom({
        room_number: newRoom.room_number.trim(),
        floor: Number(newRoom.floor),
        room_type_id: newRoom.room_type_id || roomTypes[0]?.id,
        status: newRoom.status,
      });

      toast.success(`Habitación ${newRoom.room_number} creada con éxito`);
      setShowAddModal(false);
      setNewRoom({
        room_number: '',
        floor: 1,
        room_type_id: roomTypes[0]?.id || '',
        status: 'available',
      });
      await loadData();
    } catch (err) {
      console.error('Error creating room:', err);
      toast.error(err.message || 'Error al crear la habitación');
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateRoom = async (e) => {
    e.preventDefault();
    if (!editingRoom) return;

    setSaving(true);
    try {
      await roomService.updateRoom(editingRoom.id, {
        room_number: editingRoom.room_number.trim(),
        floor: Number(editingRoom.floor),
        room_type_id: editingRoom.room_type_id,
        status: editingRoom.status,
      });

      toast.success(`Habitación ${editingRoom.room_number} actualizada`);
      setEditingRoom(null);
      await loadData();
    } catch (err) {
      console.error('Error updating room:', err);
      toast.error(err.message || 'Error al actualizar habitación');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRoom = async () => {
    if (!deletingRoom) return;

    setSaving(true);
    try {
      await roomService.deleteRoom(deletingRoom.id);
      toast.success(`Habitación ${deletingRoom.room_number} eliminada del sistema`);
      setDeletingRoom(null);
      setRooms((prev) => prev.filter((r) => r.id !== deletingRoom.id));
    } catch (err) {
      console.error('Error deleting room:', err);
      toast.error('No se puede eliminar: tiene reservas asociadas.');
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
          <h1 className="heading-3">Gestión de Habitaciones</h1>
          <p style={{ color: 'var(--muted)', fontSize: 'var(--text-sm)' }}>
            {rooms.length} habitaciones físicas registradas en el hotel
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowAddModal(true)}>
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
                const type = room.room_types;
                return (
                  <tr key={room.id}>
                    <td>
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
                          <BedDouble size={18} />
                        </div>
                        <span style={{ fontWeight: 600 }}>Hab {room.room_number}</span>
                      </div>
                    </td>
                    <td>{type?.name || '—'}</td>
                    <td>Piso {room.floor}</td>
                    <td>{type?.base_price ? formatCurrency(type.base_price) : '—'}</td>
                    <td>
                      <span className={cn('badge', getStatusBadgeClass(room.status))}>
                        {getStatusLabel(room.status)}
                      </span>
                    </td>
                    <td>
                      <div className="flex items-center gap-xs">
                        {/* Toggle Available / Maintenance */}
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleToggleStatus(room)}
                          title={
                            room.status === 'available'
                              ? 'Poner en mantenimiento'
                              : 'Marcar como disponible'
                          }
                          style={{ padding: '0.25rem 0.5rem' }}
                        >
                          {room.status === 'available' ? (
                            <ToggleRight size={20} style={{ color: 'var(--success)' }} />
                          ) : (
                            <ToggleLeft size={20} style={{ color: 'var(--warning)' }} />
                          )}
                        </button>

                        {/* Edit room */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() =>
                            setEditingRoom({
                              id: room.id,
                              room_number: room.room_number,
                              floor: room.floor,
                              room_type_id: room.room_type_id,
                              status: room.status,
                            })
                          }
                          title="Editar habitación"
                        >
                          <Edit2 size={15} />
                        </button>

                        {/* Delete room */}
                        <button
                          className="btn btn-ghost btn-icon btn-sm"
                          onClick={() => setDeletingRoom(room)}
                          title="Eliminar habitación"
                          style={{ color: 'var(--error)' }}
                        >
                          <Trash2 size={15} />
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

      {/* Modal Agregar Habitación */}
      <AnimatePresence>
        {showAddModal && (
          <div className="modal-backdrop">
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 className="heading-4">Nueva Habitación Física</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setShowAddModal(false)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleCreateRoom} className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Número de Habitación *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Ej: 501"
                    value={newRoom.room_number}
                    onChange={(e) => setNewRoom({ ...newRoom, room_number: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Piso *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({ ...newRoom, floor: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Habitación *</label>
                  <select
                    className="form-input form-select"
                    value={newRoom.room_type_id}
                    onChange={(e) => setNewRoom({ ...newRoom, room_type_id: e.target.value })}
                    required
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({formatCurrency(rt.base_price)}/noche)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado Inicial</label>
                  <select
                    className="form-input form-select"
                    value={newRoom.status}
                    onChange={(e) => setNewRoom({ ...newRoom, status: e.target.value })}
                  >
                    <option value="available">Disponible</option>
                    <option value="maintenance">Mantenimiento</option>
                  </select>
                </div>

                <div className="flex justify-end gap-sm" style={{ marginTop: 'var(--space-lg)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setShowAddModal(false)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <Check size={16} />}
                    Guardar Habitación
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Editar Habitación */}
      <AnimatePresence>
        {editingRoom && (
          <div className="modal-backdrop">
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
            >
              <div className="flex items-center justify-between" style={{ marginBottom: 'var(--space-lg)' }}>
                <h3 className="heading-4">Editar Habitación {editingRoom.room_number}</h3>
                <button className="btn btn-ghost btn-sm" onClick={() => setEditingRoom(null)}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleUpdateRoom} className="flex flex-col gap-md">
                <div className="form-group">
                  <label className="form-label">Número de Habitación *</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editingRoom.room_number}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, room_number: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Piso *</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    className="form-input"
                    value={editingRoom.floor}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, floor: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Tipo de Habitación *</label>
                  <select
                    className="form-input form-select"
                    value={editingRoom.room_type_id}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, room_type_id: e.target.value })
                    }
                    required
                  >
                    {roomTypes.map((rt) => (
                      <option key={rt.id} value={rt.id}>
                        {rt.name} ({formatCurrency(rt.base_price)}/noche)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Estado</label>
                  <select
                    className="form-input form-select"
                    value={editingRoom.status}
                    onChange={(e) =>
                      setEditingRoom({ ...editingRoom, status: e.target.value })
                    }
                  >
                    <option value="available">Disponible</option>
                    <option value="maintenance">Mantenimiento</option>
                    <option value="occupied">Ocupada</option>
                  </select>
                </div>

                <div className="flex justify-end gap-sm" style={{ marginTop: 'var(--space-lg)' }}>
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => setEditingRoom(null)}
                    disabled={saving}
                  >
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary" disabled={saving}>
                    {saving ? <span className="spinner spinner-sm" /> : <Check size={16} />}
                    Actualizar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Confirmar Eliminar */}
      <AnimatePresence>
        {deletingRoom && (
          <div className="modal-backdrop">
            <motion.div
              className="modal-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              style={{ maxWidth: '420px' }}
            >
              <div className="flex items-center gap-md" style={{ marginBottom: 'var(--space-md)' }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: '50%',
                    background: 'var(--error-light)',
                    color: 'var(--error)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <AlertTriangle size={24} />
                </div>
                <div>
                  <h3 className="heading-5" style={{ margin: 0 }}>¿Eliminar habitación?</h3>
                  <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)', margin: 0 }}>
                    Habitación {deletingRoom.room_number} (Piso {deletingRoom.floor})
                  </p>
                </div>
              </div>

              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted-dark)', marginBottom: 'var(--space-lg)' }}>
                Esta acción quitará la habitación física del inventario del hotel. No se puede deshacer.
              </p>

              <div className="flex justify-end gap-sm">
                <button
                  className="btn btn-ghost"
                  onClick={() => setDeletingRoom(null)}
                  disabled={saving}
                >
                  Cancelar
                </button>
                <button
                  className="btn btn-danger"
                  onClick={handleDeleteRoom}
                  disabled={saving}
                >
                  {saving ? <span className="spinner spinner-sm" /> : 'Eliminar permanentemente'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
