"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface SidebarContextType {
  isCollapsed: boolean;
  setIsCollapsed: (collapsed: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: ReactNode }) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Load preference and handle resize
  useEffect(() => {
    // Load from localStorage if available
    const saved = localStorage.getItem('sidebar-collapsed');
    if (saved !== null) {
      setIsCollapsed(saved === 'true');
    } else {
      // Default behavior based on screen size
      const isTablet = window.innerWidth >= 1024 && window.innerWidth < 1280;
      if (isTablet) {
        setIsCollapsed(true);
      }
    }

    const handleResize = () => {
      // Auto-collapse on smaller desktop screens if they resize
      if (window.innerWidth >= 1024 && window.innerWidth < 1280) {
        setIsCollapsed(true);
      } else if (window.innerWidth >= 1280) {
        // Optional: auto expand on very large screens if not manually collapsed? 
        // Better to respect user choice if saved.
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Save preference
  const toggleCollapsed = (value: boolean) => {
    setIsCollapsed(value);
    localStorage.setItem('sidebar-collapsed', String(value));
  };

  return (
    <SidebarContext.Provider value={{ isCollapsed, setIsCollapsed: toggleCollapsed }}>
      {children}
    </SidebarContext.Provider>
  );
}

export function useSidebar() {
  const context = useContext(SidebarContext);
  if (context === undefined) {
    throw new Error('useSidebar must be used within a SidebarProvider');
  }
  return context;
}