"use client";
import { usePathname } from 'next/navigation';
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';
import { useAuth } from './auth/authContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();
  const { user } = useAuth();
  const pathname = usePathname();
  
  // No mostrar sidebar en la landing page (/) cuando está logueado
  const showSidebar = user && pathname !== '/';

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
