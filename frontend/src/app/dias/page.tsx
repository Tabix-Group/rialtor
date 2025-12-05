"use client"

import { useState } from 'react'
import { Calculator, Calendar, Clock, CheckCircle, ArrowRight, Hash, CalendarCheck } from 'lucide-react'
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

interface DueDateResult {
    startDate: string
    dueDate: string
    businessDaysRequested: number
    totalCalendarDays: number
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
    weekends: number
}

type CalculatorMode = 'between-dates' | 'due-date'

export default function DiasPage() {
    const [mode, setMode] = useState<CalculatorMode>('between-dates')
    
    // Modo: Entre fechas
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')
    const [result, setResult] = useState<DaysResult | null>(null)
    
    // Modo: Fecha de vencimiento
    const [dueDateStart, setDueDateStart] = useState('')
    const [businessDaysCount, setBusinessDaysCount] = useState('')
    const [dueDateResult, setDueDateResult] = useState<DueDateResult | null>(null)
    
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const calculateDays = async () => {
        if (!startDate || !endDate) {
            setError('Por favor completá ambas fechas')
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

    const calculateDueDate = async () => {
        if (!dueDateStart) {
            setError('Por favor ingresá una fecha de inicio')
            return
        }

        const daysNum = parseInt(businessDaysCount)
        if (!daysNum || daysNum <= 0) {
            setError('Por favor ingresá una cantidad válida de días hábiles')
            return
        }

        if (daysNum > 365) {
            setError('La cantidad máxima de días hábiles es 365')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await authenticatedFetch('/api/calculator/due-date', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    startDate: dueDateStart,
                    businessDaysCount: daysNum
                })
            })

            const data = await res.json()
            if (data.success) {
                setDueDateResult(data.data)
            } else {
                setError(data.message || 'Error al calcular')
            }
        } catch (error) {
            setError('Error al calcular la fecha de vencimiento')
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

    const formatShortDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-AR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    }

    const handleModeChange = (newMode: CalculatorMode) => {
        setMode(newMode)
        setError('')
        setResult(null)
        setDueDateResult(null)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Calculadora de Días Hábiles</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Calculá días hábiles entre fechas o encontrá la fecha de vencimiento según días hábiles, considerando feriados de Argentina
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header con Tabs */}
                    <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-4 sm:px-8 py-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Calculator className="w-8 h-8 text-white" />
                            <h2 className="text-2xl font-bold text-white">Calculadora de Días</h2>
                        </div>
                        
                        {/* Tabs */}
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                            <button
                                onClick={() => handleModeChange('between-dates')}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    mode === 'between-dates'
                                        ? 'bg-white text-green-700 shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                <Clock className="w-5 h-5" />
                                <span>Días entre fechas</span>
                            </button>
                            <button
                                onClick={() => handleModeChange('due-date')}
                                className={`flex items-center justify-center gap-2 px-4 sm:px-6 py-3 rounded-xl font-medium transition-all duration-200 ${
                                    mode === 'due-date'
                                        ? 'bg-white text-green-700 shadow-lg'
                                        : 'bg-white/20 text-white hover:bg-white/30'
                                }`}
                            >
                                <CalendarCheck className="w-5 h-5" />
                                <span>Fecha de vencimiento</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 sm:p-8">
                        {/* Modo: Días entre fechas */}
                        {mode === 'between-dates' && (
                            <>
                                <div className="mb-6">
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        Ingresá dos fechas para calcular cuántos días hábiles y de corrido hay entre ellas.
                                    </p>
                                </div>
                                
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
                            </>
                        )}

                        {/* Modo: Fecha de vencimiento */}
                        {mode === 'due-date' && (
                            <>
                                <div className="mb-6">
                                    <p className="text-gray-600 text-sm sm:text-base">
                                        Ingresá una fecha de inicio y la cantidad de días hábiles para calcular la fecha de vencimiento.
                                    </p>
                                </div>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Fecha de inicio
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="date"
                                                value={dueDateStart}
                                                onChange={(e) => setDueDateStart(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Días hábiles a sumar
                                        </label>
                                        <div className="relative">
                                            <Hash className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                min="1"
                                                max="365"
                                                placeholder="Ej: 15"
                                                value={businessDaysCount}
                                                onChange={(e) => setBusinessDaysCount(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                                            />
                                        </div>
                                        <p className="text-xs text-gray-500">Entre 1 y 365 días hábiles</p>
                                    </div>
                                </div>
                            </>
                        )}

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={mode === 'between-dates' ? calculateDays : calculateDueDate}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {loading ? 'Calculando...' : 'Calcular'}
                            </button>
                        </div>
                    </div>

                    {/* Resultados: Días entre fechas */}
                    {mode === 'between-dates' && result && (
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 sm:px-8 py-8 border-t border-gray-200">
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
                                    <h4 className="text-xl font-bold text-gray-900 mb-4">Feriados encontrados</h4>
                                    
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
                                            <h5 className="font-semibold text-gray-900">Lista de feriados</h5>
                                        </div>
                                        <div className="max-h-60 overflow-y-auto">
                                            {result.nonBusinessDays.details.map((day, index) => (
                                                <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {formatShortDate(day.date)}
                                                            </span>
                                                            <span className="text-gray-600 ml-2">({day.day})</span>
                                                        </div>
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
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

                    {/* Resultados: Fecha de vencimiento */}
                    {mode === 'due-date' && dueDateResult && (
                        <div className="bg-gradient-to-r from-gray-50 to-green-50 px-6 sm:px-8 py-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Fecha de Vencimiento</h3>

                            {/* Card principal con la fecha */}
                            <div className="bg-white p-6 sm:p-8 rounded-xl shadow-lg border-2 border-green-200 mb-8">
                                <div className="flex flex-col items-center text-center">
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <CalendarCheck className="w-8 h-8 text-green-600" />
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mb-2">La fecha de vencimiento es:</p>
                                    <p className="text-3xl sm:text-4xl font-bold text-green-600 mb-2 capitalize">
                                        {formatDate(dueDateResult.dueDate)}
                                    </p>
                                    <p className="text-lg text-gray-600">
                                        {formatShortDate(dueDateResult.dueDate)}
                                    </p>
                                </div>
                            </div>

                            {/* Resumen visual */}
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 bg-white p-6 rounded-xl border border-gray-200">
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Desde</p>
                                    <p className="font-semibold text-gray-900">{formatShortDate(dueDateResult.startDate)}</p>
                                </div>
                                <div className="flex items-center gap-2 text-green-600">
                                    <span className="text-sm font-medium">+{dueDateResult.businessDaysRequested} días hábiles</span>
                                    <ArrowRight className="w-5 h-5" />
                                </div>
                                <div className="text-center">
                                    <p className="text-sm text-gray-500">Hasta</p>
                                    <p className="font-semibold text-green-600">{formatShortDate(dueDateResult.dueDate)}</p>
                                </div>
                            </div>

                            {/* Estadísticas */}
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-green-600">{dueDateResult.businessDaysRequested}</div>
                                    <div className="text-xs text-gray-600">Días hábiles</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-blue-600">{dueDateResult.totalCalendarDays}</div>
                                    <div className="text-xs text-gray-600">Días calendario</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-orange-600">{dueDateResult.nonBusinessDays.weekends}</div>
                                    <div className="text-xs text-gray-600">Fines de semana</div>
                                </div>
                                <div className="bg-white p-4 rounded-lg border border-gray-200 text-center">
                                    <div className="text-2xl font-bold text-purple-600">{dueDateResult.nonBusinessDays.holidays}</div>
                                    <div className="text-xs text-gray-600">Feriados</div>
                                </div>
                            </div>

                            {/* Lista de feriados si hay */}
                            {dueDateResult.nonBusinessDays && dueDateResult.nonBusinessDays.details.length > 0 && (
                                <div className="mb-8">
                                    <h4 className="text-lg font-bold text-gray-900 mb-4">Feriados en el período</h4>
                                    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                                        <div className="max-h-48 overflow-y-auto">
                                            {dueDateResult.nonBusinessDays.details.map((day, index) => (
                                                <div key={index} className="px-4 py-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                                                    <div className="flex justify-between items-center">
                                                        <div>
                                                            <span className="font-medium text-gray-900">
                                                                {formatShortDate(day.date)}
                                                            </span>
                                                            <span className="text-gray-600 ml-2">({day.day})</span>
                                                        </div>
                                                        <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-full text-xs font-medium">
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
                                <h4 className="text-lg font-semibold text-gray-900 mb-3">Detalle del cálculo</h4>
                                <div className="space-y-2 text-sm text-gray-600">
                                    <p>• <strong>Fecha inicio:</strong> {formatDate(dueDateResult.startDate)}</p>
                                    <p>• <strong>Días hábiles solicitados:</strong> {dueDateResult.businessDaysRequested}</p>
                                    <p>• <strong>Días calendario transcurridos:</strong> {dueDateResult.totalCalendarDays}</p>
                                    <p>• <strong>Fines de semana omitidos:</strong> {dueDateResult.nonBusinessDays.weekends}</p>
                                    <p>• <strong>Feriados omitidos:</strong> {dueDateResult.nonBusinessDays.holidays}</p>
                                    <p>• <strong>Fecha de vencimiento:</strong> {formatDate(dueDateResult.dueDate)}</p>
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