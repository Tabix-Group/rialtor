"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, RefreshCw, Info, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import RealEstateCommissions from "@/components/RealEstateCommissions"
import NetworkNegotiationIndicators from "@/components/NetworkNegotiationIndicators"

interface DolarRate {
  compra: number
  venta: number
  variacion: number
  fechaActualizacion: string
}

interface DolarData {
  oficial: DolarRate
  blue: DolarRate
  tarjeta: DolarRate
  lastUpdated: string
}

interface RealEstateZone {
  nombre: string
  precio: number
  variacion: number
}

interface RealEstateRegion {
  venta: number
  alquiler: number
  variacion: number
  zonas: RealEstateZone[]
}

interface Escrituraciones {
  cantidad: number
  variacionMensual: number
  variacionAnual: number
  promedioOperacion: number
}

interface RealEstateData {
  precioM2: {
    caba: RealEstateRegion
    buenosAires: RealEstateRegion
  }
  escrituraciones: {
    caba: Escrituraciones
    buenosAires: Escrituraciones
  }
  tendencias: {
    demandaAlquiler: string
    demandaVenta: string
    stockDisponible: string
    tiempoPromedioVenta: number
  }
  lastUpdated: string
  source?: string
}

interface IndicatorsData {
  dolar: DolarData
  mercadoInmobiliario: RealEstateData
  timestamp: string
}

interface EconomicIndex {
  nombre: string
  valor: number
  variacion: number
  fecha: string
  descripcion: string
}

interface EconomicIndexesData {
  ipc: EconomicIndex
  inflacion: EconomicIndex
  cacGeneral: EconomicIndex
  cacMateriales: EconomicIndex
  cacManoObra: EconomicIndex
  icc: EconomicIndex
  is: EconomicIndex
  uva: EconomicIndex
  lastUpdated: string
  dataSource?: string
}

interface ChartDataPoint {
  fecha: string
  valor: number
}

interface EconomicIndexChartData {
  data: ChartDataPoint[]
  indicador: string
  periodo: string
}

export default function IndicadoresPage() {
  const [data, setData] = useState<IndicatorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)
  const [economicIndexes, setEconomicIndexes] = useState<EconomicIndexesData | null>(null)
  const [economicCharts, setEconomicCharts] = useState<Record<string, EconomicIndexChartData>>({})
  const [dollarCharts, setDollarCharts] = useState<Record<string, EconomicIndexChartData>>({})
  const [selectedDollarChart, setSelectedDollarChart] = useState<string | null>(null)
  const [selectedDollarPeriod, setSelectedDollarPeriod] = useState<string>('30d')

  const fetchIndicators = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch("/api/indicators/all")
      
      if (!response.ok) {
        throw new Error("Error al obtener los indicadores")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setData(result.data)
        setLastUpdate(new Date())
      }
    } catch (err) {
      console.error("Error fetching indicators:", err)
      setError("No se pudieron cargar los indicadores")
    } finally {
      setLoading(false)
    }
  }

  const fetchEconomicIndexes = async () => {
    try {
      const response = await fetch("/api/indicators/economic-indexes")
      
      if (!response.ok) {
        throw new Error("Error al obtener los índices económicos")
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setEconomicIndexes(result.data)
      }
    } catch (err) {
      console.error("Error fetching economic indexes:", err)
    }
  }

  const fetchEconomicIndexChart = async (indicator: string) => {
    try {
      const response = await fetch(`/api/indicators/economic-indexes/${indicator}/chart`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener el gráfico del índice ${indicator}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setEconomicCharts(prev => ({
          ...prev,
          [indicator]: result.data
        }))
      }
    } catch (err) {
      console.error(`Error fetching chart for ${indicator}:`, err)
    }
  }

  const fetchDollarChart = async (dollarType: string, period: string = '30d') => {
    try {
      const response = await fetch(`/api/indicators/dollar/${dollarType}/chart?period=${period}`)
      
      if (!response.ok) {
        throw new Error(`Error al obtener el gráfico del dólar ${dollarType}`)
      }

      const result = await response.json()
      
      if (result.success && result.data) {
        setDollarCharts(prev => ({
          ...prev,
          [dollarType]: result.data
        }))
        setSelectedDollarChart(dollarType)
        setSelectedDollarPeriod(period)
      }
    } catch (err) {
      console.error(`Error fetching chart for ${dollarType}:`, err)
    }
  }

  const changeDollarPeriod = async (period: string) => {
    if (selectedDollarChart) {
      await fetchDollarChart(selectedDollarChart, period)
    }
  }

  useEffect(() => {
    fetchIndicators()
    fetchEconomicIndexes()

    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      fetchIndicators()
      fetchEconomicIndexes()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [])

  const formatCurrency = (value: number, decimals = 2) => {
    return new Intl.NumberFormat("es-AR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    }).format(value)
  }

  const getVariationColor = (variation: number) => {
    if (variation > 0) return "text-red-500"
    if (variation < 0) return "text-green-500"
    return "text-muted-foreground"
  }

  const getVariationBgColor = (variation: number) => {
    if (variation > 0) return "bg-red-500/10"
    if (variation < 0) return "bg-green-500/10"
    return "bg-muted/50"
  }

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-4 h-4" />
    if (variation < 0) return <TrendingDown className="w-4 h-4" />
    return null
  }

  if (loading && !data) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="h-12 bg-muted rounded-lg w-1/3"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-48 bg-muted rounded-2xl"></div>
              <div className="h-48 bg-muted rounded-2xl"></div>
              <div className="h-48 bg-muted rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !data) {
    return (
      <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-destructive/10 text-destructive p-8 rounded-2xl text-center">
            <p className="text-lg mb-4">{error}</p>
            <button
              onClick={fetchIndicators}
              className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all"
            >
              <RefreshCw className="w-4 h-4" />
              Reintentar
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Centro de Análisis</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                Mis <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Indicadores</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Datos en tiempo real del mercado inmobiliario argentino. Cotizaciones, índices económicos y tendencias actualizadas.
              </p>

              {lastUpdate && (
                <p className="text-xs sm:text-sm text-slate-400 mb-4">
                  Última actualización: {lastUpdate.toLocaleString("es-AR")}
                </p>
              )}

              <button
                onClick={() => {
                  fetchIndicators()
                  fetchEconomicIndexes()
                }}
                disabled={loading}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? "animate-spin" : "group-hover:rotate-90"} transition-transform duration-300`} />
                Actualizar Datos
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* Cotizaciones del Dólar */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <DollarSign className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Cotizaciones del Dólar</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Dólar Oficial */}
            <div 
              className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
              onClick={() => fetchDollarChart('oficial')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dólar Oficial</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(data.dolar.oficial.variacion)}`}>
                  <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.dolar.oficial.variacion)}`}>
                    {getVariationIcon(data.dolar.oficial.variacion)}
                    {formatCurrency(Math.abs(data.dolar.oficial.variacion), 1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Compra</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.oficial.compra)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Venta</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.oficial.venta)}</span>
                </div>
              </div>
            </div>

            {/* Dólar Blue */}
            <div 
              className="bg-card border-2 border-primary/50 rounded-2xl p-6 hover:border-primary transition-all hover:shadow-lg cursor-pointer"
              onClick={() => fetchDollarChart('blue')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dólar Blue</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(data.dolar.blue.variacion)}`}>
                  <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.dolar.blue.variacion)}`}>
                    {getVariationIcon(data.dolar.blue.variacion)}
                    {formatCurrency(Math.abs(data.dolar.blue.variacion), 1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Compra</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.blue.compra)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Venta</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.blue.venta)}</span>
                </div>
              </div>
            </div>

            {/* Dólar Tarjeta */}
            <div 
              className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
              onClick={() => fetchDollarChart('tarjeta')}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Dólar Tarjeta</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(data.dolar.tarjeta.variacion)}`}>
                  <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.dolar.tarjeta.variacion)}`}>
                    {getVariationIcon(data.dolar.tarjeta.variacion)}
                    {formatCurrency(Math.abs(data.dolar.tarjeta.variacion), 1)}%
                  </span>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Compra</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.tarjeta.compra)}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Venta</span>
                  <span className="text-2xl font-bold">${formatCurrency(data.dolar.tarjeta.venta)}</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Gráficos del Dólar */}
        {selectedDollarChart && dollarCharts[selectedDollarChart] && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <BarChart3 className="w-5 h-5 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">
                  Histórico del Dólar {selectedDollarChart === 'oficial' ? 'Oficial' : selectedDollarChart === 'blue' ? 'Blue' : 'Tarjeta'}
                </h2>
              </div>
              
              {/* Selector de período */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">Período:</span>
                <div className="flex gap-1">
                  {[
                    { key: '7d', label: '7 días' },
                    { key: '30d', label: '30 días' },
                    { key: '90d', label: '90 días' },
                    { key: '1y', label: '1 año' }
                  ].map((period) => (
                    <button
                      key={period.key}
                      onClick={() => changeDollarPeriod(period.key)}
                      className={`px-3 py-1.5 text-sm rounded-full transition-all ${
                        selectedDollarPeriod === period.key
                          ? 'bg-primary text-primary-foreground font-medium'
                          : 'bg-muted hover:bg-muted/80 text-muted-foreground'
                      }`}
                    >
                      {period.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="bg-card border border-border rounded-2xl p-6">
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={dollarCharts[selectedDollarChart].data}>
                    <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                    <XAxis 
                      dataKey="fecha" 
                      tick={{ fontSize: 12 }}
                      tickFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { 
                        month: 'short', 
                        day: 'numeric',
                        ...(selectedDollarPeriod === '1y' && { year: '2-digit' })
                      })}
                    />
                    <YAxis 
                      tick={{ fontSize: 12 }}
                      domain={['dataMin - 1', 'dataMax + 1']}
                      tickFormatter={(value) => `$${formatCurrency(value)}`}
                    />
                    <Tooltip 
                      labelFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { 
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                      formatter={(value: number, name: string) => [
                        `$${formatCurrency(value)}`, 
                        name === 'compra' ? 'Compra' : 'Venta'
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="compra" 
                      stroke="#10b981" 
                      strokeWidth={2}
                      name="compra"
                      dot={{ fill: '#10b981', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#10b981', strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="venta" 
                      stroke="#ef4444" 
                      strokeWidth={2}
                      name="venta"
                      dot={{ fill: '#ef4444', strokeWidth: 2, r: 3 }}
                      activeDot={{ r: 5, stroke: '#ef4444', strokeWidth: 2 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <div className="flex items-center justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm text-muted-foreground">Compra</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm text-muted-foreground">Venta</span>
                </div>
              </div>
              <div className="text-xs text-muted-foreground mt-2 text-center">
                Período: {dollarCharts[selectedDollarChart].periodo}
              </div>
            </div>
          </section>
        )}

        {/* Índice UVA */}
        {economicIndexes && economicIndexes.uva && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-amber-600" />
              </div>
              <h2 className="text-2xl font-bold">Índice UVA</h2>
            </div>

            <div className="grid grid-cols-1 gap-6">
              <div 
                className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-6 hover:border-amber-300 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('uva')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">UVA (Unidad de Valor Adquisitivo)</h3>
                    <p className="text-sm text-gray-600 mt-1">{economicIndexes.uva.descripcion}</p>
                  </div>
                  {economicIndexes.uva.variacion !== null && (
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.uva.variacion)}`}>
                      <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.uva.variacion)}`}>
                        {getVariationIcon(economicIndexes.uva.variacion)}
                        {formatCurrency(Math.abs(economicIndexes.uva.variacion), 4)}%
                      </span>
                    </div>
                  )}
                </div>
                <div className="flex items-baseline gap-3">
                  <div className="text-4xl font-bold text-gray-900">${formatCurrency(economicIndexes.uva.valor, 2)}</div>
                  <div className="text-sm text-gray-500">
                    al {economicIndexes.uva.fecha ? new Date(economicIndexes.uva.fecha).toLocaleDateString("es-AR", { day: 'numeric', month: 'long', year: 'numeric' }) : 'N/A'}
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-amber-200">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Info className="w-4 h-4" />
                    <span>Utilizado principalmente en créditos hipotecarios UVA. Se actualiza diariamente según la inflación.</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Negociación */}
        <NetworkNegotiationIndicators />

        {/* KPI Cierres */}
        <section className="space-y-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold">KPI Cierres</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Ponderación mensual histórica de operaciones
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-6 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[
                { mes: "Ene", val: "4,72%" },
                { mes: "Feb", val: "5,41%" },
                { mes: "Mar", val: "7,12%" },
                { mes: "Abr", val: "6,82%" },
                { mes: "May", val: "8,41%" },
                { mes: "Jun", val: "9,15%" },
                { mes: "Jul", val: "8,66%" },
                { mes: "Ago", val: "9,64%" },
                { mes: "Sep", val: "9,42%" },
                { mes: "Oct", val: "9,65%" },
                { mes: "Nov", val: "9,78%" },
                { mes: "Dic", val: "11,21%" }
              ].map((item, idx) => (
                <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800 flex flex-col items-center justify-center text-center">
                  <span className="text-[10px] uppercase font-bold text-muted-foreground mb-1">{item.mes}</span>
                  <span className="text-lg font-bold text-slate-900 dark:text-slate-100">{item.val}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Esquemas de Comisiones Inmobiliarias */}
        <RealEstateCommissions />

        {/* Índices Económicos */}
        {economicIndexes && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Índices Económicos</h2>
            </div>

            {/* Grid especial para IPC e Inflación - destacados en 2 columnas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* IPC */}
              <div 
                className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-2xl p-6 hover:border-blue-300 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('ipc')}
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">IPC (Inflación)</h3>
                    <p className="text-xs text-gray-600 mt-0.5">Índice acumulado</p>
                  </div>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.ipc?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.ipc?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.ipc?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.ipc?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold text-gray-900">{formatCurrency(economicIndexes.ipc?.valor || 0, 2)}</div>
                  <div className="text-sm text-gray-600">{economicIndexes.ipc?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-gray-500">
                    Actualizado: {economicIndexes.ipc?.fecha ? new Date(economicIndexes.ipc.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* Inflación Mensual */}
              {economicIndexes.inflacion && (
                <div 
                  className="bg-gradient-to-br from-red-50 to-pink-50 border-2 border-red-200 rounded-2xl p-6 hover:border-red-300 transition-all hover:shadow-lg cursor-pointer"
                  onClick={() => fetchEconomicIndexChart('inflacion')}
                >
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">Inflación Mensual</h3>
                      <p className="text-xs text-gray-600 mt-0.5">Histórica desde 2010</p>
                    </div>
                    {economicIndexes.inflacion.variacion !== null && (
                      <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.inflacion.variacion)}`}>
                        <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.inflacion.variacion)}`}>
                          {getVariationIcon(economicIndexes.inflacion.variacion)}
                          {formatCurrency(Math.abs(economicIndexes.inflacion.variacion), 2)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div className="text-3xl font-bold text-gray-900">{formatCurrency(economicIndexes.inflacion.valor, 2)}%</div>
                    <div className="text-sm text-gray-600">{economicIndexes.inflacion.descripcion}</div>
                    <div className="text-xs text-gray-500">
                      Actualizado: {economicIndexes.inflacion.fecha ? new Date(economicIndexes.inflacion.fecha).toLocaleDateString("es-AR", { month: 'long', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Resto de índices en grid normal */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

              {/* CAC General */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('cacGeneral')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CAC General</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.cacGeneral?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.cacGeneral?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.cacGeneral?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.cacGeneral?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.cacGeneral?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.cacGeneral?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.cacGeneral?.fecha ? new Date(economicIndexes.cacGeneral.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* CAC Materiales */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('cacMateriales')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CAC Materiales</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.cacMateriales?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.cacMateriales?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.cacMateriales?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.cacMateriales?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.cacMateriales?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.cacMateriales?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.cacMateriales?.fecha ? new Date(economicIndexes.cacMateriales.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* CAC Mano de Obra */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('cacManoObra')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">CAC Mano de Obra</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.cacManoObra?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.cacManoObra?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.cacManoObra?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.cacManoObra?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.cacManoObra?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.cacManoObra?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.cacManoObra?.fecha ? new Date(economicIndexes.cacManoObra.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>

              {/* IS */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('is')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">IS (Salarios)</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.is?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.is?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.is?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.is?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.is?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.is?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.is?.fecha ? new Date(economicIndexes.is.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {/* Gráficos de Índices Económicos */}
        {economicIndexes && Object.keys(economicCharts).length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Series Históricas</h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {Object.entries(economicCharts).map(([indicator, chartData]) => (
                <div key={indicator} className="bg-card border border-border rounded-2xl p-6">
                  <h3 className="text-lg font-semibold mb-4 capitalize">
                    {indicator === 'ipc' ? 'IPC (Inflación)' :
                     indicator === 'inflacion' ? 'Inflación Mensual' :
                     indicator === 'cacGeneral' ? 'CAC General' :
                     indicator === 'cacMateriales' ? 'CAC Materiales' :
                     indicator === 'cacManoObra' ? 'CAC Mano de Obra' :
                     indicator === 'uva' ? 'UVA (Unidad de Valor Adquisitivo)' :
                     'IS (Salarios)'}
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData.data}>
                        <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                        <XAxis 
                          dataKey="fecha" 
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) => new Date(value).toLocaleDateString('es-AR', { month: 'short', year: '2-digit' })}
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          domain={['dataMin - 1', 'dataMax + 1']}
                        />
                        <Tooltip 
                          labelFormatter={(value) => new Date(value).toLocaleDateString('es-AR')}
                          formatter={(value: number) => [formatCurrency(value, 2), 'Valor']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="valor" 
                          stroke="#3b82f6" 
                          strokeWidth={2}
                          dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                          activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="text-xs text-muted-foreground mt-2 text-center">
                    Período: {chartData.periodo}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer Info */}
        <div className="bg-muted/50 border border-border rounded-2xl p-6">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-muted-foreground flex-shrink-0 mt-0.5" />
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <strong>Fuentes:</strong> Los datos se actualizan automáticamente desde fuentes oficiales y confiables del mercado argentino.
              </p>
              <p>
                Las cotizaciones del dólar provienen de APIs públicas actualizadas en tiempo real.
                Los datos inmobiliarios son estimaciones basadas en Zonaprop, Properati y el Colegio de Escribanos.
              </p>
              <p>
                Los índices económicos (IPC, CAC, IS) representan indicadores clave de la economía argentina.
              </p>
              <p className="text-xs">
                Última actualización: {new Date(data.timestamp).toLocaleString("es-AR")}
                {economicIndexes && ` | Índices económicos: ${new Date(economicIndexes.lastUpdated).toLocaleString("es-AR")}`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
