'use client'

import { useState } from 'react'
import { Building2, TrendingUp, Calendar, DollarSign, AlertCircle, CheckCircle, Info } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'
import PDFExportButton from '@/components/PDFExportButton'

interface CACProjection {
  date: string
  value: number
  estimated: boolean
  difference: number
  amount: number
  details: Array<{
    date: string
    value: number
    month_before: number
    accumulate: number
  }>
}

interface CalculationResult {
  inputs: {
    amount: number
    date: string
    months: number
    rate: string
  }
  projections: CACProjection[]
}

export default function CalculadoraCACPage() {
  const [formData, setFormData] = useState({
    amount: '',
    date: '',
    months: ''
  })

  const [result, setResult] = useState<CalculationResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const response = await authenticatedFetch('/api/calculator/cac', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: parseFloat(formData.amount),
          date: formData.date,
          months: parseInt(formData.months)
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Error al calcular')
      }

      const data = await response.json()
      setResult(data.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS',
      minimumFractionDigits: 2
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-AR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-emerald-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-emerald-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
              <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-teal-300" />
              <span className="text-xs sm:text-sm font-semibold text-white">Calculadora CAC</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Proyección <span className="bg-gradient-to-r from-teal-300 to-emerald-300 bg-clip-text text-transparent">CAC</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Calculá las proyecciones de valores según el Índice de la Cámara Argentina de la Construcción (CAC). Ideal para ajustes de contratos de construcción y proyectos inmobiliarios.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-teal-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Parámetros</h2>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-2">
                    Monto base de construcción
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="number"
                      id="amount"
                      name="amount"
                      value={formData.amount}
                      onChange={handleInputChange}
                      placeholder="Ej: 100000"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                      min="1"
                      step="0.01"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de inicio
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="date"
                      id="date"
                      name="date"
                      value={formData.date}
                      onChange={handleInputChange}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="months" className="block text-sm font-medium text-gray-700 mb-2">
                    Duración en meses
                  </label>
                  <input
                    type="number"
                    id="months"
                    name="months"
                    value={formData.months}
                    onChange={handleInputChange}
                    placeholder="Ej: 24"
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    min="1"
                    max="120"
                  />
                </div>

                <div className="bg-teal-50 border border-teal-200 rounded-lg p-3">
                  <p className="text-sm text-teal-900 font-medium">
                    Índice: <span className="font-bold">CAC - Cámara Argentina de la Construcción</span>
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Calculando...' : 'Calcular Proyección'}
                </button>
              </form>

              {error && (
                <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                    <p className="text-red-700 text-sm">{error}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Resultados */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="space-y-6">
                <div className="flex justify-end">
                  <PDFExportButton 
                    elementId="cac-calculation-results" 
                    fileName={`calculo-cac-${new Date().getTime()}`} 
                    title="Proyección de Índice CAC"
                  />
                </div>

                <div id="cac-calculation-results" className="space-y-6 bg-white p-2 rounded-xl">
                  {/* Resumen */}
                  <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">Resumen del Cálculo</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Monto inicial</p>
                      <p className="text-2xl font-bold text-gray-900">{formatCurrency(result.inputs.amount)}</p>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Monto final proyectado</p>
                      <p className="text-2xl font-bold text-teal-600">
                        {result.projections[result.projections.length - 1]?.amount !== undefined ? formatCurrency(result.projections[result.projections.length - 1].amount) : 'N/A'}
                      </p>
                    </div>
                  </div>

                  <div className="bg-teal-50 border border-teal-200 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Info className="w-5 h-5 text-teal-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <h3 className="font-medium text-teal-900 mb-1">Sobre el CAC</h3>
                        <p className="text-sm text-teal-700">
                          El CAC (Cámara Argentina de la Construcción) es un índice utilizado para ajustar contratos de obras y servicios relacionados con la construcción. Los valores estimados pueden variar según la evolución real del índice.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Tabla de proyecciones */}
                <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                  <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-xl font-bold text-gray-900">Proyección Mensual</h2>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Fecha
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Valor Índice
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Variación
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Monto
                          </th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Tipo
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {result.projections.map((projection, index) => (
                          <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {formatDate(projection.date)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {projection.value !== undefined ? projection.value.toFixed(2) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                              <span className={`font-medium ${projection.difference !== undefined && projection.difference >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {projection.difference !== undefined ? formatPercentage(projection.difference) : 'N/A'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {projection.amount !== undefined ? formatCurrency(projection.amount) : 'N/A'}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              {projection.estimated ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  Estimado
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                  Real
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Detalles adicionales si existen */}
                {result.projections.some(p => p.details && p.details.length > 0) && (
                  <div className="bg-white rounded-xl shadow-lg p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Detalles del Cálculo</h2>
                    <div className="space-y-4">
                      {result.projections
                        .filter(p => p.details && p.details.length > 0)
                        .slice(0, 3)
                        .map((projection, index) => (
                          <div key={index} className="border border-gray-200 rounded-lg p-4">
                            <h3 className="font-medium text-gray-900 mb-2">
                              {formatDate(projection.date)}
                            </h3>
                            <div className="space-y-1 text-sm text-gray-600">
                              {projection.details.map((detail, detailIndex) => (
                                <div key={detailIndex} className="flex justify-between">
                                  <span>{formatDate(detail.date)}:</span>
                                  <span>{detail.month_before !== undefined ? detail.month_before.toFixed(2) : 'N/A'}% (acum: {detail.accumulate !== undefined ? detail.accumulate.toFixed(2) : 'N/A'}%)</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <Building2 className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                <h3 className="text-2xl font-bold text-gray-600 mb-4">Calculadora de Índice CAC</h3>
                <p className="text-gray-500 text-lg max-w-md mx-auto">
                  Completa los parámetros a la izquierda para obtener una proyección detallada de valores según el índice CAC de la Cámara Argentina de la Construcción.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
