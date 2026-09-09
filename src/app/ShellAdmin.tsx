import React from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  Store,
  LogOut,
  ShieldCheck,
} from 'lucide-react';

export interface ShellAdminProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const ShellAdmin: React.FC<ShellAdminProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { user, profile, signOut } = useAuth();

  const navItems = [
    { view: 'admin-dashboard', label: 'Panel de Control', icon: LayoutDashboard },
    { view: 'admin-productos', label: 'Productos & Categorías', icon: Package },
    { view: 'admin-pedidos', label: 'Moderación de Pedidos', icon: ShoppingBag },
    { view: 'admin-clientes', label: 'Clientes Registrados', icon: Users },
  ];

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#F9F6F0] text-[#1E1E1E]">
      {/* Sidebar Desktop */}
      <aside className="w-full md:w-64 bg-[#3E2723] text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-[#3E2723]/30">
        <div>
          {/* Brand header */}
          <div className="p-6 border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-[#D84315] text-white flex items-center justify-center font-serif font-bold text-lg shadow-xs">
                M
              </div>
              <div>
                <span className="font-serif text-lg font-bold tracking-tight block leading-none">
                  Marichuy
                </span>
                <span className="text-[10px] tracking-wider uppercase text-[#D84315] font-semibold block mt-0.5">
                  Administración
                </span>
              </div>
            </div>
            <ShieldCheck className="w-4 h-4 text-[#558B2F]" />
          </div>

          {/* Navigation Links */}
          <nav className="p-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.view;
              return (
                <button
                  key={item.view}
                  type="button"
                  onClick={() => onNavigate(item.view)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#D84315] text-white shadow-xs'
                      : 'text-white/75 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        {/* Footer info and store link */}
        <div className="p-4 border-t border-white/10 space-y-3">
          <button
            type="button"
            onClick={() => onNavigate('catalogo')}
            className="w-full flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <Store className="w-4 h-4 text-[#D84315]" />
            <span>Volver a la Tienda</span>
          </button>

          <div className="pt-2 flex items-center justify-between text-xs">
            <div className="min-w-0 pr-2">
              <p className="font-bold truncate text-white">
                {profile?.full_name || user?.email?.split('@')[0]}
              </p>
              <span className="text-[10px] text-white/60">Administrador</span>
            </div>

            <button
              type="button"
              onClick={signOut}
              className="p-1.5 text-white/70 hover:text-[#FF8A80] transition-colors"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Admin Content */}
      <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
        {children}
      </main>
    </div>
  );
};
