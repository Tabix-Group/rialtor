'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import Link from 'next/link'
import {
  Calculator, FileText, Wand2, Search, ImageIcon, Newspaper, Download, Shield,
  Upload, Trash2, Eye, MessageSquare, Settings,
  Sparkles, TrendingUp, Crown, BarChart3, Clock, Activity,
  ArrowUpRight, Zap, Target, Award, ChevronRight, Plus, Filter,
  Calendar, Folder, PlusCircle, Wrench, CheckCircle, Edit3
} from 'lucide-react'
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { es } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es }
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
}

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [newEvent, setNewEvent] = useState({ title: '', description: '', start: '', end: '' })

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  const fetchStats = async () => {
    try {
      const response = await authenticatedFetch('/api/documents/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error('Error fetching stats:', error)
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
    setDocsLoading(true)
    try {
      const res = await authenticatedFetch('/api/documents')
      const data = await res.json()
      setDocuments(data.documents || [])
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setDocsLoading(false)
    }
  }

  const fetchCalendarEvents = async () => {
    setCalendarLoading(true)
    try {
      const res = await authenticatedFetch('/api/calendar/events')
      if (res.ok) {
        const events = await res.json()
        setCalendarEvents(events.map((e: any) => ({
          id: e.id,
          title: e.summary,
          start: new Date(e.start.dateTime || e.start.date),
          end: new Date(e.end.dateTime || e.end.date),
          description: e.description
        })))
      } else {
        // Handle calendar not connected error
        const errorData = await res.json().catch(() => ({}))
        if (errorData.error === 'Calendario no conectado') {
          setCalendarEvents([]) // Just show empty calendar
        } else {
          console.error('Error fetching calendar events:', errorData)
        }
      }
    } catch (error) {
      // Handle the CALENDAR_NOT_CONNECTED error specifically
      if (error instanceof Error && error.message === 'CALENDAR_NOT_CONNECTED') {
        setCalendarEvents([]) // Just show empty calendar
      } else {
        console.error('Error fetching calendar events:', error)
      }
    } finally {
      setCalendarLoading(false)
    }
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return

    try {
      const res = await authenticatedFetch('/api/calendar/events', {
        method: 'POST',
        body: JSON.stringify({
          summary: newEvent.title,
          description: newEvent.description,
          start: new Date(newEvent.start).toISOString(),
          end: new Date(newEvent.end).toISOString()
        })
      })

      if (res.ok) {
        const createdEvent = await res.json()
        setCalendarEvents([...calendarEvents, {
          id: createdEvent.id,
          title: newEvent.title,
          start: new Date(newEvent.start),
          end: new Date(newEvent.end),
          description: newEvent.description
        }])
        setNewEvent({ title: '', description: '', start: '', end: '' })
        setShowModal(false)
      }
    } catch (error) {
      console.error('Error creating event:', error)
    }
  }

  const handleConnectCalendar = async () => {
    try {
      // Make authenticated request to get the auth URL
      const response = await fetch('/api/calendar/auth', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.redirected) {
        // If the server redirects, follow the redirect
        window.location.href = response.url;
      } else if (response.ok) {
        // If successful, the response should be a redirect
        const data = await response.json();
        console.log('Auth response:', data);
      } else {
        const error = await response.json();
        console.error('Calendar auth error:', error);
        alert('Error al conectar calendario: ' + error.error);
      }
    } catch (error) {
      console.error('Error connecting calendar:', error);
      alert('Error al conectar calendario');
    }
  }

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await authenticatedFetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments(documents.filter(doc => doc.id !== id))
    } catch (error) {
      alert('Error al eliminar documento')
    }
  }

  const isAdmin = user && user.roles && user.roles.some(role => role.name === 'ADMIN')

  const features = [
    {
      title: 'Calculadoras Financieras',
      description: 'Suite completa de herramientas de cálculo para gastos, créditos e inversiones inmobiliarias.',
      icon: Calculator,
      href: '/calculadoras',
      gradient: 'from-emerald-600 via-teal-600 to-cyan-600',
      iconBg: 'from-emerald-500 to-teal-600',
      badge: 'Financiero',
      stats: '12+ herramientas'
    },
    {
      title: 'Generador IA',
      description: 'Creación automática de contratos y documentos legales con inteligencia artificial avanzada.',
      icon: Wand2,
      href: '/documents/generator',
      gradient: 'from-violet-600 via-purple-600 to-indigo-600',
      iconBg: 'from-violet-500 to-purple-600',
      badge: 'IA Avanzada',
      stats: 'Precisión 99%'
    },
    {
      title: 'Análisis Documental',
      description: 'Extracción y análisis inteligente de información clave de contratos y documentos complejos.',
      icon: Search,
      href: '/documents/summary',
      gradient: 'from-rose-600 via-pink-600 to-fuchsia-600',
      iconBg: 'from-rose-500 to-pink-600',
      badge: 'Smart',
      stats: '10 seg promedio'
    },
    {
      title: 'Formularios Editables',
      description: 'Edita formularios y documentos directamente en el navegador con editor WYSIWYG profesional.',
      icon: Edit3,
      href: '/formularios',
      gradient: 'from-cyan-600 via-blue-600 to-indigo-600',
      iconBg: 'from-cyan-500 to-blue-600',
      badge: 'Editor',
      stats: 'Documentos listos'
    },
    {
      title: 'Marketing Visual',
      description: 'Diseño profesional de placas para propiedades con plantillas premium personalizables.',
      icon: ImageIcon,
      href: '/placas',
      gradient: 'from-amber-600 via-orange-600 to-red-600',
      iconBg: 'from-amber-500 to-orange-600',
      badge: 'Diseño Pro',
      stats: 'Plantilla premium'
    },
    {
      title: 'Asesor Virtual IA',
      description: 'Asistente inteligente 24/7 especializado en normativas y consultas del sector inmobiliario.',
      icon: MessageSquare,
      href: '/chat',
      gradient: 'from-blue-600 via-sky-600 to-cyan-600',
      iconBg: 'from-blue-500 to-sky-600',
      badge: 'Disponible 24/7',
      stats: 'Respuesta instantánea'
    },
    {
      title: 'Centro de Noticias',
      description: 'Actualizaciones en tiempo real del mercado inmobiliario, tendencias y análisis de mercado.',
      icon: Newspaper,
      href: '/news',
      gradient: 'from-slate-700 via-gray-700 to-zinc-700',
      iconBg: 'from-slate-600 to-gray-700',
      badge: 'En Vivo',
      stats: 'Actualización diaria'
    },
    {
      title: 'Centro de Finanzas',
      description: 'Gestión completa de ingresos y egresos personales. Controla tu flujo de caja con análisis detallado.',
      icon: BarChart3,
      href: '/finanzas',
      gradient: 'from-green-600 via-emerald-600 to-teal-600',
      iconBg: 'from-green-500 to-emerald-600',
      badge: 'Finanzas',
      stats: 'Control total'
    },
  ]

  if (isAdmin) {
    features.push({
      title: 'Panel de Control Admin',
      description: 'Gestión avanzada de usuarios, contenido, análisis y configuración completa del sistema.',
      icon: Shield,
      href: '/admin',
      gradient: 'from-red-600 via-rose-600 to-pink-600',
      iconBg: 'from-red-500 to-rose-600',
      badge: 'Admin',
      stats: 'Acceso total'
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20">
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-20 h-20 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-20 h-20 border-4 border-slate-100 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
        </div>
        <p className="mt-6 text-slate-600 font-semibold text-lg">Cargando plataforma...</p>
        <p className="mt-2 text-slate-400 text-sm">Preparando tu experiencia profesional</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">


      {/* Hero Section Premium */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>
        
        <div className="relative max-w-[1600px] mx-auto px-6 lg:px-8 py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
            {/* Contenido Principal */}
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6">
                <Sparkles className="w-4 h-4 text-yellow-400" />
                <span className="text-sm font-semibold text-white">Cuenta Premium Activa</span>
              </div>
              
              <h1 className="text-5xl lg:text-6xl font-bold text-white mb-4 tracking-tight">
                Bienvenido, <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">{user?.name?.split(' ')[0]}</span>
              </h1>
              
              <p className="text-xl text-slate-300 mb-8 max-w-2xl leading-relaxed">
                Tu centro de comando profesional. Accede a todas las herramientas, recursos y análisis que necesitas para potenciar tu negocio inmobiliario.
              </p>

              <div className="flex flex-wrap gap-4">
                <Link href="/documents/generator" className="group inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold">
                  <Plus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Nuevo Documento
                </Link>
                <Link href="/chat" className="inline-flex items-center gap-3 bg-white/10 backdrop-blur-md text-white px-8 py-4 rounded-2xl hover:bg-white/20 border border-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold">
                  <MessageSquare className="w-5 h-5" />
                  Consultar IA
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Stats Card Flotante */}
            <div className="w-full lg:w-auto">
              <div className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <Activity className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Resumen de Actividad</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-300">Esta semana</span>
                    <span className="text-2xl font-bold text-white">{statsLoading ? '...' : stats?.toolsUsed || 0}</span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-indigo-400 rounded-full" style={{ width: '75%' }}></div>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <TrendingUp className="w-4 h-4 text-green-400" />
                    <span className="text-slate-300">+{statsLoading ? '...' : stats?.toolsGrowth || 0}% vs semana anterior</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-12">
        {/* KPI Cards Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 -mt-20 relative z-10">
          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-green-50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-green-600" />
                <span className="text-xs font-bold text-green-700">+{statsLoading ? '...' : stats?.documentsGrowth || 0}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Documentos Activos</p>
            <p className="text-4xl font-bold text-slate-900 mb-2">{statsLoading ? '...' : stats?.activeDocuments || 0}</p>
            <p className="text-xs text-slate-500">Total en tu biblioteca</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-xs font-bold text-emerald-700">+{statsLoading ? '...' : stats?.toolsGrowth || 0}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Herramientas Usadas</p>
            <p className="text-4xl font-bold text-slate-900 mb-2">{statsLoading ? '...' : stats?.toolsUsed || 0}</p>
            <p className="text-xs text-slate-500">En los últimos 7 días</p>
          </div>

          <div className="bg-white rounded-3xl shadow-xl border border-slate-200/60 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group">
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-violet-500/25 group-hover:scale-110 transition-transform duration-300">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <div className="flex items-center gap-1.5 px-3 py-1 bg-violet-50 rounded-full">
                <TrendingUp className="w-3.5 h-3.5 text-violet-600" />
                <span className="text-xs font-bold text-violet-700">+{statsLoading ? '...' : stats?.timeGrowth || 0}%</span>
              </div>
            </div>
            <p className="text-sm font-medium text-slate-600 mb-1">Tiempo Ahorrado</p>
            <p className="text-4xl font-bold text-slate-900 mb-2">{statsLoading ? '...' : `${stats?.timeSaved || 0}h`}</p>
            <p className="text-xs text-slate-500">Optimización mensual</p>
          </div>

          <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 group relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-6 -right-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
            <div className="relative">
              <div className="flex items-start justify-between mb-4">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <Crown className="w-6 h-6 text-white/80" />
              </div>
              <p className="text-sm font-semibold text-white/90 mb-1">Estado Premium</p>
              <p className="text-4xl font-bold text-white mb-2">Activo</p>
              <p className="text-xs text-white/80">Acceso ilimitado a todo</p>
            </div>
          </div>
        </div>

        {/* Herramientas Premium Grid */}
        <div className="mb-16">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900 mb-2">Suite de Herramientas</h2>
              <p className="text-slate-600">Acceso completo a todas las funcionalidades profesionales</p>
            </div>
            <Link href="/tools" className="hidden lg:inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold group">
              Ver todas
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <Link key={index} href={feature.href} className="group block">
                <div className="relative bg-white rounded-3xl shadow-lg border border-slate-200/60 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 h-full">
                  {/* Gradiente superior */}
                  <div className={`h-2 bg-gradient-to-r ${feature.gradient}`}></div>
                  
                  {/* Contenido */}
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className={`w-14 h-14 bg-gradient-to-br ${feature.iconBg} rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className={`px-3 py-1 bg-gradient-to-r ${feature.gradient} rounded-full`}>
                        <span className="text-xs font-bold text-white">{feature.badge}</span>
                      </div>
                    </div>

                    {/* Título y descripción */}
                    <h3 className="text-lg font-bold text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-slate-600 leading-relaxed mb-4 line-clamp-2">
                      {feature.description}
                    </p>

                    {/* Stats */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                      <span className="text-xs font-semibold text-slate-500">{feature.stats}</span>
                      <ArrowUpRight className="w-5 h-5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
                    </div>
                  </div>

                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-indigo-500/0 to-purple-500/0 group-hover:from-blue-500/5 group-hover:via-indigo-500/5 group-hover:to-purple-500/5 transition-all duration-500 pointer-events-none"></div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Sección Calendario */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 p-8 mb-12">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Mi Calendario</h3>
                <p className="text-slate-600">Gestiona tu agenda sincronizada con Google Calendar</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleConnectCalendar}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-2xl hover:shadow-2xl hover:shadow-green-500/25 transition-all duration-300 hover:-translate-y-1 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Conectar Google Calendar
              </button>
              <button
                onClick={() => setShowModal(true)}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 font-semibold"
              >
                <Plus className="w-5 h-5" />
                Nuevo Evento
              </button>
            </div>
          </div>

          {calendarLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-green-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-slate-100 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
                <p className="mt-6 text-slate-600 font-semibold">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <div className="h-96">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day']}
                defaultView="month"
                messages={{
                  next: 'Siguiente',
                  previous: 'Anterior',
                  today: 'Hoy',
                  month: 'Mes',
                  week: 'Semana',
                  day: 'Día',
                  agenda: 'Agenda',
                  date: 'Fecha',
                  time: 'Hora',
                  event: 'Evento',
                  noEventsInRange: 'No hay eventos en este rango.',
                  showMore: (total) => `+ Ver ${total} más`
                }}
                onSelectSlot={({ start, end }) => {
                  setNewEvent({
                    ...newEvent,
                    start: start.toISOString().slice(0, 16),
                    end: end.toISOString().slice(0, 16)
                  })
                  setShowModal(true)
                }}
                selectable
                popup
              />
            </div>
          )}
        </div>

        {/* Sección Documentos Ultra Premium */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 overflow-hidden">
          {/* Header */}
          <div className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-8 py-8">
            <div className="absolute inset-0 opacity-10 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6Ii8+PC9nPjwvZz48L3N2Zz4=')]"></div>
            <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-xl border border-white/20">
                  <Folder className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">Mis Documentos</h2>
                  <p className="text-slate-300">Gestión completa de tu biblioteca profesional</p>
                </div>
              </div>
              
              <div className="flex items-center gap-4">
                <div className="hidden lg:block text-right px-6 py-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20">
                  <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Total Archivos</p>
                  <p className="text-3xl font-bold text-white">{documents.length}</p>
                </div>
                <Link href="/documents/generator" className="inline-flex items-center gap-2 bg-white text-slate-900 px-6 py-3 rounded-2xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 font-semibold">
                  <Plus className="w-5 h-5" />
                  Nuevo
                </Link>
              </div>
            </div>
          </div>

          {/* Contenido */}
          <div className="p-8">
            {docsLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin"></div>
                  <div className="absolute inset-0 w-16 h-16 border-4 border-slate-100 border-t-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
                </div>
<p className="mt-6 text-slate-600 font-semibold">Cargando documentos...</p>
                <p className="mt-2 text-slate-400 text-sm">Preparando tu biblioteca</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-20">
                <div className="relative inline-block mb-8">
                  <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto shadow-xl">
                    <FileText className="w-16 h-16 text-slate-400" />
                  </div>
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                    <Plus className="w-6 h-6 text-white" />
                  </div>
                </div>
                
                <h3 className="text-2xl font-bold text-slate-900 mb-3">Comienza tu biblioteca digital</h3>
                <p className="text-slate-600 mb-8 max-w-lg mx-auto leading-relaxed">
                  Sube y gestiona todos tus documentos profesionales en un solo lugar. Organiza contratos, reportes y más con tecnología en la nube.
                </p>
                
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                  <Link href="/documents/generator" className="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 hover:-translate-y-1 font-semibold">
                    <Upload className="w-5 h-5" />
                    Subir Documento
                  </Link>
                  <Link href="/documents/generator" className="inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-4 rounded-2xl border-2 border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-semibold">
                    <Wand2 className="w-5 h-5" />
                    Generar con IA
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Filtros y búsqueda */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8 pb-6 border-b border-slate-200">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Buscar documentos..."
                        className="pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all w-full sm:w-80"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all font-medium">
                      <Filter className="w-4 h-4" />
                      Filtrar
                    </button>
                    <button className="inline-flex items-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 rounded-2xl hover:bg-slate-100 border border-slate-200 transition-all font-medium">
                      <Calendar className="w-4 h-4" />
                      Fecha
                    </button>
                  </div>
                </div>

                {/* Lista de documentos */}
                <div className="space-y-3">
                  {documents.map((doc, index) => (
                    <div key={doc.id} className="group relative bg-gradient-to-r from-slate-50/50 to-white rounded-2xl border border-slate-200/60 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      {/* Indicador de color lateral */}
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-blue-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="flex items-center justify-between p-5 pl-6">
                        <div className="flex items-center gap-5 flex-1 min-w-0">
                          {/* Icono del documento */}
                          <div className="relative flex-shrink-0">
                            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                              <FileText className="w-7 h-7 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-5 h-5 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-white shadow-md flex items-center justify-center">
                              <div className="w-2 h-2 bg-white rounded-full"></div>
                            </div>
                          </div>

                          {/* Info del documento */}
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-slate-900 group-hover:text-blue-600 transition-colors mb-1 truncate text-lg">
                              {doc.title}
                            </h4>
                            <div className="flex items-center gap-4 text-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <span className="text-slate-600 font-medium">{doc.type}</span>
                              </div>
                              <span className="text-slate-300">•</span>
                              <div className="flex items-center gap-2 text-slate-500">
                                <Calendar className="w-4 h-4" />
                                {new Date(doc.uploadDate).toLocaleDateString('es-ES', { 
                                  day: '2-digit', 
                                  month: 'short', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <span className="text-slate-300">•</span>
                              <span className="text-slate-500">{doc.size || 'N/A'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:shadow-lg transition-all duration-300 font-semibold text-sm group/btn"
                          >
                            <Eye className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Ver</span>
                          </a>
                          <button
                            onClick={() => handleDeleteDocument(doc.id)}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-lg transition-all duration-300 font-semibold text-sm group/btn"
                          >
                            <Trash2 className="w-4 h-4 group-hover/btn:scale-110 transition-transform" />
                            <span className="hidden sm:inline">Eliminar</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Paginación y acciones */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-6 mt-10 pt-8 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    Mostrando <span className="font-bold text-slate-900">{documents.length}</span> de <span className="font-bold text-slate-900">{documents.length}</span> documentos
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Link href="/documents/generator" className="inline-flex items-center gap-2 bg-gradient-to-r from-slate-700 to-slate-800 text-white px-6 py-3 rounded-2xl hover:shadow-2xl hover:shadow-slate-500/25 transition-all duration-300 hover:-translate-y-1 font-semibold">
                      <Settings className="w-5 h-5" />
                      Gestionar Todo
                    </Link>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Sección de Insights y Tips */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
          {/* Quick Actions */}
          <div className="bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
            
            <div className="relative">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Acciones Rápidas</h3>
              </div>
              
              <div className="space-y-3">
                <Link href="/calculadoras" className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Calcular Gastos</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Link>
                
                <Link href="/documents/generator" className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <Wand2 className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Generar Contrato</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Link>
                
                <Link href="/placas" className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <ImageIcon className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Crear Placa</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Link>
                
                <Link href="/chat" className="flex items-center justify-between p-4 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="w-5 h-5 text-white" />
                    <span className="font-semibold text-white">Consultar IA</span>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all" />
                </Link>
              </div>
            </div>
          </div>

          {/* Tips Profesionales */}
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 p-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Target className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Tips del Día</h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-5 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Sparkles className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Optimiza tus documentos</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Usa el generador IA para crear contratos profesionales en segundos. Ahorra hasta 2 horas por documento.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-blue-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <BarChart3 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Analiza el mercado</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Revisa las últimas noticias del sector para tomar decisiones informadas y estar adelante de la competencia.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-5 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl border border-emerald-200/50">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-emerald-500 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Award className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 mb-2">Calidad premium</h4>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      Las placas profesionales generan 3x más interés. Crea diseños impactantes con nuestras plantillas premium.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


      </div>

      {/* Modal para Nuevo Evento */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-slate-900">Nuevo Evento</h3>
              <button
                onClick={() => setShowModal(false)}
                className="w-8 h-8 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors"
              >
                <span className="text-slate-600 font-bold">×</span>
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newEvent.title}
                  onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="Título del evento"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Descripción</label>
                <textarea
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                  rows={3}
                  placeholder="Descripción opcional"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Inicio</label>
                  <input
                    type="datetime-local"
                    value={newEvent.start}
                    onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Fin</label>
                  <input
                    type="datetime-local"
                    value={newEvent.end}
                    onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8">
              <button
                onClick={() => setShowModal(false)}
                className="flex-1 px-6 py-3 bg-slate-100 text-slate-700 rounded-xl hover:bg-slate-200 transition-all font-semibold"
              >
                Cancelar
              </button>
              <button
                onClick={handleAddEvent}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/25 transition-all font-semibold hover:-translate-y-0.5"
              >
                Crear Evento
              </button>
            </div>
          </div>
        </div>
      )}


    </div>
  )
}