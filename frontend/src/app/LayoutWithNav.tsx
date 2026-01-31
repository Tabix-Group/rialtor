"use client";
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useAuth } from './auth/authContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Debug: verificar si user existe
  console.log('[LayoutWithNav] User from useAuth:', user);
  console.log('[LayoutWithNav] Loading from useAuth:', loading);
  
  // Debug: verificar campos específicos del usuario
  if (user) {
    console.log('[LayoutWithNav] user.isActive:', user.isActive);
    console.log('[LayoutWithNav] user.requiresSubscription:', user.requiresSubscription);
  }
  
  // Rutas donde NO se debe mostrar la sidebar (incluso con usuario logueado)
  const noSidebarRoutes = ['/', '/pricing', '/subscription/success', '/auth/login', '/auth/register'];
  const shouldHideSidebar = pathname ? noSidebarRoutes.some(route => pathname.startsWith(route)) : false;
  
  console.log('[LayoutWithNav] shouldHideSidebar (route-based):', shouldHideSidebar);
  
  // Lógica de visibilidad de sidebar:
  // - Si está cargando, no mostrar
  // - Si no hay usuario, no mostrar
  // - Si está en ruta excluida, no mostrar
  // - Si usuario requiere suscripción pero no está activo, no mostrar
  // - De lo contrario, mostrar
  let showSidebar = false;
  
  if (!loading && user) {
    if (!shouldHideSidebar) {
      // Para usuarios legacy: isActive debe ser true y requiresSubscription false
      // Para usuarios nuevos: isActive true (o no definido) y requiresSubscription true
      const isLegacyUser = user.isActive === true && user.requiresSubscription === false;
      const isNewUser = user.isActive === true && user.requiresSubscription === true;
      
      console.log('[LayoutWithNav] isLegacyUser:', isLegacyUser);
      console.log('[LayoutWithNav] isNewUser:', isNewUser);
      
      if (isLegacyUser || isNewUser) {
        showSidebar = true;
      }
    }
  }
  
  console.log('[LayoutWithNav] Final showSidebar:', showSidebar);

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
