import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { updateProfile } from '../services/authService';
import { Input } from '../../../components/ui/Input';
import { Button } from '../../../components/ui/Button';
import { Badge } from '../../../components/ui/Badge';
import { User, Phone, Mail, LogOut, Save, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

export const ProfileView: React.FC = () => {
  const { user, profile, refreshProfile, signOut } = useAuth();
  const [fullName, setFullName] = useState<string>(profile?.full_name || '');
  const [phone, setPhone] = useState<string>(profile?.phone || '');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
    }
  }, [profile]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    if (!fullName.trim()) {
      toast.error('El nombre no puede estar vacío');
      return;
    }

    setLoading(true);
    const res = await updateProfile(user.id, fullName, phone);
    setLoading(false);

    if (res.error) {
      toast.error(res.error);
      return;
    }

    await refreshProfile();
    toast.success('Perfil actualizado correctamente');
  };

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 px-4">
      <div className="bg-white rounded-2xl border border-[#3E2723]/10 p-6 sm:p-10 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#3E2723]/10">
          <div>
            <h1 className="text-2xl font-bold text-[#3E2723] tracking-tight">Mi Perfil</h1>
            <p className="text-xs text-[#6B6B6B] mt-1">
              Gestiona tu información personal de contacto para tus pedidos de chocolatería
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Badge role={profile?.role || 'customer'} />
          </div>
        </div>

        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Correo Electrónico (Solo Lectura)"
            type="email"
            disabled
            value={user?.email || ''}
            leftIcon={<Mail className="w-4 h-4" />}
            helperText="El correo electrónico está vinculado a tu acceso seguro."
          />

          <Input
            label="Nombre Completo *"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            leftIcon={<User className="w-4 h-4" />}
          />

          <Input
            label="Teléfono Celular"
            type="tel"
            placeholder="310 123 4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            leftIcon={<Phone className="w-4 h-4" />}
            helperText="Utilizado para contactarte sobre la entrega de tus chocolates."
          />

          <div className="p-3.5 bg-[#F9F6F0] rounded-xl text-xs text-[#6B6B6B] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 text-[#558B2F] shrink-0 mt-0.5" />
            <span>
              La dirección de envío se solicita y confirma directamente en cada checkout para garantizar flexibilidad en tus entregas.
            </span>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-[#3E2723]/10">
            <Button
              type="button"
              variant="ghost"
              onClick={signOut}
              leftIcon={<LogOut className="w-4 h-4" />}
              className="text-[#C62828] hover:bg-[#FFEBEE]"
            >
              Cerrar Sesión
            </Button>

            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={loading}
              leftIcon={<Save className="w-4 h-4" />}
            >
              Guardar Cambios
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
