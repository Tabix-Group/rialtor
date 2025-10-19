"use client"

import type React from "react"

import { useAuth } from "../app/auth/authContext"
import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Menu,
  X,
  LogOut,
  User2,
  Building2,
  ChevronDown,
  Bell,
  Settings,
  Shield,
  Calculator,
  FileText,
  ImageIcon,
  Newspaper,
  Download,
} from "lucide-react"

function Navigation() {
  const [isOpen, setIsOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user && user.roles && user.roles.some((role) => role.name === "ADMIN")

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element
      const isDropdownButton = target.closest("[data-dropdown-button]")
      const isDropdown = target.closest("[data-dropdown]")

      if (!isDropdownButton && !isDropdown) {
        setActiveDropdown(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const navConfig = [
    {
      name: "Calculadoras",
      href: "/calculadoras",
      icon: Calculator,
      dropdown: [
        {
          name: "Calculadora de gastos inmobiliarios",
          href: "/calcescritura",
          description: "Calcula costos de escrituración",
        },
        { name: "Seguros de Caución", href: "/creditos", description: "Compara seguros de caución" },
        { name: "Créditos Hipotecarios", href: "/hipotecarios", description: "Simula créditos hipotecarios" },
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

  const renderDesktopNav = () => (
    <div className="hidden lg:flex items-center gap-1">
      {navConfig.map((item) => {
        const Icon = item.icon
        const hasDropdown = item.dropdown && item.dropdown.length > 0

        if (hasDropdown) {
          return (
            <div key={item.name} className="relative" data-dropdown>
              <button
                data-dropdown-button
                onClick={(e) => handleDropdownClick(e, item.name)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive(item.href) || item.dropdown?.some((sub: any) => sub && isActive(sub.href))
                    ? "bg-primary/10 text-primary"
                    : "text-foreground/70 hover:text-foreground hover:bg-muted"
                }`}
              >
                <Icon className="w-4 h-4" />
                {item.name}
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-200 ${
                    activeDropdown === item.name ? "rotate-180" : ""
                  }`}
                />
              </button>

              {activeDropdown === item.name && (
                <div
                  className="absolute top-full left-0 mt-2 min-w-[280px] bg-card border border-border rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in-0 zoom-in-95 duration-200"
                  data-dropdown
                >
                  {item.href && (
                    <>
                      <Link
                        href={item.href}
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors mx-1.5 rounded-lg"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <Icon className="w-4 h-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">Ver Todos</div>
                          <div className="text-xs text-muted-foreground">
                            Vista general de {item.name.toLowerCase()}
                          </div>
                        </div>
                      </Link>
                      <div className="h-px bg-border my-1.5 mx-1.5" />
                    </>
                  )}
                  {item.dropdown?.map((sub) => (
                    <Link
                      key={sub.name}
                      href={sub.href}
                      className={`block px-3 py-2.5 text-sm transition-colors mx-1.5 rounded-lg ${
                        isActive(sub.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
                      }`}
                      onClick={() => setActiveDropdown(null)}
                    >
                      <div className="font-medium">{sub.name}</div>
                      {sub.description && <div className="text-xs text-muted-foreground mt-0.5">{sub.description}</div>}
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
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              isActive(item.href)
                ? "bg-primary/10 text-primary"
                : "text-foreground/70 hover:text-foreground hover:bg-muted"
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
    <div className="lg:hidden px-3 py-4 bg-background border-t border-border">
      <div className="space-y-1">
        {navConfig.map((item) => {
          const Icon = item.icon
          const hasDropdown = item.dropdown && item.dropdown.length > 0

          return (
            <div key={item.name} data-dropdown>
              {hasDropdown ? (
                <>
                  <button
                    data-dropdown-button
                    onClick={(e) => handleDropdownClick(e, item.name)}
                    className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                      isActive(item.href) || item.dropdown?.some((sub: any) => sub && isActive(sub.href))
                        ? "bg-primary/10 text-primary"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5" />
                      {item.name}
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform duration-200 ${
                        activeDropdown === item.name ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {activeDropdown === item.name && (
                    <div className="ml-4 mt-1 space-y-1" data-dropdown>
                      {item.href && (
                        <Link
                          href={item.href}
                          className="block px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
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
                          className={`block px-3 py-2 text-sm rounded-lg transition-colors ${
                            isActive(sub.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
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
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive(item.href) ? "bg-primary/10 text-primary" : "text-foreground hover:bg-muted"
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
    </div>
  )

  return (
    <nav
      className="sticky top-0 z-50 bg-background/80 backdrop-blur-xl border-b border-border"
      suppressHydrationWarning
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Desktop Navigation */}
          {renderDesktopNav()}

          <div className="flex items-center gap-2">
            {/* Notifications */}
            {user && (
              <button className="relative p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full ring-2 ring-background" />
              </button>
            )}

            {/* User Dropdown */}
            {user && (
              <div className="relative hidden lg:block" data-dropdown>
                <button
                  data-dropdown-button
                  onClick={(e) => handleDropdownClick(e, "user")}
                  className="flex items-center gap-2 px-2 py-1.5 text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                    <User2 className="w-4 h-4 text-primary-foreground" />
                  </div>
                  <span className="text-sm font-medium max-w-[120px] truncate">{user.name}</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>

                {activeDropdown === "user" && (
                  <div
                    className="absolute right-0 top-full mt-2 min-w-[220px] bg-card border border-border rounded-xl shadow-lg z-50 py-1.5 animate-in fade-in-0 zoom-in-95 duration-200"
                    data-dropdown
                  >
                    <div className="px-3 py-2.5 border-b border-border">
                      <div className="font-medium text-foreground truncate">{user.name}</div>
                      <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                    </div>

                    {isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary hover:bg-primary/10 transition-colors mx-1.5 rounded-lg mt-1.5"
                        onClick={() => setActiveDropdown(null)}
                      >
                        <Shield className="w-4 h-4" />
                        Panel de Administración
                      </Link>
                    )}

                    <Link
                      href="/dashboard"
                      className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors mx-1.5 rounded-lg"
                      onClick={() => setActiveDropdown(null)}
                    >
                      <Settings className="w-4 h-4" />
                      Dashboard
                    </Link>

                    <div className="h-px bg-border my-1.5 mx-1.5" />

                    <button
                      onClick={() => {
                        logout()
                        setActiveDropdown(null)
                      }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted transition-colors mx-1.5 rounded-lg mb-1.5"
                    >
                      <LogOut className="w-4 h-4" />
                      Cerrar Sesión
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* CTA Buttons */}
            {!user && (
              <div className="hidden lg:flex items-center gap-2">
                <Link
                  href="/auth/login"
                  className="px-4 py-2 text-sm font-medium text-foreground hover:text-primary transition-colors"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="px-4 py-2 text-sm font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 shadow-sm hover:shadow transition-all"
                >
                  Registrarte
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="lg:hidden p-2 text-foreground hover:bg-muted rounded-lg transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {isOpen && (
        <div className="lg:hidden border-t border-border bg-background">
          {renderMobileNav()}

          {/* Mobile user section */}
          {user ? (
            <div className="px-3 py-4 border-t border-border">
              <div className="flex items-center gap-3 px-3 py-2 mb-2">
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-full flex items-center justify-center">
                  <User2 className="w-5 h-5 text-primary-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground truncate">{user.name}</div>
                  <div className="text-sm text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>

              <div className="space-y-1">
                {isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-3 px-3 py-2.5 text-sm text-primary hover:bg-primary/10 rounded-lg transition-colors"
                    onClick={() => setIsOpen(false)}
                  >
                    <Shield className="w-4 h-4" />
                    Panel de Administración
                  </Link>
                )}

                <Link
                  href="/dashboard"
                  className="flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
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
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-foreground hover:bg-muted rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <div className="px-3 py-4 border-t border-border space-y-2">
              <Link
                href="/auth/login"
                className="block w-full px-4 py-2.5 text-center text-foreground font-medium border border-border rounded-lg hover:bg-muted transition-colors"
                onClick={() => setIsOpen(false)}
              >
                Iniciar Sesión
              </Link>
              <Link
                href="/auth/register"
                className="block w-full px-4 py-2.5 text-center text-primary-foreground font-medium bg-primary rounded-lg hover:bg-primary/90 shadow-sm transition-all"
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
