"use client"

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Calendar, Banknote, Building, Wallet, Percent, Home, AlertCircle } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'
import { useAuth } from '../auth/authContext'
import PDFExportButton from "@/components/PDFExportButton"

interface BankRate {
    id: string
    bankName: string
    interestRate: number
    termMonths?: number
}

interface MortgageResult {
    loanAmount: number
    interestRate: number
    termYears: number
    termMonths: number
    monthlyPayment: number
    totalPayment: number
    totalInterest: number
    bankName: string
    amortizationTable: Array<{
        month: number
        payment: number
        principal: number
        interest: number
        balance: number
    }>
}

export default function HipotecariosPage() {
    const { user } = useAuth()
    const [activeTab, setActiveTab] = useState<'calculator' | 'rates'>('calculator')
    const [calculationMode, setCalculationMode] = useState<'salary' | 'property'>('property')
    const [loanAmount, setLoanAmount] = useState('')
    const [propertyValue, setPropertyValue] = useState('')
    const [salary, setSalary] = useState('')
    const [savings, setSavings] = useState('')
    const [interestRate, setInterestRate] = useState('')
    const [termYears, setTermYears] = useState('')
    const [selectedBank, setSelectedBank] = useState('')
    const [bankRates, setBankRates] = useState<BankRate[]>([])
    const [result, setResult] = useState<MortgageResult | null>(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [exchangeRate, setExchangeRate] = useState<number>(1450)
    const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState(true)

    // Fetch bank rates
    useEffect(() => {
        const fetchExchangeRate = async () => {
            try {
                const response = await fetch('https://mercados.ambito.com//dolar/oficial/variacion')
                const data = await response.json()
                if (data.venta) {
                    setExchangeRate(parseFloat(data.venta.replace(',', '.')))
                }
            } catch (error) {
                console.warn('Error fetching exchange rate:', error)
            } finally {
                setIsLoadingExchangeRate(false)
            }
        }
        fetchExchangeRate()
    }, [])

    // Fetch bank rates
    useEffect(() => {
        const fetchBankRates = async () => {
            try {
                const res = await authenticatedFetch('/api/admin/rates');
                const data = await res.json();
                if (data && data.success) {
                    setBankRates(data.data);
                    return;
                }
            } catch (err) {
                console.error('Primary rates fetch failed:', err);
            }

            // Fallback to test endpoint
            try {
                const res2 = await authenticatedFetch('/api/admin/rates-test');
                const data2 = await res2.json();
                if (data2 && data2.success) setBankRates(data2.data);
            } catch (err2) {
                console.error('rates-test also failed for mortgage:', err2);
            }
        }
        fetchBankRates()
    }, [])

    const handleBankChange = (bankName: string) => {
        setSelectedBank(bankName)
        const bank = bankRates.find(b => b.bankName === bankName)
        if (bank) {
            setInterestRate(bank.interestRate.toString())
        }
    }

    const calculateMortgage = async () => {
        let finalLoanAmount = ''

        if (calculationMode === 'property') {
            if (!propertyValue || !loanAmount || !termYears) {
                setError('Por favor complete todos los campos')
                return
            }
            finalLoanAmount = loanAmount
        } else {
            if (!salary || !savings || !termYears) {
                setError('Por favor complete todos los campos')
                return
            }
            const maxLoanBasedOnSalary = (parseFloat(salary) * 12 * 0.3) / 12
            finalLoanAmount = maxLoanBasedOnSalary.toString()
        }

        setLoading(true)
        setError('')

        try {
            const res = await authenticatedFetch('/api/calculator/mortgage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanAmount: parseFloat(finalLoanAmount),
                    interestRate: parseFloat(interestRate),
                    termYears: parseInt(termYears),
                    bankName: selectedBank
                })
            })

            const data = await res.json()
            if (data.success) {
                setResult(data.data)
            } else {
                setError(data.message || 'Error al calcular')
            }
        } catch (error) {
            setError('Error al calcular el crédito hipotecario')
        } finally {
            setLoading(false)
        }
    }

    const formatUSD = (amount: number) => {
        return `US$ ${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    }

    const formatARS = (amount: number) => {
        return amount.toLocaleString('es-AR', {
            style: 'currency',
            currency: 'ARS',
            maximumFractionDigits: 0
        })
    }

    const handlePropertyValueChange = (value: string) => {
        setPropertyValue(value)
        if (value && loanAmount) {
            // No action needed for anticipo if it's derived, 
            // but if we want it to stay consistent we might need logic here
        }
    }

    const handleLoanAmountChange = (value: string) => {
        setLoanAmount(value)
    }

    const anticipoMonetary = (parseFloat(propertyValue) || 0) - (parseFloat(loanAmount) || 0)
    const anticipoPercentage = propertyValue && parseFloat(propertyValue) > 0 
        ? (anticipoMonetary / parseFloat(propertyValue)) * 100 
        : 0

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

                <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex-1 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                            <Home className="w-3 h-3 sm:w-4 sm:h-4 text-blue-300" />
                            <span className="text-xs sm:text-sm font-semibold text-white">Créditos UVA</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Simulador <span className="bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Hipotecario</span>
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                            Calculá las cuotas de tu crédito hipotecario en Argentina usando el sistema de amortización francés y compará tasas bancarias.
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                
                {/* Selector de Herramienta */}
                <div className="flex justify-center mb-12">
                     <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setActiveTab('calculator')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'calculator'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Calculator className="w-4 h-4" />
                            Calculadora
                        </button>
                        <button
                            onClick={() => setActiveTab('rates')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all ${
                                activeTab === 'rates'
                                    ? 'bg-blue-600 text-white shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                        >
                            <Percent className="w-4 h-4" />
                            Tasas Vigentes
                        </button>
                    </div>
                </div>

                {activeTab === 'calculator' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Columna Izquierda: Parámetros */}
                        <div className="lg:col-span-1">
                            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                                        <Calculator className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <h2 className="text-xl font-bold text-gray-900">Parámetros</h2>
                                </div>

                                <div className="space-y-6">
                                    {/* Bank Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Banco
                                        </label>
                                        <select
                                            value={selectedBank}
                                            onChange={(e) => handleBankChange(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Seleccionar banco...</option>
                                            {bankRates.map((bank) => (
                                                <option key={bank.id} value={bank.bankName}>
                                                    {bank.bankName}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Mode Selector */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Cálculo basado en</label>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => setCalculationMode('property')}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                                                    calculationMode === 'property' 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Propiedad
                                            </button>
                                            <button
                                                onClick={() => setCalculationMode('salary')}
                                                className={`px-3 py-2 text-sm font-medium rounded-lg border ${
                                                    calculationMode === 'salary' 
                                                    ? 'border-blue-500 bg-blue-50 text-blue-700' 
                                                    : 'border-gray-200 text-gray-600 hover:bg-gray-50'
                                                }`}
                                            >
                                                Sueldo
                                            </button>
                                        </div>
                                    </div>

                                    {/* Inputs Dynamic */}
                                    {calculationMode === 'property' ? (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Valor Propiedad (USD)</label>
                                                <div className="relative">
                                                    <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={propertyValue}
                                                        onChange={(e) => setPropertyValue(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinners"
                                                        placeholder="100000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Monto Préstamo (USD)</label>
                                                <div className="relative">
                                                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={loanAmount}
                                                        onChange={(e) => handleLoanAmountChange(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinners"
                                                        placeholder="80000"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Anticipo (Diferencia)</label>
                                                <div className="relative">
                                                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <div className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-600 font-medium flex justify-between items-center">
                                                        <span>{formatUSD(anticipoMonetary)}</span>
                                                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">{anticipoPercentage.toFixed(1)}% del total</span>
                                                    </div>
                                                </div>
                                                <p className="mt-1 text-[10px] text-gray-400 italic font-medium tracking-tight">Cálculo automático: Propiedad - Préstamo</p>
                                            </div>
                                        </>
                                    ) : (
                                        <>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ingreso Neto (ARS)</label>
                                                <div className="relative">
                                                    <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={salary}
                                                        onChange={(e) => setSalary(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinners"
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-2">Ahorros (USD)</label>
                                                <div className="relative">
                                                    <Banknote className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <input
                                                        type="number"
                                                        value={savings}
                                                        onChange={(e) => setSavings(e.target.value)}
                                                        className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinners"
                                                    />
                                                </div>
                                            </div>
                                        </>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Plazo (Años)</label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={termYears}
                                                onChange={(e) => setTermYears(e.target.value)}
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 no-spinners"
                                                placeholder="20"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={calculateMortgage}
                                        disabled={loading}
                                        className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                                    >
                                        {loading ? 'Calculando...' : 'Calcular Cuotas'}
                                    </button>

                                    {error && (
                                        <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2">
                                            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                            <p className="text-red-700 text-sm">{error}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Columna Derecha: Resultados */}
                        <div className="lg:col-span-2">
                            {result ? (
                                <div className="space-y-6">
                                    <div className="bg-white rounded-xl shadow-lg p-6">
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                                    <TrendingUp className="w-5 h-5 text-green-600" />
                                                </div>
                                                <h2 className="text-xl font-bold text-gray-900">Proyección del Crédito</h2>
                                            </div>
                                            <PDFExportButton 
                                                elementId="mortgage-calculation-results" 
                                                fileName="simulacion-hipotecaria" 
                                                title={`Simulación Crédito Hipotecario - ${selectedBank || 'Resultados'}`}
                                            />
                                        </div>
                                    </div>

                                    <div id="mortgage-calculation-results" className="space-y-6 bg-white p-4 rounded-xl">
                                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                                <div className="bg-blue-50 rounded-lg p-5 border border-blue-100">
                                                    <p className="text-sm font-medium text-blue-800 mb-1">Valor Primera Cuota</p>
                                                    <p className="text-3xl font-bold text-blue-700">{formatUSD(result.monthlyPayment)}</p>
                                                    <p className="text-xs text-blue-600 mt-1 font-medium">{formatARS(result.monthlyPayment * exchangeRate)}</p>
                                                </div>
                                                <div className="bg-gray-50 rounded-lg p-5 border border-gray-200">
                                                    <p className="text-sm font-medium text-gray-600 mb-1">Monto Total a Pagar</p>
                                                    <p className="text-3xl font-bold text-gray-900">{formatUSD(result.totalPayment)}</p>
                                                    <p className="text-xs text-gray-500 mt-1 font-medium">{formatARS(result.totalPayment * exchangeRate)}</p>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
                                                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Plazo</p>
                                                    <p className="text-lg font-bold text-gray-800">{result.termYears} años</p>
                                                </div>
                                                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Tasa TNA</p>
                                                    <p className="text-lg font-bold text-gray-800">{result.interestRate}%</p>
                                                </div>
                                                <div className="p-3 bg-white border border-gray-200 rounded-lg text-center col-span-2 sm:col-span-1">
                                                    <p className="text-xs text-gray-500 uppercase tracking-wide">Intereses</p>
                                                    <p className="text-lg font-bold text-red-600">{formatUSD(result.totalInterest)}</p>
                                                    <p className="text-[10px] text-red-400 font-medium">{formatARS(result.totalInterest * exchangeRate)}</p>
                                                </div>
                                            </div>

                                            {calculationMode === 'property' && propertyValue && loanAmount && (
                                                <div className="bg-orange-50 p-4 rounded-lg border border-orange-200 flex items-center gap-3">
                                                    <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                                        <Wallet className="w-6 h-6 text-orange-600" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-orange-800 font-medium">Ahorro inicial necesario (Anticipo)</p>
                                                        <div className="flex items-baseline gap-2">
                                                            <p className="text-xl font-bold text-orange-700">
                                                                {formatUSD(anticipoMonetary)}
                                                            </p>
                                                            <p className="text-xs text-orange-600 font-medium tracking-tight">
                                                                {formatARS(anticipoMonetary * exchangeRate)}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-100 font-sans">
                                            <h3 className="font-bold text-gray-900 mb-4">Nota Importante</h3>
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                Los montos calculados son estimativos y corresponden a la primera cuota. 
                                                En los créditos UVA, el capital adeudado se ajusta mensualmente por inflación (CER), 
                                                por lo que el valor de la cuota en pesos variará a lo largo del tiempo.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col items-center justify-center">
                                    <Home className="w-20 h-20 text-gray-400 mb-6" />
                                    <h3 className="text-2xl font-bold text-gray-600 mb-4">Simulador Hipotecario</h3>
                                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                                        Selecciona un banco y completa los datos de la propiedad o tus ingresos para calcular tu crédito.
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    /* Rates Tab */
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                         <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-900">Tasas de Referencia</h3>
                            <span className="text-xs text-gray-500">Actualizado recientemente</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Banco</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tasa (TNA)</th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plazo Máx.</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {bankRates.map((rate, idx) => (
                                        <tr key={rate.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{rate.bankName}</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-blue-600 font-bold">{rate.interestRate}%</td>
                                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                                                {rate.termMonths ? `${(rate.termMonths / 12).toFixed(0)} años` : 'N/A'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {bankRates.length === 0 && (
                                <div className="p-8 text-center text-gray-500">
                                    No se encontraron tasas disponibles en este momento.
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}