'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Save, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Award
} from 'lucide-react'

// --- DEFINICIÓN DE TIPOS ---
interface FunnelStage {
  id: number
  label: string
  clientsHot: number
  clientsCold: number
  color: string 
  gradientClasses: string
  shadowColor: string
  width: string
}

type AgentLevel = 'inicial' | 'intermedio' | 'experto'

interface ConversionRates {
  tasaciones: number
  captaciones: number
  reservas: number
  cierres: number
}

interface ConversionRatesByType {
  hot: ConversionRates // Referidos
  cold: ConversionRates // Bases Frías
}

interface SalesFunnelProps {
  onSave?: (data: FunnelStage[]) => void
  showHeader?: boolean
  externalHandleSave?: (fn: () => Promise<void>) => void
}

export default function SalesFunnel({ onSave, showHeader = true, externalHandleSave }: SalesFunnelProps) {
  // --- TASAS DE CONVERSIÓN POR NIVEL Y TIPO DE CLIENTE ---
  const conversionRatesByLevel: Record<AgentLevel, ConversionRatesByType> = {
    inicial: {
      hot: {
        tasaciones: 59,
        captaciones: 60,
        reservas: 45,
        cierres: 65
      },
      cold: {
        tasaciones: 14,
        captaciones: 29,
        reservas: 43,
        cierres: 63
      }
    },
    intermedio: {
      hot: {
        tasaciones: 65,
        captaciones: 70,
        reservas: 50,
        cierres: 80
      },
      cold: {
        tasaciones: 17,
        captaciones: 35,
        reservas: 40,
        cierres: 80
      }
    },
    experto: {
      hot: {
        tasaciones: 70,
        captaciones: 70,
        reservas: 65,
        cierres: 90
      },
      cold: {
        tasaciones: 0,
        captaciones: 0,
        reservas: 0,
        cierres: 0
      }
    }
  }

  // --- ESTADO INICIAL ---
  const [agentLevel, setAgentLevel] = useState<AgentLevel>('inicial')
  const [stages, setStages] = useState<FunnelStage[]>([
    { 
      id: 1, 
      label: 'Prospectos', 
      clientsHot: 100,
      clientsCold: 100,
      color: 'teal', 
      gradientClasses: 'bg-gradient-to-r from-teal-400 to-teal-600', 
      shadowColor: 'shadow-teal-500/20',
      width: 'w-full' 
    },
    { 
      id: 2, 
      label: 'Tasaciones', 
      clientsHot: 59, 
      clientsCold: 14, 
      color: 'indigo', 
      gradientClasses: 'bg-gradient-to-r from-indigo-500 to-indigo-700', 
      shadowColor: 'shadow-indigo-500/20',
      width: 'w-11/12' 
    },
    { 
      id: 3, 
      label: 'Captaciones', 
      clientsHot: 35, 
      clientsCold: 4, 
      color: 'rose', 
      gradientClasses: 'bg-gradient-to-r from-rose-500 to-rose-700', 
      shadowColor: 'shadow-rose-500/20',
      width: 'w-10/12' 
    },
    { 
      id: 4, 
      label: 'Reservas', 
      clientsHot: 16, 
      clientsCold: 2, 
      color: 'emerald', 
      gradientClasses: 'bg-gradient-to-r from-emerald-500 to-emerald-700', 
      shadowColor: 'shadow-emerald-500/20',
      width: 'w-9/12' 
    },
    { 
      id: 5, 
      label: 'Cierres', 
      clientsHot: 10, 
      clientsCold: 1, 
      color: 'amber', 
      gradientClasses: 'bg-gradient-to-r from-amber-400 to-amber-600', 
      shadowColor: 'shadow-amber-500/20',
      width: 'w-8/12' 
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/sales-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          data: {
            stages,
            agentLevel
          } 
        }),
      })
      if (!response.ok) throw new Error('Error saving funnel data')
      if (onSave) onSave(stages)
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error saving sales funnel:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    if (externalHandleSave) {
      externalHandleSave(handleSave)
    }
  }, [externalHandleSave, stages, agentLevel])

  const recalculateStages = (prospectsCount: number, _referidosCount: number, friasCount: number, level: AgentLevel) => {
    const ratesHot = conversionRatesByLevel[level].hot
    const ratesCold = conversionRatesByLevel[level].cold
    const actualFriasCount = level === 'experto' ? 0 : friasCount;

    const tasacionesHot = Math.round((prospectsCount * ratesHot.tasaciones) / 100)
    const captacionesHot = Math.round((tasacionesHot * ratesHot.captaciones) / 100)
    const reservasHot = Math.round((captacionesHot * ratesHot.reservas) / 100)
    const cierresHot = Math.round((reservasHot * ratesHot.cierres) / 100)

    const tasacionesCold = Math.round((actualFriasCount * ratesCold.tasaciones) / 100)
    const captacionesCold = Math.round((tasacionesCold * ratesCold.captaciones) / 100)
    const reservasCold = Math.round((captacionesCold * ratesCold.reservas) / 100)
    const cierresCold = Math.round((reservasCold * ratesCold.cierres) / 100)

    return [
      { ...stages[0], clientsHot: prospectsCount, clientsCold: actualFriasCount },
      { ...stages[1], clientsHot: tasacionesHot, clientsCold: tasacionesCold },
      { ...stages[2], clientsHot: captacionesHot, clientsCold: captacionesCold },
      { ...stages[3], clientsHot: reservasHot, clientsCold: reservasCold },
      { ...stages[4], clientsHot: cierresHot, clientsCold: cierresCold },
    ]
  }

  const handleAgentLevelChange = (newLevel: AgentLevel) => {
    setAgentLevel(newLevel)
    const prospectsCount = stages[0].clientsHot
    const referidosCount = stages[4].clientsCold
    const friasCount = stages[0].clientsCold
    const newStages = recalculateStages(prospectsCount, referidosCount, friasCount, newLevel)
    setStages(newStages)
  }

  const loadData = async () => {
    try {
      const response = await fetch('/api/sales-funnel')
      if (response.ok) {
        const result = await response.json()
        if (result && result.data) {
          // Handle both old array format and new object format
          if (Array.isArray(result.data)) {
            setStages(result.data)
          } else if (result.data.stages) {
            setStages(result.data.stages)
            if (result.data.agentLevel) {
              setAgentLevel(result.data.agentLevel)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error loading sales funnel:', error)
    }
  }

  const calculateComposition = (stageIndex: number) => {
    const stage = stages[stageIndex]
    const total = stage.clientsHot + stage.clientsCold
    const hotPercent = total === 0 ? 0 : (stage.clientsHot / total) * 100
    const coldPercent = total === 0 ? 0 : (stage.clientsCold / total) * 100

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
    if (agentLevel === 'experto' && field === 'clientsCold') return;
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0)
    if (stageId !== 1) return

    const updatedStages = stages.map(stage => {
      if (stage.id === stageId && (field === 'clientsHot' || field === 'clientsCold')) {
        return { ...stage, [field]: numValue }
      }
      return stage
    })

    const prospectsCount = updatedStages[0].clientsHot
    const friasCount = updatedStages[0].clientsCold
    const newStages = recalculateStages(prospectsCount, 0, friasCount, agentLevel)
    setStages(newStages)
  }

  const totalProspectos = stages[0].clientsHot + stages[0].clientsCold
  const totalCierres = stages[stages.length - 1].clientsHot + stages[stages.length - 1].clientsCold
  const conversionGlobal = totalProspectos > 0 ? Math.round((totalCierres / totalProspectos) * 100) : 0

  return (
    <div className={`${showHeader ? 'min-h-screen' : ''} bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10 font-sans`}>
      {/* CONTENEDOR PRINCIPAL: Usa slate-50 para que los bordes no sean blancos puros, igual que Finanzas */}
      {showHeader && (
        <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

          <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
              <div className="flex-1 w-full lg:w-auto">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                  <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                  <span className="text-xs sm:text-sm font-semibold text-white">Centro de Análisis</span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                  Mis <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Proyecciones</span>
                </h1>
                <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                  Visualiza el rendimiento de tu pipeline, analiza tasas de conversión y gestiona tus referidos en tiempo real.
                </p>
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base disabled:opacity-70"
                >
                  {isSaving ? <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" /> : <Save className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-110 transition-transform" />}
                  {isSaving ? 'Guardando...' : 'Guardar Cambios'}
                </button>
              </div>

              <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                      <Users className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-slate-300 mb-1">Total Pipeline</p>
                      <p className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">{totalProspectos}</p>
                    </div>
                  </div>
                </div>
                <div className="bg-white/10 backdrop-blur-xl rounded-xl sm:rounded-2xl lg:rounded-3xl p-4 sm:p-5 lg:p-6 border border-white/20 shadow-2xl">
                  <div className="flex items-center gap-2 sm:gap-3">
                    <div className="w-8 h-8 sm:w-10 sm:h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                      <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm text-slate-300 mb-1">Conversión Global</p>
                      <p className="text-base sm:text-xl lg:text-2xl font-bold text-white truncate">{conversionGlobal}%</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- SELECTOR DE NIVEL --- */}
      <div className="relative bg-gradient-to-b from-slate-50 via-blue-50/20 to-indigo-50/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg border border-slate-200/60 p-6 sm:p-8">
            <label className="block text-sm sm:text-base font-semibold text-slate-700 mb-4">Selecciona tu nivel de Agente:</label>
            <div className="grid grid-cols-3 gap-3 sm:gap-4">
              {(['inicial', 'intermedio', 'experto'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleAgentLevelChange(level)}
                  className={`px-4 sm:px-6 py-3 sm:py-4 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 flex items-center justify-center gap-2 ${
                    agentLevel === level
                      ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/50 ring-2 ring-blue-300'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-300'
                  }`}
                >
                  <Award className="w-4 h-4 sm:w-5 sm:h-5" />
                  {level.charAt(0).toUpperCase() + level.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- CUERPO PRINCIPAL --- */}
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        <div className="bg-white rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xl border border-slate-200/60 p-6 sm:p-12 relative overflow-hidden">
          <div className="grid grid-cols-12 mb-12 text-xs font-bold text-slate-400 uppercase tracking-widest text-center opacity-70">
            <div className="col-span-3 text-right pr-12">Referidos (Hot)</div>
            <div className="col-span-6">Funnel de Conversión</div>
            <div className="col-span-3 text-left pl-12">Bases Frías (Cold)</div>
          </div>

          <div className="space-y-0">
            {stages.map((stage, index) => {
              const { hotPercent, coldPercent, conversionRate } = calculateComposition(index)
              const totalClients = stage.clientsHot + stage.clientsCold

              return (
                <div 
                  key={stage.id} 
                  className={`grid grid-cols-12 items-center relative z-10 group transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  <div className="col-span-3 flex justify-end pr-8 relative">
                    <div className="flex flex-col items-end group-hover:-translate-x-2 transition-transform duration-300">
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsHot}
                          onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                          disabled={index !== 0}
                          className={`w-24 text-right text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-200 transition-colors ${
                            index === 0 ? 'text-slate-700 hover:text-cyan-600 cursor-text' : 'text-slate-400 cursor-not-allowed opacity-60'
                          }`}
                        />
                        <div className="absolute top-1/2 -right-6 w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)] ring-4 ring-white"></div>
                      </div>
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded mt-1">
                        {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                      </span>
                    </div>
                  </div>

                  <div className="col-span-6 flex flex-col items-center relative perspective-[1000px]">
                    <div 
                      className={`relative ${stage.width} transition-all duration-500 ease-out -mb-5 hover:scale-[1.02]`} 
                      style={{ 
                        zIndex: 30 - index,
                        filter: `drop-shadow(0px 15px 25px rgba(0,0,0,0.15))`
                      }} 
                    >
                      <div 
                        className={`${stage.gradientClasses} relative overflow-hidden shadow-inner`}
                        style={{
                            clipPath: 'polygon(0 0, 100% 0, 93% 100%, 7% 100%)', 
                            height: '140px',
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingTop: '24px'
                        }}
                      >
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-white/60 z-20"></div>
                        <div className="absolute top-0 inset-x-0 h-10 bg-gradient-to-b from-white/20 to-transparent z-10 pointer-events-none"></div>

                        <div className="relative z-30 text-center w-full px-4">
                          <h3 className="text-white font-extrabold text-2xl tracking-wide drop-shadow-md mb-1">{stage.label}</h3>
                          <div className="flex items-center justify-center gap-3 text-white/95 text-sm font-medium mt-1">
                            <span className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full backdrop-blur-sm border border-white/10 shadow-sm">
                              <Users className="w-3.5 h-3.5" />
                              {totalClients}
                            </span>
                            {index > 0 && (
                              <span className="flex items-center gap-1 opacity-90 text-xs bg-white/10 px-2 py-1 rounded-full">
                                <ArrowRight className="w-3 h-3" />
                                {conversionRate}% conv.
                              </span>
                            )}
                          </div>
                        </div>

                        {totalClients > 0 && (
                          <div className="absolute bottom-6 w-[60%] h-2.5 bg-slate-900/30 rounded-full overflow-hidden backdrop-blur-md z-30 border border-white/10 flex shadow-inner">
                            <div 
                              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                              style={{ width: `${hotPercent}%` }} 
                            />
                            <div 
                              className="h-full bg-transparent transition-all duration-700"
                              style={{ width: `${coldPercent}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex justify-start pl-8 relative">
                    <div className="flex flex-col items-start group-hover:translate-x-2 transition-transform duration-300">
                      <div className="relative">
                        <div className={`absolute top-1/2 -left-6 w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(99,102,241,0.6)] ring-4 ring-white ${agentLevel === 'experto' ? 'bg-slate-300' : 'bg-indigo-500'}`}></div>
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsCold}
                          onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                          disabled={index !== 0 || agentLevel === 'experto'}
                          className={`w-24 text-left text-3xl font-bold bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-200 transition-colors ${
                            index === 0 && agentLevel !== 'experto' ? 'text-slate-700 hover:text-indigo-600 cursor-text' : 'text-slate-400 cursor-not-allowed opacity-60'
                          }`}
                        />
                      </div>
                      <span className={`text-xs font-bold px-2 py-0.5 rounded mt-1 ${agentLevel === 'experto' ? 'text-slate-400 bg-slate-50' : 'text-indigo-600 bg-indigo-50'}`}>
                        {totalClients === 0 || agentLevel === 'experto' ? '0%' : `${Math.round(coldPercent)}%`}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="mt-20 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-slate-500 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
              <span>Referidos (Barra Blanca)</span>
            </div>
            <div className={`flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100 ${agentLevel === 'experto' ? 'opacity-50 grayscale' : ''}`}>
              <div className={`w-3 h-3 rounded-full shadow-[0_0_8px_rgba(99,102,241,0.8)] ${agentLevel === 'experto' ? 'bg-slate-400 shadow-none' : 'bg-indigo-500'}`}></div>
              <span>Bases Frías {agentLevel === 'experto' && '(Inhabilitado)'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
