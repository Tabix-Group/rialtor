"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { useAuth } from "../auth/authContext"
import { authenticatedFetch } from "@/utils/api"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay, addHours } from "date-fns"
import { es } from "date-fns/locale"
import { zonedTimeToUtc, utcToZonedTime, format as formatTz } from "date-fns-tz"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
  Calendar,
  Plus,
  Edit,
  X,
  ChevronLeft,
  TrendingUp,
  ArrowUpRight,
  Clock,
  Video,
  MoreVertical,
  Trash2,
  CheckCircle2,
  AlertCircle
} from "lucide-react"

// --- ESTILOS PERSONALIZADOS DEL CALENDARIO (CSS INYECTADO) ---
// Se han ajustado para usar colores Slate/Blue consistentes con el resto de la app
const calendarStyles = `
  .custom-calendar {
    font-family: inherit;
  }
  
  .custom-calendar .rbc-calendar {
    border: none;
  }

  /* Header de la semana/mes */
  .custom-calendar .rbc-header {
    padding: 12px 0;
    font-weight: 600;
    color: #64748b; /* slate-500 */
    background-color: #f8fafc; /* slate-50 */
    border-bottom: 1px solid #e2e8f0;
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  /* Celdas del mes */
  .custom-calendar .rbc-month-view {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    overflow: hidden;
  }

  .custom-calendar .rbc-month-row {
    border-bottom: 1px solid #e2e8f0;
    min-height: 100px; /* Celdas más altas */
  }

  .custom-calendar .rbc-day-bg {
    border-left: 1px solid #e2e8f0;
  }
  
  .custom-calendar .rbc-off-range-bg {
    background-color: #f8fafc; /* slate-50 */
  }

  .custom-calendar .rbc-date-cell {
    padding: 8px;
    font-size: 0.85rem;
    font-weight: 500;
    color: #475569;
  }

  /* Eventos */
  .custom-calendar .rbc-event {
    background-color: transparent;
    padding: 0;
    border-radius: 4px;
  }
  
  /* Vista Semanal / Tiempo */
  .custom-calendar .rbc-time-view {
    border: 1px solid #e2e8f0;
    border-radius: 12px;
    background: white;
    overflow: hidden;
  }
  
  .custom-calendar .rbc-time-content {
    border-top: 1px solid #e2e8f0;
  }
  
  .custom-calendar .rbc-time-header-content {
    border-left: 1px solid #e2e8f0;
  }
  
  .custom-calendar .rbc-timeslot-group {
    border-bottom: 1px solid #f1f5f9;
  }
  
  .custom-calendar .rbc-day-slot .rbc-time-slot {
    border-top: 1px solid #f8fafc;
  }

  .custom-calendar .rbc-time-gutter .rbc-timeslot-group {
    border-bottom: 1px solid #f1f5f9;
    color: #94a3b8;
    font-size: 0.75rem;
  }

  .custom-calendar .rbc-current-time-indicator {
    background-color: #3b82f6; /* blue-500 */
    height: 2px;
  }

  .custom-calendar .rbc-today {
    background-color: #eff6ff; /* blue-50 */
  }

  /* Toolbar (Botones de navegación) */
  .custom-calendar .rbc-toolbar {
    margin-bottom: 20px;
    display: flex;
    flex-wrap: wrap;
    gap: 10px;
    justify-content: space-between;
    align-items: center;
  }

  .custom-calendar .rbc-toolbar-label {
    font-size: 1.25rem;
    font-weight: 700;
    color: #1e293b; /* slate-800 */
  }

  .custom-calendar .rbc-btn-group {
    display: inline-flex;
    background: white;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    overflow: hidden;
    box-shadow: 0 1px 2px rgba(0,0,0,0.05);
  }

  .custom-calendar .rbc-toolbar button {
    border: none;
    border-right: 1px solid #e2e8f0;
    background: white;
    color: #64748b;
    padding: 8px 16px;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    cursor: pointer;
  }
  
  .custom-calendar .rbc-toolbar button:last-child {
    border-right: none;
  }

  .custom-calendar .rbc-toolbar button:hover {
    background-color: #f8fafc;
    color: #3b82f6;
  }

  .custom-calendar .rbc-toolbar button.rbc-active {
    background-color: #eff6ff;
    color: #2563eb;
    font-weight: 600;
    box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = calendarStyles
  document.head.appendChild(styleSheet)
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: {
    es: es,
  },
})

// Zona horaria de Argentina
const TIMEZONE = 'America/Argentina/Buenos_Aires'

interface CalendarEvent {
  id?: string
  title: string
  start: Date
  end: Date
  description?: string
  source?: "google" | "local"
  meetLink?: string | null
}

// Componente de Evento Personalizado (Estilo Pastilla)
const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  // Determinamos colores basados en si es Google Meet o no para variedad visual
  const isMeet = !!event.meetLink
  const bgClass = isMeet ? "bg-blue-100 text-blue-700 border-blue-200" : "bg-indigo-100 text-indigo-700 border-indigo-200"
  
  return (
    <div className={`h-full w-full px-2 py-0.5 rounded-md border text-xs font-semibold truncate hover:shadow-md transition-all duration-200 flex items-center gap-1.5 ${bgClass}`}>
      {event.meetLink && <Video className="w-3 h-3 flex-shrink-0" />}
      <span className="truncate">{event.title}</span>
    </div>
  )
}

export default function CalendarioPage() {
  const { user } = useAuth()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [selectedEventForView, setSelectedEventForView] = useState<CalendarEvent | null>(null)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    start: "",
    end: "",
    addMeet: false,
  })

  useEffect(() => {
    fetchCalendarEvents()
  }, [])

  const fetchCalendarEvents = async () => {
    try {
      setCalendarLoading(true)
      const res = await authenticatedFetch("/api/calendar/events")

      if (res.ok) {
        const data = await res.json()
        const eventsArray = Array.isArray(data.events) ? data.events : (Array.isArray(data) ? data : [])
        setCalendarEvents(
          eventsArray.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
            meetLink: event.meetLink || null,
          }))
        )
        setCalendarConnected(true)
      } else {
        const errorData = await res.json()
        if (errorData.error === "CALENDAR_NOT_CONNECTED") {
          setCalendarConnected(false)
        }
        setCalendarEvents([])
        console.error("Error fetching calendar events:", errorData)
      }
    } catch (error) {
      if (error instanceof Error && error.message === 'CALENDAR_NOT_CONNECTED') {
        setCalendarConnected(false)
      } else {
        console.error("Error fetching calendar events:", error)
      }
      setCalendarConnected(false)
      setCalendarEvents([])
    } finally {
      setCalendarLoading(false)
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

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return

    try {
      const eventData = {
        summary: newEvent.title,
        description: newEvent.description,
        start: newEvent.start,
        end: newEvent.end,
        addMeet: newEvent.addMeet,
      }

      let res
      if (editingEvent) {
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
        if (editingEvent) {
          setCalendarEvents(
            calendarEvents.map((e) =>
              e.id === editingEvent.id
                ? {
                    ...e,
                    title: newEvent.title,
                    description: newEvent.description,
                    start: new Date(newEvent.start),
                    end: new Date(newEvent.end),
                  }
                : e
            )
          )
        } else {
          const data = await res.json()
          setCalendarEvents([
            ...calendarEvents,
            {
              id: data.event.id,
              title: newEvent.title,
              description: newEvent.description,
              start: new Date(newEvent.start),
              end: new Date(newEvent.end),
              source: "local",
              meetLink: data.event.meetLink || null,
            },
          ])
        }

        setShowModal(false)
        setEditingEvent(null)
        setNewEvent({ title: "", description: "", start: "", end: "", addMeet: false })
      }
    } catch (error) {
      console.error("Error saving event:", error)
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
        start: format(selectedEventForView.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(selectedEventForView.end, "yyyy-MM-dd'T'HH:mm"),
        addMeet: false,
      })
      setShowModal(true)
      setSelectedEventForView(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (selectedEventForView && selectedEventForView.id) {
      try {
        const res = await authenticatedFetch(`/api/calendar/events/${selectedEventForView.id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setCalendarEvents(calendarEvents.filter((e) => e.id !== selectedEventForView.id))
        }
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
    setSelectedEventForView(null)
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return calendarEvents
      .filter((event) => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 4) // Mostrar 4 próximos
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      
      {/* ================================================================================= */}
      {/* CABECERA ORIGINAL (NO TOCAR) */}
      {/* ================================================================================= */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-20">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Gestión de Agenda</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                Mi <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Calendario</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Gestiona tu agenda sincronizada con Google Calendar. Organiza tus eventos y reuniones en un solo lugar.
              </p>

              <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                {!calendarConnected && (
                  <button
                    onClick={handleConnectCalendar}
                    className="group inline-flex items-center gap-2 sm:gap-3 bg-white/10 backdrop-blur-md border border-white/20 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-white/20 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base"
                  >
                    <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
                    Conectar Google
                  </button>
                )}
                <button
                  onClick={() => setShowModal(true)}
                  className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base"
                >
                  <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                  Nuevo Evento
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* ================================================================================= */}
      {/* FIN CABECERA */}
      {/* ================================================================================= */}

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-20">

        {/* Stats Cards - Dashboard Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Eventos</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{calendarEvents.length}</p>
              </div>
              <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
                <Calendar className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Próximos</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">{getUpcomingEvents().length}</p>
              </div>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-600">
                <Clock className="w-5 h-5" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sincronización</p>
                <div className="flex items-center gap-2 mt-1">
                    <p className={`text-lg font-bold ${calendarConnected ? "text-emerald-600" : "text-slate-500"}`}>
                    {calendarConnected ? "Activa" : "Inactiva"}
                    </p>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${calendarConnected ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-400"}`}>
                {calendarConnected ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow">
             <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Esta Semana</p>
                <p className="text-2xl font-bold text-slate-800 mt-1">
                  {calendarEvents.filter(event => {
                    const now = new Date()
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return event.start >= now && event.start <= weekFromNow
                  }).length}
                </p>
              </div>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Calendar Area */}
            <div className="lg:col-span-3 bg-white rounded-xl border border-slate-200 shadow-xl overflow-hidden p-6">
                {calendarLoading ? (
                    <div className="flex flex-col items-center justify-center h-[600px]">
                    <div className="w-12 h-12 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-500 font-medium">Sincronizando agenda...</p>
                    </div>
                ) : (
                    <div className="h-[700px] custom-calendar">
                    <BigCalendar
                        localizer={localizer}
                        events={calendarEvents}
                        startAccessor="start"
                        endAccessor="end"
                        culture="es"
                        style={{ height: "100%" }}
                        views={["month", "week", "day"]}
                        defaultView="week"
                        min={new Date(2024, 0, 1, 7, 0, 0)} // 7 AM
                        max={new Date(2024, 0, 1, 23, 0, 0)} // 11 PM
                        step={30}
                        timeslots={2}
                        messages={{
                            next: "Sig",
                            previous: "Ant",
                            today: "Hoy",
                            month: "Mes",
                            week: "Semana",
                            day: "Día",
                            agenda: "Agenda",
                            date: "Fecha",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "Sin eventos.",
                            showMore: (total) => `+${total} más`,
                        }}
                        formats={{
                            dayHeaderFormat: (date) => {
                                // Ajuste responsivo para el encabezado del día
                                if (typeof window !== 'undefined') {
                                    if (window.innerWidth < 640) {
                                        return format(date, "EEEEE", { locale: es }) // 1 letra
                                    } else if (window.innerWidth < 1024) {
                                        return format(date, "EEE", { locale: es }) // 3 letras
                                    }
                                }
                                return format(date, "EEEE", { locale: es }) // Completo
                            },
                            dayRangeHeaderFormat: ({ start, end }) =>
                                `${format(start, "d MMM", { locale: es })} - ${format(end, "d MMM", { locale: es })}`,
                            monthHeaderFormat: (date) => {
                                return format(date, "MMMM yyyy", { locale: es })
                            },
                            dayFormat: (date) => format(date, "d", { locale: es }),
                            timeGutterFormat: (date) => format(date, "HH:mm", { locale: es }),
                        }}
                        onSelectSlot={({ start, end }) => {
                            const argStart = utcToZonedTime(start, TIMEZONE)
                            const argEnd = utcToZonedTime(end, TIMEZONE)
                            setNewEvent({
                                ...newEvent,
                                start: format(argStart, "yyyy-MM-dd'T'HH:mm"),
                                end: format(argEnd, "yyyy-MM-dd'T'HH:mm"),
                            })
                            setShowModal(true)
                        }}
                        onSelectEvent={(event) => handleEventClick(event as CalendarEvent)}
                        selectable
                        popup
                        components={{
                            event: CustomEvent,
                        }}
                    />
                    </div>
                )}
            </div>

            {/* Sidebar / Upcoming Events Feed */}
            <div className="lg:col-span-1 space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-lg p-5">
                    <div className="flex items-center justify-between mb-4 pb-4 border-b border-slate-100">
                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                            <ArrowUpRight className="w-5 h-5 text-blue-600" />
                            Agenda Próxima
                        </h3>
                    </div>

                    {getUpcomingEvents().length === 0 ? (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            <p>No tienes eventos próximos.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {getUpcomingEvents().map((event, index) => (
                                <div key={index} className="group p-3 rounded-lg border border-slate-100 bg-slate-50 hover:bg-white hover:border-blue-200 hover:shadow-md transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="px-2 py-1 bg-white border border-slate-200 rounded text-xs font-bold text-slate-600 text-center min-w-[50px]">
                                            {format(event.start, "d MMM", { locale: es })}
                                        </div>
                                        {event.meetLink && <Video className="w-4 h-4 text-blue-500" />}
                                    </div>
                                    
                                    <h4 className="font-bold text-slate-800 text-sm mb-1 line-clamp-2 group-hover:text-blue-700">{event.title}</h4>
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 mb-2">
                                        <Clock className="w-3 h-3" />
                                        <span>
                                            {format(event.start, "HH:mm", { locale: es })} - {format(event.end, "HH:mm", { locale: es })}
                                        </span>
                                    </div>

                                    {event.meetLink && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); window.open(event.meetLink!, '_blank') }}
                                            className="w-full mt-2 py-1.5 bg-blue-600 text-white rounded text-xs font-medium hover:bg-blue-700 transition-colors"
                                        >
                                            Unirse a Meet
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                    
                    <button 
                        onClick={() => setShowModal(true)}
                        className="w-full mt-4 py-2.5 border-2 border-dashed border-slate-200 rounded-xl text-slate-500 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus className="w-4 h-4" /> Agregar Rápido
                    </button>
                </div>
            </div>
        </div>

        {/* Modal: Ver Evento */}
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

        {/* Modal: Crear / Editar Evento */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                        {editingEvent ? <Edit className="w-5 h-5 text-blue-600" /> : <Plus className="w-5 h-5 text-blue-600" />}
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">
                        {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                        </h3>
                        <p className="text-xs text-slate-500">Completa los detalles de la agenda</p>
                    </div>
                </div>
                <button
                  onClick={() => { setShowModal(false); setEditingEvent(null); setNewEvent({ title: "", description: "", start: "", end: "", addMeet: false }) }}
                  className="p-2 hover:bg-slate-100 rounded-full text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="p-6 space-y-5">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Título</label>
                  <input
                    type="text"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm font-medium placeholder-slate-400"
                    placeholder="Ej: Visita propiedad Av. Libertador..."
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Inicio</label>
                    <input
                      type="datetime-local"
                      value={newEvent.start}
                      onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Fin</label>
                    <input
                      type="datetime-local"
                      value={newEvent.end}
                      onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                      className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-slate-700"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1.5">Descripción</label>
                  <textarea
                    value={newEvent.description}
                    onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                    className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm text-slate-700 resize-none placeholder-slate-400"
                    rows={3}
                    placeholder="Notas adicionales..."
                  />
                </div>

                {/* Google Meet Toggle */}
                <div className="flex items-center p-4 border border-blue-100 bg-blue-50/50 rounded-xl">
                    <input
                        id="meet-toggle"
                        type="checkbox"
                        checked={newEvent.addMeet}
                        onChange={(e) => setNewEvent({ ...newEvent, addMeet: e.target.checked })}
                        className="w-5 h-5 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="meet-toggle" className="ml-3 flex-1 cursor-pointer">
                        <span className="block text-sm font-bold text-slate-800">Videollamada Google Meet</span>
                        <span className="block text-xs text-slate-500">Se generará un enlace automáticamente</span>
                    </label>
                    <Video className="w-5 h-5 text-blue-400" />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowModal(false); setEditingEvent(null); setNewEvent({ title: "", description: "", start: "", end: "", addMeet: false }) }}
                    className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-lg hover:bg-slate-50 font-bold text-sm transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newEvent.title || !newEvent.start || !newEvent.end}
                    className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold text-sm shadow-md shadow-blue-500/20 transition-all"
                  >
                    {editingEvent ? "Guardar Cambios" : "Crear Evento"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}