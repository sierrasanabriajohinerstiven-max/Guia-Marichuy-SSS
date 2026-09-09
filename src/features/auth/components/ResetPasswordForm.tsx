import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { requestPasswordReset, updatePassword } from '../services/authService';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';
import { Mail, Lock, ArrowLeft, CheckCircle2 } from 'lucide-react';

export interface ResetPasswordFormProps {
  onBackToLogin: () => void;
}

export const ResetPasswordForm: React.FC<ResetPasswordFormProps> = ({ onBackToLogin }) => {
  const { isRecoveryMode, setRecoveryMode } = useAuth();
  const [email, setEmail] = useState<string>('');
  const [newPassword, setNewPassword] = useState<string>('');
  const [confirmPassword, setConfirmPassword] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [emailSent, setEmailSent] = useState<boolean>(false);
  const [errorBanner, setErrorBanner] = useState<string | null>(null);

  // Momento 1: Solicitud de restablecimiento por correo
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);
    setLoading(true);

    const res = await requestPasswordReset(email);
    setLoading(false);

    if (res.error) {
      setErrorBanner(res.error);
      toast.error(res.error);
      return;
    }

    setEmailSent(true);
    toast.success('Enlace de recuperación enviado a tu correo');
  };

  // Momento 2: Actualización de contraseña tras PASSWORD_RECOVERY
  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorBanner(null);

    if (newPassword.length < 6) {
      setErrorBanner('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorBanner('Las contraseñas no coinciden.');
      return;
    }

    setLoading(true);
    const res = await updatePassword(newPassword);
    setLoading(false);

    if (res.error) {
      setErrorBanner(res.error);
      toast.error(res.error);
      return;
    }

    toast.success('Contraseña actualizada con éxito');
    setRecoveryMode(false);
    onBackToLogin();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white p-8 rounded-xl border border-[#3E2723]/10 shadow-sm">
      <button
        onClick={onBackToLogin}
        type="button"
        className="inline-flex items-center text-xs font-semibold text-[#3E2723] hover:text-[#D84315] mb-6 transition-colors"
      >
        <ArrowLeft className="w-4 h-4 mr-1.5" />
        Volver a Iniciar Sesión
      </button>

      {isRecoveryMode ? (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#3E2723] tracking-tight">
              Nueva Contraseña
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1.5">
              Ingresa tu nueva contraseña para acceder nuevamente a tu cuenta.
            </p>
          </div>

          {errorBanner && (
            <div className="mb-5 p-3.5 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs font-medium text-[#C62828]">
              {errorBanner}
            </div>
          )}

          <form onSubmit={handleUpdatePassword} className="space-y-4">
            <Input
              label="Nueva Contraseña"
              type="password"
              required
              placeholder="Mínimo 6 caracteres"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Input
              label="Confirmar Nueva Contraseña"
              type="password"
              required
              placeholder="Repite la nueva contraseña"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              leftIcon={<Lock className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Guardar y Continuar
            </Button>
          </form>
        </div>
      ) : emailSent ? (
        <div className="text-center py-4">
          <div className="w-12 h-12 rounded-full bg-[#E8F5E9] text-[#2E7D32] flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-[#3E2723] mb-2">Revisa tu Bandeja de Entrada</h3>
          <p className="text-sm text-[#6B6B6B] mb-6 leading-relaxed">
            Hemos enviado las instrucciones para restablecer tu contraseña a{' '}
            <strong className="text-[#1E1E1E]">{email}</strong>. Por favor abre el enlace que recibiste.
          </p>
          <Button variant="outline" onClick={onBackToLogin} className="w-full">
            Regresar al inicio de sesión
          </Button>
        </div>
      ) : (
        <div>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-[#3E2723] tracking-tight">
              Recuperar Contraseña
            </h2>
            <p className="text-sm text-[#6B6B6B] mt-1.5">
              Ingresa el correo electrónico asociado a tu cuenta de Marichuy y te enviaremos un enlace de restablecimiento.
            </p>
          </div>

          {errorBanner && (
            <div className="mb-5 p-3.5 bg-[#FFEBEE] border border-[#C62828]/20 rounded-lg text-xs font-medium text-[#C62828]">
              {errorBanner}
            </div>
          )}

          <form onSubmit={handleRequestReset} className="space-y-4">
            <Input
              label="Correo Electrónico"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              leftIcon={<Mail className="w-4 h-4" />}
            />

            <Button
              type="submit"
              variant="primary"
              size="lg"
              className="w-full"
              isLoading={loading}
            >
              Enviar Enlace de Recuperación
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
