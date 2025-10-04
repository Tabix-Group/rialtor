'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { authenticatedFetch } from '@/utils/api'
import Link from 'next/link'
import {
  Calculator, FileText, Wand2, Search, ImageIcon, Newspaper, Download, Shield,
  Upload, Trash2, Eye, Loader2, User2, MessageSquare, Home, Settings,
  Sparkles, TrendingUp, Star, Crown, BarChart3, Clock, Activity
} from 'lucide-react'

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

export default function DashboardPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [documents, setDocuments] = useState<Document[]>([])
  const [docsLoading, setDocsLoading] = useState(true)
  const [stats, setStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(true)

  // Proteger ruta: solo usuarios logueados
  useEffect(() => {
    if (!loading && !user) {
      router.replace('/auth/login')
    }
  }, [user, loading, router])

  // Cargar documentos del usuario
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

  const handleDeleteDocument = async (id: string) => {
    if (!confirm('¿Eliminar este documento?')) return
    try {
      await authenticatedFetch(`/api/documents/${id}`, { method: 'DELETE' })
      setDocuments(documents.filter(doc => doc.id !== id))
    } catch (error) {
      alert('Error al eliminar documento')
    }
  }

  // Verificar si es admin
  const isAdmin = user && user.roles && user.roles.some(role => role.name === 'ADMIN')

  // Tarjetas de funcionalidades premium
  const features = [
    {
      title: 'Calculadoras',
      description: 'Herramientas avanzadas para calcular gastos inmobiliarios, seguros y créditos con precisión.',
      icon: Calculator,
      href: '/calculadoras',
      gradient: 'from-emerald-500 via-teal-500 to-cyan-500',
      bgGradient: 'from-emerald-50 via-teal-50 to-cyan-50',
      accentColor: 'emerald',
      badge: 'Premium'
    },
    {
      title: 'Generar Documentos',
      description: 'Crea contratos, reservas y documentos legales con IA avanzada y plantillas profesionales.',
      icon: Wand2,
      href: '/documents/generator',
      gradient: 'from-violet-500 via-purple-500 to-indigo-500',
      bgGradient: 'from-violet-50 via-purple-50 to-indigo-50',
      accentColor: 'violet',
      badge: 'IA Avanzada'
    },
    {
      title: 'Resumir Documentos',
      description: 'Analiza y resume contratos extensos con inteligencia artificial especializada.',
      icon: Search,
      href: '/documents/summary',
      gradient: 'from-rose-500 via-pink-500 to-fuchsia-500',
      bgGradient: 'from-rose-50 via-pink-50 to-fuchsia-50',
      accentColor: 'rose',
      badge: 'Inteligente'
    },
    {
      title: 'Placas de Propiedades',
      description: 'Genera placas profesionales y elegantes para propiedades con diseño personalizado.',
      icon: ImageIcon,
      href: '/placas',
      gradient: 'from-amber-500 via-orange-500 to-red-500',
      bgGradient: 'from-amber-50 via-orange-50 to-red-50',
      accentColor: 'amber',
      badge: 'Profesional'
    },
    {
      title: 'Chat IA',
      description: 'Consulta al asesor inmobiliario inteligente 24/7 con respuestas instantáneas.',
      icon: MessageSquare,
      href: '/chat',
      gradient: 'from-blue-500 via-sky-500 to-cyan-500',
      bgGradient: 'from-blue-50 via-sky-50 to-cyan-50',
      accentColor: 'blue',
      badge: '24/7'
    },
    {
      title: 'Noticias',
      description: 'Últimas novedades y tendencias del mercado inmobiliario argentino en tiempo real.',
      icon: Newspaper,
      href: '/news',
      gradient: 'from-slate-600 via-gray-600 to-zinc-600',
      bgGradient: 'from-slate-50 via-gray-50 to-zinc-50',
      accentColor: 'slate',
      badge: 'Actualizado'
    },
    {
      title: 'Descargas',
      description: 'Biblioteca completa de archivos y contenido descargable para tu trabajo profesional.',
      icon: Download,
      href: '/descargas',
      gradient: 'from-neutral-600 via-stone-600 to-gray-600',
      bgGradient: 'from-neutral-50 via-stone-50 to-gray-50',
      accentColor: 'neutral',
      badge: 'Completo'
    }
  ]

  // Agregar tarjeta de admin si es admin
  if (isAdmin) {
    features.push({
      title: 'Panel de Administración',
      description: 'Gestión completa de usuarios, contenido y configuración del sistema empresarial.',
      icon: Shield,
      href: '/admin',
      gradient: 'from-red-500 via-rose-500 to-pink-500',
      bgGradient: 'from-red-50 via-rose-50 to-pink-50',
      accentColor: 'red',
      badge: 'Admin'
    })
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100">
      <div className="text-center">
        <div className="relative">
          <Loader2 className="w-16 h-16 animate-spin text-slate-600 mx-auto" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-slate-400 animate-spin"></div>
        </div>
        <p className="mt-4 text-slate-600 font-medium">Cargando tu experiencia premium...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Premium */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900"></div>
        <div className="absolute inset-0 bg-gradient-to-r from-slate-900/20 via-slate-800/20 to-slate-900/20"></div>
        <div className="relative max-w-7xl mx-auto px-6 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-16 h-16 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
                  <Home className="w-8 h-8 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center">
                  <Crown className="w-3 h-3 text-white" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white tracking-tight">Dashboard Premium</h1>
                  <div className="flex items-center gap-1 px-3 py-1 bg-white/10 rounded-full backdrop-blur-sm border border-white/20">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm font-medium text-white">Pro</span>
                  </div>
                </div>
                <p className="text-slate-300 text-lg">Bienvenido de vuelta, {user?.name}. Tu suite completa de herramientas profesionales.</p>
              </div>
            </div>
            <div className="hidden lg:flex items-center gap-4">
              <div className="text-right">
                <p className="text-sm text-slate-400">Estado de la cuenta</p>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-white font-medium">Activa Premium</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-16 -mt-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Documentos Activos</p>
                <p className="text-3xl font-bold text-slate-900">{statsLoading ? '...' : (stats?.activeDocuments || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{statsLoading ? '...' : (stats?.documentsGrowth || 0)}% este mes</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Herramientas Usadas</p>
                <p className="text-3xl font-bold text-slate-900">{statsLoading ? '...' : (stats?.toolsUsed || 0)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{statsLoading ? '...' : (stats?.toolsGrowth || 0)}% esta semana</span>
            </div>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-slate-200/50 p-6 hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600 mb-1">Tiempo Ahorrado</p>
                <p className="text-3xl font-bold text-slate-900">{statsLoading ? '...' : `${stats?.timeSaved || 0}h`}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                <Crown className="w-6 h-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <span className="text-sm text-green-600 font-medium">+{statsLoading ? '...' : (stats?.timeGrowth || 0)}% este mes</span>
            </div>
          </div>
        </div>

        {/* Tarjetas de Funcionalidades Premium */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-20">
          {features.map((feature, index) => (
            <Link key={index} href={feature.href} className="group block">
              <div className="relative bg-white rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-[1.02]">
                {/* Badge */}
                <div className="absolute top-4 right-4 z-10">
                  <div className={`px-3 py-1 bg-gradient-to-r ${feature.gradient} rounded-full text-xs font-bold text-white shadow-lg`}>
                    {feature.badge}
                  </div>
                </div>

                {/* Header con gradiente */}
                <div className={`bg-gradient-to-r ${feature.gradient} p-8 relative overflow-hidden`}>
                  <div className="absolute inset-0 bg-black/10"></div>
                  <div className="absolute -top-4 -right-4 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
                  <div className="relative z-10">
                    <feature.icon className="w-10 h-10 text-white mb-4 drop-shadow-lg" />
                  </div>
                </div>

                {/* Contenido */}
                <div className="p-8">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-slate-700 transition-colors">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed mb-6">
                    {feature.description}
                  </p>

                  {/* Botón sutil */}
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-slate-500 group-hover:text-slate-700 transition-colors">
                      Acceder ahora
                    </span>
                    <div className={`w-8 h-8 bg-gradient-to-r ${feature.bgGradient} rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}>
                      <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full`}></div>
                    </div>
                  </div>
                </div>

                {/* Efecto hover sutil */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              </div>
            </Link>
          ))}
        </div>

        {/* Sección de Mis Documentos Premium */}
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-slate-50 via-slate-100 to-slate-50 px-8 py-6 border-b border-slate-200/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-gradient-to-r from-slate-600 to-slate-700 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-slate-900">Mis Documentos</h2>
                  <p className="text-slate-600">Gestiona tu biblioteca personal de documentos profesionales</p>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-3">
                <div className="text-right">
                  <p className="text-xs text-slate-500 uppercase tracking-wide">Total</p>
                  <p className="text-lg font-bold text-slate-900">{documents.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="p-8">
            {docsLoading ? (
              <div className="flex items-center justify-center py-16">
                <div className="relative">
                  <Loader2 className="w-12 h-12 animate-spin text-slate-400 mx-auto" />
                  <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-slate-500 animate-spin"></div>
                </div>
                <p className="mt-4 text-slate-500 font-medium">Cargando tus documentos...</p>
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-20 h-20 bg-gradient-to-r from-slate-100 to-slate-200 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <FileText className="w-10 h-10 text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes documentos</h3>
                <p className="text-slate-600 mb-8 max-w-md mx-auto">
                  Comienza a subir tus documentos profesionales para tenerlos organizados y accesibles desde cualquier lugar.
                </p>
                <Link href="/documents/generator" className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-medium">
                  <Upload className="w-5 h-5" />
                  Subir Primer Documento
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {documents.map((doc, index) => (
                  <div key={doc.id} className="group flex items-center justify-between p-6 bg-gradient-to-r from-slate-50 to-white border border-slate-200/50 rounded-2xl hover:shadow-lg hover:border-slate-300/50 transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-5">
                      <div className="relative">
                        <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white"></div>
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-900 group-hover:text-slate-700 transition-colors">{doc.title}</h4>
                        <div className="flex items-center gap-4 mt-1">
                          <span className="text-sm text-slate-500">{doc.type}</span>
                          <span className="text-sm text-slate-400">•</span>
                          <span className="text-sm text-slate-500">{new Date(doc.uploadDate).toLocaleDateString('es-ES')}</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-xl hover:bg-blue-100 hover:shadow-md transition-all duration-300 font-medium text-sm"
                      >
                        <Eye className="w-4 h-4" />
                        Ver
                      </a>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 hover:shadow-md transition-all duration-300 font-medium text-sm"
                      >
                        <Trash2 className="w-4 h-4" />
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {documents.length > 0 && (
              <div className="mt-12 text-center">
                <Link href="/documents/generator" className="inline-flex items-center gap-3 bg-gradient-to-r from-slate-600 to-slate-700 text-white px-8 py-4 rounded-2xl hover:shadow-xl transition-all duration-300 hover:-translate-y-1 font-medium">
                  <Settings className="w-5 h-5" />
                  Gestionar Todos los Documentos
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}