"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Building2, FileText, RefreshCw, Info } from "lucide-react"

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

export default function IndicadoresPage() {
  const [data, setData] = useState<IndicatorsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null)

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

  useEffect(() => {
    fetchIndicators()

    // Actualizar cada 5 minutos
    const interval = setInterval(() => {
      fetchIndicators()
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
            onClick={fetchIndicators}
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

        {/* Tendencias del Mercado */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">Tendencias del Mercado</h2>
          </div>

          <div className="bg-card border border-border rounded-2xl p-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Demanda de Alquiler</div>
                <div className="text-2xl font-bold capitalize">{data.mercadoInmobiliario.tendencias.demandaAlquiler}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Demanda de Venta</div>
                <div className="text-2xl font-bold capitalize">{data.mercadoInmobiliario.tendencias.demandaVenta}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Stock Disponible</div>
                <div className="text-2xl font-bold capitalize">{data.mercadoInmobiliario.tendencias.stockDisponible}</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground mb-2">Tiempo Promedio Venta</div>
                <div className="text-2xl font-bold">{data.mercadoInmobiliario.tendencias.tiempoPromedioVenta} días</div>
              </div>
            </div>
          </div>
        </section>

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
              <p className="text-xs">
                Última actualización: {new Date(data.timestamp).toLocaleString("es-AR")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
