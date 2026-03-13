'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import ValuationForm from '../../components/ValuationForm'
import { Gavel, TrendingUp, Calendar, MapPin, Trash2, Eye, Loader2 } from 'lucide-react'

interface ValuationHistoryItem {
  id: string
  provincia: string
  localidad: string
  metrosCubiertos: number
  metrosDescubiertos: number
  ambientes: number
  banos: number
  valorMinimo: number
  valorMaximo: number
  valorAlquilerUSD?: number | null
  valorAlquilerARS?: number | null
  porcentajeAlquiler?: number | null
  createdAt: string
}

export default function ValuadorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [valuations, setValuations] = useState<ValuationHistoryItem[]>([])
  const [loadingHistory, setLoadingHistory] = useState(true)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchValuations()
    }
  }, [user])

  const fetchValuations = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/valuations?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setValuations(data.data || [])
      }
    } catch (error) {
      console.error('Error fetching valuations:', error)
    } finally {
      setLoadingHistory(false)
    }
  }

  const handleValuationCreated = () => {
    fetchValuations()
  }

  const deleteValuation = async (id: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar esta tasación?')) return

    setDeleteLoading(id)
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/valuations/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        setValuations(v => v.filter(item => item.id !== id))
      }
    } catch (error) {
      console.error('Error deleting valuation:', error)
      alert('Error eliminando tasación')
    } finally {
      setDeleteLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <Gavel className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Valuación IA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Tasador</span> de Propiedades
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Obtén valuaciones precisas en USD en segundos. Análisis de mercado con IA que considera datos actuales, ubicación y características especiales.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-2">
            <ValuationForm onSuccess={handleValuationCreated} />
          </div>

          {/* Histórico */}
          <div>
            <div className="sticky top-8">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-slate-200">
                  <h2 className="font-bold text-slate-800 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-purple-600" />
                    Tasaciones Recientes
                  </h2>
                </div>

                <div className="divide-y divide-slate-100 max-h-[600px] overflow-y-auto">
                  {loadingHistory ? (
                    <div className="p-6 text-center text-gray-500 flex items-center justify-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : valuations.length === 0 ? (
                    <div className="p-6 text-center text-gray-500">
                      <p className="text-sm">No tienes tasaciones aún</p>
                    </div>
                  ) : (
                    valuations.map((val) => (
                      <div key={val.id} className="p-4 hover:bg-purple-50/50 transition-colors group">
                        <div className="flex items-start justify-between gap-2 mb-3">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-sm text-slate-800 flex items-center gap-2">
                              <MapPin className="w-3.5 h-3.5 text-purple-600 flex-shrink-0" />
                              <span className="truncate">{val.localidad}, {val.provincia}</span>
                            </h3>
                            <p className="text-xs text-slate-400 mt-1">
                              <Calendar className="w-3 h-3 inline mr-1" />
                              {new Date(val.createdAt).toLocaleDateString('es-AR')}
                            </p>
                          </div>
                          <button
                            onClick={() => deleteValuation(val.id)}
                            disabled={deleteLoading === val.id}
                            className="p-1 text-slate-300 hover:text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50 flex-shrink-0 opacity-0 group-hover:opacity-100"
                            title="Eliminar tasación"
                          >
                            {deleteLoading === val.id ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Trash2 className="w-4 h-4" />
                            )}
                          </button>
                        </div>

                        {/* Características en una línea compacta */}
                        <div className="text-xs text-slate-500 space-y-1 mb-2.5">
                          <div className="flex gap-2 flex-wrap">
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full font-medium">
                              {val.ambientes} amb
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full font-medium">
                              {val.banos} baños
                            </span>
                            <span className="px-2 py-0.5 bg-slate-100 rounded-full font-medium">
                              {val.metrosCubiertos} m²
                            </span>
                          </div>
                        </div>

                        {/* Rango de valuación destacado */}
                        <div className="bg-white rounded-lg p-3 border border-purple-100 shadow-sm">
                          <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
                            Rango USD
                          </div>
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-slate-500 mb-0.5">Min</p>
                              <p className="font-bold text-purple-600">
                                ${val.valorMinimo.toLocaleString('es-AR')}
                              </p>
                            </div>
                            <div className="text-slate-300">→</div>
                            <div className="text-right">
                              <p className="text-xs text-slate-500 mb-0.5">Max</p>
                              <p className="font-bold text-pink-600">
                                ${val.valorMaximo.toLocaleString('es-AR')}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Alquiler estimado */}
                        {val.valorAlquilerUSD && (
                          <div className="bg-white rounded-lg p-3 border border-green-100 shadow-sm">
                            <div className="text-xs text-slate-500 font-semibold mb-2 uppercase tracking-wide">
                              Alquiler Mensual
                            </div>
                            <div className="flex items-center justify-between">
                              <div>
                                <p className="text-xs text-slate-500 mb-0.5">USD</p>
                                <p className="font-bold text-green-600">
                                  ${val.valorAlquilerUSD.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                </p>
                              </div>
                              <div className="text-slate-300">•</div>
                              <div className="text-right">
                                <p className="text-xs text-slate-500 mb-0.5">ARS</p>
                                <p className="font-bold text-emerald-600">
                                  ${val.valorAlquilerARS?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                                </p>
                              </div>
                            </div>
                            {val.porcentajeAlquiler && (
                              <p className="text-xs text-slate-500 mt-2 pt-2 border-t border-gray-200">
                                {val.porcentajeAlquiler}% anual del valor de compraventa
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
