"use client"

import React from 'react'

import type { Prospect } from '../../types/prospect'

const STATUS_LABELS: Record<string, string> = {
  PROSPECTOS: 'Prospectos',
  TASACIONES: 'Tasaciones',
  CAPTACIONES: 'Captaciones',
  RESERVAS: 'Reservas',
  CIERRES: 'Cierres'
}

export default function ProspectCard({ prospect, onEdit, onDelete }: { prospect: Prospect; onEdit: (p: Prospect) => void; onDelete: (id: string) => void }) {
  const statusLabel = STATUS_LABELS[prospect.status as string] ?? prospect.status

  return (
    <div className="bg-white rounded-2xl shadow p-4 border border-gray-100 flex justify-between items-start">
      <div>
        <div className="flex items-center gap-3">
          <h4 className="font-semibold text-lg">{prospect.title}</h4>
          <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 text-gray-700">{statusLabel}</span>
        </div>
        {prospect.note && <p className="text-sm text-muted-foreground mt-2">{prospect.note}</p>}
        <div className="mt-3 text-sm text-muted-foreground grid grid-cols-2 gap-3">
          <div>Monto (estim): <strong>{prospect.estimatedValue ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(prospect.estimatedValue)) : '-'}</strong></div>
          <div>Probabilidad: <strong>{prospect.probability ? `${prospect.probability}%` : '-'}</strong></div>
          <div>Clientes: <strong>{prospect.clientsProspected ?? 0}</strong></div>
          <div>Comisión (estim): <strong>{prospect.estimatedCommission ? new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(Number(prospect.estimatedCommission)) : '-'}</strong></div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button onClick={() => onEdit(prospect)} className="text-sm text-blue-600 hover:underline">Editar</button>
        <button onClick={() => prospect.id && onDelete(prospect.id)} className="text-sm text-red-600 hover:underline">Eliminar</button>
      </div>
    </div>
  )
}
