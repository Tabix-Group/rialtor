"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "../auth/authContext"
import { authenticatedFetch } from "@/utils/api"
import { Calendar as BigCalendar, dateFnsLocalizer } from "react-big-calendar"
import { format, parse, startOfWeek, getDay } from "date-fns"
import { es } from "date-fns/locale"
import "react-big-calendar/lib/css/react-big-calendar.css"
import {
  Calendar,
  Plus,
  Edit,
  X,
  ChevronLeft,
  TrendingUp,
  ArrowUpRight,
} from "lucide-react"

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { es },
})

interface CalendarEvent {
  id?: string
  title: string
  start: Date
  end: Date
  description?: string
  source?: "google" | "local"
}

const CustomEvent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="relative group cursor-pointer">
      <div className="bg-primary text-primary-foreground px-2 py-1 rounded-lg text-xs font-medium truncate hover:shadow-lg transition-all duration-200">
        {event.title}
      </div>
      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-popover text-popover-foreground text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10 pointer-events-none border border-border shadow-xl">
        <div className="font-semibold">{event.title}</div>
        {event.description && <div className="text-muted-foreground mt-1">{event.description}</div>}
        <div className="text-muted-foreground mt-1">
          {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
        </div>
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
        setCalendarEvents(
          data.events.map((event: any) => ({
            ...event,
            start: new Date(event.start),
            end: new Date(event.end),
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

  const handleConnectCalendar = () => {
    window.location.href = "/api/calendar/auth"
  }

  const handleAddEvent = async () => {
    if (!newEvent.title || !newEvent.start || !newEvent.end) return

    try {
      let res
      if (editingEvent) {
        res = await authenticatedFetch(`/api/calendar/events/${editingEvent.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
        })
      } else {
        res = await authenticatedFetch("/api/calendar/events", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newEvent),
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
            },
          ])
        }

        setShowModal(false)
        setEditingEvent(null)
        setNewEvent({ title: "", description: "", start: "", end: "" })
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-foreground">Mi Calendario</h1>
              <p className="text-muted-foreground mt-1">
                Gestiona tu agenda sincronizada con Google Calendar
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
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
      </div>

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
        <div className="bg-card rounded-2xl border border-border p-6 shadow-lg">
          {calendarLoading ? (
            <div className="flex items-center justify-center py-20">
              <div className="text-center">
                <div className="w-12 h-12 border-4 border-border border-t-primary rounded-full animate-spin mx-auto"></div>
                <p className="mt-4 text-muted-foreground font-semibold text-sm">Cargando calendario...</p>
              </div>
            </div>
          ) : (
            <div className="h-[600px]">
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
        </div>

        {/* Upcoming Events */}
        {getUpcomingEvents().length > 0 && (
          <div className="mt-8 bg-card rounded-2xl border border-border p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h3 className="text-xl font-bold text-foreground">Próximos Eventos</h3>
            </div>

            <div className="space-y-3">
              {getUpcomingEvents().map((event, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center">
                      <Calendar className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{event.title}</h4>
                      <p className="text-sm text-muted-foreground">
                        {format(event.start, "EEEE, d 'de' MMMM 'a las' HH:mm", { locale: es })}
                      </p>
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                    </div>
                  </div>
                  <ArrowUpRight className="w-5 h-5 text-muted-foreground" />
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