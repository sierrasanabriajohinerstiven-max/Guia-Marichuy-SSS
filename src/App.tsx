import React, { useState, useEffect } from 'react';
import { AuthProvider } from './app/AuthProvider';
import { useAuth } from './features/auth/hooks/useAuth';
import { ShellTienda } from './app/ShellTienda';
import { ShellAdmin } from './app/ShellAdmin';
import { CatalogPage } from './features/catalog/components/CatalogPage';
import { CartDrawer } from './features/cart/components/CartDrawer';
import { CartView } from './features/cart/components/CartView';
import { CheckoutForm } from './features/checkout/components/CheckoutForm';
import { NequiPaymentView } from './features/payments/components/NequiPaymentView';
import { OrderConfirmedView } from './features/orders/components/OrderConfirmedView';
import { MyOrdersView } from './features/orders/components/MyOrdersView';
import { ProfileView } from './features/auth/components/ProfileView';
import { AuthForm } from './features/auth/components/AuthForm';
import { ResetPasswordForm } from './features/auth/components/ResetPasswordForm';
import { AdminDashboard } from './features/admin/components/AdminDashboard';
import { ProductTable } from './features/admin/components/ProductTable';
import { OrderTable } from './features/admin/components/OrderTable';
import { ClientTable } from './features/admin/components/ClientTable';
import { CartLineItem, EnvioPayload, CanonicalView, UserRole } from './types/db';
import { Button } from './components/ui/Button';
import { ShieldAlert } from 'lucide-react';
import { Toaster } from 'react-hot-toast';
import toast from 'react-hot-toast';

function MainRouter() {
  const { user, profile, loading: authLoading, isRecoveryMode } = useAuth();

  // Single-source state-based routing
  const [currentView, setCurrentView] = useState<CanonicalView>('catalogo');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [createdOrderId, setCreatedOrderId] = useState<string | null>(null);
  const [checkoutPayload, setCheckoutPayload] = useState<{
    items: CartLineItem[];
    envio: EnvioPayload;
  } | null>(null);
  const [authRedirectView, setAuthRedirectView] = useState<CanonicalView | null>(null);

  // Protected route guards
  useEffect(() => {
    if (authLoading) return;

    // Admin views protection
    if (currentView.startsWith('admin-')) {
      if (!user) {
        setAuthRedirectView(currentView);
        setCurrentView('auth');
        toast.error('Inicia sesión con tu cuenta de administrador.');
      } else if (profile && profile.role !== 'admin') {
        setCurrentView('catalogo');
        toast.error('Acceso denegado: solo personal autorizado de Marichuy.');
      }
    }

    // Customer views protection
    if ((currentView === 'mis-pedidos' || currentView === 'perfil') && !user) {
      setAuthRedirectView(currentView);
      setCurrentView('auth');
      toast('Por favor inicia sesión para continuar.');
    }
  }, [currentView, user, profile, authLoading]);

  // Handle navigate
  const handleNavigate = (view: string) => {
    if (view === 'catalogo') {
      setSelectedProductId(null);
    }
    setCurrentView(view as CanonicalView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectProduct = (productId: string | null) => {
    setSelectedProductId(productId);
    if (productId) {
      setCurrentView('producto');
    } else {
      setCurrentView('catalogo');
    }
  };

  // Auth success callback — recibe el rol fresco desde AuthForm (evita profile stale)
  const handleAuthSuccess = (role?: UserRole) => {
    if (authRedirectView) {
      const target = authRedirectView;
      setAuthRedirectView(null);
      setCurrentView(target);
    } else {
      const effectiveRole = role ?? profile?.role;
      setCurrentView(effectiveRole === 'admin' ? 'admin-dashboard' : 'catalogo');
    }
  };

  // Checkout transitions
  const handleGoToCheckout = () => {
    if (!user) {
      setAuthRedirectView('checkout');
      setCurrentView('auth');
      toast('Inicia sesión o regístrate para proceder al pago');
      return;
    }
    setCurrentView('checkout');
  };

  const handleProceedToNequi = (payload: { items: CartLineItem[]; envio: EnvioPayload }) => {
    setCheckoutPayload(payload);
    setCurrentView('pago-nequi');
  };

  const handleOrderSuccess = (orderId: string) => {
    setCreatedOrderId(orderId);
    setCheckoutPayload(null);
    setCurrentView('pedido-confirmado');
  };

  // If password recovery link was clicked or user opened recuperar-clave
  if (isRecoveryMode || currentView === 'recuperar-clave') {
    return (
      <ShellTienda currentView="auth" onNavigate={handleNavigate}>
        <div className="max-w-md mx-auto py-12">
          <ResetPasswordForm onBackToLogin={() => handleNavigate('auth')} />
        </div>
      </ShellTienda>
    );
  }

  // Render Admin Layout with synchronous 403 protection
  if (currentView.startsWith('admin-')) {
    if (authLoading) {
      return (
        <div className="mc-app min-h-screen flex items-center justify-center">
          <div className="g-scene" />
          <div className="w-8 h-8 border-4 border-[#D84315] border-t-transparent rounded-full animate-spin" />
        </div>
      );
    }

    if (!user) {
      return (
        <ShellTienda currentView="auth" onNavigate={handleNavigate}>
          <div className="max-w-md mx-auto py-12">
            <div className="text-center mb-6">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#D84315]/10 flex items-center justify-center text-[#D84315]">
                <ShieldAlert className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-[#3E2723]">Autenticación Requerida</h2>
              <p className="text-xs text-[#6B6B6B] mt-1">Inicia sesión con credenciales de administrador.</p>
            </div>
            <AuthForm
              onSuccess={handleAuthSuccess}
              onForgotPassword={() => handleNavigate('recuperar-clave')}
            />
          </div>
        </ShellTienda>
      );
    }

    if (profile && profile.role !== 'admin') {
      return (
        <ShellTienda currentView="catalogo" onNavigate={handleNavigate}>
          <div className="max-w-md mx-auto py-16 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-[#C62828]/10 flex items-center justify-center text-[#C62828]">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-[#3E2723] mb-2">403 - Acceso Denegado</h2>
            <p className="text-xs text-[#6B6B6B] mb-6 leading-relaxed">
              Tu cuenta ({user.email}) no tiene permisos administrativos en Chocolatería Marichuy.
            </p>
            <Button variant="primary" onClick={() => handleNavigate('catalogo')}>
              Regresar al Catálogo
            </Button>
          </div>
        </ShellTienda>
      );
    }

    return (
      <ShellAdmin currentView={currentView} onNavigate={handleNavigate}>
        {currentView === 'admin-dashboard' && (
          <AdminDashboard
            onNavigateToProducts={() => handleNavigate('admin-productos')}
            onNavigateToOrders={() => handleNavigate('admin-pedidos')}
          />
        )}
        {currentView === 'admin-productos' && <ProductTable />}
        {currentView === 'admin-pedidos' && <OrderTable />}
        {currentView === 'admin-clientes' && <ClientTable />}
      </ShellAdmin>
    );
  }

  // Render Public Store Layout
  return (
    <ShellTienda currentView={currentView} onNavigate={handleNavigate}>
      {/* Drawer rendered globally across the store */}
      <CartDrawer
        onGoToCheckout={handleGoToCheckout}
        onExploreCatalog={() => handleNavigate('catalogo')}
      />

      {/* Catalog and Product Detail Views */}
      {(currentView === 'catalogo' || currentView === 'producto') && (
        <CatalogPage
          selectedProductId={selectedProductId}
          onSelectProduct={handleSelectProduct}
        />
      )}

      {/* Full Shopping Cart Canonical View */}
      {currentView === 'carrito' && (
        <CartView
          onNavigateToCatalog={() => handleNavigate('catalogo')}
          onNavigateToCheckout={handleGoToCheckout}
        />
      )}

      {/* Checkout Form View */}
      {currentView === 'checkout' && (
        <CheckoutForm
          onOrderSuccess={handleOrderSuccess}
          onProceedToNequi={handleProceedToNequi}
          onBackToCart={() => handleNavigate('catalogo')}
        />
      )}

      {/* Nequi Manual Payment View */}
      {currentView === 'pago-nequi' && checkoutPayload && (
        <NequiPaymentView
          payload={checkoutPayload}
          onOrderSuccess={handleOrderSuccess}
          onBackToCheckout={() => setCurrentView('checkout')}
        />
      )}

      {/* Order Confirmed View */}
      {currentView === 'pedido-confirmado' && (
        <OrderConfirmedView
          orderId={createdOrderId}
          onGoToMyOrders={() => handleNavigate('mis-pedidos')}
          onContinueShopping={() => handleNavigate('catalogo')}
        />
      )}

      {/* Customer Orders History View */}
      {currentView === 'mis-pedidos' && (
        <MyOrdersView onExploreCatalog={() => handleNavigate('catalogo')} />
      )}

      {/* Customer Profile View */}
      {currentView === 'perfil' && <ProfileView />}

      {/* Authentication View */}
      {currentView === 'auth' && (
        <div className="max-w-md mx-auto py-8">
          <AuthForm
            onSuccess={handleAuthSuccess}
            onForgotPassword={() => handleNavigate('recuperar-clave')}
          />
        </div>
      )}
    </ShellTienda>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(46, 28, 24, 0.78)',
            backdropFilter: 'blur(18px) saturate(160%)',
            WebkitBackdropFilter: 'blur(18px) saturate(160%)',
            color: '#F9F6F0',
            fontSize: '13px',
            borderRadius: '16px',
            padding: '10px 14px',
            border: '1px solid rgba(255,255,255,0.18)',
            boxShadow: '0 14px 40px -10px rgba(40,20,10,.45)',
          },
          success: {
            iconTheme: {
              primary: '#558B2F',
              secondary: '#FFFFFF',
            },
          },
          error: {
            iconTheme: {
              primary: '#D84315',
              secondary: '#FFFFFF',
            },
          },
        }}
      />
      <MainRouter />
    </AuthProvider>
  );
}
