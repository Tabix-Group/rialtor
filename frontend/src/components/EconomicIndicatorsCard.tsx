"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { TrendingUp, TrendingDown, DollarSign, Building2, FileText, ArrowRight } from "lucide-react"

interface DolarRate {
  compra: number
  venta: number
  variacion: number
}

interface DolarData {
  oficial: DolarRate
  blue: DolarRate
  tarjeta: DolarRate
}

interface RealEstateRegion {
  venta: number
  variacion: number
}

interface Escrituraciones {
  cantidad: number
  variacionMensual: number
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
}

interface IndicatorsData {
  dolar: DolarData
  mercadoInmobiliario: RealEstateData
}

export default function EconomicIndicatorsCard() {
  const [data, setData] = useState<IndicatorsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchIndicators = async () => {
      try {
        const response = await fetch("/api/indicators/all")
        
        if (!response.ok) {
          throw new Error("Error al obtener los indicadores")
        }

        const result = await response.json()
        
        if (result.success && result.data) {
          setData(result.data)
        }
      } catch (err) {
        console.error("Error fetching indicators:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchIndicators()
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

  if (loading) {
    return (
      <div className="relative group h-full">
        <div className="relative h-full p-8 bg-card border border-border rounded-3xl animate-pulse">
          <div className="w-12 h-12 rounded-2xl bg-foreground/5 mb-6"></div>
          <div className="space-y-3">
            <div className="h-6 bg-foreground/5 rounded w-3/4"></div>
            <div className="h-16 bg-foreground/5 rounded"></div>
            <div className="h-16 bg-foreground/5 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  if (!data) return null

  return (
    <Link href="/indicadores" className="relative group h-full">
      <div className="relative h-full p-8 bg-card border border-border rounded-3xl hover:border-foreground/20 transition-all duration-500 hover:shadow-2xl hover:-translate-y-1">
        {/* Icon */}
        <div className="w-12 h-12 rounded-2xl bg-foreground/5 flex items-center justify-center mb-6 group-hover:bg-foreground/10 transition-colors duration-300">
          <TrendingUp className="w-6 h-6 text-foreground" />
        </div>

        {/* Content */}
        <div className="space-y-4">
          <div>
            <h3 className="text-xl font-semibold text-balance leading-tight mb-2">Indicadores de Mercado</h3>
            <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
              Datos en tiempo real del mercado inmobiliario y cotizaciones actualizadas automáticamente.
            </p>
          </div>

          {/* Mini Stats Preview */}
          <div className="space-y-3 pt-2">
            {/* Dólar Blue */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Dólar Blue</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">${formatCurrency(data.dolar.blue.venta)}</span>
                <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.dolar.blue.variacion)}`}>
                  {getVariationIcon(data.dolar.blue.variacion)}
                  <span>{formatCurrency(Math.abs(data.dolar.blue.variacion), 1)}%</span>
                </div>
              </div>
            </div>

            {/* Precio m2 CABA */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">m² CABA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">USD ${formatNumber(data.mercadoInmobiliario.precioM2.caba.venta)}</span>
                <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.precioM2.caba.variacion)}`}>
                  {getVariationIcon(data.mercadoInmobiliario.precioM2.caba.variacion)}
                  <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.precioM2.caba.variacion), 1)}%</span>
                </div>
              </div>
            </div>

            {/* Escrituras CABA */}
            <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Escrituras CABA</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold">{formatNumber(data.mercadoInmobiliario.escrituraciones.caba.cantidad)}</span>
                <div className={`flex items-center gap-1 text-xs ${getVariationColor(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}`}>
                  {getVariationIcon(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual)}
                  <span>{formatCurrency(Math.abs(data.mercadoInmobiliario.escrituraciones.caba.variacionMensual), 1)}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Call to action hint */}
          <div className="text-xs text-muted-foreground pt-2 border-t border-border">
            Ver todos los indicadores en tiempo real →
          </div>
        </div>

        {/* Arrow indicator */}
        <div className="absolute bottom-8 right-8 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
          <ArrowRight className="w-5 h-5 text-foreground" />
        </div>
      </div>
    </Link>
  )
}
