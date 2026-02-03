"use client";
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useAuth } from './auth/authContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user, loading } = useAuth();
  const pathname = usePathname();
  
  // Rutas donde NUNCA se debe mostrar la sidebar o navbar
  const noSidebarRoutes = ['/', '/pricing', '/subscription/success', '/auth/login', '/auth/register'];
  const isLandingPage = pathname === '/' || (pathname ? noSidebarRoutes.some(route => pathname === route) : false);
  
  // La sidebar solo se muestra si:
  // 1. No está en landing page u otras rutas excluidas
  // 2. El usuario está autenticado
  // 3. El usuario está activo
  let showSidebar = false;
  
  if (!loading && user && !isLandingPage) {
    // Para usuarios legacy: isActive debe ser true y requiresSubscription false
    // Para usuarios nuevos: isActive true (o no definido) y requiresSubscription true
    const isLegacyUser = user.isActive === true && user.requiresSubscription === false;
    const isNewUser = user.isActive === true && user.requiresSubscription === true;
    const isUserActive = isLegacyUser || isNewUser;
    
    if (isUserActive) {
      // Usuarios activos pueden ver la sidebar en todas las rutas permitidas
      showSidebar = true;
    }
  }

  return (
    <div className="flex min-h-screen">
      {showSidebar && <Navigation />}
      <main className={`flex-1 transition-all duration-300 ${showSidebar && (isCollapsed ? 'lg:ml-20' : 'lg:ml-72')}`}>
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
