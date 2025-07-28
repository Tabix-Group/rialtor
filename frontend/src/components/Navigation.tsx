'use client'

import { useAuth } from '../app/auth/authContext'
import { usePermission } from '../hooks/usePermission';
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut } from 'lucide-react'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const isUsuario = Array.isArray(user.roles) && user.roles.includes('USUARIO' as any)

  const navConfig = isUsuario
    ? [
        { name: 'Recursos', href: '/knowledge', icon: 'BookOpen', permission: undefined },
        { name: 'Calculadora', href: '/calculator', icon: 'Calculator', permission: undefined },
      ]
    : [
        { name: 'Recursos', href: '/knowledge', icon: 'BookOpen', permission: 'manage_articles' },
        { name: 'Asistente IA', href: '/chat', icon: 'MessageSquare', permission: 'use_chat' },
        { name: 'Calculadora', href: '/calculator', icon: 'Calculator', permission: 'use_calculator' },
        { name: 'Archivos', href: '/documents', icon: 'FileText', permission: 'manage_documents' },
        { name: 'Panel de Control', href: '/admin', icon: 'Shield', permission: 'view_admin' },
      ]

  const icons = {
    BookOpen: require('lucide-react').BookOpen,
    MessageSquare: require('lucide-react').MessageSquare,
    Calculator: require('lucide-react').Calculator,
    FileText: require('lucide-react').FileText,
    Shield: require('lucide-react').Shield,
  }

  const isActive = (href: string) => pathname?.startsWith(href)

  const renderLinks = (isMobile = false) =>
    navConfig.map((item) => {
      const Icon = icons[item.icon as keyof typeof icons]
      const hasPermission = item.permission ? usePermission(item.permission) : true
      if (!hasPermission) return null

      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => isMobile && setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-all text-sm font-medium ${
            isActive(item.href)
              ? 'bg-red-100 text-red-600'
              : 'text-gray-700 hover:bg-gray-50 hover:text-red-600'
          }`}
        >
          <Icon className="w-5 h-5" />
          {item.name}
        </Link>
      )
    })

  return (
    <nav className="bg-white border-b shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <img src="/images/logo1.png" alt="Logo Rialtor" className="w-8 h-8 object-contain" />
            <span className="text-xl font-semibold tracking-tight text-gray-900">RIALTOR</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {renderLinks()}
          </div>

          {/* User Info */}
          <div className="hidden md:flex items-center gap-4">
            <span className="text-sm text-gray-700 font-medium">{user.name}</span>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-gray-50 rounded-md transition"
            >
              <LogOut className="w-5 h-5" />
              Cerrar sesión
            </button>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-red-600 focus:outline-none"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="md:hidden border-t bg-white px-4 py-3 space-y-2">
          {renderLinks(true)}
          <button
            onClick={() => {
              setIsOpen(false)
              logout()
            }}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-red-600 transition"
          >
            <LogOut className="w-5 h-5" />
            Cerrar sesión
          </button>
        </div>
      )}
    </nav>
  )
}

export default Navigation
