'use client'

import { useAuth } from '../app/auth/authContext'
import { usePermission } from '../hooks/usePermission';
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Menu, X, LogOut, User2, Home } from 'lucide-react'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  if (!user) return null

  const isUsuario = Array.isArray(user.roles) && user.roles.includes('USUARIO' as any)

  const navConfig = isUsuario
    ? [
      {
        name: 'Calculadoras',
        href: '/calculadoras',
        icon: 'Calculator',
        dropdown: [
          { name: 'Gastos Escritura', href: '/calcescritura' },
          { name: 'Honorarios Inmobiliarios', href: '/calchonorarios' },
          { name: 'Impuesto Ganancia', href: '/calciigg' },
          { name: 'Seguros de Caución', href: '/creditos' },
        ],
        permission: undefined,
      },
      {
        name: 'Documentos',
        href: '/documents',
        icon: 'FileText',
        dropdown: [
          { name: 'Resumidor', href: '/api/documents/summary' },
          { name: 'Generador', href: '/documents/generator' },
        ],
        permission: undefined,
      },
      { name: 'Placas', href: '/placas', icon: 'ImageIcon', permission: undefined },
      {
        name: 'Panel de Control',
        href: '/admin',
        icon: 'Shield',
        dropdown: [
          { name: 'Noticias', href: '/knowledge' },
          { name: 'Archivos', href: '/documents' },
        ],
        permission: undefined,
      },
    ]
    : [
      {
        name: 'Calculadoras',
        href: '/calculadoras',
        icon: 'Calculator',
        dropdown: [
          { name: 'Gastos Escritura', href: '/calcescritura' },
          { name: 'Honorarios Inmobiliarios', href: '/calchonorarios' },
          { name: 'Impuesto Ganancia', href: '/calciigg' },
          { name: 'Seguros de Caución', href: '/creditos' },
        ],
        permission: 'use_calculator',
      },
      {
        name: 'Documentos',
        href: '/documents',
        icon: 'FileText',
        dropdown: [
          { name: 'Resumidor', href: '/api/documents/summary' },
          { name: 'Generador', href: '/documents/generator' },
        ],
        permission: undefined,
      },
      { name: 'Placas', href: '/placas', icon: 'ImageIcon', permission: undefined },
      // { name: 'Placas', href: '/placas', icon: 'ImageIcon', permission: 'use_placas' }, // OCULTO TEMPORALMENTE
      {
        name: 'Panel de Control',
        href: '/admin',
        icon: 'Shield',
        dropdown: [
          { name: 'Noticias', href: '/knowledge' },
          { name: 'Asistente IA', href: '/chat' },
          { name: 'Archivos', href: '/documents' },
        ],
        permission: 'view_admin',
      },
    ]

  const icons = {
    BookOpen: require('lucide-react').BookOpen,
    MessageSquare: require('lucide-react').MessageSquare,
    Calculator: require('lucide-react').Calculator,
    FileText: require('lucide-react').FileText,
    Shield: require('lucide-react').Shield,
    ImageIcon: require('lucide-react').Image,
  }

  const isActive = (href: string) => pathname?.startsWith(href)

  const renderLinks = (isMobile = false) =>
    navConfig.map((item) => {
      const Icon = icons[item.icon as keyof typeof icons]
      const hasPermission = item.permission ? usePermission(item.permission) : true
      if (!hasPermission) return null

      // Dropdown  
      if (item.dropdown) {
        if (isMobile) {
          return (
            <div key={item.name} className="flex flex-col">
              {/* Si tiene href, mostrar como enlace clickeable */}
              {item.href ? (
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${isActive(item.href)
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600 hover:underline'
                    }`}
                >
                  <Icon className="w-5 h-5" />
                  {item.name}
                </Link>
              ) : (
                <span className="flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium text-gray-700">
                  <Icon className="w-5 h-5" />
                  {item.name}
                </span>
              )}
              {item.dropdown.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  onClick={() => setIsOpen(false)}
                  className={`ml-8 flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${isActive(sub.href)
                    ? 'bg-orange-100 text-orange-600'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600 hover:underline'
                    }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          )
        }
        // Desktop dropdown
        return (
          <div key={item.name} className="relative group">
            {/* Si tiene href, usar Link clickeable, sino button */}
            {item.href ? (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600 focus:outline-none ${isActive(item.href) || item.dropdown.some((sub) => isActive(sub.href)) ? 'bg-orange-100 text-orange-600' : ''
                  }`}
              >
                <Icon className="w-5 h-5" />
                {item.name}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </Link>
            ) : (
              <button
                className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium text-gray-700 hover:bg-gray-50 hover:text-orange-600 focus:outline-none ${item.dropdown.some((sub) => isActive(sub.href)) ? 'bg-orange-100 text-orange-600' : ''
                  }`}
                tabIndex={0}
              >
                <Icon className="w-5 h-5" />
                {item.name}
                <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
              </button>
            )}
            <div className="absolute left-0 top-12 min-w-[160px] bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
              {item.dropdown.map((sub) => (
                <Link
                  key={sub.name}
                  href={sub.href}
                  className={`block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition ${isActive(sub.href) ? 'bg-orange-100 text-orange-600' : ''
                    }`}
                >
                  {sub.name}
                </Link>
              ))}
            </div>
          </div>
        )
      }

      // Link normal
      return (
        <Link
          key={item.name}
          href={item.href}
          onClick={() => isMobile && setIsOpen(false)}
          className={`flex items-center gap-3 px-4 py-2 rounded-lg transition-colors duration-200 text-sm font-medium ${isActive(item.href)
            ? 'bg-orange-100 text-orange-600'
            : 'text-gray-700 hover:bg-gray-50 hover:text-orange-600 hover:underline'
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
          {/* Home icon linking to homepage */}
          <Link href="/" aria-label="Inicio" className="p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none">
            <Home className="w-6 h-6" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-6">
            {renderLinks()}
          </div>

          {/* Compact User Icon Dropdown */}
          <div className="hidden md:flex items-center gap-2 relative group">
            <button
              aria-label="Usuario"
              className="p-2 rounded-full text-gray-700 hover:bg-gray-100 focus:outline-none"
              tabIndex={0}
            >
              <User2 className="w-5 h-5" />
            </button>
            <div className="absolute right-0 top-12 min-w-[180px] bg-white border rounded-lg shadow-lg opacity-0 group-hover:opacity-100 group-focus-within:opacity-100 transition-opacity z-50 pointer-events-none group-hover:pointer-events-auto group-focus-within:pointer-events-auto">
              <div className="px-4 py-2 text-sm text-gray-700 border-b">
                <div className="font-medium">{user.name}</div>
              </div>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition rounded-b-lg"
              >
                <LogOut className="w-5 h-5" />
                Cerrar sesión
              </button>
            </div>
          </div>

          {/* Mobile toggle */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-gray-700 hover:text-orange-600 focus:outline-none"
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
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-50 hover:text-orange-600 transition"
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
