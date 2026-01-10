'use client'

import React from 'react'
import { 
  Users, 
  DollarSign, 
  TrendingUp, 
  Target, 
  UserPlus, 
  Briefcase,
  Percent
} from 'lucide-react'

export default function ProspectSummary({ stats }: { stats: any }) {
  // Valores por defecto para evitar errores si stats es null/undefined
  const { 
    avgSale = 0, 
    avgCommission = 0, 
    clientsProspected = 0, 
    conversionRate = 0 
  } = stats || {}

  // Formateador de moneda (ARS)
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('es-AR', { 
      style: 'currency', 
      currency: 'ARS', 
      maximumFractionDigits: 0 
    }).format(amount)

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
      {/* --- FONDO DECORATIVO (Patrón y Gradientes) --- */}
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>
      
      {/* Efecto de luz ambiental */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4 pointer-events-none"></div>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
        <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-8 lg:gap-12">
          
          {/* SECCIÓN IZQUIERDA: Títulos y Botón */}
          <div className="flex-1 w-full xl:w-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6 shadow-lg">
              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Gestión de Clientes</span>
            </div>

            {/* Título H1 */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight drop-shadow-md">
              Mis <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Prospectos</span>
            </h1>

            {/* Descripción */}
            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Administra tus oportunidades de negocio, realiza seguimiento detallado y optimiza tu conversión de ventas.
            </p>

            {/* Botón de Acción (Opcional, funcional o visual) */}
            <button className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base">
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-110 transition-transform" />
              Nuevo Prospecto
            </button>
          </div>

          {/* SECCIÓN DERECHA: Grid de Estadísticas (Glassmorphism) */}
          <div className="w-full xl:w-auto min-w-[300px] lg:min-w-[600px]">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
              
              {/* Card 1: Monto Promedio */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <DollarSign className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-0.5 uppercase tracking-wider">Ticket Promedio</p>
                    <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
                      {formatCurrency(avgSale)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 2: Clientes Prospectados */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Target className="w-5 h-5 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-0.5 uppercase tracking-wider">Prospectados</p>
                    <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
                      {clientsProspected} <span className="text-xs font-normal text-slate-400">clientes</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 3: Comisión Promedio */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Briefcase className="w-5 h-5 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-0.5 uppercase tracking-wider">Comisión Prom.</p>
                    <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
                      {formatCurrency(avgCommission)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Card 4: Tasa de Conversión */}
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 border border-white/10 shadow-lg hover:bg-white/15 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                    <TrendingUp className="w-5 h-5 text-amber-400" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 font-medium mb-0.5 uppercase tracking-wider">Tasa de Cierre</p>
                    <p className="text-lg lg:text-xl font-bold text-white tabular-nums">
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