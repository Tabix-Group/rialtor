"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Building2, FileText, RefreshCw, Info, BarChart3 } from "lucide-react"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"

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
  cacGeneral: EconomicIndex
  cacMateriales: EconomicIndex
  cacManoObra: EconomicIndex
  icc: EconomicIndex
  is: EconomicIndex
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

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("es-AR").format(value)
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
    <div className="min-h-screen bg-background py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold mb-2">Indicadores de Mercado</h1>
            <p className="text-muted-foreground">
              Datos en tiempo real del mercado inmobiliario argentino
            </p>
            {lastUpdate && (
              <p className="text-sm text-muted-foreground mt-2">
                Última actualización: {lastUpdate.toLocaleString("es-AR")}
              </p>
            )}
          </div>
          <button
            onClick={() => {
              fetchIndicators()
              fetchEconomicIndexes()
            }}
            disabled={loading}
            className="inline-flex items-center gap-2 px-6 py-3 bg-foreground text-background font-medium rounded-full hover:bg-foreground/90 transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            Actualizar
          </button>
        </div>

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
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
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
            <div className="bg-card border-2 border-primary/50 rounded-2xl p-6 hover:border-primary transition-all hover:shadow-lg">
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
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
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

        {/* Precio por m2 */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Precio por Metro Cuadrado</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CABA */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Ciudad de Buenos Aires</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(data.mercadoInmobiliario.precioM2.caba.variacion)}`}>
                  <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.mercadoInmobiliario.precioM2.caba.variacion)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.precioM2.caba.variacion)}
                    {formatCurrency(Math.abs(data.mercadoInmobiliario.precioM2.caba.variacion), 1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Venta promedio</div>
                  <div className="text-2xl font-bold">USD ${formatNumber(data.mercadoInmobiliario.precioM2.caba.venta)}</div>
                  <div className="text-xs text-muted-foreground mt-1">por m²</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Alquiler promedio</div>
                  <div className="text-2xl font-bold">USD ${formatCurrency(data.mercadoInmobiliario.precioM2.caba.alquiler)}</div>
                  <div className="text-xs text-muted-foreground mt-1">por m²</div>
                </div>
              </div>

              {/* Zonas CABA */}
              {data.mercadoInmobiliario.precioM2.caba.zonas && data.mercadoInmobiliario.precioM2.caba.zonas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Por zona</h4>
                  <div className="space-y-2">
                    {data.mercadoInmobiliario.precioM2.caba.zonas.map((zona) => (
                      <div key={zona.nombre} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">{zona.nombre}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">USD ${formatNumber(zona.precio)}</span>
                          <div className={`flex items-center gap-1 text-xs ${getVariationColor(zona.variacion)}`}>
                            {getVariationIcon(zona.variacion)}
                            <span>{formatCurrency(Math.abs(zona.variacion), 1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Provincia de Buenos Aires */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-semibold">Provincia de Buenos Aires</h3>
                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(data.mercadoInmobiliario.precioM2.buenosAires.variacion)}`}>
                  <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(data.mercadoInmobiliario.precioM2.buenosAires.variacion)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.precioM2.buenosAires.variacion)}
                    {formatCurrency(Math.abs(data.mercadoInmobiliario.precioM2.buenosAires.variacion), 1)}%
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Venta promedio</div>
                  <div className="text-2xl font-bold">USD ${formatNumber(data.mercadoInmobiliario.precioM2.buenosAires.venta)}</div>
                  <div className="text-xs text-muted-foreground mt-1">por m²</div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Alquiler promedio</div>
                  <div className="text-2xl font-bold">USD ${formatCurrency(data.mercadoInmobiliario.precioM2.buenosAires.alquiler)}</div>
                  <div className="text-xs text-muted-foreground mt-1">por m²</div>
                </div>
              </div>

              {/* Zonas Buenos Aires */}
              {data.mercadoInmobiliario.precioM2.buenosAires.zonas && data.mercadoInmobiliario.precioM2.buenosAires.zonas.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-3 text-muted-foreground">Por zona</h4>
                  <div className="space-y-2">
                    {data.mercadoInmobiliario.precioM2.buenosAires.zonas.map((zona) => (
                      <div key={zona.nombre} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <span className="text-sm font-medium">{zona.nombre}</span>
                        <div className="flex items-center gap-3">
                          <span className="text-sm font-bold">USD ${formatNumber(zona.precio)}</span>
                          <div className={`flex items-center gap-1 text-xs ${getVariationColor(zona.variacion)}`}>
                            {getVariationIcon(zona.variacion)}
                            <span>{formatCurrency(Math.abs(zona.variacion), 1)}%</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Escrituraciones */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Escrituraciones del Mes</h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* CABA */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Ciudad de Buenos Aires</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Cantidad</div>
                  <div className="text-3xl font-bold">{formatNumber(data.mercadoInmobiliario.escrituraciones.caba.cantidad)}</div>
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getVariationColor(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}
                    <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual), 1)}% mensual</span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Promedio</div>
                  <div className="text-2xl font-bold">USD ${formatNumber(data.mercadoInmobiliario.escrituraciones.caba.promedioOperacion)}</div>
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getVariationColor(data.mercadoInmobiliario.escrituraciones.caba.variacionAnual)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.escrituraciones.caba.variacionAnual)}
                    <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.caba.variacionAnual), 1)}% anual</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buenos Aires */}
            <div className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg">
              <h3 className="text-xl font-semibold mb-6">Provincia de Buenos Aires</h3>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Cantidad</div>
                  <div className="text-3xl font-bold">{formatNumber(data.mercadoInmobiliario.escrituraciones.buenosAires.cantidad)}</div>
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getVariationColor(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual)}
                    <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual), 1)}% mensual</span>
                  </div>
                </div>
                <div className="bg-muted/50 rounded-xl p-4">
                  <div className="text-sm text-muted-foreground mb-1">Promedio</div>
                  <div className="text-2xl font-bold">USD ${formatNumber(data.mercadoInmobiliario.escrituraciones.buenosAires.promedioOperacion)}</div>
                  <div className={`flex items-center gap-1 text-sm mt-2 ${getVariationColor(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionAnual)}`}>
                    {getVariationIcon(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionAnual)}
                    <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionAnual), 1)}% anual</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Índices Económicos */}
        {economicIndexes && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary" />
              </div>
              <h2 className="text-2xl font-bold">Índices Económicos</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* IPC */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('ipc')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">IPC (Inflación)</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.ipc?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.ipc?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.ipc?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.ipc?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.ipc?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.ipc?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.ipc?.fecha ? new Date(economicIndexes.ipc.fecha).toLocaleDateString("es-AR") : 'N/A'}
                  </div>
                </div>
              </div>

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

              {/* ICC */}
              <div 
                className="bg-card border border-border rounded-2xl p-6 hover:border-foreground/20 transition-all hover:shadow-lg cursor-pointer"
                onClick={() => fetchEconomicIndexChart('icc')}
              >
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">ICC (Construcción)</h3>
                  <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${getVariationBgColor(economicIndexes.icc?.variacion || 0)}`}>
                    <span className={`flex items-center gap-1 text-sm font-medium ${getVariationColor(economicIndexes.icc?.variacion || 0)}`}>
                      {getVariationIcon(economicIndexes.icc?.variacion || 0)}
                      {formatCurrency(Math.abs(economicIndexes.icc?.variacion || 0), 2)}%
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="text-3xl font-bold">{formatCurrency(economicIndexes.icc?.valor || 0, 2)}</div>
                  <div className="text-sm text-muted-foreground">{economicIndexes.icc?.descripcion || 'Cargando...'}</div>
                  <div className="text-xs text-muted-foreground">
                    Actualizado: {economicIndexes.icc?.fecha ? new Date(economicIndexes.icc.fecha).toLocaleDateString("es-AR") : 'N/A'}
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
                     indicator === 'cacGeneral' ? 'CAC General' :
                     indicator === 'cacMateriales' ? 'CAC Materiales' :
                     indicator === 'cacManoObra' ? 'CAC Mano de Obra' :
                     indicator === 'icc' ? 'ICC (Construcción)' :
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
                Los índices económicos (IPC, CAC, ICC, IS) se gestionan desde el panel de administración 
                y representan indicadores clave de la economía argentina.
                {economicIndexes?.dataSource && (
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${
                    economicIndexes.dataSource === 'DATABASE' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                      : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                  }`}>
                    {economicIndexes.dataSource === 'DATABASE' ? 'Datos administrados' : 'Datos estimados'}
                  </span>
                )}
              </p>
              <p className="text-xs">
                Última actualización: {new Date(data.timestamp).toLocaleString("es-AR")}
                {economicIndexes && ` | Índices económicos: ${new Date(economicIndexes.lastUpdated).toLocaleString("es-AR")}`}
                {economicIndexes?.dataSource && ` (${economicIndexes.dataSource === 'DATABASE' ? 'Base de datos' : 'Datos locales'})`}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
