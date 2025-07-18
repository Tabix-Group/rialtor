
'use client'


import { useAuth } from '../app/auth/authContext'
import { usePermission } from '../hooks/usePermission';
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, Home, BookOpen, MessageSquare, Calculator, FileText, Shield, User, LogOut } from 'lucide-react'


function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  // Solo mostrar navegación si el usuario está logueado
  if (!user) return null

  const navConfig = [
    { name: 'Recursos', href: '/knowledge', icon: BookOpen, permission: 'manage_articles' },
    { name: 'Asistente IA', href: '/chat', icon: MessageSquare, permission: 'use_chat' },
    { name: 'Calculadora', href: '/calculator', icon: Calculator, permission: 'use_calculator' },
    { name: 'Archivos', href: '/documents', icon: FileText, permission: 'manage_documents' },
    { name: 'Panel de Control', href: '/admin', icon: Shield, permission: 'view_admin' },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname ? pathname.startsWith(href) : false
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">RM</span>
              </div>
              <span className="text-xl font-bold text-gray-900">RE/MAX</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            {navConfig.map((item) => {
              const Icon = item.icon;
              const hasPerm = usePermission(item.permission);
              if (!hasPerm) return null;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <span className="text-gray-700 text-sm font-medium">{user.name}</span>
            <button
              onClick={logout}
              className="flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-red-600 focus:outline-none focus:text-red-600 p-2"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t">
            {navConfig.map((item) => {
              const Icon = item.icon;
              const hasPerm = usePermission(item.permission);
              if (!hasPerm) return null;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium transition-colors ${
                    isActive(item.href)
                      ? 'bg-red-50 text-red-600'
                      : 'text-gray-700 hover:text-red-600 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
            <div className="border-t pt-3 mt-3">
              <button
                onClick={() => { setIsOpen(false); logout(); }}
                className="flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50 transition-colors"
              >
                <LogOut className="w-5 h-5" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </nav>
  )
}

export default Navigation;
