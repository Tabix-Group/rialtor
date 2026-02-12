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
  MessageCircle,
  HelpCircle,
  Mail,
  Briefcase, // Icono añadido para mejorar sección de negocio
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
    // --- GESTIÓN DIARIA ---
    {
      name: "Mi Panel",
      href: user ? "/dashboard" : "/",
      icon: Home,
    },
    {
      name: "Asistente IA",
      href: "/chat",
      icon: MessageCircle,
      description: "Consultor inmobiliario con inteligencia artificial",
    },
    {
      name: "Mi Calendario",
      href: "/calendario",
      icon: Calendar,
      description: "Gestiona tu agenda y eventos",
    },
    
    // --- NEGOCIO (CRM & VENTAS) ---
    {
      name: "Proyección Comercial",
      href: "/prospectos",
      icon: Briefcase, // Cambiado de User2 a Briefcase para diferenciar del perfil
      description: "Prospectos, proyecciones y funnel",
    },
    {
      name: "Mis Finanzas",
      href: "/finanzas",
      icon: DollarSign,
      description: "Gestión financiera personal",
    },

    // --- HERRAMIENTAS OPERATIVAS ---
    {
      name: "Mis Calculadoras",
      href: "/calculadoras",
      icon: Calculator,
      dropdown: [
        {
          name: "Ajustes de alquiler",
          href: "/calculadoraalquiler",
        },
        {
          name: "Calculadora CAC",
          href: "/calculadoracac",
        },
        {
          name: "Gastos inmobiliarios",
          href: "/calcescritura",
        },
        {
          name: "Días hábiles",
          href: "/dias",
        },
        { name: "Créditos Hipotecarios", href: "/hipotecarios" },
        { name: "Garantía de fianza", href: "/creditos" },
      ],
    },
    {
      name: "Mis Documentos",
      href: "/documents",
      icon: FileText,
      dropdown: [
        { name: "Resumidor Inteligente", href: "/documents/summary" },
        {
          name: "Formularios Editables",
          href: "/formularios",
        },
      ],
    },

    // --- MARKETING ---
    {
      name: "Mis Placas",
      href: "/placas",
      icon: ImageIcon,
      description: "Genera placas profesionales",
    },
    {
      name: "Mis Newsletters",
      href: "/newsletter",
      icon: Mail,
      description: "Crea newsletters de marketing",
    },

    // --- INFORMACIÓN DE MERCADO ---
    {
      name: "Indicadores",
      href: "/indicadores",
      icon: TrendingUp,
      description: "Indicadores económicos",
    },
    {
      name: "Noticias",
      href: "/news",
      icon: Newspaper,
      description: "Noticias del mercado",
    },
    {
      name: "Mis Descargas",
      href: "/descargas",
      icon: Download,
      description: "Archivos descargables",
    },
  ]

  const isActive = (href: string) => {
    if (href === '/') return pathname === '/'
    if (href === '/news') return pathname === '/news' || pathname?.startsWith('/news/')
    if (href === '/newsletter') return pathname === '/newsletter' || pathname?.startsWith('/newsletter/')
    return pathname?.startsWith(href)
  }

  const handleDropdownClick = (e: React.MouseEvent, itemName: string) => {
    e.stopPropagation()
    e.preventDefault()
    setActiveDropdown(activeDropdown === itemName ? null : itemName)
  }

  const handleUserMenuClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    e.preventDefault()

    if (isCollapsed) {
      setIsCollapsed(false)
      setTimeout(() => {
        setIsUserMenuOpen(true)
      }, 300)
    } else {
      setIsUserMenuOpen(!isUserMenuOpen)
    }
  }

  // Keyboard shortcut for toggling sidebar
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault()
        toggleSidebar()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isCollapsed])

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const toggleMobileSidebar = () => {
    setIsMobileOpen(!isMobileOpen)
  }

  const renderSidebarContent = () => (
    <div className="flex flex-col h-full bg-white text-slate-800">
      {/* Header / Logo */}
      <div className={`flex items-center border-b border-slate-100 transition-all duration-300 ${isCollapsed ? 'flex-col py-4 gap-4' : 'h-16 px-5 justify-between'}`}>
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative flex items-center justify-center w-8 h-8 transition-transform group-hover:scale-105">
             <img
              src="/images/favicon.ico"
              alt="Logo"
              className="object-contain w-full h-full"
            />
          </div>
          {!isCollapsed && (
            <span className="text-lg font-bold tracking-tight text-slate-900">RIALTOR</span>
          )}
        </Link>
        
        {/* Toggle Button */}
        <button
          onClick={toggleSidebar}
          className="hidden lg:flex p-1.5 text-slate-400 rounded-lg hover:text-primary hover:bg-primary/5 transition-all"
          title={isCollapsed ? "Expandir (Ctrl+B)" : "Colapsar (Ctrl+B)"}
        >
          {isCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        <button
          onClick={toggleMobileSidebar}
          className="p-2 text-slate-500 rounded-lg lg:hidden hover:bg-slate-50"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Navigation Scroll Area */}
      {user && (
        <div className="flex-1 px-3 py-6 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200">
          <nav className="space-y-1.5">
            {navConfig.map((item) => {
              const Icon = item.icon
              const hasDropdown = item.dropdown && item.dropdown.length > 0
              const isItemActive = isActive(item.href) || (hasDropdown && item.dropdown?.some((sub: any) => sub && isActive(sub.href)))
              const isDropdownOpen = activeDropdown === item.name

              // Wrapper para items con dropdown
              if (hasDropdown) {
                return (
                  <div key={item.name} className="relative group/menu">
                    <Link
                      href={item.href}
                      data-dropdown-button
                      onClick={(e) => {
                        const target = e.target as HTMLElement
                        const isChevronClick = target.closest('svg') || target.tagName === 'svg'
                        const hasModifier = e.ctrlKey || e.metaKey || e.shiftKey

                        if (isCollapsed) {
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
                      className={`
                        flex items-center w-full px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                        ${isItemActive 
                          ? "bg-slate-50 text-primary shadow-sm ring-1 ring-slate-200" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }
                        ${isCollapsed ? "justify-center" : "justify-start"}
                      `}
                    >
                      <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isItemActive ? "text-primary" : "text-slate-500 group-hover/menu:text-slate-700"}`} />
                      
                      {!isCollapsed && (
                        <>
                          <span className="flex-1 ml-3 text-left truncate">{item.name}</span>
                          <ChevronRight
                            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
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

                    {/* Submenu */}
                    {!isCollapsed && isDropdownOpen && (
                      <div className="mt-1 ml-4 pl-4 space-y-1 border-l-2 border-slate-100 animate-in slide-in-from-left-2 duration-200" data-dropdown>
                        {item.dropdown?.map((sub) => (
                          <Link
                            key={sub.name}
                            href={sub.href}
                            className={`
                              flex items-center px-3 py-2 text-sm rounded-md transition-colors
                              ${isActive(sub.href)
                                ? "text-primary font-medium bg-primary/5"
                                : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                              }
                            `}
                          >
                            <span className="truncate">{sub.name}</span>
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              }

              // Item normal sin dropdown
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    group/item flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200
                    ${isItemActive 
                       ? "bg-slate-50 text-primary shadow-sm ring-1 ring-slate-200" 
                       : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                    }
                    ${isCollapsed ? "justify-center" : "justify-start"}
                  `}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 transition-colors ${isItemActive ? "text-primary" : "text-slate-500 group-hover/item:text-slate-700"}`} />
                  {!isCollapsed && (
                    <span className="ml-3 truncate">{item.name}</span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* User Section / Footer */}
      <div className="p-4 border-t border-slate-100 bg-white z-10">
        {user ? (
          <div className="relative">
            {/* User Toggle Button */}
            <button
              data-user-button
              onClick={handleUserMenuClick}
              className={`
                w-full flex items-center p-2 rounded-xl transition-all duration-200
                ${isUserMenuOpen ? "bg-slate-50 ring-1 ring-slate-200" : "hover:bg-slate-50"}
                ${isCollapsed ? "justify-center" : ""}
              `}
            >
              <div className="w-9 h-9 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 text-primary ring-2 ring-white shadow-sm">
                <User2 className="w-5 h-5" />
              </div>
              
              {!isCollapsed && (
                <>
                  <div className="flex-1 ml-3 min-w-0 text-left">
                    <p className="text-sm font-semibold text-slate-900 truncate">{user.name}</p>
                    <p className="text-xs text-slate-500 truncate">{user.email}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${isUserMenuOpen ? "rotate-90" : ""}`} />
                </>
              )}
            </button>

            {/* User Popup Menu */}
            {!isCollapsed && isUserMenuOpen && (
              <div 
                className="absolute bottom-full left-0 w-full mb-2 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden animate-in zoom-in-95 duration-200 origin-bottom" 
                data-user-menu
              >
                <div className="p-1.5 space-y-0.5">
                  {isAdmin && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-primary transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                      <span>Panel Admin</span>
                    </Link>
                  )}

                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <Settings className="w-4 h-4" />
                    <span>Configuración</span>
                  </Link>

                  <Link
                    href="/ayuda"
                    className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-50 hover:text-slate-900 transition-colors"
                  >
                    <HelpCircle className="w-4 h-4" />
                    <span>Ayuda y Soporte</span>
                  </Link>
                  
                  <div className="my-1 border-t border-slate-100"></div>

                  <button
                    onClick={logout}
                    className="w-full flex items-center gap-2 px-3 py-2 text-sm font-medium text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          !isCollapsed && (
            <div className="space-y-3 px-1">
              <Link
                href="/auth/login"
                className="flex w-full justify-center px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg shadow-sm hover:bg-slate-50 transition-all"
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="flex w-full justify-center px-4 py-2 text-sm font-medium text-white bg-primary rounded-lg shadow-md hover:bg-primary/90 transition-all"
              >
                Crear Cuenta
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
        className={`fixed left-0 top-0 z-40 h-screen bg-white border-r border-slate-200/80 shadow-[2px_0_8px_-4px_rgba(0,0,0,0.05)] transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] hidden lg:flex flex-col
          ${isCollapsed ? "w-20" : "w-72"}
        `}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Backdrop */}
      {isMobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={toggleMobileSidebar}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`fixed left-0 top-0 z-50 h-screen bg-white shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] lg:hidden w-72
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {renderSidebarContent()}
      </aside>

      {/* Mobile Toggle Button */}
      <button
        onClick={toggleMobileSidebar}
        className="fixed top-4 left-4 z-50 lg:hidden p-2.5 bg-white text-slate-700 border border-slate-200 rounded-xl shadow-lg active:scale-95 transition-all"
      >
        <Menu className="w-5 h-5" />
      </button>
    </>
  )
}

export default Navigation