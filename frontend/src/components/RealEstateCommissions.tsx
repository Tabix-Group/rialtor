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
  // Flattened list de todas las comisiones para vista de tabla
  const allCommissions = commissionsData.flatMap((section) =>
    section.types.map((type) => ({
      operationType: section.title,
      region: section.subtitle || "General",
      party: type.name,
      description: type.description,
      rate: type.seller.max > 0 ? type.seller : type.buyer,
      notes: type.notes,
      isSeller: type.seller.max > 0,
    }))
  )

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
          <h2 className="text-2xl font-bold">Comisiones Inmobiliarias</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Valores de mercado actuales para diferentes tipos de operaciones
          </p>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50/50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
        <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
        <p className="text-sm text-blue-900 dark:text-blue-100">
          Los valores mostrados son rangos estándar del mercado. Las comisiones pueden variar según el acuerdo entre partes, 
          la zona geográfica y las políticas específicas de cada inmobiliaria. Use esta información como referencia para negociaciones.
        </p>
      </div>

      {/* Commissions Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full">
          <thead>
            <tr className="bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-border">
              <th className="px-6 py-4 text-left text-sm font-semibold">Tipo de Operación</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Zona</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Parte</th>
              <th className="px-6 py-4 text-right text-sm font-semibold">Comisión</th>
              <th className="px-6 py-4 text-left text-sm font-semibold">Notas</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {allCommissions.map((commission, idx) => (
              <tr
                key={idx}
                className="hover:bg-muted/50 transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-medium text-sm">{commission.operationType}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    {commission.region}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-muted-foreground">{commission.party}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`text-sm font-semibold ${
                    commission.rate.max === 0 
                      ? "text-green-600 dark:text-green-400" 
                      : "text-slate-900 dark:text-slate-100"
                  }`}>
                    {formatRate(commission.rate.min, commission.rate.max)}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {commission.notes && (
                    <span className="text-xs text-muted-foreground italic">
                      {commission.notes}
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer Note */}
      <div className="bg-slate-50 dark:bg-slate-900/50 rounded-xl p-4 border border-border">
        <p className="text-xs text-muted-foreground text-center">
          Datos compilados de estándares del mercado inmobiliario argentino. 
          <br />
          Última actualización: {new Date().toLocaleDateString("es-AR")}
        </p>
      </div>
    </section>
  )
}
