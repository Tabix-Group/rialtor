'use client'

import { useState, useEffect } from 'react'

interface FunnelStage {
  id: number
  label: string
  clientsHot: number
  clientsCold: number
  // 'color' se mantiene por compatibilidad, pero usamos 'tailwindColor' para el visual
  color: string
  tailwindColor: string
  width: string
}

interface SalesFunnelProps {
  onSave?: (data: FunnelStage[]) => void
}

export default function SalesFunnel({ onSave }: SalesFunnelProps) {
  // 1. ESTADO ACTUALIZADO CON DEGRADADOS (GRADIENTS)
  const [stages, setStages] = useState<FunnelStage[]>([
    { 
      id: 1, 
      label: 'Prospectos', 
      clientsHot: 20, 
      clientsCold: 0, 
      color: 'teal', 
      tailwindColor: 'bg-gradient-to-r from-teal-400 to-teal-600', 
      width: 'w-full' 
    },
    { 
      id: 2, 
      label: 'Tasaciones', 
      clientsHot: 13, 
      clientsCold: 0, 
      color: 'indigo', 
      tailwindColor: 'bg-gradient-to-r from-indigo-500 to-indigo-700', 
      width: 'w-11/12' 
    },
    { 
      id: 3, 
      label: 'Captaciones', 
      clientsHot: 9, 
      clientsCold: 1, 
      color: 'red', 
      tailwindColor: 'bg-gradient-to-r from-rose-500 to-rose-700', 
      width: 'w-10/12' 
    },
    { 
      id: 4, 
      label: 'Reservas', 
      clientsHot: 4, 
      clientsCold: 2, 
      color: 'green', 
      tailwindColor: 'bg-gradient-to-r from-emerald-500 to-emerald-700', 
      width: 'w-9/12' 
    },
    { 
      id: 5, 
      label: 'Cierres', 
      clientsHot: 3, 
      clientsCold: 2, 
      color: 'yellow', 
      tailwindColor: 'bg-gradient-to-r from-amber-400 to-amber-600', 
      width: 'w-8/12' 
    },
  ])

  const [isSaving, setIsSaving] = useState(false)

  // --- LÓGICA DE NEGOCIO (INTACTA) ---
  const calculateComposition = (stageIndex: number) => {
    const stage = stages[stageIndex]
    const total = stage.clientsHot + stage.clientsCold

    if (total === 0) {
      return { hotPercent: 0, coldPercent: 0 }
    }

    const hotPercent = (stage.clientsHot / total) * 100
    const coldPercent = (stage.clientsCold / total) * 100

    return { hotPercent, coldPercent }
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
      const response = await fetch('/api/sales-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stages }),
      })

      if (!response.ok) throw new Error('Error saving funnel data')

      if (onSave) onSave(stages)
    } catch (error) {
      console.error('Error saving sales funnel:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/sales-funnel')
        if (response.ok) {
          const result = await response.json()
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            setStages(result.data)
          }
        }
      } catch (error) {
        console.error('Error loading sales funnel:', error)
      }
    }
    loadData()
  }, [])

  return (
    <div className="w-full font-sans">
      {/* HEADER */}
      <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-6 py-12 sm:px-8 sm:py-16 rounded-t-2xl shadow-xl">
        <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-start">
          <div>
            <div className="mb-4 inline-block rounded-full bg-blue-700/50 px-4 py-2 backdrop-blur border border-blue-500/30">
              <p className="text-sm font-semibold text-blue-100">📊 Centro de Análisis</p>
            </div>
            <h1 className="text-4xl font-bold text-white sm:text-5xl tracking-tight">
              Mis <span className="text-cyan-400">Proyecciones</span>
            </h1>
            <p className="mt-3 max-w-2xl text-base text-blue-100 sm:text-lg opacity-90">
              Visualiza y gestiona tu pipeline de ventas en tiempo real.
            </p>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-lg transition-all hover:bg-blue-50 hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 sm:w-auto flex items-center justify-center gap-2"
          >
            <span>💾</span>
            {isSaving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="bg-gray-50 py-6 min-h-[600px]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-b-2xl border border-t-0 border-gray-200 bg-white p-4 shadow-sm sm:p-12">
            <div className="space-y-8">
              
              {/* --- DESKTOP LAYOUT (PREMIUM LOOK) --- */}
              <div className="hidden lg:block pt-8 pb-4">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    // relative z-10 para manejar el stacking
                    <div key={stage.id} className={`grid grid-cols-3 items-center gap-6 relative z-10 ${index === stages.length - 1 ? 'pb-6' : 'mb-0'}`}>
                      
                      {/* LÍNEA CONECTORA IZQUIERDA (Decorativa) */}
                      <div className="absolute left-[28%] top-1/2 w-[10%] border-t-2 border-dashed border-gray-200 -translate-y-1/2 z-0 hidden xl:block opacity-60" />

                      {/* COLUMNA IZQUIERDA (Inputs) */}
                      <div className="flex flex-col items-end pr-8 relative z-10">
                        <div className="mb-1 flex w-full flex-col items-end group">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsHot}
                            onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                            className="w-24 rounded border-b-2 border-transparent bg-transparent text-right text-2xl font-bold text-gray-800 outline-none transition-all hover:bg-gray-50 focus:border-teal-500 focus:bg-gray-50"
                          />
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Referidos</span>
                        </div>
                        <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full transition-colors ${totalClients > 0 ? 'bg-teal-50 text-teal-700' : 'bg-gray-100 text-gray-400'}`}>
                          {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                        </div>
                      </div>

                      {/* COLUMNA CENTRAL (Embudo Geométrico) */}
                      <div className="flex flex-col items-center relative group perspective-1000">
                        <div 
                          className={`relative ${stage.width} transition-transform duration-300 hover:scale-[1.02] drop-shadow-xl -mb-7`} 
                          style={{ zIndex: 20 - index }} 
                        >
                          <div 
                            className={`${stage.tailwindColor} shadow-inner transition-all overflow-hidden rounded-none`}
                            style={{
                                // Geometría Trapezoidal
                                clipPath: 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)',
                                height: '85px', 
                                display: 'flex',
                                flexDirection: 'column',
                                justifyContent: 'center'
                            }}
                          >
                            {/* Efecto Rim Light (Borde de luz superior) */}
                            <div className="absolute top-0 left-0 w-full h-px bg-white/40" />
                            <div className="absolute top-0 left-0 w-full h-4 bg-gradient-to-b from-white/10 to-transparent" />
                            
                            {/* Barra de progreso sutil interna */}
                            <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
                               <div className="h-full bg-black/30" style={{ width: `${coldPercent}%`, marginLeft: `${hotPercent}%` }} />
                            </div>

                            {/* Contenido Texto */}
                            <div className="px-4 text-center z-10 pt-1">
                              <p className="font-extrabold text-white text-lg tracking-wide drop-shadow-md filter">
                                {stage.label}
                              </p>
                              <p className="text-center text-xs text-white/90 font-medium mt-0.5">
                                {totalClients} clientes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* LÍNEA CONECTORA DERECHA (Decorativa) */}
                      <div className="absolute right-[28%] top-1/2 w-[10%] border-t-2 border-dashed border-gray-200 -translate-y-1/2 z-0 hidden xl:block opacity-60" />

                      {/* COLUMNA DERECHA (Inputs) */}
                      <div className="flex flex-col items-start pl-8 relative z-10">
                        <div className="mb-1 flex w-full flex-col items-start group">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsCold}
                            onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                            className="w-24 rounded border-b-2 border-transparent bg-transparent text-left text-2xl font-bold text-gray-800 outline-none transition-all hover:bg-gray-50 focus:border-indigo-500 focus:bg-gray-50"
                          />
                          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mt-1">Bases frías</span>
                        </div>
                        <div className={`mt-2 text-xs font-bold px-3 py-1 rounded-full transition-colors ${totalClients > 0 ? 'bg-indigo-50 text-indigo-700' : 'bg-gray-100 text-gray-400'}`}>
                          {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* --- TABLET LAYOUT (Simplificado pero con colores correctos) --- */}
              <div className="hidden md:block lg:hidden">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    <div key={stage.id} className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4 hover:shadow-md transition-shadow">
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsHot}
                          onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                          className="w-16 bg-transparent text-center text-lg font-bold text-teal-600 outline-none border-b border-transparent focus:border-teal-500"
                        />
                        <span className="text-[10px] uppercase text-gray-400 font-bold">Referidos</span>
                        <span className="text-xs font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded">
                          {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                        </span>
                      </div>

                      <div className={`${stage.width} flex-1 px-4`}>
                        <div className={`${stage.tailwindColor} rounded-lg overflow-hidden shadow-lg`}>
                          <div className="flex h-1.5 w-full">
                            <div className="bg-white/40" style={{ width: `${hotPercent}%` }} />
                            <div className="bg-black/20" style={{ width: `${coldPercent}%` }} />
                          </div>
                          <div className="px-3 py-3 text-center">
                            <p className="font-bold text-white text-sm">{stage.label}</p>
                            <p className="text-xs text-white/90">{totalClients} clientes</p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsCold}
                          onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                          className="w-16 bg-transparent text-center text-lg font-bold text-indigo-600 outline-none border-b border-transparent focus:border-indigo-500"
                        />
                        <span className="text-[10px] uppercase text-gray-400 font-bold">Bases Frías</span>
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                          {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* --- MOBILE LAYOUT (Cards Verticales) --- */}
              <div className="space-y-4 md:hidden">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    <div key={stage.id} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                      <div className="mb-4 flex justify-center">
                        <div className={`w-full ${stage.width}`}>
                          <div className={`${stage.tailwindColor} rounded-lg overflow-hidden shadow-md`}>
                            <div className="flex h-2 w-full">
                              <div className="bg-white/40" style={{ width: `${hotPercent}%` }} />
                              <div className="bg-black/20" style={{ width: `${coldPercent}%` }} />
                            </div>
                            <div className="px-4 py-3 text-center">
                              <p className="font-bold text-white text-sm">{stage.label}</p>
                              <p className="text-xs text-white/90">{totalClients} clientes</p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <label className="text-[10px] font-bold uppercase text-gray-400">Referidos</label>
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsHot}
                            onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                            className="mt-1 w-full bg-transparent text-center text-xl font-bold text-teal-600 outline-none"
                          />
                          <div className="mt-1 text-xs font-bold text-teal-600">
                            {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                          </div>
                        </div>

                        <div className="rounded-lg bg-gray-50 p-3 text-center">
                          <label className="text-[10px] font-bold uppercase text-gray-400">Bases Frías</label>
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsCold}
                            onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                            className="mt-1 w-full bg-transparent text-center text-xl font-bold text-indigo-600 outline-none"
                          />
                          <div className="mt-1 text-xs font-bold text-indigo-600">
                            {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* FOOTER STATS */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
              {stages.map((stage) => (
                <div key={stage.id} className="rounded-lg border border-gray-100 bg-white p-3 sm:p-4 shadow-sm hover:shadow-md transition-all">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wide">{stage.label}</p>
                  <p className="mt-1 text-2xl font-extrabold text-gray-900">
                    {stage.clientsHot + stage.clientsCold}
                  </p>
                  <div className="mt-2 flex gap-1 text-[10px] sm:gap-2 font-medium">
                    <span className="inline-block rounded-full bg-teal-100 px-2 py-0.5 text-teal-700 truncate">
                      {stage.clientsHot} Ref
                    </span>
                    <span className="inline-block rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-700 truncate">
                      {stage.clientsCold} Frío
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}