"use client"

import { useState, useEffect } from "react"
import { TrendingUp, TrendingDown, DollarSign, Building2, FileText, RefreshCw } from "lucide-react"

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
  lastUpdated: string
}

interface IndicatorsData {
  dolar: DolarData
  mercadoInmobiliario: RealEstateData
  timestamp: string
}

export default function EconomicIndicators() {
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

  const getVariationIcon = (variation: number) => {
    if (variation > 0) return <TrendingUp className="w-3 h-3" />
    if (variation < 0) return <TrendingDown className="w-3 h-3" />
    return null
  }

  if (loading && !data) {
    return (
      <div className="space-y-4 p-4 animate-pulse">
        <div className="h-6 bg-muted rounded"></div>
        <div className="space-y-3">
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
          <div className="h-20 bg-muted rounded-lg"></div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-4 space-y-4">
        <div className="text-sm text-muted-foreground">Indicadores de Mercado</div>
        <div className="bg-destructive/10 text-destructive text-sm p-4 rounded-lg">
          {error}
        </div>
        <button
          onClick={fetchIndicators}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-muted hover:bg-muted/80 rounded-lg transition-colors text-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Reintentar
        </button>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="space-y-4 p-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold">Indicadores de Mercado</h3>
          {lastUpdate && (
            <p className="text-xs text-muted-foreground mt-0.5">
              Actualizado {lastUpdate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
            </p>
          )}
        </div>
        <button
          onClick={fetchIndicators}
          disabled={loading}
          className="p-2 hover:bg-muted rounded-lg transition-colors disabled:opacity-50"
          title="Actualizar indicadores"
        >
          <RefreshCw className={`w-4 h-4 text-muted-foreground ${loading ? "animate-spin" : ""}`} />
        </button>
      </div>

      {/* Cotizaciones del Dólar */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <DollarSign className="w-4 h-4" />
          <span>Cotizaciones USD</span>
        </div>

        <div className="space-y-2">
          {/* Dólar Oficial */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Oficial</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.dolar.oficial.variacion)}`}>
                {getVariationIcon(data.dolar.oficial.variacion)}
                <span>{formatCurrency(Math.abs(data.dolar.oficial.variacion), 1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <div>C: ${formatCurrency(data.dolar.oficial.compra)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${formatCurrency(data.dolar.oficial.venta)}</div>
              </div>
            </div>
          </div>

          {/* Dólar Blue */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Blue</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.dolar.blue.variacion)}`}>
                {getVariationIcon(data.dolar.blue.variacion)}
                <span>{formatCurrency(Math.abs(data.dolar.blue.variacion), 1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <div>C: ${formatCurrency(data.dolar.blue.compra)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${formatCurrency(data.dolar.blue.venta)}</div>
              </div>
            </div>
          </div>

          {/* Dólar Tarjeta */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Tarjeta</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.dolar.tarjeta.variacion)}`}>
                {getVariationIcon(data.dolar.tarjeta.variacion)}
                <span>{formatCurrency(Math.abs(data.dolar.tarjeta.variacion), 1)}%</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <div className="text-xs text-muted-foreground">
                <div>C: ${formatCurrency(data.dolar.tarjeta.compra)}</div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold">${formatCurrency(data.dolar.tarjeta.venta)}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Precio por m2 */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <Building2 className="w-4 h-4" />
          <span>Precio por m²</span>
        </div>

        <div className="space-y-2">
          {/* CABA */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">CABA</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.precioM2.caba.variacion)}`}>
                {getVariationIcon(data.mercadoInmobiliario.precioM2.caba.variacion)}
                <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.precioM2.caba.variacion), 1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Venta</span>
                <span className="text-sm font-bold">
                  USD ${formatNumber(data.mercadoInmobiliario.precioM2.caba.venta)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Alquiler</span>
                <span className="text-xs">USD ${formatCurrency(data.mercadoInmobiliario.precioM2.caba.alquiler)}</span>
              </div>
            </div>
          </div>

          {/* Buenos Aires */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Prov. BA</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.precioM2.buenosAires.variacion)}`}>
                {getVariationIcon(data.mercadoInmobiliario.precioM2.buenosAires.variacion)}
                <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.precioM2.buenosAires.variacion), 1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Venta</span>
                <span className="text-sm font-bold">
                  USD ${formatNumber(data.mercadoInmobiliario.precioM2.buenosAires.venta)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Alquiler</span>
                <span className="text-xs">
                  USD ${formatCurrency(data.mercadoInmobiliario.precioM2.buenosAires.alquiler)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Escrituraciones */}
      <div className="space-y-2 pt-2 border-t border-border">
        <div className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <FileText className="w-4 h-4" />
          <span>Escrituraciones del mes</span>
        </div>

        <div className="space-y-2">
          {/* CABA */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">CABA</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}`}>
                {getVariationIcon(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}
                <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual), 1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cantidad</span>
                <span className="text-sm font-bold">
                  {formatNumber(data.mercadoInmobiliario.escrituraciones.caba.cantidad)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Promedio</span>
                <span className="text-xs">
                  USD ${formatNumber(data.mercadoInmobiliario.escrituraciones.caba.promedioOperacion)}
                </span>
              </div>
            </div>
          </div>

          {/* Buenos Aires */}
          <div className="bg-card border border-border rounded-lg p-3 hover:border-foreground/20 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium">Prov. BA</span>
              <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual)}`}>
                {getVariationIcon(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual)}
                <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.buenosAires.variacionMensual), 1)}%</span>
              </div>
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Cantidad</span>
                <span className="text-sm font-bold">
                  {formatNumber(data.mercadoInmobiliario.escrituraciones.buenosAires.cantidad)}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Promedio</span>
                <span className="text-xs">
                  USD ${formatNumber(data.mercadoInmobiliario.escrituraciones.buenosAires.promedioOperacion)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
        <p>Datos actualizados automáticamente desde fuentes oficiales</p>
      </div>
    </div>
  )
}
