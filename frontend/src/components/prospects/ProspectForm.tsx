"use client"

import React, { useState, useEffect } from 'react'

import type { Prospect, ProspectFormData } from '../../types/prospect'

export default function ProspectForm({ initial, onCancel, onSave }: { initial?: Prospect; onCancel: ()=>void; onSave: (data: ProspectFormData) => void | Promise<void> }) {
  const [form, setForm] = useState<ProspectFormData>({
    title: '', note: '', estimatedValue: '', estimatedCommission: '', clientsProspected: 0, probability: '', status: 'PROSPECTOS', closedValue: '', closeDate: ''
  })

  useEffect(()=>{ if (initial) setForm({
    title: initial.title||'', note: initial.note||'', estimatedValue: initial.estimatedValue||'', estimatedCommission: initial.estimatedCommission||'', clientsProspected: initial.clientsProspected||0, probability: initial.probability||'', status: initial.status||'PROSPECTOS', closedValue: initial.closedValue||'', closeDate: initial.closeDate ? new Date(initial.closeDate).toISOString().slice(0,10) : ''
  }) },[initial])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const target = e.target as HTMLInputElement
    const { name, value, type } = target
    setForm(s => ({ ...s, [name]: type === 'number' ? (value === '' ? 0 : Number(value)) : value }))
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => { e.preventDefault(); onSave(form) }

  return (
    <form onSubmit={submit} className="bg-white rounded-2xl p-6 border border-gray-100 shadow">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium">Título</label>
          <input name="title" value={form.title} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Estado</label>
          <select name="status" value={form.status} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200">
            <option value="PROSPECTOS">Prospectos</option>
            <option value="TASACIONES">Tasaciones</option>
            <option value="CAPTACIONES">Captaciones</option>
            <option value="RESERVAS">Reservas</option>
            <option value="CIERRES">Cierres</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium">Monto estimado</label>
          <input name="estimatedValue" value={form.estimatedValue ?? ''} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Comisión estimada</label>
          <input name="estimatedCommission" value={form.estimatedCommission ?? ''} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Clientes prospectados</label>
          <input name="clientsProspected" type="number" value={form.clientsProspected ?? 0} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <div>
          <label className="text-sm font-medium">Probabilidad (%)</label>
          <input name="probability" value={form.probability ?? ''} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Valor cerrado (si aplica)</label>
          <input name="closedValue" value={form.closedValue ?? ''} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha de cierre</label>
          <input name="closeDate" type="date" value={form.closeDate ?? ''} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
        </div>
      </div>

      <div className="mt-4">
        <label className="text-sm font-medium">Notas</label>
        <textarea name="note" value={form.note} onChange={handleChange} className="mt-1 w-full rounded-md border-gray-200" />
      </div>

      <div className="flex gap-3 mt-4 justify-end">
        <button type="button" onClick={onCancel} className="px-4 py-2 rounded-xl border">Cancelar</button>
        <button type="submit" className="px-4 py-2 rounded-xl bg-blue-600 text-white">Guardar</button>
      </div>
    </form>
  )
}
