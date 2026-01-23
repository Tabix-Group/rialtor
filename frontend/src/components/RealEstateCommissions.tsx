"use client"

import { TrendingUp, Info } from "lucide-react"
import { useState } from "react"

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
        seller: { min: 5.0, max: 5.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 3.0, max: 5.0 },
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
        seller: { min: 4.0, max: 4.0 },
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
        seller: { min: 10.0, max: 10.0 },
        buyer: { min: 0, max: 0 },
      },
      {
        name: "Locatario",
        description: "Comisión a cargo del inquilino",
        seller: { min: 0, max: 0 },
        buyer: { min: 20.0, max: 20.0 },
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
  const [expandedSection, setExpandedSection] = useState<string | null>(null)

  return (
    <section className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <TrendingUp className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold">Esquemas de Comisiones Inmobiliarias</h2>
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

      {/* Commissions Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {commissionsData.map((section, sectionIdx) => (
          <div
            key={sectionIdx}
            className="bg-card border border-border rounded-xl overflow-hidden hover:border-foreground/20 transition-all hover:shadow-md"
          >
            {/* Section Header */}
            <div
              onClick={() =>
                setExpandedSection(
                  expandedSection === section.title ? null : section.title
                )
              }
              className="p-4 cursor-pointer bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-b border-border hover:from-slate-100 hover:to-slate-200 dark:hover:from-slate-800 dark:hover:to-slate-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{section.title}</h3>
                  {section.subtitle && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {section.subtitle}
                    </p>
                  )}
                </div>
                <div
                  className={`w-5 h-5 text-muted-foreground transition-transform ${
                    expandedSection === section.title ? "rotate-180" : ""
                  }`}
                >
                  ▼
                </div>
              </div>
            </div>

            {/* Section Content */}
            {expandedSection === section.title && (
              <div className="p-4 space-y-4">
                {section.types.map((type, typeIdx) => (
                  <div
                    key={typeIdx}
                    className="bg-muted/50 rounded-lg p-4 border border-border/50"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-sm">{type.name}</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          {type.description}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      {type.seller.max > 0 && (
                        <div className="bg-white dark:bg-slate-950 rounded p-3 border border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Vendedor/Locador
                          </p>
                          <p className="text-sm font-semibold">
                            {type.seller.min === type.seller.max
                              ? `${type.seller.min.toFixed(2)}%`
                              : `${type.seller.min.toFixed(2)}% - ${type.seller.max.toFixed(2)}%`}
                          </p>
                        </div>
                      )}

                      {type.buyer.max > 0 && (
                        <div className="bg-white dark:bg-slate-950 rounded p-3 border border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Comprador/Locatario
                          </p>
                          <p className="text-sm font-semibold">
                            {type.buyer.min === type.buyer.max
                              ? `${type.buyer.min.toFixed(2)}%`
                              : `${type.buyer.min.toFixed(2)}% - ${type.buyer.max.toFixed(2)}%`}
                          </p>
                        </div>
                      )}

                      {type.seller.max === 0 && type.buyer.max === 0 && (
                        <div className="col-span-2 bg-white dark:bg-slate-950 rounded p-3 border border-border/50">
                          <p className="text-xs font-medium text-muted-foreground mb-1">
                            Comisión
                          </p>
                          <p className="text-sm font-semibold text-green-600">
                            Sin comisión
                          </p>
                        </div>
                      )}
                    </div>

                    {type.notes && (
                      <p className="text-xs text-muted-foreground mt-3 pt-3 border-t border-border/50 italic">
                        📝 {type.notes}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Summary when collapsed */}
            {expandedSection !== section.title && (
              <div className="p-4 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {section.types.length} tipo{section.types.length > 1 ? "s" : ""} de operación
                </span>
                <span className="text-xs text-slate-400">Click para expandir</span>
              </div>
            )}
          </div>
        ))}
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
