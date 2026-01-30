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
  ArrowUpRight,
  Zap,
  Target,
  Award,
  ChevronRight,
  Plus,
  Calendar,
  Edit3,
  X,
  Video,
  DollarSign,
  User2,
  Edit,
  Trash2,
  Percent,
  TrendingDown
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
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; event: CalendarEvent } | null>(null)
  const [calendarExpanded, setCalendarExpanded] = useState(false)
  const [indicatorsExpanded, setIndicatorsExpanded] = useState(false)
  const [proyeccionesExpanded, setProyeccionesExpanded] = useState(false)
  const [marketData, setMarketData] = useState<any>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login")
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
      }
    } catch (error) {
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
        fetchCalendarEvents()
        setNewEvent({ title: "", description: "", start: "", end: "" })
        setEditingEvent(null)
        setShowModal(false)
      }
    } catch (error) {
      console.error("Error saving event:", error)
    }
  }

  const handleEventClick = (event: CalendarEvent, e: React.SyntheticEvent) => {
    e.preventDefault()
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect()
    const x = Math.min(rect.left + rect.width / 2, window.innerWidth - 180)
    setContextMenu({
      x: x,
      y: rect.top + window.scrollY - 10,
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
        }
      } catch (error) {
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

  const isAdmin = user && user.roles && user.roles.some((role: any) => role.name === "ADMIN")

  const features = [
    { title: "Calculadoras", description: "Gastos, créditos e inversiones.", icon: Calculator, href: "/calculadoras", badge: "Financiero", color: "text-blue-600 bg-blue-50" },
    { title: "Formularios", description: "Editor de contratos y reservas.", icon: Edit3, href: "/formularios", badge: "Editor", color: "text-purple-600 bg-purple-50" },
    { title: "Análisis IA", description: "Lectura inteligente de docs.", icon: Search, href: "/documents/summary", badge: "Smart", color: "text-emerald-600 bg-emerald-50" },
    { title: "Marketing", description: "Diseño de placas inmobiliarias.", icon: ImageIcon, href: "/placas", badge: "Diseño", color: "text-pink-600 bg-pink-50" },
    { title: "Asesor IA", description: "Chatbot legal e inmobiliario 24/7.", icon: MessageSquare, href: "/chat", badge: "24/7", color: "text-indigo-600 bg-indigo-50" },
    { title: "Noticias", description: "Actualidad del mercado.", icon: Newspaper, href: "/news", badge: "Info", color: "text-orange-600 bg-orange-50" },
    { title: "Prospectos", description: "Gestión de clientes y CRM.", icon: User2, href: "/prospectos", badge: "CRM", color: "text-cyan-600 bg-cyan-50" },
    { title: "Finanzas", description: "Control de ingresos y egresos.", icon: BarChart3, href: "/finanzas", badge: "Control", color: "text-green-600 bg-green-50" },
    { title: "Newsletter", description: "Email marketing profesional.", icon: Send, href: "/newsletter", badge: "Mkt", color: "text-rose-600 bg-rose-50" },
  ]

  if (isAdmin) features.push({ title: "Admin Panel", description: "Gestión completa del sistema.", icon: Shield, href: "/admin", badge: "Admin", color: "text-slate-600 bg-slate-50" })

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="text-center">
          <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-slate-500 font-medium">Sincronizando con Rialtor...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12 relative overflow-hidden">
      {/* Fondo decorativo exclusivo Dashboard */}
      <div className="absolute inset-0 pointer-events-none opacity-40" style={{ backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>
      
      {/* Hero Section Moderno con Gradiente */}
      <div className="bg-gradient-to-r from-white via-slate-50 to-blue-50/30 border-b border-slate-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-3">
               <div className="flex items-center gap-3">
                 <div className="px-3 py-1 rounded-full bg-slate-900 text-yellow-400 text-xs font-bold flex items-center gap-1.5 shadow-lg shadow-slate-200">
                    <Crown className="w-3.5 h-3.5" /> Acceso Premium
                 </div>
                 <span className="text-xs font-medium text-slate-400 bg-white/50 px-2 py-1 rounded border border-slate-100 uppercase tracking-wider">
                    {new Date().toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' })}
                 </span>
               </div>
               <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight">
                  Hola, <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">{user?.name?.split(" ")[0]}</span>
               </h1>
               <p className="text-slate-500 text-base max-w-xl leading-relaxed">
                 Tu central inteligente está lista. Tienes <span className="text-blue-600 font-bold">{getUpcomingEvents().length} citas</span> para hoy y el mercado está {marketData?.dolar?.blue?.variacion > 0 ? 'al alza' : 'estable'}.
               </p>
            </div>
            
            <div className="flex gap-4 w-full lg:w-auto">
                <Link href="/documents/generator" className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800 transition-all font-bold text-sm shadow-xl shadow-slate-200 active:scale-95">
                    <Plus className="w-5 h-5" /> Nuevo Documento
                </Link>
                <Link href="/chat" className="flex-1 lg:flex-none inline-flex justify-center items-center gap-2 bg-white text-slate-700 border border-slate-200 px-6 py-3 rounded-xl hover:bg-slate-50 transition-all font-bold text-sm shadow-sm active:scale-95">
                    <Sparkles className="w-5 h-5 text-purple-500" /> Asistente IA
                </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 relative z-10">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
                    <FileText className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <TrendingUp className="w-3 h-3" /> {statsLoading ? "0" : stats?.documentsGrowth}%
                </div>
             </div>
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Docs Activos</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{statsLoading ? "..." : stats?.activeDocuments}</p>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                    <Zap className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                    <TrendingUp className="w-3 h-3" /> {statsLoading ? "0" : stats?.toolsGrowth}%
                </div>
             </div>
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Uso de IA</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{statsLoading ? "..." : stats?.toolsUsed}</p>
             </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-orange-50 rounded-xl text-orange-600">
                    <Clock className="w-6 h-6" />
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full border border-emerald-100">
                   <Zap className="w-3 h-3" /> {statsLoading ? "0" : stats?.timeGrowth}%
                </div>
             </div>
             <div>
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Tiempo Ahorrado</p>
                <p className="text-3xl font-black text-slate-900 mt-1">{statsLoading ? "..." : stats?.timeSaved}h</p>
             </div>
          </div>
          
          <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 rounded-2xl p-6 shadow-2xl flex flex-col justify-between h-full text-white relative overflow-hidden group border border-white/10">
             <div className="absolute -right-4 -top-4 opacity-20 transform group-hover:rotate-12 transition-transform duration-500">
                <Crown className="w-32 h-32" />
             </div>
             <div className="flex justify-between items-start relative z-10">
                <div className="p-3 bg-white/10 rounded-xl backdrop-blur-md">
                    <Award className="w-6 h-6 text-yellow-400" />
                </div>
                <span className="text-[10px] font-black text-slate-900 bg-yellow-400 px-3 py-1 rounded-full uppercase tracking-tighter shadow-lg shadow-yellow-400/20">
                    Gold Member
                </span>
             </div>
             <div className="relative z-10 mt-4">
                <p className="text-slate-400 text-xs font-bold uppercase tracking-widest">Membresía</p>
                <p className="text-2xl font-black tracking-tight">Plan Profesional</p>
             </div>
          </div>
        </div>

        {/* Widgets Interactivos */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* 1. Calendario Widget */}
            <div 
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${calendarExpanded ? 'lg:col-span-3 h-auto' : 'h-[320px] group cursor-pointer hover:border-blue-400/50 hover:shadow-xl'}`}
                onClick={() => !calendarExpanded && setCalendarExpanded(true)}
            >
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-blue-600 text-white rounded-xl shadow-lg shadow-blue-200">
                            <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Agenda Rialtor</h3>
                            {!calendarExpanded && <p className="text-xs text-blue-600 font-bold">{getUpcomingEvents().length} tareas pendientes para hoy</p>}
                        </div>
                    </div>
                    {calendarExpanded ? (
                        <div className="flex gap-2">
                             <button onClick={(e) => { e.stopPropagation(); setShowModal(true) }} className="px-4 py-2 bg-blue-600 text-white text-xs font-black rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200">
                                + AGENDAR
                             </button>
                             <button onClick={(e) => { e.stopPropagation(); setCalendarExpanded(false) }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                                <X className="w-6 h-6" />
                             </button>
                        </div>
                    ) : (
                        <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-blue-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    )}
                </div>

                <div className="flex-1 p-0 overflow-hidden relative bg-white">
                    {calendarExpanded ? (
                        <div className="p-4 h-[600px]">
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
                                onSelectEvent={handleEventClick}
                                components={{ event: CustomEvent }}
                            />
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {getUpcomingEvents().length > 0 ? getUpcomingEvents().map((evt, i) => (
                                <div key={i} className="flex items-center gap-4 p-3 rounded-2xl hover:bg-blue-50/50 transition-all border border-slate-50 hover:border-blue-100 group/item">
                                    <div className="flex-shrink-0 w-12 h-12 flex flex-col items-center justify-center bg-white border border-slate-100 rounded-xl shadow-sm">
                                        <p className="text-[10px] uppercase font-black text-blue-600">{evt.start.toLocaleDateString('es-ES', {month: 'short'})}</p>
                                        <p className="text-xl font-black text-slate-800 leading-none">{evt.start.getDate()}</p>
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-800 truncate group-hover/item:text-blue-700">{evt.title}</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <p className="text-xs font-medium text-slate-400">{format(evt.start, 'HH:mm')} hs</p>
                                            {evt.meetLink && <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50 px-1.5 py-0.5 rounded uppercase border border-blue-100"><Video className="w-2.5 h-2.5"/> Meet</span>}
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="h-48 flex flex-col items-center justify-center text-slate-400 text-sm">
                                    <div className="p-4 bg-slate-50 rounded-full mb-3">
                                        <Calendar className="w-8 h-8 opacity-20" />
                                    </div>
                                    No hay compromisos pendientes
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* 2. Pipeline Widget */}
             <div 
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${proyeccionesExpanded ? 'lg:col-span-3 h-[700px] z-50 fixed inset-4 lg:inset-20 m-auto shadow-2xl border-purple-500/20' : 'h-[320px] group cursor-pointer hover:border-purple-400/50 hover:shadow-xl'}`}
                onClick={() => !proyeccionesExpanded && setProyeccionesExpanded(true)}
            >
                {proyeccionesExpanded && <div className="fixed inset-0 bg-slate-900/40 -z-10 backdrop-blur-md" onClick={(e) => {e.stopPropagation(); setProyeccionesExpanded(false)}}></div>}

                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-purple-600 text-white rounded-xl shadow-lg shadow-purple-200">
                            <Target className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Embudo de Ventas</h3>
                            {!proyeccionesExpanded && <p className="text-xs text-purple-600 font-bold">4 cierres potenciales este mes</p>}
                        </div>
                    </div>
                    {proyeccionesExpanded ? (
                         <button onClick={(e) => { e.stopPropagation(); setProyeccionesExpanded(false) }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                            <X className="w-6 h-6" />
                         </button>
                    ) : (
                        <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-purple-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden relative bg-white">
                    {proyeccionesExpanded ? (
                        <div className="h-full overflow-y-auto p-8">
                             <SalesFunnel /> 
                        </div>
                    ) : (
                        <div className="p-8 flex flex-col justify-center h-full space-y-6">
                             <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">Etapa de Captación</span>
                                    <span className="text-sm font-black text-slate-900">12</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full shadow-sm" style={{ width: '60%' }}></div>
                                </div>
                             </div>
                             
                             <div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs font-black text-slate-400 uppercase tracking-widest">En Negociación</span>
                                    <span className="text-sm font-black text-slate-900">4</span>
                                </div>
                                <div className="w-full bg-slate-100 rounded-full h-3">
                                    <div className="bg-gradient-to-r from-purple-500 to-indigo-500 h-3 rounded-full shadow-sm" style={{ width: '25%' }}></div>
                                </div>
                             </div>
                             <p className="text-[10px] text-center text-slate-400 font-medium">Click para ver detalle del pipeline</p>
                        </div>
                    )}
                </div>
            </div>

            {/* 3. Indicadores de Mercado Widget */}
             <div 
                className={`bg-white rounded-2xl border border-slate-200 shadow-sm transition-all duration-300 overflow-hidden flex flex-col ${indicatorsExpanded ? 'lg:col-span-3 h-[700px] z-50 fixed inset-4 lg:inset-20 m-auto shadow-2xl border-emerald-500/20' : 'h-[320px] group cursor-pointer hover:border-emerald-400/50 hover:shadow-xl'}`}
                onClick={() => !indicatorsExpanded && setIndicatorsExpanded(true)}
            >
                {indicatorsExpanded && <div className="fixed inset-0 bg-slate-900/40 -z-10 backdrop-blur-md" onClick={(e) => {e.stopPropagation(); setIndicatorsExpanded(false)}}></div>}
                
                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/30">
                    <div className="flex items-center gap-4">
                        <div className="p-2.5 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-200">
                            <TrendingUp className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="font-black text-slate-800 text-lg uppercase tracking-tight">Mercado Hoy</h3>
                            {!indicatorsExpanded && <p className="text-xs text-emerald-600 font-bold">Datos financieros actualizados</p>}
                        </div>
                    </div>
                    {indicatorsExpanded ? (
                         <button onClick={(e) => { e.stopPropagation(); setIndicatorsExpanded(false) }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl">
                            <X className="w-6 h-6" />
                         </button>
                    ) : (
                        <ArrowUpRight className="w-6 h-6 text-slate-300 group-hover:text-emerald-600 transition-all group-hover:translate-x-1 group-hover:-translate-y-1" />
                    )}
                </div>
                <div className="flex-1 overflow-hidden relative bg-white">
                    {indicatorsExpanded ? (
                        <div className="h-full overflow-y-auto p-8">
                             <EconomicIndicators />
                        </div>
                    ) : (
                        <div className="p-6 space-y-4">
                            {/* Dólar Blue Card */}
                            <div className="group/item flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-emerald-50 hover:border-emerald-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <DollarSign className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Dólar Blue</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">
                                        {marketData?.dolar?.blue?.venta 
                                            ? `$${new Intl.NumberFormat("es-AR", { minimumFractionDigits: 0 }).format(marketData.dolar.blue.venta)}`
                                            : '$...'}
                                    </p>
                                    <p className={`text-[10px] font-bold flex items-center justify-end gap-1 ${marketData?.dolar?.blue?.variacion >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                                        {marketData?.dolar?.blue?.variacion >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                                        {marketData?.dolar?.blue?.variacion || 0}%
                                    </p>
                                </div>
                            </div>
                            
                            {/* Inflación Card (Actualizado) */}
                            <div className="group/item flex justify-between items-center p-4 bg-slate-50 border border-slate-100 rounded-2xl hover:bg-blue-50 hover:border-blue-100 transition-all">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-white rounded-lg shadow-sm">
                                        <Percent className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <span className="text-sm font-bold text-slate-700">Inflación Mensual</span>
                                </div>
                                <div className="text-right">
                                    <p className="font-black text-slate-900 text-lg">
                                        {marketData?.indicesEconomicos?.inflacion?.valor 
                                            ? `${marketData.indicesEconomicos.inflacion.valor}%`
                                            : '...'}
                                    </p>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">
                                        IPC {marketData?.indicesEconomicos?.inflacion?.fecha?.split('-')[1] || '--'}/24
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

        </div>

        {/* Tools Grid Section */}
        <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    Suite de Herramientas <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                </h2>
                <Link href="/calculadoras" className="group text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition-all">
                    Explorar suite completa <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                {features.map((feature, index) => (
                    <Link key={index} href={feature.href} className="group">
                        <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all duration-300 h-full flex flex-col hover:border-blue-400/30 hover:-translate-y-1 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ArrowUpRight className="w-4 h-4 text-slate-300" />
                            </div>
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-3 rounded-xl shadow-sm ${feature.color.split(' ')[1]}`}>
                                    <feature.icon className={`w-6 h-6 ${feature.color.split(' ')[0]}`} />
                                </div>
                                <span className="text-[10px] font-black text-slate-400 bg-slate-50 px-2 py-1 rounded-lg border border-slate-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all uppercase tracking-tighter">{feature.badge}</span>
                            </div>
                            <h3 className="font-black text-slate-800 text-sm mb-1.5 uppercase tracking-tight">{feature.title}</h3>
                            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{feature.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>

        {/* Recent Documents Section */}
        <div className="pt-4">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                    Documentos Recientes <div className="h-1 w-1 bg-blue-600 rounded-full"></div>
                </h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {documents.length > 0 ? documents.slice(0, 3).map((doc) => (
                    <Link key={doc.id} href={doc.url} target="_blank" className="block group">
                         <div className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-xl transition-all flex items-start gap-4 hover:border-blue-200">
                             <div className="p-3 bg-slate-50 text-slate-400 rounded-xl group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                 <FileText className="w-6 h-6" />
                             </div>
                             <div className="min-w-0">
                                 <h4 className="font-bold text-slate-800 text-sm truncate group-hover:text-blue-700 uppercase tracking-tight">{doc.title}</h4>
                                 <p className="text-[10px] font-black text-slate-400 mt-1 uppercase tracking-widest">{new Date(doc.uploadDate).toLocaleDateString()} • {doc.type}</p>
                             </div>
                         </div>
                    </Link>
                )) : (
                    <div className="col-span-3 text-center py-12 border-2 border-dashed border-slate-200 rounded-3xl bg-white/50">
                        <div className="p-4 bg-white rounded-full inline-block mb-3 shadow-sm">
                            <FileText className="w-8 h-8 text-slate-200" />
                        </div>
                        <p className="text-slate-400 font-bold text-sm">Tu bandeja de documentos está vacía</p>
                        <Link href="/documents/generator" className="text-blue-600 font-black text-xs mt-3 inline-block hover:underline uppercase tracking-widest">Generar Contrato →</Link>
                    </div>
                )}
            </div>
        </div>

      </div>

      {/* Modal Crear Evento (Simplificado para el copy-paste) */}
      {showModal && (
          <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-3xl shadow-2xl border border-white/20 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-300">
               <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">{editingEvent ? "Editar Evento" : "Nueva Cita"}</h3>
                  <button onClick={() => setShowModal(false)} className="p-2 text-slate-400 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors"><X className="w-6 h-6"/></button>
               </div>
               <div className="p-8 space-y-6">
                  <div>
                      <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Asunto</label>
                      <input type="text" value={newEvent.title} onChange={(e) => setNewEvent({...newEvent, title: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all text-sm font-bold" placeholder="Ej: Firma Boleto Depto Palermo" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Inicio</label>
                          <input type="datetime-local" value={newEvent.start} onChange={(e) => setNewEvent({...newEvent, start: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                      <div>
                          <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Fin</label>
                          <input type="datetime-local" value={newEvent.end} onChange={(e) => setNewEvent({...newEvent, end: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold" />
                      </div>
                  </div>
                  <div className="flex gap-4 pt-4">
                      <button onClick={() => setShowModal(false)} className="flex-1 px-6 py-3 border border-slate-200 rounded-xl text-slate-500 font-black text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors">Cerrar</button>
                      <button onClick={handleAddEvent} className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95">Confirmar</button>
                  </div>
               </div>
            </div>
          </div>
      )}
      
      {/* Context Menu (Click derecho en eventos) */}
      {contextMenu && (
          <>
            <div className="fixed inset-0 z-[110]" onClick={() => setContextMenu(null)} />
            <div className="fixed z-[120] bg-white rounded-2xl shadow-2xl border border-slate-200 py-2 min-w-[200px] animate-in slide-in-from-top-2 duration-200" style={{ left: contextMenu.x, top: contextMenu.y }}>
                {contextMenu.event.meetLink && (
                    <button onClick={() => { window.open(contextMenu.event.meetLink!, '_blank'); setContextMenu(null) }} className="w-full px-5 py-3 text-left hover:bg-blue-50 text-blue-600 text-xs font-black uppercase tracking-tighter flex items-center gap-3"><Video className="w-4 h-4"/> Entrar a Video</button>
                )}
                <button onClick={handleEditEvent} className="w-full px-5 py-3 text-left hover:bg-slate-50 text-slate-700 text-xs font-black uppercase tracking-tighter flex items-center gap-3"><Edit className="w-4 h-4"/> Modificar</button>
                <div className="h-px bg-slate-100 my-1 mx-2"></div>
                <button onClick={handleDeleteEvent} className="w-full px-5 py-3 text-left hover:bg-red-50 text-red-600 text-xs font-black uppercase tracking-tighter flex items-center gap-3"><Trash2 className="w-4 h-4"/> Borrar Evento</button>
            </div>
          </>
      )}

    </div>
  )
}