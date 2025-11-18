"use client"

import type React from "react"

import { useAuth } from "../app/auth/authContext"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSidebar } from "../contexts/SidebarContext"
import {
  Menu,
  X,
  LogOut,
  User2,
  ChevronDown,
  ChevronRight,
  Settings,
  Shield,
  Calculator,
  FileText,
  ImageIcon,
  Newspaper,
  Download,
  Home,
  PanelLeftClose,
  PanelLeftOpen,
  DollarSign,
  Calendar,
  TrendingUp,
} from "lucide-react"

function Navigation() {
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [isMobileOpen, setIsMobileOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const { isCollapsed, setIsCollapsed } = useSidebar()

  const isAdmin = user && user.roles && user.roles.some((role) => role.name === "ADMIN")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const isDropdownButton = target.closest("[data-dropdown-button]")
      const isDropdown = target.closest("[data-dropdown]")
      const isUserButton = target.closest("[data-user-button]")
      const isUserMenu = target.closest("[data-user-menu]")

      if (!isDropdownButton && !isDropdown && !isUserButton && !isUserMenu) {
        setActiveDropdown(null)
        setIsUserMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  // Close mobile sidebar when route changes
  useEffect(() => {
    setIsMobileOpen(false)
  }, [pathname])

  const navConfig = [
    {
      name: "Mi Panel",
      href: user ? "/dashboard" : "/",
      icon: Home,
    },
    {
      name: "Indicadores",
      href: "/indicadores",
      icon: TrendingUp,
      description: "Indicadores económicos e inmobiliarios en tiempo real",
    },
    {
      name: "Mi Calendario",
      href: "/calendario",
      icon: Calendar,
      description: "Gestiona tu agenda y eventos",
    },
    {
      name: "Mis Finanzas",
      href: "/finanzas",
      icon: DollarSign,
      description: "Gestión financiera personal",
    },
    {
      name: "Calculadoras",
      href: "/calculadoras",
      icon: Calculator,
      dropdown: [
        {
          name: "Calculadora de ajustes de alquiler",
          href: "/ajustes",
          description: "Calcula ajustes por IPC y acuerdos",
        },
        {
          name: "Calculadora de gastos inmobiliarios",
          href: "/calcescritura",
          description: "Calcula costos de escrituración",
        },
        {
          name: "Calculadora de días hábiles",
          href: "/dias",
          description: "Calcula días hábiles entre fechas",
        },
        { name: "Créditos Hipotecarios", href: "/hipotecarios", description: "Simula créditos hipotecarios" },
        { name: "Seguros de Caución", href: "/creditos", description: "Compara seguros de caución" },
      ],
    },
    {
      name: "Documentos",
      href: "/documents",
      icon: FileText,
      dropdown: [
        { name: "Resumidor Inteligente", href: "/documents/summary", description: "Resume documentos extensos" },
        {
          name: "Formularios Editables",
          href: "/formularios",
          description: "Edita formularios directamente en el navegador",
        },
      ],
    },
    {
      name: "Placas",
      href: "/placas",
      icon: ImageIcon,
      description: "Genera placas profesionales",
    },
    {
      name: "Noticias",
      href: "/news",
      icon: Newspaper,
      description: "Últimas noticias del mercado inmobiliario",
    },
    {
      name: "Descargas",
      href: "/descargas",
      icon: Download,
      description: "Archivos y contenido descargable",
    },
  ]

  const isActive = (href: string) => pathname?.startsWith(href)

  const handleDropdownClick = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveDropdown(activeDropdown === itemName ? null : itemName)
  }

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    // Si la sidebar está colapsada, expandirla primero
    if (isCollapsed) {
      setIsCollapsed(false)
      // Esperar a que se expanda antes de abrir el menú
      setTimeout(() => {
        setIsUserMenuOpen(true)
      }, 300)
    } else {
      setIsUserMenuOpen(!isUserMenuOpen)
    }
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 lg:border-border">
        {!isCollapsed && (
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <img
              src="/images/l.png"
              alt="RIALTOR Logo"
              className="w-10 h-10 rounded-lg"
            />
            <span className="font-bold text-lg text-gray-900 lg:text-foreground">RIALTOR</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors hidden lg:block lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
        <button
          onClick={toggleMobileSidebar}
          className="p-2 rounded-lg lg:hidden text-gray-700 hover:text-gray-900 hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Items */}
      {user && (
        <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-3 space-y-1">
          {navConfig.map((item) => {
            const Icon = item.icon
            const hasDropdown = item.dropdown && item.dropdown.length > 0
            const isItemActive = isActive(item.href) || (hasDropdown && item.dropdown?.some((sub: any) => sub && isActive(sub.href)))
            const isDropdownOpen = activeDropdown === item.name

            if (hasDropdown) {
              return (
                <div key={item.name} className="space-y-1">
                  <Link
                    href={item.href}
                    data-dropdown-button
                    onClick={(e) => {
                      // If clicking on the chevron area or with modifier keys, toggle dropdown
                      // Otherwise, allow navigation
                      const target = e.target as HTMLElement
                      const isChevronClick = target.closest('svg') || target.tagName === 'svg'
                      const hasModifier = e.ctrlKey || e.metaKey || e.shiftKey

                      if (isCollapsed) {
                        // When collapsed, expand sidebar and open dropdown
                        e.preventDefault()
                        setIsCollapsed(false)
                        setTimeout(() => {
                          setActiveDropdown(item.name)
                        }, 300)
                      } else if (isChevronClick || hasModifier) {
                        e.preventDefault()
                        handleDropdownClick(e, item.name)
                      }
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                      isItemActive
                        ? "bg-primary/10 text-primary border border-primary/20"
                        : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
                    }`}
                  >
                    <Icon className={`w-5 h-5 flex-shrink-0 ${isItemActive ? "text-primary" : ""}`} />
                    {!isCollapsed && (
                      <>
                        <span className="flex-1 text-left">{item.name}</span>
                        <ChevronRight
                          className={`w-4 h-4 transition-transform duration-200 cursor-pointer ${
                            isDropdownOpen ? "rotate-90" : ""
                          }`}
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            handleDropdownClick(e, item.name)
                          }}
                        />
                      </>
                    )}
                  </Link>

                  {!isCollapsed && isDropdownOpen && (
                    <div className="ml-8 space-y-1 animate-in slide-in-from-left-2 duration-200" data-dropdown>
                      {item.dropdown?.map((sub) => (
                        <Link
                          key={sub.name}
                          href={sub.href}
                          className={`flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(sub.href)
                              ? "bg-primary/10 text-primary"
                              : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${isActive(sub.href) ? "bg-primary" : "bg-muted-foreground/50"}`}></div>
                          <span>{sub.name}</span>
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
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                  isItemActive
                    ? "bg-primary/10 text-primary border border-primary/20"
                    : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
                }`}
              >
                <Icon className={`w-5 h-5 flex-shrink-0 ${isItemActive ? "text-primary" : ""}`} />
                {!isCollapsed && (
                  <span className="flex-1">{item.name}</span>
                )}
              </Link>
            )
          })}
        </nav>
      </div>
      )}

      {/* User Section */}
      <div className="border-t border-gray-200 p-4 lg:border-border">
        {user ? (
          <div className="space-y-1">
            {/* User Info Button */}
            <button
              data-user-button
              onClick={handleUserMenuClick}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group ${
                isUserMenuOpen
                  ? "bg-primary/10 text-primary border border-primary/20"
                  : "text-gray-700 hover:text-gray-900 hover:bg-gray-100 lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
              }`}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center flex-shrink-0">
                <User2 className="w-4 h-4 text-primary-foreground" />
              </div>
              {!isCollapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="font-medium text-gray-900 truncate text-sm lg:text-foreground">{user.name}</div>
                    <div className="text-xs text-gray-500 truncate lg:text-muted-foreground">{user.email}</div>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform duration-200 ${
                      isUserMenuOpen ? "rotate-90" : ""
                    }`}
                  />
                </>
              )}
            </button>

            {/* User Actions */}
            {!isCollapsed && isUserMenuOpen && (
              <div className="ml-8 space-y-1 animate-in slide-in-from-left-2 duration-200" data-user-menu>
                {/* Admin Panel */}
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                  >
                    <Shield className="w-4 h-4" />
                    <span>Panel Admin</span>
                  </Link>
                )}

                {/* Dashboard */}
                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors lg:text-muted-foreground lg:hover:text-foreground lg:hover:bg-muted"
                >
                  <Settings className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {/* Logout */}
                <button
                  onClick={logout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors lg:text-muted-foreground lg:hover:text-destructive lg:hover:bg-destructive/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div className="space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2.5 text-center text-gray-700 font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-sm lg:text-foreground lg:hover:bg-muted lg:border-border"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-2.5 text-center text-white font-medium bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm transition-all text-sm lg:text-primary-foreground lg:bg-primary lg:hover:bg-primary/90"
              >
                Registrarte
              </Link>
            </div>
          )
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-all duration-300 ease-in-out hidden lg:flex flex-col shadow-lg ${
          isCollapsed ? "w-16" : "w-64"
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Sidebar Overlay */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-gray-200 transition-transform duration-300 ease-in-out lg:hidden w-64 shadow-2xl ${
          isMobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-white border border-gray-200 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 text-gray-700 hover:text-gray-900"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}

export default Navigation
