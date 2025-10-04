'use client'

import { useAuth } from '../app/auth/authContext'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Menu,
  X,
  LogOut,
  User2,
  Building2,
  ChevronDown,
  Bell,
  Settings,
  Shield
} from 'lucide-react'

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user && user.roles && user.roles.some(role => role.name === 'ADMIN')

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      const isDropdownButton = target.closest('[data-dropdown-button]');
      const isDropdown = target.closest('[data-dropdown]');

      // Solo cerrar si el click no fue dentro de un dropdown o botón de dropdown
      if (!isDropdownButton && !isDropdown) {
        setActiveDropdown(null);
      }
    };

    // Usar mousedown en lugar de click para mejor responsiveness
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);;

  const navConfig = [
    {
      name: 'Calculadoras',
      href: '/calculadoras',
      icon: 'Calculator',
      dropdown: [
        { name: 'Calculadora de gastos inmobiliarios', href: '/calcescritura', description: 'Calcula costos de escrituración' },
        { name: 'Seguros de Caución', href: '/creditos', description: 'Compara seguros de caución' },
        { name: 'Créditos Hipotecarios', href: '/hipotecarios', description: 'Simula créditos hipotecarios' },
      ],
    },
    {
      name: 'Documentos',
      href: '/documents',
      icon: 'FileText',
      dropdown: [
        { name: 'Generador de Documentos', href: '/documents/generator', description: 'Crea contratos y reservas' },
        { name: 'Resumidor Inteligente', href: '/documents/summary', description: 'Resume documentos extensos' },
      ],
    },
    {
      name: 'Placas',
      href: '/placas',
      icon: 'ImageIcon',
      description: 'Genera placas profesionales'
    },
    {
      name: 'Noticias',
      href: '/news',
      icon: 'Newspaper',
      description: 'Últimas noticias del mercado inmobiliario'
    },
    {
      name: 'Descargas',
      href: '/descargas',
      icon: 'Download',
      description: 'Archivos y contenido descargable'
    },
    ...(isAdmin ? [{
      name: 'Admin',
      href: '/admin',
      icon: 'Shield',
      dropdown: [
        { name: 'Panel de Control', href: '/admin', description: 'Gestión general' },
        { name: 'Usuarios', href: '/admin/users', description: 'Administrar usuarios' },
        { name: 'Contenido', href: '/admin/content', description: 'Gestionar contenido' },
      ],
    }] : []),
  ]

  const icons = {
    BookOpen: require('lucide-react').BookOpen,
    MessageSquare: require('lucide-react').MessageSquare,
    Calculator: require('lucide-react').Calculator,
    FileText: require('lucide-react').FileText,
    Shield: require('lucide-react').Shield,
    ImageIcon: require('lucide-react').Image,
    Newspaper: require('lucide-react').Newspaper,
    Download: require('lucide-react').Download,
  }

  const isActive = (href: string) => pathname?.startsWith(href)

  const handleDropdownClick = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveDropdown(activeDropdown === itemName ? null : itemName);
  }

  const renderDesktopNav = () => (
    <div className="hidden lg:flex items-center space-x-1">
      {navConfig.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons]
        const hasDropdown = item.dropdown && item.dropdown.length > 0

        if (hasDropdown) {
          return (
            <div key={item.name} className="relative" data-dropdown>
              <button
                data-dropdown-button
                onClick={(e) => handleDropdownClick(e, item.name)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50 ${isActive(item.href) || item.dropdown?.some((sub: any) => sub && isActive(sub.href))
                  ? 'bg-blue-50 text-blue-600 border border-blue-100'
                  : 'text-gray-700 hover:text-blue-600'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
                <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                  }`} />
              </button>

              {activeDropdown === item.name && (
                <div className="absolute top-12 left-0 min-w-[280px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2" data-dropdown>
                  {item.href && (
                    <>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <Icon className="w-4 h-4 text-gray-400" />
                        <div>
                          <div className="font-medium">Ver Todos</div>
                          <div className="text-xs text-gray-500">Vista general de {item.name.toLowerCase()}</div>
                        </div>
                      </Link>
                      <hr className="my-2" />
                    </>
                  )}
                  {item.dropdown?.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`block px-4 py-3 text-sm hover:bg-gray-50 transition-colors ${isActive(sub.href) ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                        }`}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="font-medium">{sub.name}</div>
                      {sub.description && (
                        <div className="text-xs text-gray-500 mt-1">{sub.description}</div>
                      )}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )
        }

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 hover:bg-gray-50 ${isActive(item.href)
              ? 'bg-blue-50 text-blue-600 border border-blue-100'
              : 'text-gray-700 hover:text-blue-600'
              }`}
          >
            <Icon className="w-4 h-4" />
            {item.name}
          </Link>
        )
      })}
    </div>
  )

  const renderMobileNav = () => (
    <div className="lg:hidden space-y-1 px-4 py-6 bg-white">
      {navConfig.map((item) => {
        const Icon = icons[item.icon as keyof typeof icons]
        const hasDropdown = item.dropdown && item.dropdown.length > 0

        return (
          <div key={item.name} data-dropdown>
            {hasDropdown ? (
              <>
                <button
                  data-dropdown-button
                  onClick={(e) => handleDropdownClick(e, item.name)}
                  className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(item.href) || item.dropdown?.some((sub: any) => sub && isActive(sub.href))
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
                    }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </div>
                  <ChevronDown className={`w-4 h-4 transition-transform ${activeDropdown === item.name ? 'rotate-180' : ''
                    }`} />
                </button>

                {activeDropdown === item.name && (
                  <div className="ml-4 mt-2 space-y-1" data-dropdown>
                    {item.href && (
                      <Link
                        href={item.href}
                        className="block px-4 py-2 text-sm text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        onClick={() => {
                          setActiveDropdown(null)
                          setIsOpen(false)
                        }}
                      >
                        Ver Todos
                      </Link>
                    )}
                    {item.dropdown?.map((sub) => (
                      <Link
                        key={sub.name}
                        href={sub.href}
                        className={`block px-4 py-2 text-sm rounded-lg transition-colors ${isActive(sub.href)
                          ? 'bg-blue-50 text-blue-600'
                          : 'text-gray-600 hover:text-blue-600 hover:bg-blue-50'
                          }`}
                        onClick={() => {
                          setActiveDropdown(null)
                          setIsOpen(false)
                        }}
                      >
                        {sub.name}
                      </Link>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${isActive(item.href)
                  ? 'bg-blue-50 text-blue-600'
                  : 'text-gray-700 hover:bg-gray-50'
                  }`}
                onClick={() => setIsOpen(false)}
              >
                <Icon className="w-5 h-5" />
                {item.name}
              </Link>
            )}
          </div>
        )
      })}
    </div>
  )

  return (
    <nav className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-50 backdrop-blur-sm bg-white/95" suppressHydrationWarning>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo y Home */}
          <Link
            href={user ? "/dashboard" : "/"}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl bg-gradient-to-r from-blue-600 to-blue-700 bg-clip-text text-transparent hidden sm:block">
              RIALTOR
            </span>
          </Link>

          {/* Desktop Navigation */}
          {renderDesktopNav()}

          {/* User Menu & Mobile Toggle */}
          <div className="flex items-center gap-3">
            {/* Notifications (solo si hay usuario) */}
            {user && (
              <button className="relative p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="w-1.5 h-1.5 bg-white rounded-full"></span>
                </span>
              </button>
            )}

            {/* User Dropdown (solo si hay usuario) */}
            {user && (
              <div className="relative hidden lg:block" data-dropdown>
                <button
                  data-dropdown-button
                  onClick={(e) => handleDropdownClick(e, 'user')}
                  className="flex items-center gap-2 p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                    <User2 className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-sm font-medium">{user.name}</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {activeDropdown === 'user' && (
                  <div className="absolute right-0 top-12 min-w-[200px] bg-white border border-gray-200 rounded-2xl shadow-xl z-50 py-2" data-dropdown>
                    <div className="px-4 py-3 border-b border-gray-100">
                      <div className="font-medium text-gray-900">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-blue-600 hover:bg-blue-50 transition-colors"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <Shield className="w-4 h-4" />
                        Panel de Administración
                      </Link>
                    )}

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <button
                      onClick={() => {
                        logout()
                        setActiveDropdown(null)
                      }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CTA Button (solo si no hay usuario) */}
            {!user && (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-gray-700 hover:text-blue-600 font-medium transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200"
                >
                  Registrarte
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="lg:hidden border-t border-gray-200 bg-white">
          {renderMobileNav()}

          {/* Mobile user section */}
          {user ? (
            <div className="px-4 py-4 border-t border-gray-200 space-y-2">
              <div className="flex items-center gap-3 px-4 py-2">
                <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                  <User2 className="w-4 h-4 text-white" />
                </div>
                <div>
                  <div className="font-medium text-gray-900">{user.name}</div>
                  <div className="text-sm text-gray-500">{user.email}</div>
                </div>
              </div>

              {isAdmin && (
                <Link
                  href="/admin"
                  className="flex items-center gap-3 px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  onClick={() => setIsOpen(false)}
                >
                  <Shield className="w-4 h-4" />
                  Panel de Administración
                </Link>
              )}

              <Link
                href="/dashboard"
                className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Dashboard
              </Link>

              <button
                onClick={() => {
                  logout()
                  setIsOpen(false)
                }}
                className="w-full flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Cerrar Sesión
              </button>
            </div>
          ) : (
            <div className="px-4 py-4 border-t border-gray-200 space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2 text-center text-gray-700 font-medium border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-2 text-center text-white font-medium bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:shadow-lg transition-all"
                onClick={() => setIsOpen(false)}
              >
                Registrarte
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  )
}

export default Navigation