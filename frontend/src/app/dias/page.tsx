"use client"

import { useState } from 'react'
import { Calculator, Calendar, Clock, CheckCircle, ArrowRight, Hash, CalendarCheck, Info, Briefcase } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'
import PDFExportButton from "@/components/PDFExportButton"

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

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-teal-900 to-blue-900">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-teal-900/20 to-slate-900/90"></div>

                <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex-1 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4 text-teal-300" />
                            <span className="text-xs sm:text-sm font-semibold text-white">Calculadora de Días</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Cálculo de <span className="bg-gradient-to-r from-teal-300 to-cyan-300 bg-clip-text text-transparent">Días Hábiles</span>
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                            Calculá plazos, vencimientos y días laborables considerando fines de semana y feriados oficiales de Argentina.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    
                    {/* Columna Izquierda: Controles */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                    <Clock className="w-5 h-5 text-teal-600" />
                                </div>
                                <h2 className="text-xl font-bold text-gray-900">Configuración</h2>
                            </div>

                            <div className="space-y-6">
                                {/* Selector de Modo */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Tipo de cálculo</label>
                                    <div className="grid grid-cols-1 gap-2">
                                        <button
                                            onClick={() => {
                                                setMode('between-dates')
                                                setError('')
                                                setResult(null)
                                                setDueDateResult(null)
                                            }}
                                            className={`flex items-center px-4 py-3 border rounded-lg transition-all ${
                                                mode === 'between-dates' 
                                                ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' 
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <Calendar className="w-5 h-5 mr-3" />
                                            <div className="text-left">
                                                <div className="font-medium text-sm">Días entre fechas</div>
                                            </div>
                                        </button>
                                        <button
                                            onClick={() => {
                                                setMode('due-date')
                                                setError('')
                                                setResult(null)
                                                setDueDateResult(null)
                                            }}
                                            className={`flex items-center px-4 py-3 border rounded-lg transition-all ${
                                                mode === 'due-date' 
                                                ? 'border-teal-500 bg-teal-50 text-teal-700 ring-1 ring-teal-500' 
                                                : 'border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            <CalendarCheck className="w-5 h-5 mr-3" />
                                            <div className="text-left">
                                                <div className="font-medium text-sm">Fecha de vencimiento</div>
                                            </div>
                                        </button>
                                    </div>
                                </div>

                                <div className="h-px bg-gray-200 my-4"></div>

                                {/* Inputs según modo */}
                                {mode === 'between-dates' ? (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
                                            <input
                                                type="date"
                                                value={startDate}
                                                onChange={(e) => setStartDate(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha fin</label>
                                            <input
                                                type="date"
                                                value={endDate}
                                                onChange={(e) => setEndDate(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Fecha inicio</label>
                                            <input
                                                type="date"
                                                value={dueDateStart}
                                                onChange={(e) => setDueDateStart(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-2">Días hábiles a sumar</label>
                                            <div className="relative">
                                                <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <input
                                                    type="number"
                                                    min="1"
                                                    max="365"
                                                    value={businessDaysCount}
                                                    onChange={(e) => setBusinessDaysCount(e.target.value)}
                                                    placeholder="Ej: 15"
                                                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 no-spinners"
                                                />
                                            </div>
                                        </div>
                                    </>
                                )}

                                <button
                                    onClick={mode === 'between-dates' ? calculateDays : calculateDueDate}
                                    disabled={loading}
                                    className="w-full bg-teal-600 text-white py-3 px-6 rounded-lg hover:bg-teal-700 focus:ring-2 focus:ring-teal-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                >
                                    {loading ? 'Calculando...' : 'Calcular'}
                                </button>

                                {error && (
                                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                                        <p className="text-red-600 text-sm">{error}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Columna Derecha: Resultados */}
                    <div className="lg:col-span-2">
                        {/* Estado Inicial */}
                        {!result && !dueDateResult && (
                             <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col items-center justify-center">
                                <Briefcase className="w-20 h-20 text-gray-400 mb-6" />
                                <h3 className="text-2xl font-bold text-gray-600 mb-4">Calculadora de Días</h3>
                                <p className="text-gray-500 text-lg max-w-md mx-auto">
                                    Seleccioná un modo de cálculo y completá los parámetros para ver los resultados aquí.
                                </p>
                            </div>
                        )}

                        {/* Resultado: Entre Fechas */}
                        {mode === 'between-dates' && result && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Resultado</h2>
                                        </div>
                                        <PDFExportButton 
                                            elementId="days-calculation-results" 
                                            fileName="calculo-dias-habiles" 
                                            title="Cálculo de Días Hábiles"
                                        />
                                    </div>

                                    <div id="days-calculation-results" className="space-y-6 bg-white p-2 rounded-xl">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                        <div className="bg-blue-50 rounded-lg p-4">
                                            <p className="text-sm text-blue-800">Días de corrido</p>
                                            <p className="text-3xl font-bold text-blue-700">{result.totalDays}</p>
                                            <p className="text-xs text-blue-600 mt-1">Días calendario totales</p>
                                        </div>
                                        <div className="bg-green-50 rounded-lg p-4">
                                            <p className="text-sm text-green-800">Días hábiles</p>
                                            <p className="text-3xl font-bold text-green-700">{result.businessDays}</p>
                                            <p className="text-xs text-green-600 mt-1">Excluyendo findes y feriados</p>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-6">
                                        <h4 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Resumen del período</h4>
                                        <div className="grid grid-cols-3 gap-4 text-center">
                                            <div className="p-2">
                                                <div className="text-2xl font-bold text-gray-700">{result.nonBusinessDays.total}</div>
                                                <div className="text-xs text-gray-500">No Hábiles</div>
                                            </div>
                                            <div className="p-2 border-l border-gray-200">
                                                <div className="text-2xl font-bold text-gray-700">{result.nonBusinessDays.weekends}</div>
                                                <div className="text-xs text-gray-500">Fin de Semana</div>
                                            </div>
                                            <div className="p-2 border-l border-gray-200">
                                                <div className="text-2xl font-bold text-purple-600">{result.nonBusinessDays.holidays}</div>
                                                <div className="text-xs text-gray-500">Feriados</div>
                                            </div>
                                        </div>
                                    </div>
                                    
                                    <div className="text-sm text-gray-600 text-center bg-gray-50 rounded p-2">
                                        {formatDate(result.startDate)} — {formatDate(result.endDate)}
                                    </div>
                                </div>
                            </div>

                            {result.nonBusinessDays.details.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="font-bold text-gray-900">Detalle de Feriados</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100 max-h-60 overflow-y-auto">
                                            {result.nonBusinessDays.details.map((day, index) => (
                                                <div key={index} className="px-6 py-3 hover:bg-gray-50 flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{formatShortDate(day.date)}</span>
                                                        <span className="text-sm text-gray-500 ml-2">({day.day})</span>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {day.reason}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Resultado: Fecha de Vencimiento */}
                        {mode === 'due-date' && dueDateResult && (
                            <div className="space-y-6">
                                <div className="bg-white rounded-xl shadow-lg p-6">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
                                                <CalendarCheck className="w-5 h-5 text-teal-600" />
                                            </div>
                                            <h2 className="text-xl font-bold text-gray-900">Fecha de Vencimiento</h2>
                                        </div>
                                        <PDFExportButton 
                                            elementId="due-date-calculation-results" 
                                            fileName="calculo-vencimiento" 
                                            title="Cálculo de Fecha de Vencimiento"
                                        />
                                    </div>

                                    <div id="due-date-calculation-results" className="space-y-6 bg-white p-2 rounded-xl">
                                        <div className="text-center py-6 bg-teal-50 rounded-xl border border-teal-100 mb-6">
                                            <p className="text-sm text-teal-700 mb-1">La fecha calculada es</p>
                                            <p className="text-3xl sm:text-4xl font-bold text-teal-800 capitalize mb-2">
                                                {formatDate(dueDateResult.dueDate)}
                                            </p>
                                            <p className="text-gray-600">{formatShortDate(dueDateResult.dueDate)}</p>
                                        </div>

                                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-lg mb-6">
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Inicio</p>
                                                <p className="font-semibold text-gray-900">{formatShortDate(dueDateResult.startDate)}</p>
                                            </div>
                                            <div className="flex items-center text-teal-500 px-4">
                                                <span className="text-xs font-medium mr-2">+{dueDateResult.businessDaysRequested} hábiles</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </div>
                                            <div className="text-center">
                                                <p className="text-xs text-gray-500">Fin</p>
                                                <p className="font-semibold text-teal-700">{formatShortDate(dueDateResult.dueDate)}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-3 border border-gray-200 rounded-lg text-center">
                                                <div className="text-xl font-bold text-gray-700">{dueDateResult.totalCalendarDays}</div>
                                                <div className="text-xs text-gray-500">Días Calendario</div>
                                            </div>
                                            <div className="p-3 border border-gray-200 rounded-lg text-center">
                                                <div className="text-xl font-bold text-purple-600">{dueDateResult.nonBusinessDays.holidays}</div>
                                                <div className="text-xs text-gray-500">Feriados saltados</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {dueDateResult.nonBusinessDays && dueDateResult.nonBusinessDays.details.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                                        <div className="px-6 py-4 border-b border-gray-200">
                                            <h3 className="font-bold text-gray-900">Feriados en el lapso</h3>
                                        </div>
                                        <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
                                            {dueDateResult.nonBusinessDays.details.map((day, index) => (
                                                <div key={index} className="px-6 py-3 hover:bg-gray-50 flex justify-between items-center">
                                                    <div>
                                                        <span className="font-medium text-gray-900">{formatShortDate(day.date)}</span>
                                                        <span className="text-sm text-gray-500 ml-2">({day.day})</span>
                                                    </div>
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                                        {day.reason}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}