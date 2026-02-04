'use client'

import React from 'react'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  Briefcase,
} from 'lucide-react'
import { getWeightedClosingRate } from '@/constants/conversionRates'
import type { AgentLevel } from '@/constants/conversionRates'

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
  funnelStages = [], 
  agentLevel = 'inicial', 
  startDate,
  endDate,
  onDateChange,
  onSaveFunnel, 
  isSavingFunnel 
}: ProspectSummaryProps) {
  // Calcular tasa de cierre dinámica según nivel (usando datos reales)
  const tasaCierrePorcentaje = getWeightedClosingRate(
    Math.floor((stats?.clientsProspected || 0) * 0.5), // Asumir 50% referidos
    Math.floor((stats?.clientsProspected || 0) * 0.5), // 50% fríos
    agentLevel as AgentLevel
  )

  // Cálculo de comisiones totales usando datos reales
  const totalProspectados = stats?.total || 0
  const comisionesTotales = totalProspectados * (stats?.avgSale || 0) * ((stats?.avgCommission || 0) / 100) * (tasaCierrePorcentaje / 100)

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { 
      style: 'currency', 
      currency: 'USD', 
      maximumFractionDigits: 0 
    }).format(amount)

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
            </p>

            {/* Filtros de fecha */}
            {onDateChange && (
              <div className="flex flex-wrap gap-4 mb-8">
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-300">Desde:</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => onDateChange(e.target.value, endDate || '')}
                    className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-500 text-sm"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-sm text-slate-300">Hasta:</label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => onDateChange(startDate || '', e.target.value)}
                    className="bg-slate-700/50 text-white px-3 py-2 rounded-lg border border-slate-500 text-sm"
                  />
                </div>
              </div>
            )}

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
            </div>
          </div>

          {/* Derecha: KPIs */}
          <div className="w-full xl:w-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              {/* 1. Prospectados (Total en período) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Prospectados (Período)</p>
                    <p className="text-lg font-bold text-white tabular-nums">{stats?.total || 0}</p>
                    <p className="text-[10px] text-slate-400">Total en el período</p>
                  </div>
                </div>
              </div>

              {/* 2. Ticket Promedio */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Ticket Promedio</p>
                    <p className="text-lg font-bold text-white tabular-nums">{formatCurrency(stats?.avgSale || 0)}</p>
                  </div>
                </div>
              </div>

              {/* 3. Comisión Promedio (%) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Comisión Promedio</p>
                    <p className="text-lg font-bold text-white tabular-nums">{stats?.avgCommission || 0}%</p>
                  </div>
                </div>
              </div>

              {/* 4. Tasa de Cierre (Calculada Automáticamente) */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Tasa de Cierre Ponderada ({agentLevel})</p>
                    <p className="text-lg font-bold text-white tabular-nums">{tasaCierrePorcentaje}%</p>
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
                    <p className="text-[10px] text-slate-400">({totalProspectados} × {formatCurrency(stats?.avgSale || 0)} × {stats?.avgCommission || 0}% × {tasaCierrePorcentaje}%)</p>
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