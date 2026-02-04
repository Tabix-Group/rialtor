"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../auth/authContext"
import { useRouter } from "next/navigation"
import { authenticatedFetch } from "@/utils/api"
import Link from "next/link"
import EconomicIndicators from "@/components/EconomicIndicators"
import SalesFunnel from "@/components/SalesFunnel"
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
  MoreVertical,
  Trash2,
  AlertCircle,
  Briefcase
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
  const isMeet = !!event.meetLink
  const bgClass = isMeet ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-indigo-100 text-indigo-700 border-indigo-200"

  return (
    <div className={`h-full w-full px-2 py-0.5 rounded-md border text-xs font-semibold truncate hover:shadow-md transition-all duration-200 flex items-center gap-1.5 ${bgClass}`}>
      {event.meetLink && <Video className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{event.title}</span>
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
  const [selectedEventForView, setSelectedEventForView] = useState<CalendarEvent | null>(null)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false)
  const [proyeccionesExpanded, setProyeccionesExpanded] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
    }
    
    // Verificar si el usuario está inactivo y requiere pago
    if (!loading && user && !user.isActive && user.requiresSubscription) {
      console.log('[DASHBOARD] User is inactive and requires payment, redirecting to pricing')
      router.replace(`/pricing?userId=${user.id}`)
    }
  }, [user, loading, router])

  const fetchMarketData = async () => {
    try {
      const response = await fetch("/api/indicators/all")
      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          setMarketData(result.data)
        }
      }
    } catch (error) {
      console.error("Error fetching market data:", error)
    }
  }

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
      fetchMarketData()

      // Actualizar datos de mercado cada 5 minutos
      const interval = setInterval(fetchMarketData, 5 * 60 * 1000)
      return () => clearInterval(interval)
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
        // Tratar todos los errores (401, 500, etc.) como "calendario no conectado"
        setCalendarEvents([])
        setCalendarConnected(false)
      }
    } catch (error) {
        // Silenciosamente manejar errores de calendario
        setCalendarConnected(false)
        setCalendarEvents([])
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
        // Refresh full list to be safe or update state locally
        fetchCalendarEvents()
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
          alert("Error al obtener URL de autorización")
        }
      } else {
        alert("Error al conectar calendario")
      }
    } catch (error) {
      alert("Error al conectar calendario")
    }
  }

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEventForView(event)
  }

  const handleEditEvent = () => {
    if (selectedEventForView) {
      setEditingEvent(selectedEventForView)
      setNewEvent({
        title: selectedEventForView.title,
        description: selectedEventForView.description || "",
        start: selectedEventForView.start.toISOString().slice(0, 16),
        end: selectedEventForView.end.toISOString().slice(0, 16),
      })
      setShowModal(true)
      setSelectedEventForView(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (selectedEventForView && selectedEventForView.id) {
      if (!confirm("¿Eliminar este evento?")) return

      try {
        const res = await authenticatedFetch(`/api/calendar/events/${selectedEventForView.id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setCalendarEvents(calendarEvents.filter((e) => e.id !== selectedEventForView.id))
        } else {
          alert("Error al eliminar el evento")
        }
      } catch (error) {
        alert("Error al eliminar el evento")
      }
    }
    setSelectedEventForView(null)
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
      title: "Calculadoras",
      description: "Gastos, créditos e inversiones.",
      icon: Calculator,
      href: "/calculadoras",
      badge: "Financiero",
      color: "text-blue-600 bg-blue-50"
    },
    {
      title: "Formularios",
      description: "Editor de contratos y reservas.",
      icon: Edit3,
      href: "/formularios",
      badge: "Editor",
      color: "text-purple-600 bg-purple-50"
    },
    {
      title: "Análisis IA",
      description: "Lectura inteligente de docs.",
      icon: Search,
      href: "/documents/summary",
      badge: "Smart",
      color: "text-emerald-600 bg-emerald-50"
    },
    {
      title: "Marketing",
      description: "Diseño de placas inmobiliarias.",
      icon: ImageIcon,
      href: "/placas",
      badge: "Diseño",
      color: "text-pink-600 bg-pink-50"
    },
    {
      title: "Asesor IA",
      description: "Chatbot legal e inmobiliario 24/7.",
      icon: MessageSquare,
      href: "/chat",
      badge: "24/7",
      color: "text-indigo-600 bg-indigo-50"
    },
    {
      title: "Noticias",
      description: "Actualidad del mercado.",
      icon: Newspaper,
      href: "/news",
      badge: "Info",
      color: "text-orange-600 bg-orange-50"
    },
    {
      title: "Prospectos",
      description: "Gestión de clientes y CRM.",
      icon: User2,
      href: "/prospectos",
      badge: "CRM",
      color: "text-cyan-600 bg-cyan-50"
    },
    {
      title: "Finanzas",
      description: "Control de ingresos y egresos.",
      icon: BarChart3,
      href: "/finanzas",
      badge: "Control",
      color: "text-green-600 bg-green-50"
    },
    {
      title: "Newsletter",
      description: "Email marketing profesional.",
      icon: Send,
      href: "/newsletter",
      badge: "Mkt",
      color: "text-rose-600 bg-rose-50"
    },
  ]

  if (isAdmin) {
    features.push({
      title: "Admin Panel",
      description: "Gestión completa del sistema.",
      icon: Shield,
      href: "/admin",
      badge: "Admin",
      color: "text-slate-600 bg-slate-50"
    })
  }

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
            <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
            <p className="mt-4 text-slate-500 font-medium">Cargando dashboard...</p>
        </div>
      </div>
    )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      
      {/* Hero Section Moderno */}
      <div className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-10">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
               <div className="flex items-center gap-2">
                 <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 text-xs font-bold border border-emerald-100 flex items-center gap-1">
                    <Crown className="w-3 h-3" /> Premium
                 </span>
                 <span className="text-xs text-slate-400">{new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}</span>
               </div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                  Hola, <span className="text-blue-600">{user?.name?.split(" ")[0]}</span>
               </h1>
               <p className="text-slate-500 text-sm max-w-xl">
                 Bienvenido a tu centro de comando. Aquí tienes un resumen de tu actividad y acceso rápido a tus herramientas.
               </p>
            </div>
            
            <div className="flex gap-3 w-full lg:w-auto">
                <Link href="/documents/generator" className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-700 transition-colors font-semibold text-sm shadow-sm shadow-blue-200">
                    <Plus className="w-4 h-4" /> Nuevo Documento
                </Link>
                <Link href="/chat" className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 bg-white text-slate-700 border border-slate-200 px-5 py-2.5 rounded-lg hover:bg-slate-50 transition-colors font-semibold text-sm">
                    <Sparkles className="w-4 h-4 text-purple-500" /> Consultar IA
                </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                    <FileText className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{statsLoading ? "-" : stats?.documentsGrowth}%
                </span>
             </div>
             <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Documentos Activos</p>
                <p className="text-2xl font-bold text-slate-900">{statsLoading ? "..." : stats?.activeDocuments}</p>
             </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                    <Zap className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{statsLoading ? "-" : stats?.toolsGrowth}%
                </span>
             </div>
             <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Herramientas Usadas</p>
                <p className="text-2xl font-bold text-slate-900">{statsLoading ? "..." : stats?.toolsUsed}</p>
             </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200 shadow-sm flex flex-col justify-between h-full">
             <div className="flex justify-between items-start mb-2">
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                    <Clock className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    +{statsLoading ? "-" : stats?.timeGrowth}%
                </span>
             </div>
             <div>
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wide">Tiempo Ahorrado</p>
                <p className="text-2xl font-bold text-slate-900">{statsLoading ? "..." : stats?.timeSaved}h</p>
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 rounded-xl p-5 shadow-lg flex flex-col justify-between h-full text-white relative overflow-hidden group">
             <div className="absolute right-0 top-0 opacity-10 transform translate-x-4 -translate-y-4 group-hover:scale-110 transition-transform">
                <Crown className="w-24 h-24" />
             </div>
             <div className="flex justify-between items-start mb-2 relative z-10">
                <div className="p-2 bg-white/10 rounded-lg">
                    <Award className="w-5 h-5" />
                </div>
                <span className="text-xs font-bold text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 px-2 py-0.5 rounded-full">
                    Activo
                </span>
             </div>
             <div className="relative z-10">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">Membresía</p>
                <p className="text-xl font-bold">Plan Profesional</p>
             </div>
          </div>
        </div>

        {/* Widgets Interactivos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* 1. Calendario Widget */}
            <div 
                className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${calendarExpanded ? 'lg:col-span-3 h-auto' : 'h-[300px] group cursor-pointer hover:border-blue-300 hover:shadow-md'}`}
                onClick={() => !calendarExpanded && setCalendarExpanded(true)}
            >
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Agenda</h3>
                            {!calendarExpanded && <p className="text-xs text-slate-500">{getUpcomingEvents().length} eventos próximos</p>}
                        </div>
                    </div>
                    {calendarExpanded ? (
                        <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); setShowModal(true) }} className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-700">
                                + Evento
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); setCalendarExpanded(false) }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                                <X className="w-5 h-5" />
                             </button>
                        </div>
                    ) : (
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-blue-500 transition-colors" />
                    )}
                </div>

                <div className="flex-1 p-0 overflow-hidden relative">
                    {calendarExpanded ? (
                        <div className="p-4 h-[500px]">
                            {/* Full Calendar View */}
                            <BigCalendar
                                localizer={localizer}
                                events={calendarEvents}
                                startAccessor="start"
                                endAccessor="end"
                                style={{ height: "100%" }}
                                views={["month", "week", "day"]}
                                defaultView="month"
                                onSelectSlot={(slotInfo) => {
                                    setNewEvent({ ...newEvent, start: slotInfo.start.toISOString().slice(0, 16), end: slotInfo.end.toISOString().slice(0, 16) })
                                    setShowModal(true)
                                }}
                                onSelectEvent={(event) => handleEventClick(event as CalendarEvent)}
                                components={{ event: CustomEvent }}
                            />
                        </div>
                    ) : (
                        <div className="p-5 space-y-3">
                            {getUpcomingEvents().length > 0 ? getUpcomingEvents().map((evt, i) => (
                                <div key={i} className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                                    <div className="flex-shrink-0 w-10 text-center">
                                        <p className="text-[10px] uppercase font-bold text-slate-400">{evt.start.toLocaleDateString('es-ES', {month: 'short'})}</p>
                                        <p className="text-lg font-bold text-slate-700 leading-none">{evt.start.getDate()}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-slate-800 truncate">{evt.title}</p>
                                        <p className="text-xs text-slate-500">{format(evt.start, 'HH:mm')} hs {evt.meetLink && '• Videollamada'}</p>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-slate-400 text-sm">
                                    <Calendar className="w-8 h-8 mb-2 opacity-20" />
                                    No tienes eventos próximos
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Pipeline / Proyecciones Widget */}
             <div 
                className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${proyeccionesExpanded ? 'lg:col-span-3 h-[600px] z-20 fixed inset-4 lg:inset-10 m-auto shadow-2xl' : 'h-[300px] group cursor-pointer hover:border-purple-300 hover:shadow-md'}`}
                onClick={() => !proyeccionesExpanded && setProyeccionesExpanded(true)}
            >
                {/* Backdrop for fixed modal mode */}
                {proyeccionesExpanded && <div className="fixed inset-0 bg-slate-900/20 -z-10 backdrop-blur-sm" onClick={(e) => {e.stopPropagation(); setProyeccionesExpanded(false)}}></div>}

                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Pipeline</h3>
                            {!proyeccionesExpanded && <p className="text-xs text-slate-500">Estado de ventas</p>}
                        </div>
                    </div>
                    {proyeccionesExpanded ? (
                         <button onClick={(e) => { e.stopPropagation(); setProyeccionesExpanded(false) }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5" />
                         </button>
                    ) : (
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-purple-500 transition-colors" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {proyeccionesExpanded ? (
                        <div className="h-full overflow-y-auto p-4">
                             <SalesFunnel /> 
                        </div>
                    ) : (
                        <div className="p-6 flex flex-col justify-center h-full">
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Prospectos</span>
                                <span className="text-sm font-bold text-slate-900">12</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2 mb-4">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                             </div>
                             
                             <div className="flex items-center justify-between mb-2">
                                <span className="text-sm font-medium text-slate-600">Negociación</span>
                                <span className="text-sm font-bold text-slate-900">4</span>
                             </div>
                             <div className="w-full bg-slate-100 rounded-full h-2">
                                <div className="bg-purple-500 h-2 rounded-full" style={{ width: '25%' }}></div>
                             </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Indicadores Widget */}
             <div 
                className={`bg-white rounded-xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${indicatorsExpanded ? 'lg:col-span-3 h-[600px] z-20 fixed inset-4 lg:inset-10 m-auto shadow-2xl' : 'h-[300px] group cursor-pointer hover:border-emerald-300 hover:shadow-md'}`}
                onClick={() => !indicatorsExpanded && setIndicatorsExpanded(true)}
            >
                {indicatorsExpanded && <div className="fixed inset-0 bg-slate-900/20 -z-10 backdrop-blur-sm" onClick={(e) => {e.stopPropagation(); setIndicatorsExpanded(false)}}></div>}
                
                <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-emerald-50 rounded-lg text-emerald-600">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">Mercado</h3>
                            {!indicatorsExpanded && <p className="text-xs text-slate-500">Indicadores en vivo</p>}
                        </div>
                    </div>
                    {indicatorsExpanded ? (
                         <button onClick={(e) => { e.stopPropagation(); setIndicatorsExpanded(false) }} className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg">
                            <X className="w-5 h-5" />
                         </button>
                    ) : (
                        <ArrowUpRight className="w-5 h-5 text-slate-300 group-hover:text-emerald-500 transition-colors" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden relative">
                    {indicatorsExpanded ? (
                        <div className="h-full overflow-y-auto p-4">
                             <EconomicIndicators />
                        </div>
                    ) : (
                        <div className="p-5 space-y-4">
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <DollarSign className="w-4 h-4 text-emerald-600" />
                                    <span className="text-sm font-medium text-slate-700">Dólar Blue</span>
                                </div>
                                <span className="font-bold text-slate-900">
                                    {marketData?.dolar?.blue?.venta 
                                        ? `$${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0 }).format(marketData.dolar.blue.venta)}`
                                        : '$...'}
                                </span>
                            </div>
                            <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-100">
                                <div className="flex items-center gap-2">
                                    <Building2 className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-medium text-slate-700">M² CABA</span>
                                </div>
                                <span className="font-bold text-slate-900">
                                    {marketData?.mercadoInmobiliario?.precioM2?.caba?.venta 
                                        ? `USD ${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0 }).format(marketData.mercadoInmobiliario.precioM2.caba.venta)}`
                                        : 'USD ...'}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Tools Grid Section */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Suite de Herramientas</h2>
                <Link href="/calculadoras" className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center gap-1">
                    Ver todas <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {features.map((feature, index) => (
                    <Link key={index} href={feature.href} className="group">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all duration-200 h-full flex flex-col hover:border-blue-300">
                            <div className="flex justify-between items-start mb-3">
                                <div className={`p-2 rounded-lg ${feature.color.split(' ')[1]}`}>
                                    <feature.icon className={`w-5 h-5 ${feature.color.split(' ')[0]}`} />
                                </div>
                                <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded border border-slate-100 group-hover:bg-white transition-colors">{feature.badge}</span>
                            </div>
                            <h3 className="font-bold text-slate-800 text-sm mb-1">{feature.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{feature.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Recent Documents Section */}
        <div>
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-slate-800">Documentos Recientes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {documents.length > 0 ? documents.slice(0, 3).map((doc) => (
                    <Link key={doc.id} href={doc.url} target="_blank" className="block group">
                         <div className="bg-white rounded-xl border border-slate-200 p-4 hover:shadow-md transition-all flex items-start gap-3">
                             <div className="p-2 bg-slate-100 text-slate-500 rounded-lg group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                 <FileText className="w-5 h-5" />
                             </div>
                             <div className="min-w-0">
                                 <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-700">{doc.title}</h4>
                                 <p className="text-xs text-slate-500 mt-1">{new Date(doc.uploadDate).toLocaleDateString()} • {doc.type}</p>
                             </div>
                         </div>
                    </Link>
                )) : (
                    <div className="col-span-3 text-center py-8 border-2 border-dashed border-slate-200 rounded-xl">
                        <p className="text-slate-400 text-sm">No hay documentos recientes</p>
                        <Link href="/documents/generator" className="text-blue-600 font-bold text-sm mt-2 inline-block hover:underline">Crear el primero</Link>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Modal Crear Evento */}
      {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
               <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-lg font-bold text-slate-800">{editingEvent ? "Editar Evento" : "Nuevo Evento"}</h3>
                  <button onClick={() => setShowModal(false)} className="p-1 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-200"><X className="w-5 h-5"/></button>
               </div>
               <div className="p-6 space-y-4">
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Título</label>
                      <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" placeholder="Reunión..." />
                  </div>
                  <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Descripción</label>
                      <textarea value={newEvent.description} onChange={(e) => setNewEvent({...newEvent, description: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm" rows={2} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Inicio</label>
                          <input type="datetime-local" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Fin</label>
                          <input type="datetime-local" value={newEvent.end} onChange={(e) => setNewEvent({...newEvent, end: e.target.value})} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm" />
                      </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                      <button onClick={() => setShowModal(false)} className="flex-1 px-4 py-2 border border-slate-300 rounded-lg text-slate-700 font-bold text-sm hover:bg-slate-50">Cancelar</button>
                      <button onClick={handleAddEvent} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Guardar</button>
                  </div>
               </div>
            </div>
          </div>
      )}
      
      {/* Modal para ver detalles de evento */}
      {selectedEventForView && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/20 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Evento</h3>
                  <button onClick={() => setSelectedEventForView(null)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"><X className="w-6 h-6"/></button>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asunto</label>
                      <p className="text-lg font-bold text-slate-900">{selectedEventForView.title}</p>
                  </div>
                  {selectedEventForView.description && (
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Descripción</label>
                          <p className="text-sm text-slate-700">{selectedEventForView.description}</p>
                      </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inicio</label>
                          <p className="text-sm font-semibold text-slate-900">{selectedEventForView.start.toLocaleString('es-ES')}</p>
                      </div>
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fin</label>
                          <p className="text-sm font-semibold text-slate-900">{selectedEventForView.end.toLocaleString('es-ES')}</p>
                      </div>
                  </div>
                  <div className="flex gap-3 pt-4">
                      {selectedEventForView.meetLink && (
                          <button onClick={() => { window.open(selectedEventForView.meetLink!, '_blank'); }} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                              <Video className="w-4 h-4"/> Meet
                          </button>
                      )}
                      <button onClick={handleEditEvent} className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-slate-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Edit className="w-4 h-4"/> Editar
                      </button>
                      <button onClick={handleDeleteEvent} className="flex-1 px-6 py-3 bg-red-100 text-red-600 rounded-xl font-black text-xs uppercase tracking-widest hover:bg-red-200 transition-all active:scale-95 flex items-center justify-center gap-2">
                          <Trash2 className="w-4 h-4"/> Borrar
                      </button>
                  </div>
                  <button onClick={() => setSelectedEventForView(null)} className="w-full px-6 py-3 border border-slate-200 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cerrar</button>
               </div>
            </div>
          </div>
      )}

    </div>
  )
}