'use client'

import { useState, useEffect } from 'react'

// Iconos simples
const UserIcon = () => (
  <svg className="w-4 h-4 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
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

    // Porcentajes de composición (Barra visual Hot/Cold)
    const hotPercent = total === 0 ? 0 : (stage.clientsHot / total) * 100
    const coldPercent = total === 0 ? 0 : (stage.clientsCold / total) * 100

    // Tasa de conversión respecto a la etapa anterior
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
      {/* HEADER */}
      <div className="bg-[#0f172a] px-6 py-12 sm:px-8 sm:py-16 rounded-t-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/20 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4"></div>
        
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
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="group relative inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition-all hover:bg-blue-50 disabled:opacity-50"
          >
            <span>{isSaving ? 'Guardando...' : 'Guardar Cambios'}</span>
          </button>
        </div>
      </div>

      <div className="bg-slate-50 py-10 min-h-[700px]">
        <div className="mx-auto max-w-6xl px-4">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 relative">
            
            {/* Encabezados de Columna */}
            <div className="grid grid-cols-12 mb-8 text-xs font-bold text-slate-400 uppercase tracking-widest text-center">
              <div className="col-span-3 text-right pr-6">Referidos</div>
              <div className="col-span-6">Embudo</div>
              <div className="col-span-3 text-left pl-6">Bases Frías</div>
            </div>

            <div className="space-y-2"> 
              {stages.map((stage, index) => {
                const { hotPercent, coldPercent, conversionRate } = calculateComposition(index)
                const totalClients = stage.clientsHot + stage.clientsCold

                return (
                  <div key={stage.id} className="grid grid-cols-12 items-center relative z-10 group min-h-[90px]">
                    
                    {/* --- COLUMNA IZQUIERDA (REFERIDOS) --- */}
                    <div className="col-span-3 flex flex-col items-end pr-8 relative">
                      <div className="flex items-center gap-3">
                        <div className="flex flex-col items-end">
                            {/* Input grande */}
                            <input
                                type="number"
                                min="0"
                                value={stage.clientsHot}
                                onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                                className="w-20 text-right text-2xl font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-teal-500 focus:outline-none transition-colors p-0"
                            />
                            {/* Porcentaje lateral restaurado */}
                            <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded mt-1">
                                {totalClients === 0 ? '0%' : `${Math.round(hotPercent)}%`}
                            </span>
                        </div>
                        {/* Indicador visual */}
                        <div className="h-2 w-2 rounded-full bg-teal-400 shadow-[0_0_8px_rgba(45,212,191,0.6)] mt-[-15px]"></div>
                      </div>
                    </div>

                    {/* --- COLUMNA CENTRAL (EMBUDO LIMPIO) --- */}
                    <div className="col-span-6 flex flex-col items-center relative perspective-1000">
                      <div 
                        className={`relative ${stage.width} transition-all duration-500 ease-out -mb-5`} 
                        style={{ 
                          zIndex: 30 - index,
                          filter: 'drop-shadow(0px 8px 12px rgba(0,0,0,0.15))'
                        }} 
                      >
                        <div 
                          className={`${stage.tailwindColor} relative overflow-hidden`}
                          style={{
                              clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)',
                              height: '100px', // Altura aumentada para mejor espacio
                              display: 'flex',
                              flexDirection: 'column',
                              justifyContent: 'flex-start', // Alineado arriba para dejar espacio a la barra
                              paddingTop: '16px',
                              alignItems: 'center'
                          }}
                        >
                          {/* Brillo superior */}
                          <div className="absolute top-0 inset-x-0 h-[1px] bg-white/40 z-20"></div>

                          {/* TEXTO DE LA ETAPA (Sin obstrucciones) */}
                          <div className="relative z-30 text-center w-full px-4 mb-1">
                            <h3 className="text-white font-extrabold text-lg tracking-wide drop-shadow-md leading-none mb-1">
                              {stage.label}
                            </h3>
                            
                            <div className="flex items-center justify-center gap-2 text-white/95 text-sm font-medium">
                              <span className="flex items-center gap-1">
                                <UserIcon />
                                {totalClients}
                              </span>
                              {/* Tasa de conversión (si no es la primera etapa) */}
                              {index > 0 && (
                                <>
                                  <span className="opacity-50 mx-1">|</span>
                                  <span className="text-xs opacity-90">{conversionRate}% conv.</span>
                                </>
                              )}
                            </div>
                          </div>

                          {/* BARRA DE PROGRESO (HOT vs COLD) - Moviéndola abajo */}
                          {totalClients > 0 && (
                            <div className="mt-auto mb-3 w-[70%] h-2 bg-black/20 rounded-full overflow-hidden backdrop-blur-sm z-30 border border-white/10 flex">
                              {/* Parte Hot (Blanco Brillante) */}
                              <div 
                                className="h-full bg-white shadow-[0_0_10px_white] transition-all duration-700"
                                style={{ width: `${hotPercent}%` }}
                              />
                              {/* Parte Cold (Transparente oscurecido) */}
                              <div 
                                className="h-full bg-slate-900/40 transition-all duration-700"
                                style={{ width: `${coldPercent}%` }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* --- COLUMNA DERECHA (BASES FRÍAS) --- */}
                    <div className="col-span-3 flex justify-start pl-8 relative">
                      <div className="flex items-center gap-3">
                        {/* Indicador visual */}
                        <div className="h-2 w-2 rounded-full bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.6)] mt-[-15px]"></div>
                        
                        <div className="flex flex-col items-start">
                             {/* Input grande */}
                            <input
                                type="number"
                                min="0"
                                value={stage.clientsCold}
                                onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                                className="w-20 text-left text-2xl font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 focus:outline-none transition-colors p-0"
                            />
                             {/* Porcentaje lateral restaurado */}
                            <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1">
                                {totalClients === 0 ? '0%' : `${Math.round(coldPercent)}%`}
                            </span>
                        </div>
                      </div>
                    </div>

                  </div>
                )
              })}
            </div>

            {/* LEYENDA */}
            <div className="mt-20 pt-8 border-t border-slate-100 flex justify-center gap-8 text-sm text-slate-500">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-teal-400"></div>
                <span>Clientes Referidos (Barra Blanca)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-indigo-400"></div>
                <span>Bases Frías (Barra Oscura)</span>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}