'use client'

import { useState, useEffect } from 'react'
import { 
  BarChart3, 
  Save, 
  Users, 
  TrendingUp, 
  ArrowRight,
  Loader2,
  Share2
} from 'lucide-react'

// --- DEFINICIÓN DE TIPOS ---
interface FunnelStage {
  id: number
  label: string
  clientsHot: number
  clientsCold: number
  color: string // Identificador base del color
  gradientClasses: string // Clases de Tailwind para el gradiente
  shadowColor: string // Color para la sombra (glow)
  width: string
}

interface SalesFunnelProps {
  onSave?: (data: FunnelStage[]) => void
}

export default function SalesFunnel({ onSave }: SalesFunnelProps) {
  // --- ESTADO INICIAL ---
  const [stages, setStages] = useState<FunnelStage[]>([
    { 
      id: 1, 
      label: 'Prospectos', 
      clientsHot: 20, 
      clientsCold: 0, 
      color: 'teal', 
      gradientClasses: 'bg-gradient-to-r from-teal-400 to-teal-600', 
      shadowColor: 'shadow-teal-500/30',
      width: 'w-full' 
    },
    { 
      id: 2, 
      label: 'Tasaciones', 
      clientsHot: 13, 
      clientsCold: 0, 
      color: 'indigo', 
      gradientClasses: 'bg-gradient-to-r from-indigo-500 to-indigo-700', 
      shadowColor: 'shadow-indigo-500/30',
      width: 'w-11/12' 
    },
    { 
      id: 3, 
      label: 'Captaciones', 
      clientsHot: 9, 
      clientsCold: 1, 
      color: 'rose', 
      gradientClasses: 'bg-gradient-to-r from-rose-500 to-rose-700', 
      shadowColor: 'shadow-rose-500/30',
      width: 'w-10/12' 
    },
    { 
      id: 4, 
      label: 'Reservas', 
      clientsHot: 4, 
      clientsCold: 2, 
      color: 'emerald', 
      gradientClasses: 'bg-gradient-to-r from-emerald-500 to-emerald-700', 
      shadowColor: 'shadow-emerald-500/30',
      width: 'w-9/12' 
    },
    { 
      id: 5, 
      label: 'Cierres', 
      clientsHot: 3, 
      clientsCold: 2, 
      color: 'amber', 
      gradientClasses: 'bg-gradient-to-r from-amber-400 to-amber-600', 
      shadowColor: 'shadow-amber-500/30',
      width: 'w-8/12' 
    },
  ])

  const [isSaving, setIsSaving] = useState(false)
  const [mounted, setMounted] = useState(false)

  // Efecto de montaje para animaciones
  useEffect(() => {
    setMounted(true)
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const response = await fetch('/api/sales-funnel')
      if (response.ok) {
        const result = await response.json()
        if (result.data && Array.isArray(result.data) && result.data.length > 0) {
          // Mapeamos los datos guardados a la estructura visual si es necesario
          // (Asumiendo que el backend devuelve la misma estructura)
          setStages(result.data)
        }
      }
    } catch (error) {
      console.error('Error loading sales funnel:', error)
    }
  }

  // --- LÓGICA DE NEGOCIO ---

  // Calcula porcentajes visuales y tasa de conversión
  const calculateComposition = (stageIndex: number) => {
    const stage = stages[stageIndex]
    const total = stage.clientsHot + stage.clientsCold

    // Porcentaje visual para la barra (Hot vs Cold)
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
      const response = await fetch('/api/sales-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stages }),
      })

      if (!response.ok) throw new Error('Error saving funnel data')

      if (onSave) onSave(stages)
      // Simulamos un pequeño delay para feedback visual
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      console.error('Error saving sales funnel:', error)
      alert('Error al guardar los datos')
    } finally {
      setIsSaving(false)
    }
  }

  // Calculo de totales para tarjetas resumen
  const totalProspectos = stages[0].clientsHot + stages[0].clientsCold
  const totalCierres = stages[stages.length - 1].clientsHot + stages[stages.length - 1].clientsCold
  const conversionGlobal = totalProspectos > 0 ? Math.round((totalCierres / totalProspectos) * 100) : 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 font-sans">
      
      {/* --- HEADER ESTANDARIZADO (Igual que Newsletter/Finanzas) --- */}
      <div className="relative overflow-hidden">
        {/* Decorative Background Elements */}
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-3xl"></div>
        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-cyan-400/10 to-blue-400/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            
            {/* Título y Descripción */}
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6 animate-in slide-in-from-left duration-500">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Centro de Análisis</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight animate-in slide-in-from-bottom duration-500 delay-100">
                Proyecciones <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Comerciales</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed animate-in slide-in-from-bottom duration-500 delay-200">
                Visualiza el rendimiento de tu pipeline, analiza tasas de conversión y gestiona tus referidos en tiempo real.
              </p>

              {/* Botón Guardar Estilo Premium */}
              <button
                onClick={handleSave}
                disabled={isSaving}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base disabled:opacity-70 animate-in fade-in duration-700 delay-300"
              >
                {isSaving ? (
                  <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin text-blue-600" />
                ) : (
                  <Save className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                )}
                {isSaving ? 'Guardando...' : 'Guardar Cambios'}
              </button>
            </div>

            {/* Tarjetas Resumen Header (Estilo Finanzas) */}
            <div className="w-full lg:w-auto grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 animate-in slide-in-from-right duration-700 delay-200">
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-cyan-500/20 rounded-xl flex items-center justify-center">
                    <Users className="w-5 h-5 text-cyan-300" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 mb-0.5">Total Pipeline</p>
                    <p className="text-xl font-bold text-white">{totalProspectos}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-xl rounded-xl p-4 sm:p-5 border border-white/10 shadow-xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-500/20 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-emerald-300" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-300 mb-0.5">Conversión Global</p>
                    <p className="text-xl font-bold text-white">{conversionGlobal}%</p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* --- BODY: EL EMBUDO --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8 relative z-10">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 p-6 sm:p-12 relative overflow-hidden">
          
          {/* Etiquetas de Columnas */}
          <div className="grid grid-cols-12 mb-10 text-xs font-bold text-slate-400 uppercase tracking-widest text-center opacity-70">
            <div className="col-span-3 text-right pr-12">Referidos (Hot)</div>
            <div className="col-span-6">Funnel de Conversión</div>
            <div className="col-span-3 text-left pl-12">Bases Frías (Cold)</div>
          </div>

          <div className="space-y-2">
            {stages.map((stage, index) => {
              const { hotPercent, coldPercent, conversionRate } = calculateComposition(index)
              const totalClients = stage.clientsHot + stage.clientsCold

              return (
                // Fila Grid Principal
                <div 
                  key={stage.id} 
                  className={`grid grid-cols-12 items-center relative z-10 group transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
                  style={{ transitionDelay: `${index * 100}ms` }}
                >
                  
                  {/* --- COLUMNA IZQUIERDA: REFERIDOS --- */}
                  <div className="col-span-3 flex justify-end pr-8 relative">
                    <div className="flex flex-col items-end group-hover:-translate-x-2 transition-transform duration-300">
                      {/* Input Gigante sin bordes */}
                      <div className="relative">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsHot}
                          onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                          className="w-24 text-right text-3xl font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-200 hover:text-cyan-600 transition-colors"
                        />
                        {/* Dot indicador */}
                        <div className="absolute top-1/2 -right-4 w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.6)]"></div>
                      </div>
                      
                      {/* Porcentaje debajo */}
                      <span className="text-xs font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded mt-1">
                        {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                      </span>
                    </div>
                  </div>

                  {/* --- COLUMNA CENTRAL: EL EMBUDO VISUAL --- */}
                  <div className="col-span-6 flex flex-col items-center relative perspective-[1000px]">
                    <div 
                      className={`relative ${stage.width} transition-all duration-500 ease-out -mb-6 hover:scale-[1.02]`} 
                      style={{ 
                        zIndex: 30 - index,
                        // Sombra que sigue la forma general
                        filter: `drop-shadow(0px 12px 20px rgba(0,0,0,0.15))` 
                      }} 
                    >
                      <div 
                        className={`${stage.gradientClasses} relative overflow-hidden shadow-inner`}
                        style={{
                            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 8% 100%)', // Trapecio
                            height: '110px', // Altura generosa para contenido
                            display: 'flex',
                            flexDirection: 'column',
                            justifyContent: 'flex-start',
                            alignItems: 'center',
                            paddingTop: '20px'
                        }}
                      >
                        {/* 1. Borde de Luz Superior (Glass Effect) */}
                        <div className="absolute top-0 inset-x-0 h-[1px] bg-white/50 z-20"></div>
                        <div className="absolute top-0 inset-x-0 h-6 bg-gradient-to-b from-white/20 to-transparent z-10 pointer-events-none"></div>

                        {/* 2. Contenido de Texto (Centrado y legible) */}
                        <div className="relative z-30 text-center w-full px-4">
                          <h3 className="text-white font-extrabold text-xl tracking-wide drop-shadow-md mb-1">
                            {stage.label}
                          </h3>
                          
                          <div className="flex items-center justify-center gap-3 text-white/95 text-sm font-medium">
                            {/* Icono Usuario y Total */}
                            <span className="flex items-center gap-1.5 bg-black/10 px-2 py-0.5 rounded-md backdrop-blur-sm border border-white/10">
                              <Users className="w-3.5 h-3.5" />
                              {totalClients}
                            </span>

                            {/* Tasa de conversión (si no es el primero) */}
                            {index > 0 && (
                              <span className="flex items-center gap-1 opacity-90 text-xs">
                                <ArrowRight className="w-3 h-3 opacity-70" />
                                {conversionRate}% conv.
                              </span>
                            )}
                          </div>
                        </div>

                        {/* 3. Barra de Progreso Interna (Hot vs Cold) - Restaurada */}
                        {totalClients > 0 && (
                          <div className="absolute bottom-4 w-[70%] h-2.5 bg-slate-900/30 rounded-full overflow-hidden backdrop-blur-md z-30 border border-white/10 flex shadow-inner">
                            {/* Parte Blanca (Referidos) */}
                            <div 
                              className="h-full bg-white shadow-[0_0_15px_rgba(255,255,255,0.8)] transition-all duration-700 ease-out"
                              style={{ width: `${hotPercent}%` }} 
                            />
                            {/* Parte Transparente/Oscura (Fríos) */}
                            <div 
                              className="h-full bg-transparent transition-all duration-700"
                              style={{ width: `${coldPercent}%` }} 
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* --- COLUMNA DERECHA: BASES FRÍAS --- */}
                  <div className="col-span-3 flex justify-start pl-8 relative">
                    <div className="flex flex-col items-start group-hover:translate-x-2 transition-transform duration-300">
                      {/* Input Gigante sin bordes */}
                      <div className="relative">
                        <div className="absolute top-1/2 -left-4 w-2 h-2 rounded-full bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.6)]"></div>
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsCold}
                          onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                          className="w-24 text-left text-3xl font-bold text-slate-700 bg-transparent border-none outline-none focus:ring-0 p-0 placeholder-gray-200 hover:text-indigo-600 transition-colors"
                        />
                      </div>

                      {/* Porcentaje debajo */}
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded mt-1">
                        {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                      </span>
                    </div>
                  </div>

                </div>
              )
            })}
          </div>

          {/* --- FOOTER / LEYENDA --- */}
          <div className="mt-24 pt-8 border-t border-slate-100 flex flex-col sm:flex-row justify-center items-center gap-8 text-sm text-slate-500 animate-in fade-in duration-700 delay-500">
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.8)]"></div>
              <span>Referidos (Barra Blanca)</span>
            </div>
            <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-full border border-slate-100">
              <div className="w-3 h-3 rounded-full bg-indigo-500 shadow-[0_0_8px_rgba(99,102,241,0.8)]"></div>
              <span>Bases Frías (Fondo Oscuro)</span>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}