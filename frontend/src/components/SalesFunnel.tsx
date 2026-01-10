'use client'

import { useState, useEffect } from 'react'

// Iconos SVG simples para mejorar la estética sin librerías externas
const UserIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
)
const ChartIcon = () => (
  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
)

interface FunnelStage {
  id: number
  label: string
  clientsHot: number
  clientsCold: number
  color: string
  tailwindColor: string
  width: string
}

interface SalesFunnelProps {
  onSave?: (data: FunnelStage[]) => void
}

export default function SalesFunnel({ onSave }: SalesFunnelProps) {
  const [stages, setStages] = useState<FunnelStage[]>([
    { 
      id: 1, 
      label: 'Prospectos', 
      clientsHot: 20, 
      clientsCold: 0, 
      color: 'teal', 
      tailwindColor: 'bg-gradient-to-r from-teal-500 to-teal-600', 
      width: 'w-full' 
    },
    { 
      id: 2, 
      label: 'Tasaciones', 
      clientsHot: 13, 
      clientsCold: 0, 
      color: 'indigo', 
      tailwindColor: 'bg-gradient-to-r from-indigo-500 to-indigo-600', 
      width: 'w-11/12' 
    },
    { 
      id: 3, 
      label: 'Captaciones', 
      clientsHot: 9, 
      clientsCold: 1, 
      color: 'rose', 
      tailwindColor: 'bg-gradient-to-r from-rose-500 to-rose-600', 
      width: 'w-10/12' 
    },
    { 
      id: 4, 
      label: 'Reservas', 
      clientsHot: 4, 
      clientsCold: 2, 
      color: 'emerald', 
      tailwindColor: 'bg-gradient-to-r from-emerald-500 to-emerald-600', 
      width: 'w-9/12' 
    },
    { 
      id: 5, 
      label: 'Cierres', 
      clientsHot: 3, 
      clientsCold: 2, 
      color: 'amber', 
      tailwindColor: 'bg-gradient-to-r from-amber-400 to-amber-500', 
      width: 'w-8/12' 
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const calculateComposition = (stageIndex: number) => {
    const stage = stages[stageIndex]
    const total = stage.clientsHot + stage.clientsCold

    // Cálculo del % de conversión respecto a la etapa anterior
    let conversionRate = 100
    if (stageIndex > 0) {
      const prevStage = stages[stageIndex - 1]
      const prevTotal = prevStage.clientsHot + prevStage.clientsCold
      if (prevTotal > 0) {
        conversionRate = Math.round((total / prevTotal) * 100)
      } else {
        conversionRate = 0
      }
    }

    // Cálculo visual para la barra (proporción interna)
    const hotPercent = total === 0 ? 0 : (stage.clientsHot / total) * 100
    const coldPercent = total === 0 ? 0 : (stage.clientsCold / total) * 100

    return { hotPercent, coldPercent, conversionRate }
  }

  const handleInputChange = (stageId: number, field: 'clientsHot' | 'clientsCold', value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0)

    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId
          ? { ...stage, [field]: numValue }
          : stage
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      // Simulación de guardado
      await new Promise(resolve => setTimeout(resolve, 800))
      if (onSave) onSave(stages)
    } catch (error) {
      console.error('Error saving sales funnel:', error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="w-full font-sans text-slate-800">
      {/* HEADER PREMIUM */}
      <div className="bg-[#0f172a] px-6 py-12 sm:px-8 sm:py-16 rounded-t-3xl shadow-2xl relative overflow-hidden">
        {/* Efectos de fondo sutiles */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-[80px] translate-y-1/2 -translate-x-1/4"></div>
        
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-center relative z-10">
          <div>
            <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-slate-800/80 px-3 py-1 text-xs font-medium text-blue-200 border border-slate-700 backdrop-blur-md">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
              </span>
              Pipeline en tiempo real
            </div>
            <h1 className="text-3xl font-bold text-white sm:text-4xl tracking-tight">
              Proyecciones <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-400">Comerciales</span>
            </h1>
            <p className="mt-2 text-slate-400 max-w-lg text-sm sm:text-base">
              Gestiona el flujo de conversión de tus referidos y bases frías.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-blue-50 hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-slate-900" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Guardando...
              </>
            ) : (
              <>
                <span>Guardar Cambios</span>
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>

      <div className="bg-slate-50 py-10 min-h-[600px]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 relative">
            
            {/* Etiquetas de columnas superiores */}
            <div className="grid grid-cols-12 mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              <div className="col-span-3 text-right pr-12">Referidos</div>
              <div className="col-span-6">Embudo de Conversión</div>
              <div className="col-span-3 text-left pl-12">Fríos</div>
            </div>

            <div className="space-y-1"> {/* Espaciado reducido para mayor compacidad */}
              
              {stages.map((stage, index) => {
                const { hotPercent, coldPercent, conversionRate } = calculateComposition(index)
                const totalClients = stage.clientsHot + stage.clientsCold

                return (
                  <div key={stage.id} className={`grid grid-cols-12 items-center relative z-10 group`}>
                    
                    {/* --- COLUMNA IZQUIERDA (INPUT REFERIDOS) --- */}
                    <div className="col-span-3 flex justify-end pr-8 relative">
                      <div className="flex items-center gap-3 transition-transform duration-300 group-hover:-translate-x-1">
                        <div className="text-right">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsHot}
                            onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                            className="w-16 text-right text-xl font-bold text-slate-700 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-blue-500 focus:outline-none transition-colors p-0"
                          />
                        </div>
                        {/* Indicador visual tipo 'tag' */}
                        <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)]"></div>
                      </div>
                    </div>

                    {/* --- COLUMNA CENTRAL (EMBUDO) --- */}
                    <div className="col-span-6 flex flex-col items-center relative">
                      <div 
                        className={`relative ${stage.width} transition-all duration-500 ease-out -mb-5`} 
                        style={{ 
                          zIndex: 30 - index,
                          filter: 'drop-shadow(0px 10px 15px rgba(0,0,0,0.15))'
                        }} 
                      >
                        <div 
                          className={`${stage.tailwindColor} relative overflow-hidden`}
                          style={{
                              clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)', // Trapecio más estilizado
                              height: '88px',
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'center',
                              alignItems: 'center'
                          }}
                        >
                          {/* Efecto de Brillo Superior (Glassmorphism) */}
                          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50 z-20"></div>
                          <div className="absolute top-0 inset-x-0 h-12 bg-gradient-to-b from-white/10 to-transparent z-10 pointer-events-none"></div>

                          {/* TEXTO DE LA ETAPA */}
                          <div className="relative z-30 text-center w-full px-4">
                            <h3 className="text-white font-extrabold text-lg tracking-wide drop-shadow-md mb-1">
                              {stage.label}
                            </h3>
                            
                            {/* DATOS CENTRALIZADOS (CANTIDAD + PORCENTAJE) */}
                            <div className="flex items-center justify-center gap-2 text-white/95 text-sm font-medium bg-black/10 backdrop-blur-sm py-1 px-3 rounded-full inline-flex border border-white/10 shadow-inner">
                              <span className="flex items-center gap-1">
                                <UserIcon />
                                {totalClients}
                              </span>
                              <span className="w-px h-3 bg-white/30 mx-1"></span>
                              <span className="flex items-center gap-1 font-bold text-white">
                                <ChartIcon />
                                {conversionRate}%
                              </span>
                            </div>
                          </div>

                          {/* BARRA DE PROGRESO INFERIOR (DARK MODE) */}
                          {totalClients > 0 && (
                            <div className="absolute bottom-3 w-[70%] h-1.5 bg-slate-900/40 rounded-full overflow-hidden backdrop-blur-md z-20 shadow-inner border border-white/5">
                              {/* Hot clients (Color Claro) */}
                              <div 
                                className="h-full bg-white/90 shadow-[0_0_10px_white] float-left transition-all duration-700"
                                style={{ width: `${hotPercent}%` }}
                              />
                              {/* Cold clients (Color Oscuro/Transparente) */}
                              <div 
                                className="h-full bg-slate-800/50 float-left transition-all duration-700"
                                style={{ width: `${coldPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- COLUMNA DERECHA (INPUT FRIOS) --- */}
                    <div className="col-span-3 flex justify-start pl-8 relative">
                      <div className="flex items-center gap-3 transition-transform duration-300 group-hover:translate-x-1">
                        {/* Indicador visual tipo 'tag' */}
                        <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)]"></div>
                        <div className="text-left">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsCold}
                            onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                            className="w-16 text-left text-xl font-bold text-slate-700 bg-transparent border-b-2 border-transparent hover:border-slate-200 focus:border-indigo-500 focus:outline-none transition-colors p-0"
                          />
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* LEYENDA / FOOTER */}
            <div className="mt-16 pt-8 border-t border-slate-100 flex justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-400 shadow-[0_0_6px_rgba(45,212,191,0.8)]"></div>
                <span>Clientes Referidos (Barra Blanca)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400 shadow-[0_0_6px_rgba(129,140,248,0.8)]"></div>
                <span>Bases Frías (Barra Oscura)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}