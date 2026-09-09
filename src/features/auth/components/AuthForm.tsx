import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { signIn, signUp } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail, Lock, User, Phone } from 'lucide-react';
import type { UserRole } from '../../../types/db';

export interface AuthFormProps {
  onSuccess: (role?: UserRole) => void;
  onForgotPassword: () => void;
}

export const AuthForm: React.FC<AuthFormProps> = ({ onSuccess, onForgotPassword }) => {
  const { refreshProfile } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Form fields
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [fullName, setFullName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setLoading(true);

    if (mode === 'login') {
      const res = await signIn(email, password);
      if (res.error) {
        setErrorBanner(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      const prof = await refreshProfile();
      toast.success('¡Bienvenido a Marichuy Chocolatería!');
      setLoading(false);
      onSuccess(prof?.role);
    } else {
      if (!fullName.trim()) {
        setErrorBanner('Por favor ingresa tu nombre completo.');
        setLoading(false);
        return;
      }
      if (!phone.trim()) {
        setErrorBanner('Por favor ingresa tu número telefónico.');
        setLoading(false);
        return;
      }

      const res = await signUp(email, password, fullName, phone);
      if (res.error) {
        setErrorBanner(res.error);
        toast.error(res.error);
        setLoading(false);
        return;
      }

      const prof = await refreshProfile();
      toast.success('Cuenta registrada con éxito. ¡Bienvenido!');
      setLoading(false);
      onSuccess(prof?.role);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl border border-[#3E2723]/10 shadow-sm">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-[#3E2723] tracking-tight">
          {mode === 'login' ? 'Iniciar Sesión' : 'Crear Cuenta en Marichuy'}
        </h2>
        <p className="text-sm text-[#6B6B6B] mt-1.5">
          {mode === 'login'
            ? 'Accede a tu cuenta para gestionar tus compras y pedidos artesanales'
            : 'Únete para disfrutar del chocolate de origen más fino de Colombia'}
        </p>
      </div>

      {errorBanner && (
        <div className="mb-5 p-3.5 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs font-medium text-[#C62828]">
          {errorBanner}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {mode === 'register' && (
          <>
            <Input
              label="Nombre Completo"
              type="text"
              required
              placeholder="Ej. Sofía Morales"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              leftIcon={<User className="w-4 h-4" />}
            />

            <Input
              label="Teléfono Celular"
              type="tel"
              required
              placeholder="Ej. 310 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              leftIcon={<Phone className="w-4 h-4" />}
            />
          </>
        )}

        <Input
          label="Correo Electrónico"
          type="email"
          required
          placeholder="tucorreo@ejemplo.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          leftIcon={<Mail className="w-4 h-4" />}
        />

        <Input
          label="Contraseña"
          type="password"
          required
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          leftIcon={<Lock className="w-4 h-4" />}
        />

        {mode === 'login' && (
          <div className="flex justify-end pt-1">
            <button
              type="button"
              onClick={onForgotPassword}
              className="text-xs font-medium text-[#D84315] hover:text-[#BF360C] hover:underline"
            >
              ¿Olvidaste tu contraseña?
            </button>
          </div>
        )}

        <Button
          type="submit"
          variant="primary"
          size="lg"
          className="w-full mt-2"
          isLoading={loading}
        >
          {mode === 'login' ? 'Ingresar a mi Cuenta' : 'Registrarme'}
        </Button>
      </form>

      <div className="mt-6 pt-5 border-t border-[#3E2723]/10 text-center">
        <p className="text-xs text-[#6B6B6B]">
          {mode === 'login' ? '¿Aún no tienes cuenta?' : '¿Ya tienes una cuenta registrada?'}
          <button
            type="button"
            onClick={() => {
              setErrorBanner(null);
              setMode(mode === 'login' ? 'register' : 'login');
            }}
            className="ml-1.5 font-bold text-[#3E2723] hover:underline"
          >
            {mode === 'login' ? 'Regístrate aquí' : 'Inicia sesión'}
          </button>
        </p>
      </div>
    </div>
  );
};
