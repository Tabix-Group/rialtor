"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../auth/authContext"
import { useRouter } from "next/navigation"
import { authenticatedFetch } from "@/utils/api"
import Link from "next/link"
import EconomicIndicators from "@/components/EconomicIndicators"
import {
  Calculator,
  FileText,
  Wand2,
  Search,
  ImageIcon,
  Newspaper,
  Shield,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Crown,
  BarChart3,
  Clock,
  Activity,
  ArrowUpRight,
  ArrowRight,
  Zap,
  Target,
  Award,
  ChevronRight,
  Plus,
  Calendar,
  Edit3,
  ChevronLeft,
  Edit,
  X,
  Video,
  DollarSign,
  User2,
  Building2,
  Mail,
  Send,
} from "lucide-react"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { es } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es },
})

interface Document {
  id: string
  title: string
  type: string
  category: string
  uploadDate: string
  size: string
  url: string
}

interface UserStats {
  activeDocuments: number
  documentsGrowth: number
  toolsUsed: number
  toolsGrowth: number
  timeSaved: number
  timeGrowth: number
}

interface CalendarEvent {
  id?: string
  title: string
  start: Date
  end: Date
  description?: string
  source?: "google" | "local"
  meetLink?: string | null
}

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="relative group cursor-pointer">
      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium truncate hover:shadow-lg transition-all duration-200 flex items-center gap-1">
        {event.meetLink && <Video className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate">{event.title}</span>
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none border border-border shadow-xl">
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="text-muted-foreground mt-1">{event.description}</div>}
        <div className="text-muted-foreground mt-1">
          {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
        </div>
        {event.meetLink && (
          <div className="flex items-center gap-1 mt-1 text-primary">
            <Video className="w-3 h-3" />
            <span>Google Meet disponible</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: "", description: "", start: "", end: "" })
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; event: CalendarEvent } | null>(null)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
  }, [user, loading, router])

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch("/api/documents/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Error fetching stats:", error)
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (user) {
      fetchDocuments()
      fetchStats()
      fetchCalendarEvents()
    }
  }, [user])

  const fetchDocuments = async () => {
    try {
      const res = await authenticatedFetch("/api/documents")
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error("Error fetching documents:", error)
    }
  }

  const fetchCalendarEvents = async () => {
    setCalendarLoading(true)
    try {
      const res = await authenticatedFetch("/api/calendar/events")
      if (res.ok) {
        const data = await res.json()
        // Validar que data.events existe y es un array
        const eventsArray = Array.isArray(data.events) ? data.events : (Array.isArray(data) ? data : [])
        setCalendarEvents(
          eventsArray.map((event: any) => ({
            id: event.id,
            title: event.title,
            start: new Date(event.start),
            end: new Date(event.end),
            description: event.description,
            meetLink: event.meetLink || null,
          })),
        )
        setCalendarConnected(true)
      } else {
        const errorData = await res.json().catch(() => ({}))
        if (errorData.error === "CALENDAR_NOT_CONNECTED" || errorData.error === "Calendario no conectado") {
          setCalendarEvents([])
          setCalendarConnected(false)
        } else {
          console.error("Error fetching calendar events:", errorData)
          setCalendarConnected(false)
        }
      }
    } catch (error) {
      if (error instanceof Error && error.message === "CALENDAR_NOT_CONNECTED") {
        setCalendarEvents([])
        setCalendarConnected(false)
      } else {
        console.error("Error fetching calendar events:", error)
        setCalendarConnected(false)
      }
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return

    try {
      const eventData = {
        summary: newEvent.title,
        description: newEvent.description,
        start: new Date(newEvent.start).toISOString(),
        end: new Date(newEvent.end).toISOString(),
      }

      let res
      if (editingEvent && editingEvent.id) {
        res = await authenticatedFetch(`/api/calendar/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
      } else {
        res = await authenticatedFetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(eventData),
        })
      }

      if (res.ok) {
        const data = await res.json()

        if (editingEvent) {
          setCalendarEvents(
            calendarEvents.map((e) =>
              e.id === editingEvent.id
                ? {
                    id: data.event?.id || editingEvent.id,
                    title: newEvent.title,
                    start: new Date(newEvent.start),
                    end: new Date(newEvent.end),
                    description: newEvent.description,
                    meetLink: data.event?.meetLink || null,
                  }
                : e,
            ),
          )
        } else {
          setCalendarEvents([
            ...calendarEvents,
            {
              id: data.event?.id || `temp-${Date.now()}`,
              title: newEvent.title,
              start: new Date(newEvent.start),
              end: new Date(newEvent.end),
              description: newEvent.description,
              meetLink: data.event?.meetLink || null,
            },
          ])
        }

        setNewEvent({ title: "", description: "", start: "", end: "" })
        setEditingEvent(null)
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleConnectCalendar = async () => {
    try {
      const response = await fetch("/api/calendar/auth", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        if (data.authUrl) {
          window.location.href = data.authUrl
        } else {
          console.error("No auth URL received:", data)
          alert("Error al obtener URL de autorización")
        }
      } else {
        const error = await response.json()
        console.error("Calendar auth error:", error)
        alert("Error al conectar calendario: " + error.error)
      }
    } catch (error) {
      console.error("Error connecting calendar:", error)
      alert("Error al conectar calendario")
    }
  }

  const handleEventClick = (event: CalendarEvent, e: React.SyntheticEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    setContextMenu({
      x: rect.left + rect.width / 2,
      y: rect.top - 10,
      event,
    })
  }

  const handleEditEvent = () => {
    if (contextMenu) {
      setEditingEvent(contextMenu.event)
      setNewEvent({
        title: contextMenu.event.title,
        description: contextMenu.event.description || "",
        start: contextMenu.event.start.toISOString().slice(0, 16),
        end: contextMenu.event.end.toISOString().slice(0, 16),
      })
      setShowModal(true)
      setContextMenu(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (contextMenu && contextMenu.event.id) {
      if (!confirm("¿Eliminar este evento?")) return

      try {
        const res = await authenticatedFetch(`/api/calendar/events/${contextMenu.event.id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setCalendarEvents(calendarEvents.filter((e) => e.id !== contextMenu.event.id))
        } else {
          alert("Error al eliminar el evento")
        }
      } catch (error) {
        console.error("Error deleting event:", error)
        alert("Error al eliminar el evento")
      }
    }
    setContextMenu(null)
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return calendarEvents
      .filter((event) => event.start >= now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3)
  }

  const isAdmin = user && user.roles && user.roles.some((role) => role.name === "ADMIN")

  const features = [
    {
      title: "Calculadoras Financieras",
      description: "Suite completa de herramientas de cálculo para gastos, créditos e inversiones inmobiliarias.",
      icon: Calculator,
      href: "/calculadoras",
      badge: "Financiero",
      stats: "12+ herramientas",
    },
    {
      title: "Formularios Editables",
      description: "Edita formularios y documentos directamente en el navegador con editor WYSIWYG profesional.",
      icon: Edit3,
      href: "/formularios",
      badge: "Editor",
      stats: "Documentos listos",
    },
    {
      title: "Análisis Documental",
      description: "Extracción y análisis inteligente de información clave de contratos y documentos complejos.",
      icon: Search,
      href: "/documents/summary",
      badge: "Smart",
      stats: "10 seg promedio",
    },
    {
      title: "Marketing Visual",
      description: "Diseño profesional de placas para propiedades con plantillas premium personalizables.",
      icon: ImageIcon,
      href: "/placas",
      badge: "Diseño Pro",
      stats: "Plantilla premium",
    },
    {
      title: "Asesor Virtual IA",
      description: "Asistente inteligente 24/7 especializado en normativas y consultas del sector inmobiliario.",
      icon: MessageSquare,
      href: "/chat",
      badge: "Disponible 24/7",
      stats: "Respuesta instantánea",
    },
    {
      title: "Centro de Noticias",
      description: "Actualizaciones en tiempo real del mercado inmobiliario, tendencias y análisis de mercado.",
      icon: Newspaper,
      href: "/news",
      badge: "En Vivo",
      stats: "Actualización diaria",
    },
    {
      title: "Mis Prospectos",
      description: "Gestioná tus prospectos: proyecciones, conversiones y seguimiento por cliente.",
      icon: User2,
      href: "/prospectos",
      badge: "Prospectos",
      stats: "Conversiones"
    },
    {
      title: "Centro de Finanzas",
      description:
        "Gestión completa de ingresos y egresos personales. Controla tu flujo de caja con análisis detallado.",
      icon: BarChart3,
      href: "/finanzas",
      badge: "Finanzas",
      stats: "Control total",
    },
    {
      title: "Newsletter Marketing",
      description: "Crea newsletters profesionales con plantillas premium, contenido dinámico y exportación a PDF de alta calidad.",
      icon: Send,
      href: "/newsletter",
      badge: "Marketing Pro",
      stats: "Plantillas premium",
    },
  ]

  if (isAdmin) {
    features.push({
      title: "Panel de Control Admin",
      description: "Gestión avanzada de usuarios, contenido, análisis y configuración completa del sistema.",
      icon: Shield,
      href: "/admin",
      badge: "Admin",
      stats: "Acceso total",
    })
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-16 h-16 border-4 border-border border-t-primary rounded-full animate-spin"></div>
          </div>
          <p className="mt-6 text-foreground font-semibold text-lg">Cargando plataforma...</p>
          <p className="mt-2 text-muted-foreground text-sm">Preparando tu experiencia profesional</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-subtle">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Content */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-accent/10 border border-accent/20 rounded-full">
                <Crown className="w-4 h-4 text-accent" />
                <span className="text-sm font-semibold text-accent">Cuenta Premium Activa</span>
              </div>

              <div>
                <h1 className="text-4xl lg:text-5xl font-bold mb-3 tracking-tight text-balance">
                  Bienvenido, <span className="text-gradient">{user?.name?.split(" ")[0]}</span>
                </h1>
                <p className="text-lg text-muted-foreground max-w-2xl leading-relaxed text-pretty">
                  Tu centro de comando profesional. Accede a todas las herramientas y recursos que necesitas para
                  potenciar tu negocio inmobiliario.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  href="/formularios"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold hover:shadow-lg"
                >
                  <Plus className="w-4 h-4" />
                  Base de Documentos
                </Link>
                <Link
                  href="/chat"
                  className="inline-flex items-center gap-2 bg-muted text-foreground px-6 py-3 rounded-xl hover:bg-muted/80 border border-border transition-all duration-200 font-semibold"
                >
                  <MessageSquare className="w-4 h-4" />
                  Consultar IA
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stats Card */}
            <div className="w-full lg:w-auto">
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 border border-border shadow-lg">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-base font-bold text-foreground">Resumen de Actividad</h3>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Esta semana</span>
                    <span className="text-2xl font-bold text-foreground">
                      {statsLoading ? "..." : stats?.toolsUsed || 0}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: "75%" }}
                    ></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-accent-foreground" />
                    <span className="text-muted-foreground">
                      +{statsLoading ? "..." : stats?.toolsGrowth || 0}% vs semana anterior
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Premium Status */}
          <div className="bg-gradient-accent rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 group relative overflow-hidden border border-accent/20">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-11 h-11 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform duration-300">
                  <Award className="w-5 h-5 text-white" />
                </div>
                <Crown className="w-5 h-5 text-white/80" />
              </div>
              <p className="text-sm font-semibold text-white/90 mb-1">Estado Premium</p>
              <p className="text-3xl font-bold text-white mb-1">Activo</p>
              <p className="text-xs text-white/80">Acceso ilimitado a todo</p>
            </div>
          </div>

          {/* Active Documents */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />
                <span className="text-xs font-bold text-accent-foreground">
                  +{statsLoading ? "..." : stats?.documentsGrowth || 0}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Documentos Activos</p>
            <p className="text-3xl font-bold text-foreground mb-1">
              {statsLoading ? "..." : stats?.activeDocuments || 0}
            </p>
            <p className="text-xs text-muted-foreground">Total en tu biblioteca</p>
          </div>

          {/* Tools Used */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />
                <span className="text-xs font-bold text-accent-foreground">
                  +{statsLoading ? "..." : stats?.toolsGrowth || 0}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Herramientas Usadas</p>
            <p className="text-3xl font-bold text-foreground mb-1">{statsLoading ? "..." : stats?.toolsUsed || 0}</p>
            <p className="text-xs text-muted-foreground">En los últimos 7 días</p>
          </div>

          {/* Time Saved */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm hover:shadow-lg transition-all duration-300 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <Clock className="w-5 h-5 text-primary" />
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />
                <span className="text-xs font-bold text-accent-foreground">
                  +{statsLoading ? "..." : stats?.timeGrowth || 0}%
                </span>
              </div>
            </div>
            <p className="text-sm font-medium text-muted-foreground mb-1">Tiempo Ahorrado</p>
            <p className="text-3xl font-bold text-foreground mb-1">
              {statsLoading ? "..." : `${stats?.timeSaved || 0}h`}
            </p>
            <p className="text-xs text-muted-foreground">Optimización mensual</p>
          </div>
        </div>

        {/* Tools Grid */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-1">Suite de Herramientas</h2>
              <p className="text-muted-foreground text-sm">Acceso completo a todas las funcionalidades profesionales</p>
            </div>
            <Link
              href="/calculadoras"
              className="hidden lg:inline-flex items-center gap-2 text-primary hover:text-primary/80 font-semibold group text-sm"
            >
              Ver todas
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href} className="group block">
                <div className="bg-card rounded-2xl border border-border overflow-hidden hover:shadow-lg transition-all duration-300 hover:border-primary/50 h-full">
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                        <feature.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="px-2 py-0.5 bg-primary/10 border border-primary/20 rounded-md">
                        <span className="text-xs font-bold text-primary">{feature.badge}</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-1">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 line-clamp-2">
                      {feature.description}
                    </p>

                    <div className="flex items-center justify-between pt-3 border-t border-border">
                      <span className="text-xs font-semibold text-muted-foreground">{feature.stats}</span>
                      <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all duration-300" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Calendar Section */}
        {calendarExpanded ? (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Mi Calendario</h3>
                  <p className="text-sm text-muted-foreground">Gestiona tu agenda sincronizada con Google Calendar</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setCalendarExpanded(false)}
                  className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-xl hover:bg-muted/80 transition-all duration-200 font-semibold text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Minimizar
                </button>
                {!calendarConnected && (
                  <button
                    onClick={handleConnectCalendar}
                    className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-4 py-2 rounded-xl hover:bg-accent/90 transition-all duration-200 font-semibold text-sm"
                  >
                    <Plus className="w-4 h-4" />
                    Conectar Google
                  </button>
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold text-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Evento
                </button>
              </div>
            </div>

            {calendarLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
                  <p className="mt-4 text-muted-foreground font-semibold text-sm">Cargando calendario...</p>
                </div>
              </div>
            ) : (
              <div className="h-96">
                <BigCalendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  style={{ height: "100%" }}
                  views={["month", "week", "day"]}
                  defaultView="month"
                  messages={{
                    next: "Siguiente",
                    previous: "Anterior",
                    today: "Hoy",
                    month: "Mes",
                    week: "Semana",
                    day: "Día",
                    agenda: "Agenda",
                    date: "Fecha",
                    time: "Hora",
                    event: "Evento",
                    noEventsInRange: "No hay eventos en este rango.",
                    showMore: (total) => `+ Ver ${total} más`,
                  }}
                  onSelectSlot={({ start, end }) => {
                    setNewEvent({
                      ...newEvent,
                      start: start.toISOString().slice(0, 16),
                      end: end.toISOString().slice(0, 16),
                    })
                    setShowModal(true)
                  }}
                  onSelectEvent={handleEventClick}
                  selectable
                  popup
                  components={{
                    event: CustomEvent,
                  }}
                />
              </div>
            )}

            {contextMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setContextMenu(null)} />
                <div
                  className="fixed z-50 bg-popover rounded-xl shadow-2xl border border-border py-1 min-w-48"
                  style={{
                    left: contextMenu.x,
                    top: contextMenu.y,
                    transform: "translate(-50%, -100%)",
                  }}
                >
                  {contextMenu.event.meetLink && (
                    <button
                      onClick={() => {
                        window.open(contextMenu.event.meetLink!, '_blank')
                        setContextMenu(null)
                      }}
                      className="w-full px-4 py-2.5 text-left hover:bg-primary/10 transition-colors flex items-center gap-3 text-primary font-medium text-sm"
                    >
                      <Video className="w-4 h-4" />
                      Abrir Google Meet
                    </button>
                  )}
                  <button
                    onClick={handleEditEvent}
                    className="w-full px-4 py-2.5 text-left hover:bg-muted transition-colors flex items-center gap-3 text-foreground font-medium text-sm"
                  >
                    <Edit className="w-4 h-4" />
                    Editar evento
                  </button>
                  <button
                    onClick={handleDeleteEvent}
                    className="w-full px-4 py-2.5 text-left hover:bg-destructive/10 transition-colors flex items-center gap-3 text-destructive font-medium text-sm"
                  >
                    <X className="w-4 h-4" />
                    Eliminar evento
                  </button>
                </div>
              </>
            )}
          </div>
        ) : (
          <div className="mb-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Calendar Card */}
              <div
                onClick={() => setCalendarExpanded(true)}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/50 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />
                    <span className="text-xs font-bold text-accent-foreground">{calendarEvents.length}</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Mi Calendario</p>
                <p className="text-3xl font-bold text-foreground mb-3">{calendarEvents.length}</p>
                <div className="space-y-2">
                  {getUpcomingEvents().length > 0 ? (
                    getUpcomingEvents()
                      .slice(0, 2)
                      .map((event, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full"></div>
                          <span className="truncate">{event.title}</span>
                        </div>
                      ))
                  ) : (
                    <p className="text-xs text-muted-foreground">Sin eventos próximos</p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Próximos eventos</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                </div>
              </div>

              {/* Economic Indicators Card */}
              <div
                onClick={() => setIndicatorsExpanded(true)}
                className="bg-card rounded-2xl border border-border p-6 hover:shadow-lg transition-all duration-300 hover:border-primary/50 group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                    <DollarSign className="w-5 h-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-1 bg-accent/50 rounded-full">
                    <TrendingUp className="w-3.5 h-3.5 text-accent-foreground" />
                    <span className="text-xs font-bold text-accent-foreground">Live</span>
                  </div>
                </div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Indicadores</p>
                <p className="text-3xl font-bold text-foreground mb-3">Mercado</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <DollarSign className="w-3 h-3" />
                    <span className="truncate">Dólar Blue</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Building2 className="w-3 h-3" />
                    <span className="truncate">Precio m² CABA</span>
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-muted-foreground">Ver detalles</span>
                    <ArrowUpRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Economic Indicators Expanded */}
        {indicatorsExpanded && (
          <div className="bg-card rounded-2xl border border-border p-6 mb-8 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">Indicadores de Mercado</h3>
                  <p className="text-sm text-muted-foreground">Datos en tiempo real del mercado inmobiliario</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIndicatorsExpanded(false)}
                  className="inline-flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-xl hover:bg-muted/80 transition-all duration-200 font-semibold text-sm"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Minimizar
                </button>
                <Link
                  href="/indicadores"
                  className="inline-flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-xl hover:bg-primary/90 transition-all duration-200 font-semibold text-sm"
                >
                  Ver página completa
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            <div className="max-h-[600px] overflow-y-auto">
              <EconomicIndicators />
            </div>
          </div>
        )}

        {/* Recent Documents */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold text-foreground">Documentos Recientes</h2>
            </div>
            <Link
              href="/documents"
              className="text-primary hover:text-primary/80 font-semibold transition-colors flex items-center gap-2 text-sm"
            >
              Ver todos
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.slice(0, 3).map((doc) => (
              <div
                key={doc.id}
                className="bg-card rounded-2xl border border-border p-5 hover:shadow-lg transition-all duration-300 hover:border-primary/50 group"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-11 h-11 bg-primary/10 rounded-xl flex items-center justify-center">
                    <FileText className="w-5 h-5 text-primary" />
                  </div>
                  <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-1 rounded-md">
                    {doc.type}
                  </span>
                </div>

                <h3 className="font-bold text-foreground mb-2 line-clamp-2 text-sm">{doc.title}</h3>
                <p className="text-sm text-muted-foreground mb-4 line-clamp-2">Documento profesional generado con IA</p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {new Date(doc.uploadDate).toLocaleDateString("es-ES", { day: "2-digit", month: "short" })}
                  </span>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-primary/80 font-semibold text-sm transition-colors group-hover:translate-x-1"
                  >
                    Ver →
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions & Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-primary via-primary/90 to-primary/80 rounded-2xl p-6 shadow-lg relative overflow-hidden border border-border">
            <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black/5"></div>

            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-background/10 backdrop-blur-sm rounded-xl flex items-center justify-center">
                  <Zap className="w-5 h-5 text-primary-foreground" />
                </div>
                <h3 className="text-xl font-bold text-primary-foreground">Acciones Rápidas</h3>
              </div>

              <div className="space-y-2">
                {[
                  { icon: Wand2, label: "Generar Documento", href: "/documents/generator" },
                  { icon: Calculator, label: "Calcular Gastos", href: "/calculadoras" },
                  { icon: Edit3, label: "Editar Formulario", href: "/formularios" },
                  { icon: ImageIcon, label: "Crear Placa", href: "/placas" },
                  { icon: MessageSquare, label: "Consultar IA", href: "/chat" },
                  { icon: User2, label: "Ver Prospectos", href: "/prospectos" },
                  { icon: BarChart3, label: "Ver Finanzas", href: "/finanzas" },
                ].map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="flex items-center justify-between p-3 bg-background/10 backdrop-blur-sm rounded-xl border border-background/20 hover:bg-background/20 transition-all duration-200 group"
                  >
                    <div className="flex items-center gap-3">
                      <action.icon className="w-4 h-4 text-primary-foreground" />
                      <span className="font-semibold text-primary-foreground text-sm">{action.label}</span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-primary-foreground/60 group-hover:text-primary-foreground group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div className="bg-card rounded-2xl border border-border p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-accent/50 rounded-xl flex items-center justify-center">
                <Target className="w-5 h-5 text-accent-foreground" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Tips del Día</h3>
            </div>

            <div className="space-y-3">
              {[
                {
                  icon: Sparkles,
                  title: "Optimiza tus documentos",
                  description:
                    "Usa el generador IA para crear contratos profesionales en segundos. Ahorra hasta 2 horas por documento.",
                  color: "accent",
                },
                {
                  icon: BarChart3,
                  title: "Analiza el mercado",
                  description:
                    "Revisa las últimas noticias del sector para tomar decisiones informadas y estar adelante de la competencia.",
                  color: "primary",
                },
                {
                  icon: Award,
                  title: "Calidad premium",
                  description:
                    "Las placas profesionales generan 3x más interés. Crea diseños impactantes con nuestras plantillas premium.",
                  color: "accent",
                },
              ].map((tip, index) => (
                <div key={index} className="p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-8 h-8 ${tip.color === "accent" ? "bg-accent" : "bg-primary"} rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5`}
                    >
                      <tip.icon
                        className={`w-4 h-4 ${tip.color === "accent" ? "text-accent-foreground" : "text-primary-foreground"}`}
                      />
                    </div>
                    <div>
                      <h4 className="font-bold text-foreground mb-1 text-sm">{tip.title}</h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Event Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-2xl p-6 max-w-md w-full mx-4 shadow-2xl border border-border">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-foreground">{editingEvent ? "Editar Evento" : "Nuevo Evento"}</h3>
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEvent(null)
                  setNewEvent({ title: "", description: "", start: "", end: "" })
                }}
                className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center hover:bg-muted/80 transition-colors"
              >
                <X className="w-4 h-4 text-foreground" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Título</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  placeholder="Título del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-foreground mb-2">Descripción</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-foreground"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Inicio</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">Fin</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-4 py-2.5 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-foreground"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-6">
              <button
                onClick={() => {
                  setShowModal(false)
                  setEditingEvent(null)
                  setNewEvent({ title: "", description: "", start: "", end: "" })
                }}
                className="flex-1 px-6 py-2.5 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all font-semibold text-sm"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-6 py-2.5 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 transition-all font-semibold text-sm"
              >
                {editingEvent ? "Actualizar" : "Crear Evento"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
