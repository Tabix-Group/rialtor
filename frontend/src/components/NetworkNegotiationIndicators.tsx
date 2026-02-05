"use client"

import { BarChart3, Clock, TrendingDown, Home, Building2 } from "lucide-react"

export default function NetworkNegotiationIndicators() {
  return (
    <section className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 flex items-center justify-center">
          <BarChart3 className="w-5 h-5 text-indigo-600" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Negociación</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Estadísticas promedio de negociación y tiempos de venta
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {/* Variación de Precios */}
        <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">Variación de Precios</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-muted-foreground mb-1 leading-tight">Prom. Variación Precio Publicación / Vendido</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-500">-5,60%</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-100 dark:border-slate-800">
              <p className="text-xs text-muted-foreground mb-1 leading-tight">Prom. Variación Primer Precio / Vendido</p>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-red-500">-8,12%</span>
                <TrendingDown className="w-4 h-4 text-red-500" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tiempos de Venta */}
      <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-6">Tiempos Promedio (Días)</h3>
        
        <div className="space-y-8">
          {/* Global */}
          <div className="bg-indigo-50/50 dark:bg-indigo-950/20 rounded-2xl p-6 border border-indigo-100 dark:border-indigo-900">
            <h4 className="text-center text-xs font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-widest mb-4">PROMEDIO RED GLOBAL</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Captación hasta Reserva</p>
                <span className="text-3xl font-bold">135,35</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Reserva hasta Venta</p>
                <span className="text-3xl font-bold">55,88</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <Clock className="w-5 h-5 text-indigo-500 mb-2" />
                <p className="text-xs text-muted-foreground mb-1">Captación hasta Venta</p>
                <span className="text-3xl font-bold">188,66</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-4">
            {/* Casas */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Home className="w-4 h-4 text-blue-600" />
                </div>
                CASAS
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Capt./Reserva</p>
                  <p className="text-lg font-bold">162,16</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Res./Venta</p>
                  <p className="text-lg font-bold">64,76</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Capt./Venta</p>
                  <p className="text-lg font-bold">226,98</p>
                </div>
              </div>
            </div>

            {/* Departamentos */}
            <div className="space-y-4">
              <h4 className="text-lg font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                  <Building2 className="w-4 h-4 text-cyan-600" />
                </div>
                DEPARTAMENTOS
              </h4>
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Capt./Reserva</p>
                  <p className="text-lg font-bold">116,94</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Res./Venta</p>
                  <p className="text-lg font-bold">52,63</p>
                </div>
                <div className="bg-slate-50 dark:bg-slate-800/30 p-3 rounded-xl border border-border/50 text-center">
                  <p className="text-[10px] text-muted-foreground mb-1 font-medium">Capt./Venta</p>
                  <p className="text-lg font-bold">168,75</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
