"use client"

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Calendar, Banknote, Building, Wallet } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'
import { useAuth } from '../auth/authContext'

interface BankRate {
    id: string
    bankName: string
    interestRate: number
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

    // Fetch bank rates
    useEffect(() => {
        const fetchBankRates = async () => {
            try {
                console.log('Fetching bank rates for mortgage calculator from /api/admin/rates (primary)...');
                const res = await authenticatedFetch('/api/admin/rates');
                console.log('Mortgage primary response status:', res.status);
                const data = await res.json();
                console.log('Mortgage primary response body:', data);
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
                console.log('Mortgage test response status:', res2.status);
                const data2 = await res2.json();
                console.log('Mortgage test response body:', data2);
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
            // For salary-based calculation, we'll use a simplified approach
            // In a real implementation, this would calculate the maximum loan amount based on salary
            // For now, we'll use a placeholder calculation
            const maxLoanBasedOnSalary = (parseFloat(salary) * 12 * 0.3) / 12 // Simplified calculation
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-AR', {
            style: 'currency',
            currency: 'ARS'
        }).format(amount)
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Simulá tu Crédito Hipotecario</h1>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                        Calculá las cuotas de tu crédito hipotecario en Argentina usando el sistema de amortización francés
                    </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
                    {/* Header with Bank Selector */}
                    <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-8 py-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <Calculator className="w-8 h-8 text-white" />
                                <h2 className="text-2xl font-bold text-white">Calculadora de Créditos UVA</h2>
                            </div>
                            <div className="text-right">
                                <p className="text-blue-100 text-sm">Seleccioná el banco</p>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => handleBankChange(e.target.value)}
                                    className="mt-1 px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
                                >
                                    <option value="" className="text-gray-900">Seleccionar banco</option>
                                    {bankRates.map((bank) => (
                                        <option key={bank.id} value={bank.bankName} className="text-gray-900">
                                            {bank.bankName}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="p-8">
                        {/* Calculation Mode Tabs */}
                        <div className="flex mb-8 bg-gray-100 rounded-lg p-1">
                            <button
                                onClick={() => setCalculationMode('salary')}
                                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${calculationMode === 'salary'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                En base a tu sueldo
                            </button>
                            <button
                                onClick={() => setCalculationMode('property')}
                                className={`flex-1 py-3 px-6 rounded-md font-medium transition-all ${calculationMode === 'property'
                                    ? 'bg-white text-blue-600 shadow-sm'
                                    : 'text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                En base a la propiedad
                            </button>
                        </div>

                        {/* Form */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                            {calculationMode === 'property' ? (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Valor de la propiedad (USD)
                                        </label>
                                        <div className="relative">
                                            <Building className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={propertyValue}
                                                onChange={(e) => setPropertyValue(e.target.value)}
                                                placeholder="Ej: 100000"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Monto total a pedir prestado (USD)
                                        </label>
                                        <div className="relative">
                                            <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={loanAmount}
                                                onChange={(e) => setLoanAmount(e.target.value)}
                                                placeholder="Ej: 80000"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Plazo del préstamo (años)
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={termYears}
                                                onChange={(e) => setTermYears(e.target.value)}
                                                placeholder="Ej: 20"
                                                min="1"
                                                max="50"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <>
                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ingreso neto mensual (ARS)
                                        </label>
                                        <div className="relative">
                                            <Wallet className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={salary}
                                                onChange={(e) => setSalary(e.target.value)}
                                                placeholder="Ej: 150000"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Ahorro disponible (USD)
                                        </label>
                                        <div className="relative">
                                            <Banknote className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={savings}
                                                onChange={(e) => setSavings(e.target.value)}
                                                placeholder="Ej: 20000"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Plazo del préstamo (años)
                                        </label>
                                        <div className="relative">
                                            <Calendar className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                                            <input
                                                type="number"
                                                value={termYears}
                                                onChange={(e) => setTermYears(e.target.value)}
                                                placeholder="Ej: 20"
                                                min="1"
                                                max="50"
                                                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            />
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-600 text-sm">{error}</p>
                            </div>
                        )}

                        <div className="text-center">
                            <button
                                onClick={calculateMortgage}
                                disabled={loading}
                                className="px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-105"
                            >
                                {loading ? 'Calculando...' : 'Calcular Cuotas'}
                            </button>
                        </div>
                    </div>

                    {/* Results */}
                    {result && (
                        <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-8 py-8 border-t border-gray-200">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Condiciones del crédito al que podrías acceder</h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <DollarSign className="w-6 h-6 text-green-600" />
                                        <span className="text-sm font-medium text-gray-600">Valor de la primera cuota</span>
                                    </div>
                                    <p className="text-2xl font-bold text-green-600">{formatCurrency(result.monthlyPayment)}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Banknote className="w-6 h-6 text-blue-600" />
                                        <span className="text-sm font-medium text-gray-600">Total a pagar</span>
                                    </div>
                                    <p className="text-2xl font-bold text-blue-600">{formatCurrency(result.totalPayment)}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-6 h-6 text-red-600" />
                                        <span className="text-sm font-medium text-gray-600">Intereses totales</span>
                                    </div>
                                    <p className="text-2xl font-bold text-red-600">{formatCurrency(result.totalInterest)}</p>
                                </div>

                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Calendar className="w-6 h-6 text-purple-600" />
                                        <span className="text-sm font-medium text-gray-600">Plazo</span>
                                    </div>
                                    <p className="text-2xl font-bold text-purple-600">{result.termYears} años</p>
                                </div>
                            </div>

                            {calculationMode === 'property' && propertyValue && loanAmount && (
                                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-6">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Wallet className="w-6 h-6 text-orange-600" />
                                        <span className="text-sm font-medium text-gray-600">Ahorro necesario</span>
                                    </div>
                                    <p className="text-2xl font-bold text-orange-600">
                                        {formatCurrency(parseFloat(propertyValue) - parseFloat(loanAmount))} USD
                                    </p>
                                </div>
                            )}

                            <div className="text-center">
                                <button className="px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-semibold rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all duration-200">
                                    Encontrá propiedades por ese valor
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="mt-8 text-sm text-gray-500 text-center">
                    <p>
                        <strong>Nota:</strong> Los montos son estimativos. Consultar con el banco correspondiente los valores y
                        condiciones finales del crédito hipotecario.
                    </p>
                </div>
            </div>
        </div>
    )
}
