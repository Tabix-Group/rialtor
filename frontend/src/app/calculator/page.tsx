'use client'

import { useState } from 'react'
import { Calculator, DollarSign, Percent, TrendingUp } from 'lucide-react'

interface CalculationResult {
  commission: number
  taxes: number
  netAmount: number
  details: {
    grossCommission: number
    iva: number
    incomeTax: number
    iibb: number
    other: number
  }
}

export default function CalculatorPage() {
  const [saleAmount, setSaleAmount] = useState('')
  const [commissionRate, setCommissionRate] = useState('3')
  const [zone, setZone] = useState('caba')
  const [isIndependent, setIsIndependent] = useState(true)
  const [result, setResult] = useState<CalculationResult | null>(null)

  const calculateCommission = () => {
    const amount = parseFloat(saleAmount)
    const rate = parseFloat(commissionRate)
    
    if (!amount || !rate) return

    const grossCommission = (amount * rate) / 100
    
    // Simulación de cálculos de impuestos (valores aproximados)
    const iva = grossCommission * 0.21
    const incomeTax = grossCommission * 0.35
    const iibb = grossCommission * 0.015
    const other = grossCommission * 0.05
    
    const totalTaxes = iva + incomeTax + iibb + other
    const netAmount = grossCommission - totalTaxes

    setResult({
      commission: grossCommission,
      taxes: totalTaxes,
      netAmount,
      details: {
        grossCommission,
        iva,
        incomeTax,
        iibb,
        other
      }
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Calculator className="w-8 h-8 text-red-600" />
              Calculadora de Comisiones
            </h1>
            <p className="text-gray-600">
              Calcula tu comisión neta después de impuestos
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Valor de la operación
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={saleAmount}
                    onChange={(e) => setSaleAmount(e.target.value)}
                    placeholder="1000000"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Porcentaje de comisión
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={commissionRate}
                    onChange={(e) => setCommissionRate(e.target.value)}
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Zona
                </label>
                <select
                  value={zone}
                  onChange={(e) => setZone(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="caba">CABA</option>
                  <option value="gba">GBA</option>
                  <option value="interior">Interior</option>
                </select>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="independent"
                  checked={isIndependent}
                  onChange={(e) => setIsIndependent(e.target.checked)}
                  className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
                />
                <label htmlFor="independent" className="ml-2 text-sm text-gray-700">
                  Trabajador independiente
                </label>
              </div>

              <button
                onClick={calculateCommission}
                disabled={!saleAmount || !commissionRate}
                className="w-full bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Calcular
              </button>
            </div>

            {/* Resultados */}
            <div className="space-y-4">
              {result && (
                <div className="bg-gray-50 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Resultado del cálculo
                  </h3>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-white rounded">
                      <span className="text-gray-600">Comisión bruta:</span>
                      <span className="font-semibold text-gray-800">
                        {formatCurrency(result.commission)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded">
                      <span className="text-gray-600">Total impuestos:</span>
                      <span className="font-semibold text-red-600">
                        -{formatCurrency(result.taxes)}
                      </span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-green-50 rounded border-2 border-green-200">
                      <span className="text-gray-800 font-medium">Comisión neta:</span>
                      <span className="font-bold text-green-600 text-lg">
                        {formatCurrency(result.netAmount)}
                      </span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">
                      Detalle de impuestos:
                    </h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>IVA (21%):</span>
                        <span>{formatCurrency(result.details.iva)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Ganancias (35%):</span>
                        <span>{formatCurrency(result.details.incomeTax)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>IIBB (1.5%):</span>
                        <span>{formatCurrency(result.details.iibb)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Otros (5%):</span>
                        <span>{formatCurrency(result.details.other)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="text-sm font-medium text-yellow-800 mb-2">
                  Importante:
                </h4>
                <p className="text-sm text-yellow-700">
                  Este cálculo es aproximado. Los impuestos pueden variar según tu situación fiscal específica. 
                  Consulta con un contador para obtener información precisa.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
