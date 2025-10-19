"use client";
import Navigation from '../components/Navigation';
import { SidebarProvider, useSidebar } from '../contexts/SidebarContext';

function LayoutContent({ children }: { children: React.ReactNode }) {
  const { isCollapsed } = useSidebar();

  return (
    <div className="flex min-h-screen">
      <Navigation />
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
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
