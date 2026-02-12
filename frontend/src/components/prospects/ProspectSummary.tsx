'use client'

import React, { useState, useEffect } from 'react'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Briefcase,
  Save,
  Edit2
} from 'lucide-react'
import { getWeightedClosingRate } from '@/constants/conversionRates'
import type { AgentLevel } from '@/constants/conversionRates'

// Función para formatear moneda en USD
const formatCurrency = (amount: number): string => {
  return `U$D ${new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)}`
}

interface ProspectSummaryProps {
  stats?: {
    avgSale?: number;
    avgCommission?: number;
    clientsProspected?: number;
    total?: number;
    wonCount?: number;
    totalPipeline?: number;
    conversionRate?: number;
  }
  funnelStages?: {
    clientsHot: number;
    clientsCold: number;
  }[]
  agentLevel?: string
  startDate?: string
  endDate?: string
  projectionMetrics?: any
  onDateChange?: (start: string, end: string) => void
  onCreateClick?: () => void
  onStatsSaved?: () => void
}

export default function ProspectSummary({ 
  stats = {}, 
  funnelStages = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  agentLevel = 'inicial', 
  startDate,
  endDate,
  projectionMetrics = null,
  onDateChange,
  onStatsSaved,
}: ProspectSummaryProps) {
  const [isEditingStats, setIsEditingStats] = useState(false)
  const [hasMounted, setHasMounted] = useState(false)
  const [localFrequency, setLocalFrequency] = useState('mensual')
  const [localStartDate, setLocalStartDate] = useState('')
  const [localEndDate, setLocalEndDate] = useState('')

  // Inicializar en el cliente para evitar errores de hidratación
  useEffect(() => {
    setHasMounted(true)
    
    if (!localStartDate && !startDate) {
      const d = new Date()
      d.setMonth(d.getMonth() - 1)
      setLocalStartDate(d.toISOString().split('T')[0])
    } else if (startDate) {
      setLocalStartDate(startDate)
    }

    if (!localEndDate && !endDate) {
      setLocalEndDate(new Date().toISOString().split('T')[0])
    } else if (endDate) {
      setLocalEndDate(endDate)
    }
  }, [startDate, endDate])

  // Detectar frecuencia inicial basada en fechas
  useEffect(() => {
    if (startDate && endDate) {
      const start = new Date(startDate + 'T00:00:00')
      const end = new Date(endDate + 'T00:00:00')
      
      if (!isNaN(start.getTime()) && !isNaN(end.getTime())) {
        const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
        
        if (diffDays <= 8) setLocalFrequency('semanal')
        else if (diffDays <= 16) setLocalFrequency('quincenal')
        else if (diffDays <= 32) setLocalFrequency('mensual')
        else if (diffDays <= 65) setLocalFrequency('bimestral')
        else if (diffDays <= 95) setLocalFrequency('trimestral')
        else if (diffDays <= 185) setLocalFrequency('semestral')
        else if (diffDays <= 370) setLocalFrequency('anual')
      }
    }
  }, [startDate, endDate])

  // Calcular fecha fin basada en frecuencia cuando se edita
  useEffect(() => {
    if (isEditingStats && localStartDate) {
      const start = new Date(localStartDate + 'T00:00:00')
      if (isNaN(start.getTime())) return

      const end = new Date(start)
      
      switch (localFrequency) {
        case 'semanal': end.setDate(start.getDate() + 7); break
        case 'quincenal': end.setDate(start.getDate() + 15); break
        case 'mensual': end.setMonth(start.getMonth() + 1); break
        case 'bimestral': end.setMonth(start.getMonth() + 2); break
        case 'trimestral': end.setMonth(start.getMonth() + 3); break
        case 'semestral': end.setMonth(start.getMonth() + 6); break
        case 'anual': end.setFullYear(start.getFullYear() + 1); break
      }
      
      if (!isNaN(end.getTime())) {
        setLocalEndDate(end.toISOString().split('T')[0])
      }
    }
  }, [localStartDate, localFrequency, isEditingStats])

  const [editedStats, setEditedStats] = useState({
    prospectadosReferidos: Math.floor((stats?.clientsProspected || 0) * 0.5),
    prospectadosFrios: Math.floor((stats?.clientsProspected || 0) * 0.5),
    ticketPromedio: stats?.avgSale || 0,
    comisionPorcentaje: stats?.avgCommission || 3,
    agentLevel: (agentLevel as AgentLevel) || 'inicial',
  })

  // Actualizar editedStats cuando cambien los stats o projection metrics
  useEffect(() => {
    if (projectionMetrics) {
      // Si hay métricas guardadas, usarlas
      setEditedStats({
        prospectadosReferidos: projectionMetrics.prospectadosReferidos || 0,
        prospectadosFrios: projectionMetrics.prospectadosFrios || 0,
        ticketPromedio: projectionMetrics.ticketPromedio || 0,
        comisionPorcentaje: projectionMetrics.comisionPorcentaje || 0,
        agentLevel: (projectionMetrics.agentLevel as AgentLevel) || 'inicial',
      })
      if (projectionMetrics.startDate) setLocalStartDate(projectionMetrics.startDate)
      if (projectionMetrics.endDate) setLocalEndDate(projectionMetrics.endDate)
    } else {
      // Si no hay métricas guardadas, usar los stats calculados
      setEditedStats({
        prospectadosReferidos: Math.floor((stats?.clientsProspected || 0) * 0.5),
        prospectadosFrios: Math.floor((stats?.clientsProspected || 0) * 0.5),
        ticketPromedio: stats?.avgSale || 0,
        comisionPorcentaje: stats?.avgCommission || 3,
        agentLevel: (agentLevel as AgentLevel) || 'inicial',
      })
    }
  }, [stats, agentLevel, projectionMetrics])

  // Sincronizar fechas locales con props
  useEffect(() => {
    if (startDate) setLocalStartDate(startDate)
    if (endDate) setLocalEndDate(endDate)
  }, [startDate, endDate])

  // Cálculo de comisiones totales
  const totalProspectados = editedStats.prospectadosReferidos + editedStats.prospectadosFrios
  const tasaCierreCalculada = getWeightedClosingRate(
    editedStats.prospectadosReferidos,
    editedStats.prospectadosFrios,
    editedStats.agentLevel
  ) / 100 // Convertir de porcentaje a decimal
  const comisionesTotales = totalProspectados * editedStats.ticketPromedio * (editedStats.comisionPorcentaje / 100) * tasaCierreCalculada

  const handleSaveStats = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
      const apiUrl = typeof window !== 'undefined' 
        ? (window.location.hostname === 'rialtor.app' || window.location.hostname === 'www.rialtor.app'
          ? 'https://remax-be-production.up.railway.app'
          : 'http://localhost:3003')
        : 'http://localhost:3003'

      const response = await fetch(`${apiUrl}/api/projection-metrics`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          prospectadosReferidos: editedStats.prospectadosReferidos,
          prospectadosFrios: editedStats.prospectadosFrios,
          ticketPromedio: editedStats.ticketPromedio,
          comisionPorcentaje: editedStats.comisionPorcentaje,
          agentLevel: editedStats.agentLevel,
          startDate: localStartDate,
          endDate: localEndDate,
        }),
      })

      if (!response.ok) {
        console.error('Error saving projection metrics')
        return
      }
    } catch (error) {
      console.error('Error saving projection metrics:', error)
    }

    setIsEditingStats(false)
    if (onStatsSaved) {
      onStatsSaved()
    }
    // Aplicar las nuevas fechas
    if (onDateChange) {
      onDateChange(localStartDate, localEndDate)
    }
  }

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
      {/* Fondo decorativo */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      {/* Contenido */}
      <div className="relative max-w-[1600px] mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12">
          
          {/* Izquierda: Títulos */}
          <div className="flex-1">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 shadow-lg">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Proyección Comercial</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Proyección Comercial
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Tasa de cierre según mis indicadores del negocio
              {hasMounted && startDate && endDate && (
                <span className="block text-sm text-slate-400 mt-2">
                  Desde: {new Date(startDate + 'T00:00:00').toLocaleDateString('es-AR')} - Hasta: {new Date(endDate + 'T00:00:00').toLocaleDateString('es-AR')}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-4">
              <button 
                onClick={() => isEditingStats ? handleSaveStats() : setIsEditingStats(true)}
                className="group inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 font-bold text-sm sm:text-base"
              >
                {isEditingStats ? (
                  <>
                    <Save className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    Guardar Métricas
                  </>
                ) : (
                  <>
                    <Edit2 className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                    Editar Métricas
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Derecha: KPIs */}
          <div className="w-full xl:w-auto">
            {isEditingStats && (
              <div className="mb-6 bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg">
                <h3 className="text-sm font-bold text-white mb-3">Configuración de Métricas</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold uppercase">Fecha Inicio</label>
                    <input
                      type="date"
                      value={localStartDate}
                      onChange={(e) => setLocalStartDate(e.target.value)}
                      className="w-full bg-slate-700/50 text-white px-3 py-2 rounded text-sm border border-slate-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold uppercase">Frecuencia</label>
                    <select
                      value={localFrequency}
                      onChange={(e) => setLocalFrequency(e.target.value)}
                      className="w-full bg-slate-700/50 text-white px-3 py-2 rounded text-sm border border-slate-500 mt-1"
                    >
                      <option value="semanal">Semanal</option>
                      <option value="quincenal">Quincenal</option>
                      <option value="mensual">Mensual</option>
                      <option value="bimestral">Bimestral</option>
                      <option value="trimestral">Trimestral</option>
                      <option value="semestral">Semestral</option>
                      <option value="anual">Anual</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold uppercase">Nivel de Agente</label>
                    <select
                      value={editedStats.agentLevel}
                      onChange={(e) => {
                        const newLevel = e.target.value as AgentLevel
                        setEditedStats({
                          ...editedStats, 
                          agentLevel: newLevel,
                          prospectadosFrios: newLevel === 'experto' ? 0 : editedStats.prospectadosFrios
                        })
                      }}
                      className="w-full bg-slate-700/50 text-white px-3 py-2 rounded text-sm border border-slate-500 mt-1"
                    >
                      <option value="inicial">Inicial</option>
                      <option value="intermedio">Intermedio</option>
                      <option value="experto">Experto</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Prospectados (Referidos + Bases Frías) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                {isEditingStats ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-slate-300 font-bold uppercase">Referidos</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editedStats.prospectadosReferidos || ''}
                        onChange={(e) => setEditedStats({...editedStats, prospectadosReferidos: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-300 font-bold uppercase">Bases Frías</label>
                      <input
                        type="number"
                        placeholder="0"
                        value={editedStats.prospectadosFrios || ''}
                        onChange={(e) => setEditedStats({...editedStats, prospectadosFrios: parseInt(e.target.value) || 0})}
                        disabled={editedStats.agentLevel === 'experto'}
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500 disabled:opacity-50 disabled:cursor-not-allowed [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Prospectados</p>
                      <p className="text-lg font-bold text-white tabular-nums">{totalProspectados}</p>
                      <p className="text-[10px] text-slate-400">
                        {editedStats.agentLevel === 'experto' 
                          ? `${editedStats.prospectadosReferidos} referidos` 
                          : `${editedStats.prospectadosReferidos} ref. + ${editedStats.prospectadosFrios} Bases Frías`
                        }
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* 2. Ticket Promedio */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                {isEditingStats ? (
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-300 font-bold uppercase">Ticket Promedio</label>
                    <input
                      type="number"
                      placeholder="0"
                      value={editedStats.ticketPromedio || ''}
                      onChange={(e) => setEditedStats({...editedStats, ticketPromedio: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <DollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Ticket Promedio</p>
                      <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(editedStats.ticketPromedio)}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 3. Comisión Promedio (%) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                {isEditingStats ? (
                  <div className="space-y-1">
                    <label className="text-[9px] text-slate-300 font-bold uppercase">Comisión Promedio</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      max="100"
                      value={editedStats.comisionPorcentaje}
                      onChange={(e) => {
                        const value = parseFloat(e.target.value) || 0
                        setEditedStats({...editedStats, comisionPorcentaje: Math.min(100, Math.max(0, value))})
                      }}
                      className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500"
                    />
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <TrendingUp className="w-5 h-5 text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Comisión Promedio</p>
                      <p className="text-lg font-bold text-white tabular-nums">{editedStats.comisionPorcentaje}%</p>
                    </div>
                  </div>
                )}
              </div>

              {/* 4. Tasa de Cierre */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Tasa de Cierre ({editedStats.agentLevel})</p>
                    <p className="text-lg font-bold text-white tabular-nums">{(tasaCierreCalculada * 100).toFixed(1)}%</p>
                    <p className="text-[10px] text-slate-400">Según nivel de agente</p>
                  </div>
                </div>
              </div>

              {/* 5. Comisiones Totales Obtenidas (Calculado) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group sm:col-span-2 lg:col-span-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Comisiones Totales Proyectadas</p>
                    <p className="text-xl font-extrabold text-white tabular-nums drop-shadow-sm">{formatCurrency(comisionesTotales)}</p>
                    <p className="text-[10px] text-slate-400">({totalProspectados} × {formatCurrency(editedStats.ticketPromedio)} × {editedStats.comisionPorcentaje}% × {(tasaCierreCalculada * 100).toFixed(1)}%)</p>
                  </div>
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </div>
  )
}