import React, { useState } from 'react';
import { useAuth } from '../features/auth/hooks/useAuth';
import { useCartStore } from '../features/cart/store/useCartStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import {
  ShoppingBag,
  User,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  Package,
  Sparkles,
} from 'lucide-react';

export interface ShellTiendaProps {
  currentView: string;
  onNavigate: (view: string) => void;
  children: React.ReactNode;
}

export const ShellTienda: React.FC<ShellTiendaProps> = ({
  currentView,
  onNavigate,
  children,
}) => {
  const { user, profile, signOut } = useAuth();
  const { items, openDrawer } = useCartStore();
  const itemsCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isAdmin = profile?.role === 'admin';

  return (
    <div className="mc-app min-h-screen flex flex-col text-[#1E1E1E]">
      <div className="g-scene" />
      {/* Top artisanal announcement bar */}
      <div className="bg-[#2E1C18]/80 backdrop-blur-md text-[#F9F6F0] text-[11px] py-2 px-4 text-center tracking-wider font-medium flex items-center justify-center gap-2">
        <Sparkles className="w-3.5 h-3.5 text-[#D84315]" />
        <span>Chocolatería artesanal con cacao fino colombiano de aroma · Envíos a todo el país</span>
      </div>

      {/* Main Navigation Header */}
      <header className="glass glass--strong g-static mc-shell-in sticky top-3 z-40 mx-3 sm:mx-6 mt-3 max-w-7xl xl:mx-auto xl:w-[calc(100%-3rem)] [--g-radius:28px]">
        <div className="px-4 sm:px-6 h-16 flex items-center justify-between">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('catalogo')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-2xl bg-[#3E2723] text-white flex items-center justify-center font-serif font-bold text-xl group-hover:bg-[#D84315] group-hover:rotate-[-6deg] transition-all duration-300 shadow-[0_6px_18px_-6px_rgba(62,39,35,.6)]">
              M
            </div>
            <div>
              <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-[#3E2723] block leading-none">
                Marichuy
              </span>
              <span className="text-[10px] tracking-widest uppercase text-[#D84315] font-semibold hidden sm:block mt-0.5">
                Chocolatería Artesanal
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-white/45 border border-white/70 text-[13px] font-medium text-[#3E2723]/80">
            <button
              onClick={() => onNavigate('catalogo')}
              className={`px-4 py-2 rounded-full transition-all duration-300 ${
                currentView === 'catalogo' || currentView === 'producto'
                  ? 'bg-[#3E2723] text-white shadow-[0_4px_14px_-4px_rgba(62,39,35,.6)]'
                  : 'hover:bg-white/60 hover:text-[#3E2723]'
              }`}
            >
              Catálogo de Cacao
            </button>

            {user && (
              <button
                onClick={() => onNavigate('mis-pedidos')}
                className={`px-4 py-2 rounded-full transition-all duration-300 flex items-center gap-1.5 ${
                  currentView === 'mis-pedidos'
                    ? 'bg-[#3E2723] text-white shadow-[0_4px_14px_-4px_rgba(62,39,35,.6)]'
                    : 'hover:bg-white/60 hover:text-[#3E2723]'
                }`}
              >
                <Package className="w-4 h-4" />
                Mis Pedidos
              </button>
            )}

            {isAdmin && (
              <button
                onClick={() => onNavigate('admin-dashboard')}
                className="text-[#558B2F] hover:text-[#3E2723] transition-colors py-2 flex items-center gap-1.5 bg-[#F1F8E9]/80 px-4 rounded-full"
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                Panel Admin
              </button>
            )}
          </nav>

          {/* Right Header Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Cart trigger button */}
            <button
              type="button"
              onClick={() => onNavigate('carrito')}
              className="relative h-10 px-3 text-[#3E2723] hover:text-[#D84315] rounded-full bg-white/45 hover:bg-white/70 hover:-translate-y-0.5 active:scale-95 transition-all duration-300 flex items-center gap-2 border border-white/70"
              aria-label="Ir al carrito de compras"
              data-magnetic=".25"
            >
              <ShoppingBag className="w-5 h-5" />
              <span className="hidden sm:inline text-xs font-bold">Cesta</span>
              {itemsCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#D84315] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {itemsCount}
                </span>
              )}
            </button>

            {/* Auth status trigger */}
            {user ? (
              <div className="relative group">
                <button
                  type="button"
                  onClick={() => onNavigate('perfil')}
                  className="flex items-center gap-2 h-10 p-1 pr-3 rounded-full border border-white/70 bg-white/45 hover:bg-white/70 text-xs font-semibold text-[#3E2723] transition-all duration-300 hover:-translate-y-0.5"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#D84315] to-[#3E2723] text-white flex items-center justify-center text-xs font-bold">
                    {(profile?.full_name || user.email || 'U')[0].toUpperCase()}
                  </div>
                  <span className="hidden sm:inline max-w-[120px] truncate">
                    {profile?.full_name || user.email?.split('@')[0]}
                  </span>
                </button>
              </div>
            ) : (
              <Button
                variant="primary"
                size="sm"
                data-magnetic=".25"
                onClick={() => onNavigate('auth')}
                leftIcon={<User className="w-4 h-4" />}
              >
                Ingresar
              </Button>
            )}

            {/* Mobile hamburger */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-[#3E2723] rounded-lg hover:bg-[#F9F6F0]"
              aria-label="Abrir menú móvil"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden mc-fade border-t border-white/60 px-4 py-4 space-y-3">
            <button
              onClick={() => {
                onNavigate('catalogo');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left py-2 text-sm font-semibold text-[#3E2723]"
            >
              Catálogo de Cacao
            </button>

            {user && (
              <>
                <button
                  onClick={() => {
                    onNavigate('mis-pedidos');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-sm font-semibold text-[#3E2723] flex items-center gap-2"
                >
                  <Package className="w-4 h-4 text-[#D84315]" /> Mis Pedidos
                </button>
                <button
                  onClick={() => {
                    onNavigate('perfil');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left py-2 text-sm font-semibold text-[#3E2723] flex items-center gap-2"
                >
                  <User className="w-4 h-4 text-[#558B2F]" /> Mi Perfil
                </button>
              </>
            )}

            {isAdmin && (
              <button
                onClick={() => {
                  onNavigate('admin-dashboard');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-[#558B2F] flex items-center gap-2"
              >
                <ShieldAlert className="w-4 h-4" /> Panel de Administración
              </button>
            )}

            {user && (
              <button
                onClick={() => {
                  signOut();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left py-2 text-sm font-semibold text-[#C62828] flex items-center gap-2 pt-2 border-t border-[#3E2723]/10"
              >
                <LogOut className="w-4 h-4" /> Cerrar Sesión
              </button>
            )}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-28 md:pb-8">
        <div key={currentView === 'producto' ? 'catalogo' : currentView} className="mc-page">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation Bar (Viewport angosto: 4 destinos) */}
      <nav
        aria-label="Navegación móvil"
        className="md:hidden glass glass--strong g-static fixed bottom-3 left-3 right-3 z-40 px-2 py-1.5 flex items-center justify-around [--g-radius:24px]"
      >
        <button
          type="button"
          onClick={() => onNavigate('catalogo')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-[10px] font-medium min-w-[60px] min-h-[44px] ${
            currentView === 'catalogo' || currentView === 'producto'
              ? 'text-[#D84315] font-bold'
              : 'text-[#6B6B6B] hover:text-[#3E2723]'
          }`}
        >
          <Sparkles className="w-5 h-5 mb-0.5" />
          <span>Catálogo</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate('carrito')}
          className={`relative flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-[10px] font-medium min-w-[60px] min-h-[44px] ${
            currentView === 'carrito'
              ? 'text-[#D84315] font-bold'
              : 'text-[#6B6B6B] hover:text-[#3E2723]'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 mb-0.5" />
            {itemsCount > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#D84315] text-white text-[9px] font-bold rounded-full h-4 min-w-[16px] px-1 flex items-center justify-center shadow-xs">
                {itemsCount > 99 ? '99+' : itemsCount}
              </span>
            )}
          </div>
          <span>Carrito</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(user ? 'mis-pedidos' : 'auth')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-[10px] font-medium min-w-[60px] min-h-[44px] ${
            currentView === 'mis-pedidos'
              ? 'text-[#D84315] font-bold'
              : 'text-[#6B6B6B] hover:text-[#3E2723]'
          }`}
        >
          <Package className="w-5 h-5 mb-0.5" />
          <span>Mis Pedidos</span>
        </button>

        <button
          type="button"
          onClick={() => onNavigate(user ? 'perfil' : 'auth')}
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-[10px] font-medium min-w-[60px] min-h-[44px] ${
            currentView === 'perfil' || currentView === 'auth'
              ? 'text-[#D84315] font-bold'
              : 'text-[#6B6B6B] hover:text-[#3E2723]'
          }`}
        >
          <User className="w-5 h-5 mb-0.5" />
          <span>{user ? 'Perfil' : 'Ingresar'}</span>
        </button>
      </nav>

      {/* Artisan Footer */}
      <footer className="glass glass--dark g-static mx-3 sm:mx-6 mb-24 md:mb-6 mt-12 py-12 px-6 sm:px-10 [--g-radius:32px]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-[#D84315] text-white flex items-center justify-center font-serif font-bold text-base">
                M
              </div>
              <span className="font-serif text-lg font-bold text-white tracking-wide">
                Marichuy
              </span>
            </div>
            <p className="text-[#F9F6F0]/70 leading-relaxed">
              Elaboramos chocolates artesanales bean-to-bar en pequeños lotes, honrando a los cacaocultores de Arauca, Santander, Tumaco y la Sierra Nevada de Santa Marta.
            </p>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#D84315] mb-3">
              Cacaos de Origen
            </h4>
            <ul className="space-y-2 text-[#F9F6F0]/70">
              <li>Sierra Nevada 72% · Frutos Rojos</li>
              <li>Arauca 80% · Notas Miel y Malta</li>
              <li>Santander 65% · Cítricos y Café</li>
              <li>Tumaco 70% · Nuez y Cacao Profundo</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#D84315] mb-3">
              Métodos de Pago
            </h4>
            <ul className="space-y-2 text-[#F9F6F0]/70">
              <li>Transferencia directa Nequi</li>
              <li>Efectivo contra entrega en tu puerta</li>
              <li>Verificación segura y directa</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold uppercase tracking-wider text-[#D84315] mb-3">
              Atención Artesanal
            </h4>
            <p className="text-[#F9F6F0]/70 leading-relaxed">
              Bogotá D.C., Colombia
              <br />
              Lunes a Sábado: 8:00 AM – 6:00 PM
              <br />
              contacto@marichuychocolate.co
            </p>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-[#F9F6F0]/10 text-center text-[#F9F6F0]/50 text-[11px]">
          © {new Date().getFullYear()} Chocolates Marichuy S.A.S. Todos los derechos reservados.
        </div>
      </footer>
    </div>
  );
};
