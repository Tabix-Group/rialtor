"use client"

import React from 'react'

export default function ProspectSummary({ stats }: { stats: any }) {
  const { avgSale = 0, avgCommission = 0, clientsProspected = 0, conversionRate = 0 } = stats || {}

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
        <p className="text-sm text-muted-foreground">Monto promedio venta</p>
        <p className="text-lg font-bold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(avgSale || 0)}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
        <p className="text-sm text-muted-foreground">Comisión promedio</p>
        <p className="text-lg font-bold">{new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(avgCommission || 0)}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
        <p className="text-sm text-muted-foreground">Clientes prospectados</p>
        <p className="text-lg font-bold">{clientsProspected || 0}</p>
      </div>
      <div className="bg-white rounded-2xl shadow p-4 border border-gray-100">
        <p className="text-sm text-muted-foreground">Tasa de conversión</p>
        <p className="text-lg font-bold">{(conversionRate || 0).toFixed(1)}%</p>
      </div>
    </div>
  )
}
