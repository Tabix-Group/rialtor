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

  // Calculate conversion percentage
  const calculatePercentage = (currentIndex: number) => {
    if (currentIndex === 0) return 100

    const currentStageTotal = stages[currentIndex].clientsHot + stages[currentIndex].clientsCold
    const previousStageTotal = stages[currentIndex - 1].clientsHot + stages[currentIndex - 1].clientsCold

    if (previousStageTotal === 0) return 0
    return Math.round((currentStageTotal / previousStageTotal) * 100)
  }

  // Handle input change
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

  // Save funnel data
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

  // Load funnel data on mount
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
        // Silently fail - use default data
      }
    }

    loadData()
  }, [])

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Embudo de Ventas</h2>
          <p className="mt-1 text-sm text-gray-500">Gestiona tu pipeline de proyectos</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className="w-full rounded-lg bg-blue-600 px-6 py-2 font-semibold text-white shadow-md transition-all hover:bg-blue-700 disabled:opacity-50 sm:w-auto"
        >
          {isSaving ? 'Guardando...' : 'Guardar'}
        </button>
      </div>

      {/* Main Funnel Layout */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm sm:p-8">
        {/* Responsive Container */}
        <div className="space-y-8">
          {/* Desktop: 3-Column Layout */}
          <div className="hidden lg:block">
            {stages.map((stage, index) => (
              <div key={stage.id} className="mb-6 grid grid-cols-3 items-center gap-6">
                {/* Left Column: Calientes */}
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
                    {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                  </div>
                </div>

                {/* Center Column: Funnel */}
                <div className="flex flex-col items-center">
                  <div className={`relative ${stage.width} transition-all duration-300`}>
                    <div className={`${stage.tailwindColor} rounded-lg py-4 px-4 shadow-md transition-all`}>
                      <p className="text-center font-semibold text-white">{stage.label}</p>
                      <p className="text-center text-sm text-white/80">
                        {stage.clientsHot + stage.clientsCold} clientes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right Column: Fríos */}
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
                    {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Tablet: 2-Column Compact Layout */}
          <div className="hidden md:block lg:hidden">
            {stages.map((stage, index) => (
              <div key={stage.id} className="mb-4 flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 p-4">
                {/* Left: Calientes Input */}
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
                    {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                  </span>
                </div>

                {/* Center: Funnel bar */}
                <div className={`${stage.width} flex-1 px-2`}>
                  <div className={`${stage.tailwindColor} rounded-lg py-3 px-3 text-center shadow-md`}>
                    <p className="font-semibold text-white text-sm">{stage.label}</p>
                    <p className="text-xs text-white/80">
                      {stage.clientsHot + stage.clientsCold} clientes
                    </p>
                  </div>
                </div>

                {/* Right: Fríos Input */}
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
                    {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Stack Layout */}
          <div className="space-y-4 md:hidden">
            {stages.map((stage, index) => (
              <div key={stage.id} className="rounded-xl border border-gray-200 bg-gray-50 p-3 sm:p-4">
                {/* Funnel bar */}
                <div className="mb-4 flex justify-center">
                  <div className={`w-full ${stage.width}`}>
                    <div className={`${stage.tailwindColor} rounded-lg py-3 px-4 text-center shadow-md`}>
                      <p className="font-semibold text-white text-sm">{stage.label}</p>
                      <p className="text-xs text-white/80">
                        {stage.clientsHot + stage.clientsCold} clientes
                      </p>
                    </div>
                  </div>
                </div>

                {/* Two-column inputs */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Calientes */}
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
                      {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                    </div>
                  </div>

                  {/* Fríos */}
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
                      {index === 0 ? '100%' : `${calculatePercentage(index)}%`}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="mt-6 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
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
  )
}
