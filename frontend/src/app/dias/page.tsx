"use client"

import { useState } from 'react'
import { Calculator, Calendar, Clock, CheckCircle } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'

interface DaysResult {
    startDate: string
    endDate: string
    totalDays: number
    businessDays: number
    nonBusinessDays: {
        total: number
        weekends: number
        holidays: number
        details: Array<{
            date: string
            day: string
            reason: string
        }>
    }
    holidays: Array<{
        date: string
        day: string
        reason: string
    }>
    weekends: Array<{
        date: string
        day: string
        reason: string
    }>
}

export default function DiasPage() {
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [result, setResult] = useState<DaysResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const calculateDays = async () => {
        if (!startDate || !endDate) {
            setError('Por favor complete ambas fechas')
            return
        }

        const start = new Date(startDate)
        const end = new Date(endDate)

        if (start > end) {
            setError('La fecha de inicio debe ser anterior a la fecha de fin')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await authenticatedFetch('/api/calculator/days', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate,
                    endDate
                })
            })

            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            } else {
                setError(data.message || 'Error al calcular')
            }
        } catch (error) {
            setError('Error al calcular los días')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Calculadora de Días</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Calculá días hábiles y días de corrido entre dos fechas, considerando feriados y fines de semana en Argentina
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
                        <div className="flex items-center gap-3">
                            <Calculator className="w-8 h-8 text-white" />
                            <h2 className="text-2xl font-bold text-white">Calculadora de Días Hábiles</h2>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha de inicio
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">
                                    Fecha de fin
                                </label>
                                <div className="relative">
                                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                    <input
                                        type="date"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={calculateDays}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {loading ? 'Calculando...' : 'Calcular Días'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 px-8 py-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Resultado del Cálculo</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-6 h-6 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-600">Días de corrido</span>
                                    </div>
                                    <p className="text-3xl font-bold text-blue-600">{result.totalDays}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Desde {formatDate(result.startDate)} hasta {formatDate(result.endDate)}
                                    </p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <CheckCircle className="w-6 h-6 text-green-600" />
                                        <span className="text-sm font-medium text-gray-600">Días hábiles</span>
                                    </div>
                                    <p className="text-3xl font-bold text-green-600">{result.businessDays}</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Excluyendo fines de semana y feriados
                                    </p>
                                </div>
                            </div>

                            {/* Detalles de días no hábiles */}
                            {result.nonBusinessDays && result.nonBusinessDays.details.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Detalle de días no hábiles</h4>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                                            <div className="text-2xl font-bold text-red-600">{result.nonBusinessDays.total}</div>
                                            <div className="text-sm text-red-700">Total no hábiles</div>
                                        </div>
                                        <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                                            <div className="text-2xl font-bold text-orange-600">{result.nonBusinessDays.weekends}</div>
                                            <div className="text-sm text-orange-700">Fines de semana</div>
                                        </div>
                                        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                                            <div className="text-2xl font-bold text-purple-600">{result.nonBusinessDays.holidays}</div>
                                            <div className="text-sm text-purple-700">Feriados</div>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                                            <h5 className="font-semibold text-gray-900">Lista detallada de días no hábiles</h5>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {result.nonBusinessDays.details.map((day, index) => (
                                                <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {new Date(day.date).toLocaleDateString('es-AR', {
                                                                    day: '2-digit',
                                                                    month: '2-digit',
                                                                    year: 'numeric'
                                                                })}
                                                            </span>
                                                            <span className="text-gray-600 ml-2">({day.day})</span>
                                                        </div>
                                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                                                            day.reason === 'Fin de semana' 
                                                                ? 'bg-orange-100 text-orange-800'
                                                                : 'bg-purple-100 text-purple-800'
                                                        }`}>
                                                            {day.reason}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Información del cálculo</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>• <strong>Fecha inicio:</strong> {formatDate(result.startDate)}</p>
                                    <p>• <strong>Fecha fin:</strong> {formatDate(result.endDate)}</p>
                                    <p>• <strong>Días hábiles:</strong> Lunes a viernes, excluyendo feriados nacionales</p>
                                    <p>• <strong>Feriados considerados:</strong> Feriados oficiales de Argentina</p>
                                    {result.nonBusinessDays && (
                                        <p>• <strong>Días no hábiles encontrados:</strong> {result.nonBusinessDays.total} ({result.nonBusinessDays.weekends} fines de semana, {result.nonBusinessDays.holidays} feriados)</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-sm text-gray-500 text-center">
                    <p>
                        <strong>Nota:</strong> El cálculo considera los feriados nacionales de Argentina y excluye sábados y domingos como días hábiles.
                    </p>
                </div>
            </div>
        </div>
    )
}