"use client";
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useAuth } from './auth/authContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  
  // Rutas donde NO se debe mostrar la sidebar (incluso con usuario logueado)
  const noSidebarRoutes = ['/', '/pricing', '/subscription/success', '/auth/login', '/auth/register'];
  const shouldHideSidebar = noSidebarRoutes.some(route => pathname.startsWith(route));
  
  // Mostrar sidebar solo si: usuario logueado Y no está en una ruta excluida
  const showSidebar = user && !shouldHideSidebar;

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
