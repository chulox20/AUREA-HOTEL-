import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';
import { LogIn, Shield, Key, Sparkles, UserCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email('Email no válido'),
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres'),
});

export default function Login() {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/account';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });

  const handleFillAdmin = () => {
    setValue('email', 'admin@aureahotel.com', { shouldValidate: true });
    setValue('password', 'Admin123!_Secure', { shouldValidate: true });
    toast.success('Credenciales de Administrador cargadas');
  };

  const handleFillCustomer = () => {
    setValue('email', 'jmfiguera90@gmail.com', { shouldValidate: true });
    setValue('password', 'Password123!', { shouldValidate: true });
    toast.success('Credenciales de Huésped cargadas');
  };

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const result = await signIn(data.email, data.password);
      toast.success('¡Bienvenido de nuevo!');
      if (result?.profile?.role === 'admin') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login error:', err);
      toast.error(err.message || 'Error al iniciar sesión. Comprueba tus credenciales.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <Link
            to="/"
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'var(--text-2xl)',
              fontWeight: 700,
              color: 'var(--gold)',
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              display: 'block',
              marginBottom: '1rem',
            }}
          >
            Aurea Hotel
          </Link>
          <h1>Iniciar sesión</h1>
          <p>Bienvenido de nuevo a tu estancia de lujo</p>
        </div>

        {/* Demo Credentials Box */}
        <div
          style={{
            background: 'linear-gradient(135deg, rgba(184, 155, 94, 0.08), rgba(240, 237, 230, 0.6))',
            border: '1px solid rgba(184, 155, 94, 0.35)',
            borderRadius: 'var(--radius-lg)',
            padding: '0.875rem 1rem',
            marginBottom: '1.25rem',
          }}
        >
          <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
            <span
              className="flex items-center gap-xs"
              style={{
                fontSize: 'var(--text-xs)',
                fontWeight: 700,
                color: 'var(--gold-dark)',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              <Shield size={14} /> Credenciales de Prueba
            </span>
            <span
              style={{
                fontSize: '10px',
                background: 'var(--gold)',
                color: '#fff',
                padding: '1px 6px',
                borderRadius: '4px',
                fontWeight: 600,
              }}
            >
              DEMO
            </span>
          </div>

          <div
            style={{
              fontSize: 'var(--text-xs)',
              color: 'var(--muted-dark)',
              lineHeight: 1.5,
              marginBottom: '0.75rem',
            }}
          >
            <div>
              <strong>👑 Admin:</strong> <code style={{ color: 'var(--obsidian)', fontWeight: 600 }}>admin@aureahotel.com</code>
            </div>
            <div>
              <strong>🔑 Clave:</strong> <code style={{ color: 'var(--obsidian)', fontWeight: 600 }}>Admin123!_Secure</code>
            </div>
          </div>

          <div className="flex gap-xs flex-wrap">
            <button
              type="button"
              onClick={handleFillAdmin}
              className="btn btn-primary btn-sm"
              style={{
                fontSize: '11px',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                flex: 1,
                minHeight: '32px',
              }}
            >
              <Sparkles size={13} /> Autocompletar Admin
            </button>
            <button
              type="button"
              onClick={handleFillCustomer}
              className="btn btn-secondary btn-sm"
              style={{
                fontSize: '11px',
                padding: '0.25rem 0.625rem',
                borderRadius: '6px',
                flex: 1,
                minHeight: '32px',
              }}
            >
              <UserCheck size={13} /> Autocompletar Huésped
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-md">
          <div className="form-group">
            <label className="form-label">Correo electrónico</label>
            <input
              type="email"
              className={`form-input ${errors.email ? 'error' : ''}`}
              placeholder="correo@ejemplo.com"
              {...register('email')}
            />
            {errors.email && <span className="form-error">{errors.email.message}</span>}
          </div>

          <div className="form-group">
            <label className="form-label">Contraseña</label>
            <input
              type="password"
              className={`form-input ${errors.password ? 'error' : ''}`}
              placeholder="••••••••"
              {...register('password')}
            />
            {errors.password && <span className="form-error">{errors.password.message}</span>}
          </div>

          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ width: '100%', marginTop: '0.5rem' }}
          >
            {loading ? (
              <span className="spinner spinner-sm" />
            ) : (
              <>
                <LogIn size={16} /> Entrar
              </>
            )}
          </button>
        </form>

        <div className="auth-footer">
          ¿No tienes una cuenta? <Link to="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
