"use client"

import { useState, useEffect } from 'react'
import { Calculator, TrendingUp, DollarSign, Calendar, Banknote } from 'lucide-react'
import { authenticatedFetch } from '../../utils/api'
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
    const [loanAmount, setLoanAmount] = useState('')
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
                console.log('Fetching bank rates for mortgage calculator...');
                // Usar endpoint de testing temporalmente
                const res = await authenticatedFetch('/api/admin/rates-test');
                const data = await res.json();
                console.log('Mortgage bank rates response:', data);
                if (data.success) {
                    setBankRates(data.data);
                } else {
                    console.error('Error in mortgage bank rates response:', data);
                }
            } catch (error) {
                console.error('Error fetching bank rates for mortgage:', error);
                // Fallback: intentar con el endpoint normal
                try {
                    const res = await authenticatedFetch('/api/admin/rates');
                    const data = await res.json();
                    console.log('Fallback mortgage bank rates response:', data);
                    if (data.success) {
                        setBankRates(data.data);
                    }
                } catch (fallbackError) {
                    console.error('Fallback also failed for mortgage:', fallbackError);
                }
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
        if (!loanAmount || !interestRate || !termYears) {
            setError('Por favor complete todos los campos')
            return
        }

        setLoading(true)
        setError('')

        try {
            const res = await authenticatedFetch('/api/calculator/mortgage', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    loanAmount: parseFloat(loanAmount),
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
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mb-8 text-center">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Calculadora de Créditos Hipotecarios</h1>
                    <p className="mt-2 text-gray-600 max-w-2xl mx-auto">
                        Calculá las cuotas de tu crédito hipotecario en Argentina usando el sistema de amortización francés
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Formulario */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <Calculator className="w-6 h-6 text-red-600" />
                            Datos del Préstamo
                        </h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Monto del Préstamo (ARS)
                                </label>
                                <input
                                    type="number"
                                    value={loanAmount}
                                    onChange={(e) => setLoanAmount(e.target.value)}
                                    placeholder="Ej: 5000000"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Banco
                                </label>
                                <select
                                    value={selectedBank}
                                    onChange={(e) => handleBankChange(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                >
                                    <option value="">Seleccionar banco</option>
                                    {bankRates.map((bank) => (
                                        <option key={bank.id} value={bank.bankName}>
                                            {bank.bankName} ({bank.interestRate}%)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Tasa de Interés Anual (%)
                                </label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={interestRate}
                                    onChange={(e) => setInterestRate(e.target.value)}
                                    placeholder="Ej: 8.5"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Plazo (años)
                                </label>
                                <input
                                    type="number"
                                    value={termYears}
                                    onChange={(e) => setTermYears(e.target.value)}
                                    placeholder="Ej: 20"
                                    min="1"
                                    max="50"
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                />
                            </div>

                            {error && (
                                <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                                    <p className="text-red-600 text-sm">{error}</p>
                                </div>
                            )}

                            <button
                                onClick={calculateMortgage}
                                disabled={loading}
                                className="w-full bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50"
                            >
                                {loading ? 'Calculando...' : 'Calcular Cuotas'}
                            </button>
                        </div>
                    </div>

                    {/* Resultados */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
                            <TrendingUp className="w-6 h-6 text-green-600" />
                            Resultados
                        </h2>

                        {result ? (
                            <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-blue-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <DollarSign className="w-4 h-4 text-blue-600" />
                                            <span className="text-sm font-medium text-blue-900">Cuota Mensual</span>
                                        </div>
                                        <p className="text-lg font-bold text-blue-900">{formatCurrency(result.monthlyPayment)}</p>
                                    </div>

                                    <div className="p-3 bg-green-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Banknote className="w-4 h-4 text-green-600" />
                                            <span className="text-sm font-medium text-green-900">Total a Pagar</span>
                                        </div>
                                        <p className="text-lg font-bold text-green-900">{formatCurrency(result.totalPayment)}</p>
                                    </div>

                                    <div className="p-3 bg-red-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <TrendingUp className="w-4 h-4 text-red-600" />
                                            <span className="text-sm font-medium text-red-900">Intereses Totales</span>
                                        </div>
                                        <p className="text-lg font-bold text-red-900">{formatCurrency(result.totalInterest)}</p>
                                    </div>

                                    <div className="p-3 bg-purple-50 rounded-lg">
                                        <div className="flex items-center gap-2 mb-1">
                                            <Calendar className="w-4 h-4 text-purple-600" />
                                            <span className="text-sm font-medium text-purple-900">Plazo</span>
                                        </div>
                                        <p className="text-lg font-bold text-purple-900">{result.termYears} años</p>
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Tabla de Amortización</h3>
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200 text-sm">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Mes</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Cuota</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Capital</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Interés</th>
                                                    <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Saldo</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {result.amortizationTable.map((row) => (
                                                    <tr key={row.month}>
                                                        <td className="px-3 py-2 whitespace-nowrap">{row.month}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(row.payment)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(row.principal)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(row.interest)}</td>
                                                        <td className="px-3 py-2 whitespace-nowrap">{formatCurrency(row.balance)}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-center py-12 text-gray-500">
                                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                                <p>Complete el formulario y presione "Calcular Cuotas" para ver los resultados</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-8 text-sm text-gray-500">
                    <p>
                        <strong>Nota:</strong> Este cálculo utiliza el sistema de amortización francés, donde las cuotas son fijas
                        y consisten en capital + intereses. Los resultados son estimativos y pueden variar según las condiciones
                        del banco y regulaciones vigentes.
                    </p>
                </div>
            </div>
        </div>
    )
}
