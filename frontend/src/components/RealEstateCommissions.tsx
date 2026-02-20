"use client"

import { TrendingUp, Info } from "lucide-react"

interface CommissionRate {
  min: number
  max: number
}

interface CommissionType {
  name: string
  description: string
  seller: CommissionRate
  buyer: CommissionRate
  notes?: string
}

interface CommissionSection {
  title: string
  subtitle?: string
  types: CommissionType[]
}

const commissionsData: CommissionSection[] = [
  {
    title: "Venta Vivienda",
    subtitle: "CABA / PBA",
    types: [
      {
        name: "Vendedor",
        description: "Comisión a cargo del vendedor",
        seller: { min: 2.0, max: 3.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Comprador",
        description: "Comisión a cargo del comprador",
        seller: { min: 0, max: 0 },
        buyer: { min: 3.0, max: 4.0 },
      },
    ],
  },
  {
    title: "Venta Local u Oficina",
    subtitle: "CABA / PBA",
    types: [
      {
        name: "Vendedor",
        description: "Comisión a cargo del vendedor",
        seller: { min: 2.0, max: 3.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Comprador",
        description: "Comisión a cargo del comprador",
        seller: { min: 0, max: 0 },
        buyer: { min: 3.0, max: 4.0 },
      },
    ],
  },
  {
    title: "Venta Lote",
    subtitle: "CABA / PBA",
    types: [
      {
        name: "Vendedor",
        description: "Comisión a cargo del vendedor",
        seller: { min: 2.0, max: 3.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Comprador",
        description: "Comisión a cargo del comprador",
        seller: { min: 0, max: 0 },
        buyer: { min: 3.0, max: 5.0 },
      },
    ],
  },
  {
    title: "Alquiler Vivienda",
    subtitle: "CABA",
    types: [
      {
        name: "Locador",
        description: "Comisión a cargo del dueño",
        seller: { min: 4.15, max: 4.15 },
        buyer: { min: 0, max: 0 },
        notes: "Tarifa única CABA",
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 0.0, max: 0.0 },
        notes: "Sin comisión",
      },
    ],
  },
  {
    title: "Alquiler Vivienda",
    subtitle: "PBA",
    types: [
      {
        name: "Locador",
        description: "Comisión a cargo del dueño",
        seller: { min: 3.0, max: 5.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 5.0, max: 5.0 },
        notes: "Opcional, 1 Mes",
      },
    ],
  },
  {
    title: "Alquiler Comercial",
    subtitle: "CABA / PBA",
    types: [
      {
        name: "Locador",
        description: "Comisión a cargo del dueño",
        seller: { min: 2.0, max: 4.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 5.0, max: 5.0 },
        notes: "1 Mes",
      },
    ],
  },
  {
    title: "Alquiler Temporario",
    subtitle: "CABA / PBA",
    types: [
      {
        name: "Locador",
        description: "Comisión a cargo del dueño",
        seller: { min: 5.0, max: 10.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 10.0, max: 20.0 },
        notes: "10.00 %",
      },
    ],
  },
  {
    title: "Fondos de Comercio",
    types: [
      {
        name: "Vendedor",
        description: "Comisión a cargo del vendedor",
        seller: { min: 5.0, max: 5.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Comprador",
        description: "Comisión a cargo del comprador",
        seller: { min: 0, max: 0 },
        buyer: { min: 5.0, max: 5.0 },
      },
    ],
  },
]

export default function RealEstateCommissions() {
  const formatRate = (min: number, max: number) => {
    if (min === 0 && max === 0) return "Sin comisión"
    if (min === max) return `${min.toFixed(2)}%`
    return `${min.toFixed(2)}% - ${max.toFixed(2)}%`
  }

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Honorarios inmobiliarios</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Valores de mercado actuales para diferentes tipos de operaciones
            <span className="block text-xs text-primary font-medium mt-1 italic">
              * Datos recolectados por agentes independientes
            </span>
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Los valores mostrados son rangos estándar del mercado argentino. Use esta información como referencia profesional.
        </p>
      </div>

      {/* Commissions cards grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {commissionsData.map((section, idx) => (
          <div key={idx} className="bg-white dark:bg-slate-900 border border-border rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
            <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-border">
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">{section.title}</h3>
              {section.subtitle && (
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                  {section.subtitle}
                </span>
              )}
            </div>
            <div className="p-4 space-y-3">
              {section.types.map((type, tIdx) => {
                const rate = type.seller.max > 0 ? type.seller : type.buyer;
                return (
                  <div key={tIdx} className="flex flex-col">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-xs text-muted-foreground font-medium">{type.name}</span>
                      <span className={`text-sm font-bold ${rate.max === 0 ? "text-green-600 dark:text-green-400" : "text-slate-900 dark:text-slate-100"}`}>
                        {formatRate(rate.min, rate.max)}
                      </span>
                    </div>
                    {type.notes && (
                      <span className="text-[10px] text-muted-foreground italic leading-tight">
                        {type.notes}
                      </span>
                    )}
                    {tIdx < section.types.length - 1 && (
                      <div className="h-px bg-slate-100 dark:bg-slate-800 mt-3" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Footer Note */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Datos compilados de estándares del mercado inmobiliario. 
          Última actualización: {new Date().toLocaleDateString("es-AR")}
        </p>
      </div>
    </section>
  )
}
