"use client";
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useAuth } from './auth/authContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Rutas donde NO se debe mostrar la sidebar (incluso con usuario logueado)
  const noSidebarRoutes = ['/', '/pricing', '/subscription/success', '/auth/login', '/auth/register'];
  const shouldHideSidebar = pathname ? noSidebarRoutes.some(route => pathname.startsWith(route)) : false;
  
  // Lógica de visibilidad de sidebar:
  // - Si está cargando, no mostrar
  // - Si no hay usuario, no mostrar
  // - Si está en ruta excluida Y el usuario requiere pago (inactive o requiresSubscription), no mostrar
  // - Si es usuario legacy activo (isActive=true, requiresSubscription=false), mostrar siempre
  // - Si es usuario nuevo activo (isActive=true, requiresSubscription=true), mostrar siempre
  let showSidebar = false;
  
  if (!loading && user) {
    // Para usuarios legacy: isActive debe ser true y requiresSubscription false
    // Para usuarios nuevos: isActive true (o no definido) y requiresSubscription true
    const isLegacyUser = user.isActive === true && user.requiresSubscription === false;
    const isNewUser = user.isActive === true && user.requiresSubscription === true;
    const isUserActive = isLegacyUser || isNewUser;
    
    if (isUserActive) {
      // Usuarios activos pueden ver la sidebar en todas las rutas
      showSidebar = true;
    } else if (!shouldHideSidebar) {
      // Usuarios inactivos solo ven sidebar en rutas no excluidas
      showSidebar = true;
    }
  }

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Navigation />}
      <main className={`flex-1 transition-all duration-300 ${showSidebar && (isCollapsed ? 'lg:ml-16' : 'lg:ml-64')}`}>
        {children}
      </main>
    </div>
  );
}

export default function LayoutWithNav({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <LayoutContent>{children}</LayoutContent>
    </SidebarProvider>
  );
}
