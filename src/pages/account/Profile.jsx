import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import { Save, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { getInitials } from '../../lib/utils';

export default function Profile() {
  const { profile, updateProfile } = useAuth();
  const [form, setForm] = useState({
    full_name: profile?.full_name || '',
    email: profile?.email || '',
    phone: profile?.phone || '',
    country: profile?.country || '',
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || '',
        email: profile.email || '',
        phone: profile.phone || '',
        country: profile.country || '',
      });
    }
  }, [profile]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await updateProfile(form);
      toast.success('Perfil actualizado');
    } catch (err) {
      toast.error('Error al actualizar');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <h2 className="heading-4" style={{ marginBottom: 'var(--space-lg)' }}>Mi perfil</h2>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        {/* Avatar */}
        <div className="flex items-center gap-lg" style={{ marginBottom: 'var(--space-xl)' }}>
          <div className="avatar avatar-xl">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.full_name} />
            ) : (
              getInitials(profile?.full_name)
            )}
          </div>
          <div>
            <h3 style={{ fontFamily: 'var(--font-serif)' }}>{profile?.full_name}</h3>
            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--muted)' }}>{profile?.email}</p>
            <button className="btn btn-ghost btn-sm" style={{ marginTop: '0.5rem' }}>
              <Camera size={14} /> Cambiar foto
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSave} style={{ background: '#fff', border: '1px solid var(--warm-gray)', borderRadius: 'var(--radius-lg)', padding: 'var(--space-xl)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-md)' }}>
            <div className="form-group">
              <label className="form-label">Nombre completo</label>
              <input
                className="form-input"
                value={form.full_name}
                onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} disabled style={{ opacity: 0.6 }} />
              <span className="form-helper">El email no se puede cambiar</span>
            </div>
            <div className="form-group">
              <label className="form-label">Teléfono</label>
              <input
                className="form-input"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="+52 555 123 4567"
              />
            </div>
            <div className="form-group">
              <label className="form-label">País</label>
              <select
                className="form-input form-select"
                value={form.country}
                onChange={(e) => setForm({ ...form, country: e.target.value })}
              >
                <option value="">Seleccionar</option>
                <option value="México">México</option>
                <option value="España">España</option>
                <option value="Colombia">Colombia</option>
                <option value="Argentina">Argentina</option>
                <option value="Chile">Chile</option>
                <option value="Perú">Perú</option>
                <option value="Estados Unidos">Estados Unidos</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
          </div>

          <div style={{ marginTop: 'var(--space-xl)', display: 'flex', justifyContent: 'flex-end' }}>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner spinner-sm" /> : <Save size={16} />}
              Guardar cambios
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
