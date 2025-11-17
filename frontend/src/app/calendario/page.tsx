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

// Custom styles for calendar
const calendarStyles = `
  .custom-calendar .rbc-calendar {
    font-family: inherit;
  }

  .custom-calendar .rbc-header {
    padding: 10px 6px;
    font-weight: 600;
    color: hsl(var(--foreground));
    background-color: hsl(var(--muted));
    border-bottom: 1px solid hsl(var(--border));
    font-size: 13px;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-header {
      padding: 12px 8px;
      font-size: 14px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-header {
      padding: 14px 10px;
      font-size: 15px;
    }
  }

  .custom-calendar .rbc-month-view {
    border-radius: 12px;
  }

  .custom-calendar .rbc-month-row {
    min-height: 60px;
    overflow: hidden;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-month-row {
      min-height: 70px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-month-row {
      min-height: 90px;
    }
  }

  .custom-calendar .rbc-day-bg {
    padding: 0;
  }

  .custom-calendar .rbc-date-cell {
    padding: 4px 6px;
    font-size: 12px;
    text-align: right;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-date-cell {
      padding: 5px 7px;
      font-size: 13px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-date-cell {
      padding: 6px 8px;
      font-size: 14px;
    }
  }

  .custom-calendar .rbc-event {
    padding: 2px 4px;
    font-size: 11px;
    margin: 1px 0;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-event {
      padding: 3px 5px;
      font-size: 12px;
      margin: 2px 0;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-event {
      padding: 3px 6px;
      font-size: 13px;
    }
  }

  .custom-calendar .rbc-event-content {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .custom-calendar .rbc-show-more {
    font-size: 10px;
    padding: 2px 4px;
    margin: 1px 2px;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-show-more {
      font-size: 11px;
      padding: 2px 5px;
    }
  }

  .custom-calendar .rbc-week-view,
  .custom-calendar .rbc-day-view {
    border-radius: 12px;
  }

  .custom-calendar .rbc-time-view .rbc-time-gutter {
    font-size: 11px;
    color: hsl(var(--muted-foreground));
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-time-view .rbc-time-gutter {
      font-size: 12px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-time-view .rbc-time-gutter {
      font-size: 13px;
    }
  }

  .custom-calendar .rbc-time-view .rbc-time-slot {
    border-top: 1px solid hsl(var(--border));
  }

  .custom-calendar .rbc-time-view .rbc-current-time-indicator {
    background-color: hsl(var(--primary));
  }

  .custom-calendar .rbc-today {
    background-color: hsl(var(--primary) / 0.05);
  }

  .custom-calendar .rbc-toolbar {
    flex-wrap: wrap;
    gap: 6px;
    margin-bottom: 14px;
    padding: 10px;
    background-color: hsl(var(--card));
    border: 1px solid hsl(var(--border));
    border-radius: 12px;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-toolbar {
      gap: 8px;
      margin-bottom: 18px;
      padding: 14px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-toolbar {
      gap: 10px;
      margin-bottom: 24px;
      padding: 16px;
    }
  }

  .custom-calendar .rbc-toolbar button {
    color: hsl(var(--foreground));
    border: 1px solid hsl(var(--border));
    background-color: hsl(var(--background));
    padding: 8px 12px;
    border-radius: 8px;
    font-weight: 500;
    transition: all 0.2s;
    font-size: 12px;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-toolbar button {
      padding: 9px 14px;
      font-size: 13px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-toolbar button {
      padding: 10px 16px;
      font-size: 14px;
    }
  }

  .custom-calendar .rbc-toolbar button:hover {
    background-color: hsl(var(--muted));
    border-color: hsl(var(--primary));
  }

  .custom-calendar .rbc-toolbar button.rbc-active {
    background-color: hsl(var(--primary));
    border-color: hsl(var(--primary));
    color: hsl(var(--primary-foreground));
  }

  .custom-calendar .rbc-toolbar-label {
    font-size: 15px;
    font-weight: 700;
    color: hsl(var(--foreground));
    margin: 0 10px;
  }

  @media (min-width: 640px) {
    .custom-calendar .rbc-toolbar-label {
      font-size: 17px;
      margin: 0 14px;
    }
  }

  @media (min-width: 1024px) {
    .custom-calendar .rbc-toolbar-label {
      font-size: 19px;
      margin: 0 16px;
    }
  }
`

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement("style")
  styleSheet.type = "text/css"
  styleSheet.innerText = calendarStyles
  document.head.appendChild(styleSheet)
}

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
} from "lucide-react"

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

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="relative group cursor-pointer">
      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium truncate hover:shadow-lg transition-all duration-200 flex items-center gap-1">
        {event.meetLink && <Video className="w-3 h-3 flex-shrink-0" />}
        <span className="truncate">{event.title}</span>
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none border border-border shadow-xl min-w-max">
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

export default function CalendarioPage() {
  const { user } = useAuth()
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>([])
  const [calendarLoading, setCalendarLoading] = useState(true)
  const [calendarConnected, setCalendarConnected] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; event: CalendarEvent } | null>(null)
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
        // Validar que data.events existe y es un array
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
      setCalendarConnected(false)
      setCalendarEvents([])
      console.error("Error fetching calendar events:", error)
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
      // Mapear campos del frontend al formato del backend de Google Calendar
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

  const handleEventClick = (event: CalendarEvent, e: React.SyntheticEvent) => {
    e.preventDefault()
    const rect = (e.target as HTMLElement).getBoundingClientRect()
    setContextMenu({
      x: rect.left + rect.width / 2,
      y: rect.top,
      event,
    })
  }

  const handleEditEvent = () => {
    if (contextMenu) {
      setEditingEvent(contextMenu.event)
      setNewEvent({
        title: contextMenu.event.title,
        description: contextMenu.event.description || "",
        start: format(contextMenu.event.start, "yyyy-MM-dd'T'HH:mm"),
        end: format(contextMenu.event.end, "yyyy-MM-dd'T'HH:mm"),
        addMeet: false,
      })
      setShowModal(true)
      setContextMenu(null)
    }
  }

  const handleDeleteEvent = async () => {
    if (contextMenu && contextMenu.event.id) {
      try {
        const res = await authenticatedFetch(`/api/calendar/events/${contextMenu.event.id}`, {
          method: "DELETE",
        })

        if (res.ok) {
          setCalendarEvents(calendarEvents.filter((e) => e.id !== contextMenu.event.id))
        }
      } catch (error) {
        console.error("Error deleting event:", error)
      }
    }
    setContextMenu(null)
  }

  const getUpcomingEvents = () => {
    const now = new Date()
    return calendarEvents
      .filter((event) => event.start > now)
      .sort((a, b) => a.start.getTime() - b.start.getTime())
      .slice(0, 3)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
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

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Eventos</p>
                <p className="text-3xl font-bold text-foreground mt-1">{calendarEvents.length}</p>
              </div>
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Próximos Eventos</p>
                <p className="text-3xl font-bold text-foreground mt-1">{getUpcomingEvents().length}</p>
              </div>
              <div className="w-12 h-12 bg-accent/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-accent-foreground" />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Estado</p>
                <p className="text-lg font-bold text-foreground mt-1">
                  {calendarConnected ? "Conectado" : "Sin conectar"}
                </p>
              </div>
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                calendarConnected ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
              }`}>
                <div className={`w-3 h-3 rounded-full ${
                  calendarConnected ? "bg-green-600" : "bg-red-600"
                }`} />
              </div>
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Esta Semana</p>
                <p className="text-3xl font-bold text-foreground mt-1">
                  {calendarEvents.filter(event => {
                    const now = new Date()
                    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
                    return event.start >= now && event.start <= weekFromNow
                  }).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center">
                <Calendar className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar */}
        <div className="bg-card rounded-2xl border border-border p-3 sm:p-4 lg:p-6 shadow-lg">
          {calendarLoading ? (
            <div className="flex items-center justify-center py-12 sm:py-16 lg:py-20">
              <div className="text-center">
                <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-3 sm:mt-4 text-muted-foreground font-semibold text-xs sm:text-sm">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px] sm:h-[650px] lg:h-[750px]">
              <BigCalendar
                localizer={localizer}
                events={calendarEvents}
                startAccessor="start"
                endAccessor="end"
                style={{ height: "100%" }}
                views={["month", "week", "day"]}
                defaultView="week"
                min={new Date(2024, 0, 1, 7, 0, 0)} // 7 AM
                max={new Date(2024, 0, 1, 23, 0, 0)} // 11 PM
                step={30}
                timeslots={2}
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
                formats={{
                  dayHeaderFormat: (date) => {
                    // Mobile: 1-2 letras, Tablet: 3 letras, Desktop: completo
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
                    if (typeof window !== 'undefined' && window.innerWidth < 640) {
                      return format(date, "MMM yyyy", { locale: es })
                    }
                    return format(date, "MMMM yyyy", { locale: es })
                  },
                  dayFormat: (date) => format(date, "d", { locale: es }),
                  timeGutterFormat: (date) => format(date, "HH:mm", { locale: es }),
                }}
                onSelectSlot={({ start, end }) => {
                  // Convertir a zona horaria de Argentina
                  const argStart = utcToZonedTime(start, TIMEZONE)
                  const argEnd = utcToZonedTime(end, TIMEZONE)

                  setNewEvent({
                    ...newEvent,
                    start: format(argStart, "yyyy-MM-dd'T'HH:mm"),
                    end: format(argEnd, "yyyy-MM-dd'T'HH:mm"),
                  })
                  setShowModal(true)
                }}
                onSelectEvent={handleEventClick}
                selectable
                popup
                components={{
                  event: CustomEvent,
                }}
                className="custom-calendar"
              />
            </div>
          )}
        </div>

        {/* Upcoming Events */}
        {getUpcomingEvents().length > 0 && (
          <div className="mt-6 sm:mt-8 bg-card rounded-2xl border border-border p-4 sm:p-5 lg:p-6">
            <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-5 lg:mb-6">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
              </div>
              <h3 className="text-lg sm:text-xl font-bold text-foreground">Próximos Eventos</h3>
            </div>

            <div className="space-y-2 sm:space-y-3">
              {getUpcomingEvents().map((event, index) => (
                <div key={index} className="flex items-start sm:items-center justify-between p-3 sm:p-4 bg-muted/50 rounded-xl border border-border hover:bg-muted/70 transition-all gap-2">
                  <div className="flex items-start sm:items-center gap-2 sm:gap-3 lg:gap-4 flex-1 min-w-0">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                      <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        <h4 className="font-semibold text-sm sm:text-base text-foreground truncate">{event.title}</h4>
                        {event.meetLink && (
                          <Video className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-primary flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
                        {format(event.start, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                      {event.description && (
                        <p className="text-xs sm:text-sm text-muted-foreground mt-1 truncate hidden sm:block">{event.description}</p>
                      )}
                      {event.meetLink && (
                        <button
                          onClick={() => window.open(event.meetLink!, '_blank')}
                          className="text-xs text-primary hover:underline mt-1 sm:mt-1.5 flex items-center gap-1"
                        >
                          <Video className="w-3 h-3" />
                          Unirse a Meet
                        </button>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground flex-shrink-0" />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Context Menu */}
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

        {/* Event Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-start sm:items-center justify-center z-50 p-0 sm:p-4 overflow-y-auto">
            <div className="bg-card rounded-t-2xl sm:rounded-2xl p-5 sm:p-6 lg:p-8 max-w-lg w-full sm:mx-4 shadow-2xl border-t sm:border border-border my-auto sm:my-4 max-h-screen sm:max-h-[90vh] overflow-y-auto">
              <div className="flex items-start sm:items-center justify-between mb-5 sm:mb-6 lg:mb-8 gap-3 sticky top-0 bg-card z-10 pb-4 sm:pb-0 sm:static">
                <div className="flex items-start sm:items-center gap-3 flex-1 min-w-0">
                  <div className="w-10 h-10 sm:w-11 sm:h-11 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Plus className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl lg:text-2xl font-bold text-foreground">
                      {editingEvent ? "Editar Evento" : "Nuevo Evento"}
                    </h3>
                    <p className="text-sm sm:text-sm text-muted-foreground mt-1 sm:mt-1 hidden sm:block">
                      {editingEvent ? "Modifica los detalles del evento" : "Crea un nuevo evento en tu calendario"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setShowModal(false)
                    setEditingEvent(null)
                    setNewEvent({ title: "", description: "", start: "", end: "", addMeet: false })
                  }}
                  className="w-10 h-10 sm:w-10 sm:h-10 bg-muted rounded-xl flex items-center justify-center hover:bg-muted/80 transition-colors flex-shrink-0"
                >
                  <X className="w-5 h-5 sm:w-5 sm:h-5 text-foreground" />
                </button>
              </div>

              <form onSubmit={(e) => { e.preventDefault(); handleAddEvent(); }} className="space-y-5 sm:space-y-5 lg:space-y-6">
                <div className="space-y-4 sm:space-y-4">
                  <div>
                    <label className="flex items-center gap-2 text-sm sm:text-sm font-semibold text-foreground mb-3 sm:mb-3">
                      <Calendar className="w-4 h-4 sm:w-4 sm:h-4" />
                      Título del Evento
                    </label>
                    <input
                      type="text"
                      value={newEvent.title}
                      onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                      className="w-full px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base sm:text-base text-foreground placeholder:text-muted-foreground"
                      placeholder="Ej: Reunión con cliente, Cita médica..."
                      required
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-2 text-sm sm:text-sm font-semibold text-foreground mb-3 sm:mb-3">
                      <Edit className="w-4 h-4 sm:w-4 sm:h-4" />
                      Descripción (Opcional)
                    </label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      className="w-full px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all resize-none text-base sm:text-base text-foreground placeholder:text-muted-foreground"
                      rows={3}
                      placeholder="Agrega detalles adicionales sobre el evento..."
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-4">
                    <div>
                      <label className="flex items-center gap-2 text-sm sm:text-sm font-semibold text-foreground mb-3 sm:mb-3">
                        <Clock className="w-4 h-4 sm:w-4 sm:h-4" />
                        Fecha y Hora de Inicio
                      </label>
                      <input
                        type="datetime-local"
                        value={newEvent.start}
                        onChange={(e) => setNewEvent({ ...newEvent, start: e.target.value })}
                        className="w-full px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base sm:text-base text-foreground"
                        required
                      />
                    </div>
                    <div>
                      <label className="flex items-center gap-2 text-sm sm:text-sm font-semibold text-foreground mb-3 sm:mb-3">
                        <Clock className="w-4 h-4 sm:w-4 sm:h-4" />
                        Fecha y Hora de Fin
                      </label>
                      <input
                        type="datetime-local"
                        value={newEvent.end}
                        onChange={(e) => setNewEvent({ ...newEvent, end: e.target.value })}
                        className="w-full px-4 sm:px-4 py-3 sm:py-3 bg-background border border-border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all text-base sm:text-base text-foreground"
                        required
                      />
                    </div>
                  </div>

                  {/* Google Meet Option */}
                  <div className="bg-muted/30 rounded-xl p-4 sm:p-4 border border-border">
                    <label className="flex items-start sm:items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEvent.addMeet}
                        onChange={(e) => setNewEvent({ ...newEvent, addMeet: e.target.checked })}
                        className="w-5 h-5 sm:w-5 sm:h-5 rounded border-border text-primary focus:ring-2 focus:ring-primary focus:ring-offset-0 flex-shrink-0 mt-0.5 sm:mt-0"
                      />
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <Video className="w-4 h-4 text-primary flex-shrink-0" />
                        <span className="text-sm sm:text-sm font-semibold text-foreground">
                          Agregar enlace de Google Meet
                        </span>
                      </div>
                    </label>
                    <p className="text-xs text-muted-foreground ml-8 sm:ml-8 mt-1">
                      Se generará automáticamente un enlace para videollamada
                    </p>
                  </div>

                  {/* Preview */}
                  {newEvent.title && newEvent.start && (
                    <div className="bg-muted/50 rounded-xl p-4 sm:p-4 border border-border">
                      <h4 className="text-sm sm:text-sm font-semibold text-foreground mb-2">Vista Previa</h4>
                      <div className="flex items-center gap-3 sm:gap-3">
                        <div className="w-8 h-8 sm:w-8 sm:h-8 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-4 h-4 sm:w-4 sm:h-4 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-base sm:text-base text-foreground truncate">{newEvent.title}</p>
                          <p className="text-sm sm:text-sm text-muted-foreground">
                            {newEvent.start && format(new Date(newEvent.start), "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                            {newEvent.end && ` - ${format(new Date(newEvent.end), "HH:mm", { locale: es })}`}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-3 pt-4 sm:pt-4 border-t border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEvent(null)
                      setNewEvent({ title: "", description: "", start: "", end: "", addMeet: false })
                    }}
                    className="flex-1 px-5 sm:px-6 py-3 sm:py-3 bg-muted text-foreground rounded-xl hover:bg-muted/80 transition-all font-semibold text-sm sm:text-sm"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={!newEvent.title || !newEvent.start || !newEvent.end}
                    className="flex-1 px-5 sm:px-6 py-3 sm:py-3 bg-primary text-primary-foreground rounded-xl hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold text-sm sm:text-sm flex items-center justify-center gap-2 sm:gap-2"
                  >
                    <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
                    <span>{editingEvent ? "Actualizar Evento" : "Crear Evento"}</span>
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