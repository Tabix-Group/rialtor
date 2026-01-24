'use client'

import React from 'react'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  UserPlus, 
  Briefcase
} from 'lucide-react'

// Definimos la interfaz para recibir la función del botón
interface ProspectSummaryProps {
  stats: any
  onCreateClick: () => void // Esta función activará el modal en el padre
  onSaveFunnel?: () => void
  isSavingFunnel?: boolean
}

export default function ProspectSummary({ stats, onCreateClick, onSaveFunnel, isSavingFunnel }: ProspectSummaryProps) {
  const { 
    avgSale = 0, 
    avgCommission = 0, 
    clientsProspected = 0, 
    conversionRate = 0,
    totalPipeline = 0
  } = stats || {}

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(amount)

  return (
    // Quitamos márgenes externos y aseguramos w-full para que ocupe todo el ancho
    <div className="relative w-full overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 shadow-xl">
      {/* --- FONDO DECORATIVO --- */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>
      
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      {/* --- CONTENIDO --- */}
      <div className="relative max-w-[1600px] mx-auto px-6 py-12 lg:py-16">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12">
          
          {/* IZQUIERDA: Títulos y Botones */}
          <div className="flex-1 w-full xl:w-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-6 shadow-lg">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Gestión Comercial Unificada</span>
            </div>

            <h1 className="text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight drop-shadow-md">
              Mis <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Proyecciones y Prospectos</span>
            </h1>

            <p className="text-lg text-slate-300 mb-8 max-w-2xl leading-relaxed">
              Visualiza tu embudo de ventas y administra tus prospectos en una sola vista optimizada.
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
                onClick={onCreateClick}
                className="group inline-flex items-center gap-3 bg-white text-slate-900 px-8 py-3 rounded-xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 font-bold text-sm sm:text-base cursor-pointer"
              >
                <UserPlus className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                Nuevo Prospecto
              </button>
            </div>
          </div>

          {/* DERECHA: KPIs (6 tarjetas) */}
          <div className="w-full xl:w-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-cyan-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Total Pipeline</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {formatCurrency(totalPipeline)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Conv. Global</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {conversionRate.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Ticket Promedio</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {formatCurrency(avgSale)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Users className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Prospectados</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {clientsProspected}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Comisión Prom.</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {formatCurrency(avgCommission)}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-rose-500/20 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-rose-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-wider">Tasa de Cierre</p>
                    <p className="text-lg font-bold text-white tabular-nums">
                      {conversionRate.toFixed(1)}%
                    </p>
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