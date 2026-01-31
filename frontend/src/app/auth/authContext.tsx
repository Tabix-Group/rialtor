
"use client";
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface Role {
  id: string;
  name: string;
  permissions: string[];
}

interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  roles: Role[];
  isActive?: boolean;
  requiresSubscription?: boolean;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const userData = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
    
    if (token && userData) {
      try {
        const parsed = JSON.parse(userData);
        
        // Si viene de backend antiguo, migrar a nueva estructura
        if (!parsed.roles && parsed.role) {
          parsed.roles = [{ id: 'legacy', name: parsed.role, permissions: [] }];
        }
        // Asegurar que los campos de Stripe existan
        if (parsed.isActive === undefined) {
          parsed.isActive = true; // Asumir activo por defecto
        }
        if (parsed.requiresSubscription === undefined) {
          parsed.requiresSubscription = false; // Asumir no requiere suscripción por defecto
        }
        setUser(parsed);
      } catch (error) {
        console.error('[AuthContext] Error parsing user data:', error);
        // Limpiar datos corruptos
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    setLoading(false);
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    router.push('/auth/login');
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
