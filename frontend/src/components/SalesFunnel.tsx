'use client'

import { useState, useEffect } from 'react'

interface FunnelStage {
  id: number
  label: string
  clientsHot: number
  clientsCold: number
  color: string
  tailwindColor: string
  width: string
}

interface SalesFunnelProps {
  onSave?: (data: FunnelStage[]) => void
}

export default function SalesFunnel({ onSave }: SalesFunnelProps) {
  const [stages, setStages] = useState<FunnelStage[]>([
    { id: 1, label: 'Prospectos', clientsHot: 20, clientsCold: 0, color: 'teal', tailwindColor: 'bg-teal-500', width: 'w-full' },
    { id: 2, label: 'Tasaciones', clientsHot: 13, clientsCold: 0, color: 'indigo', tailwindColor: 'bg-indigo-600', width: 'w-11/12' },
    { id: 3, label: 'Captaciones', clientsHot: 9, clientsCold: 1, color: 'red', tailwindColor: 'bg-red-500', width: 'w-10/12' },
    { id: 4, label: 'Reservas', clientsHot: 4, clientsCold: 2, color: 'green', tailwindColor: 'bg-green-600', width: 'w-9/12' },
    { id: 5, label: 'Cierres', clientsHot: 3, clientsCold: 2, color: 'yellow', tailwindColor: 'bg-yellow-500', width: 'w-8/12' },
  ])

  const [isSaving, setIsSaving] = useState(false)

  const calculateComposition = (stageIndex: number) => {
    const stage = stages[stageIndex]
    const total = stage.clientsHot + stage.clientsCold

    if (total === 0) {
      return { hotPercent: 0, coldPercent: 0 }
    }

    const hotPercent = (stage.clientsHot / total) * 100
    const coldPercent = (stage.clientsCold / total) * 100

    return { hotPercent, coldPercent }
  }

  const handleInputChange = (stageId: number, field: 'clientsHot' | 'clientsCold', value: string) => {
    const numValue = value === '' ? 0 : Math.max(0, parseInt(value) || 0)

    setStages(prev =>
      prev.map(stage =>
        stage.id === stageId
          ? { ...stage, [field]: numValue }
          : stage
      )
    )
  }

  const handleSave = async () => {
    setIsSaving(true)
    try {
      const response = await fetch('/api/sales-funnel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ data: stages }),
      })

      if (!response.ok) throw new Error('Error saving funnel data')

      if (onSave) onSave(stages)
    } catch (error) {
      console.error('Error saving sales funnel:', error)
    } finally {
      setIsSaving(false)
    }
  }

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/sales-funnel')
        if (response.ok) {
          const result = await response.json()
          if (result.data && Array.isArray(result.data) && result.data.length > 0) {
            setStages(result.data)
          }
        }
      } catch (error) {
        console.error('Error loading sales funnel:', error)
      }
    }
    loadData()
  }, [])

  return (
    <div className="w-full">
      <div className="mb-0 rounded-none bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 px-6 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <div>
              <div className="mb-4 inline-block rounded-full bg-blue-800/50 px-4 py-2 backdrop-blur">
                <p className="text-sm font-semibold text-blue-200">📊 Centro de Análisis</p>
              </div>
              <h1 className="text-4xl font-bold text-white sm:text-5xl">
                Mis <span className="text-cyan-400">Proyecciones</span>
              </h1>
              <p className="mt-3 max-w-2xl text-base text-blue-100 sm:text-lg">
                Visualiza y gestiona tu pipeline de ventas en tiempo real.
              </p>
            </div>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="w-full rounded-xl bg-white px-6 py-3 font-semibold text-blue-900 shadow-lg transition-all hover:bg-blue-50 disabled:opacity-50 sm:w-auto"
            >
              {isSaving ? 'Guardando...' : '💾 Guardar'}
            </button>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
            <div className="space-y-8">
              {/* Desktop Layout */}
              <div className="hidden lg:block">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    <div key={stage.id} className="mb-8 grid grid-cols-3 items-center gap-6">
                      <div className="flex flex-col items-end pr-4">
                        <div className="mb-2 flex w-full flex-col items-end">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsHot}
                            onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                            className="w-20 rounded border-0 bg-transparent text-right text-lg font-semibold text-gray-900 outline-none transition-all focus:bg-gray-100 focus:ring-2 focus:ring-teal-500"
                          />
                          <span className="text-xs text-gray-500">Clientes referidos</span>
                        </div>
                        <div className="text-sm font-bold text-teal-600">
                          {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-3">
                        <div className={`relative ${stage.width} transition-all duration-300`}>
                          <div className={`${stage.tailwindColor} rounded-lg overflow-hidden shadow-md transition-all`}>
                            <div className="flex h-2 w-full">
                              <div
                                className="bg-white/40 transition-all duration-300"
                                style={{ width: `${hotPercent}%` }}
                              />
                              <div
                                className="bg-blue-900/20 transition-all duration-300"
                                style={{ width: `${coldPercent}%` }}
                              />
                            </div>
                            <div className="px-4 py-4">
                              <p className="text-center font-semibold text-white">{stage.label}</p>
                              <p className="text-center text-sm text-white/80">
                                {totalClients} clientes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-start pl-4">
                        <div className="mb-2 flex w-full flex-col items-start">
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsCold}
                            onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                            className="w-20 rounded border-0 bg-transparent text-left text-lg font-semibold text-gray-900 outline-none transition-all focus:bg-gray-100 focus:ring-2 focus:ring-indigo-500"
                          />
                          <span className="text-xs text-gray-500">Bases frías</span>
                        </div>
                        <div className="text-sm font-bold text-indigo-600">
                          {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tablet Layout */}
              <div className="hidden md:block lg:hidden">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    <div key={stage.id} className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsHot}
                          onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                          className="w-16 rounded border-0 bg-transparent text-center text-lg font-bold text-teal-600 outline-none focus:ring-2 focus:ring-teal-500"
                        />
                        <span className="text-xs text-gray-500">Referidos</span>
                        <span className="text-xs font-bold text-teal-600">
                          {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                        </span>
                      </div>

                      <div className={`${stage.width} flex-1 px-2`}>
                        <div className={`${stage.tailwindColor} rounded-lg overflow-hidden shadow-md`}>
                          <div className="flex h-1.5 w-full">
                            <div
                              className="bg-white/40 transition-all duration-300"
                              style={{ width: `${hotPercent}%` }}
                            />
                            <div
                              className="bg-blue-900/20 transition-all duration-300"
                              style={{ width: `${coldPercent}%` }}
                            />
                          </div>
                          <div className="px-3 py-3 text-center">
                            <p className="font-semibold text-white text-sm">{stage.label}</p>
                            <p className="text-xs text-white/80">
                              {totalClients} clientes
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2">
                        <input
                          type="number"
                          min="0"
                          value={stage.clientsCold}
                          onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                          className="w-16 rounded border-0 bg-transparent text-center text-lg font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <span className="text-xs text-gray-500">Bases Frías</span>
                        <span className="text-xs font-bold text-indigo-600">
                          {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Mobile Layout */}
              <div className="space-y-4 md:hidden">
                {stages.map((stage, index) => {
                  const { hotPercent, coldPercent } = calculateComposition(index)
                  const totalClients = stage.clientsHot + stage.clientsCold

                  return (
                    <div key={stage.id} className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                      <div className="mb-4 flex justify-center">
                        <div className={`w-full ${stage.width}`}>
                          <div className={`${stage.tailwindColor} rounded-lg overflow-hidden shadow-md`}>
                            <div className="flex h-2 w-full">
                              <div
                                className="bg-white/40 transition-all duration-300"
                                style={{ width: `${hotPercent}%` }}
                              />
                              <div
                                className="bg-blue-900/20 transition-all duration-300"
                                style={{ width: `${coldPercent}%` }}
                              />
                            </div>
                            <div className="px-4 py-3 text-center">
                              <p className="font-semibold text-white text-sm">{stage.label}</p>
                              <p className="text-xs text-white/80">
                                {totalClients} clientes
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg bg-white p-3">
                          <label className="text-xs font-semibold text-gray-600">Referidos</label>
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsHot}
                            onChange={(e) => handleInputChange(stage.id, 'clientsHot', e.target.value)}
                            className="mt-1 w-full rounded border-0 bg-transparent text-center text-lg font-bold text-teal-600 outline-none focus:ring-2 focus:ring-teal-500"
                          />
                          <div className="mt-2 text-center text-xs font-bold text-teal-600">
                            {totalClients === 0 ? '—' : `${Math.round(hotPercent)}%`}
                          </div>
                        </div>

                        <div className="rounded-lg bg-white p-3">
                          <label className="text-xs font-semibold text-gray-600">Bases Frías</label>
                          <input
                            type="number"
                            min="0"
                            value={stage.clientsCold}
                            onChange={(e) => handleInputChange(stage.id, 'clientsCold', e.target.value)}
                            className="mt-1 w-full rounded border-0 bg-transparent text-center text-lg font-bold text-indigo-600 outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <div className="mt-2 text-center text-xs font-bold text-indigo-600">
                            {totalClients === 0 ? '—' : `${Math.round(coldPercent)}%`}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 pb-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
            {stages.map((stage) => (
              <div key={stage.id} className="rounded-lg border border-gray-200 bg-gray-50 p-3 sm:p-4">
                <p className="text-xs font-semibold text-gray-600">{stage.label}</p>
                <p className="mt-2 text-xl font-bold text-gray-900 sm:text-2xl">
                  {stage.clientsHot + stage.clientsCold}
                </p>
                <div className="mt-2 flex gap-1 text-xs sm:gap-2">
                  <span className="inline-block rounded bg-teal-100 px-2 py-1 text-teal-700 truncate">
                    {stage.clientsHot} ref.
                  </span>
                  <span className="inline-block rounded bg-indigo-100 px-2 py-1 text-indigo-700 truncate">
                    {stage.clientsCold} f.
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
