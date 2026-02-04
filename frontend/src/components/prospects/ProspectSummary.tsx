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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
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
  onDateChange?: (start: string, end: string) => void
  onCreateClick?: () => void
  onSaveFunnel?: () => void
  isSavingFunnel?: boolean
}

export default function ProspectSummary({ 
  stats = {}, 
  funnelStages = [], // eslint-disable-line @typescript-eslint/no-unused-vars
  agentLevel = 'inicial', 
  startDate,
  endDate,
  onDateChange,
  onSaveFunnel, 
  isSavingFunnel 
}: ProspectSummaryProps) {
  const [isEditingStats, setIsEditingStats] = useState(false)
  const [localStartDate, setLocalStartDate] = useState(startDate || (() => {
    const date = new Date()
    date.setMonth(date.getMonth() - 1)
    return date.toISOString().split('T')[0]
  })())
  const [localEndDate, setLocalEndDate] = useState(endDate || new Date().toISOString().split('T')[0])
  const [editedStats, setEditedStats] = useState({
    prospectadosReferidos: Math.floor((stats?.clientsProspected || 0) * 0.5),
    prospectadosFrios: Math.floor((stats?.clientsProspected || 0) * 0.5),
    ticketPromedio: stats?.avgSale || 0,
    comisionPorcentaje: stats?.avgCommission || 3,
    agentLevel: (agentLevel as AgentLevel) || 'inicial',
  })

  // Actualizar editedStats cuando cambien los stats
  useEffect(() => {
    setEditedStats({
      prospectadosReferidos: Math.floor((stats?.clientsProspected || 0) * 0.5),
      prospectadosFrios: Math.floor((stats?.clientsProspected || 0) * 0.5),
      ticketPromedio: stats?.avgSale || 0,
      comisionPorcentaje: stats?.avgCommission || 3,
      agentLevel: (agentLevel as AgentLevel) || 'inicial',
    })
  }, [stats, agentLevel])

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
    // Aquí iría la lógica para guardar en el backend si es necesario
    setIsEditingStats(false)
    if (onSaveFunnel) {
      onSaveFunnel()
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
              {startDate && endDate && (
                <span className="block text-sm text-slate-400 mt-2">
                  Desde: {new Date(startDate).toLocaleDateString('es-AR')} - Hasta: {new Date(endDate).toLocaleDateString('es-AR')}
                </span>
              )}
            </p>

            <div className="flex flex-wrap gap-4">
              {onSaveFunnel && (
                <button
                  onClick={onSaveFunnel}
                  disabled={isSavingFunnel}
                  className="group inline-flex items-center gap-3 bg-blue-600 text-white px-8 py-3 rounded-xl hover:bg-blue-700 transition-all duration-300 hover:-translate-y-1 font-bold text-sm sm:text-base disabled:opacity-50"
                >
                  <Briefcase className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                  {isSavingFunnel ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              )}

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
                    <label className="text-[10px] text-slate-300 font-bold uppercase">Fecha Fin</label>
                    <input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => setLocalEndDate(e.target.value)}
                      className="w-full bg-slate-700/50 text-white px-3 py-2 rounded text-sm border border-slate-500 mt-1"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-300 font-bold uppercase">Nivel de Agente</label>
                    <select
                      value={editedStats.agentLevel}
                      onChange={(e) => setEditedStats({...editedStats, agentLevel: e.target.value as AgentLevel})}
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
              
              {/* 1. Prospectados (Referidos + Fríos) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                {isEditingStats ? (
                  <div className="space-y-2">
                    <div>
                      <label className="text-[9px] text-slate-300 font-bold uppercase">Referidos</label>
                      <input
                        type="number"
                        value={editedStats.prospectadosReferidos}
                        onChange={(e) => setEditedStats({...editedStats, prospectadosReferidos: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500"
                      />
                    </div>
                    <div>
                      <label className="text-[9px] text-slate-300 font-bold uppercase">Fríos</label>
                      <input
                        type="number"
                        value={editedStats.prospectadosFrios}
                        onChange={(e) => setEditedStats({...editedStats, prospectadosFrios: parseInt(e.target.value) || 0})}
                        className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500"
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
                      <p className="text-[10px] text-slate-400">{editedStats.prospectadosReferidos} ref. + {editedStats.prospectadosFrios} fríos</p>
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
                      value={editedStats.ticketPromedio}
                      onChange={(e) => setEditedStats({...editedStats, ticketPromedio: parseInt(e.target.value) || 0})}
                      className="w-full bg-slate-700/50 text-white px-2 py-1 rounded text-sm border border-slate-500"
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
                      onChange={(e) => setEditedStats({...editedStats, comisionPorcentaje: parseFloat(e.target.value) || 0})}
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