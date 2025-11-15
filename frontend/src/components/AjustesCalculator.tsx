'use client'

import { useState } from 'react'

export default function AjustesCalculator() {
  const [currentAmount, setCurrentAmount] = useState('')
  const [adjustmentPercentage, setAdjustmentPercentage] = useState('')
  const [period, setPeriod] = useState('mensual')
  const [currency, setCurrency] = useState('ARS')
  const [result, setResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const handleCalculate = async () => {
    if (!currentAmount || !adjustmentPercentage || isNaN(Number(currentAmount)) || isNaN(Number(adjustmentPercentage))) {
      alert('Por favor ingresa valores válidos')
      return
    }

    setLoading(true)
    setResult(null)

    try {
      const current = parseFloat(currentAmount)
      const percentage = parseFloat(adjustmentPercentage)

      // Calcular el aumento
      const increase = current * (percentage / 100)
      const newAmount = current + increase

      // Calcular según período
      let periodMultiplier = 1
      let periodLabel = 'mes'

      switch (period) {
        case 'trimestral':
          periodMultiplier = 3
          periodLabel = 'trimestre'
          break
        case 'semestral':
          periodMultiplier = 6
          periodLabel = 'semestre'
          break
        case 'anual':
          periodMultiplier = 12
          periodLabel = 'año'
          break
        default:
          periodMultiplier = 1
          periodLabel = 'mes'
      }

      const totalIncrease = increase * periodMultiplier
      const totalNewAmount = newAmount * periodMultiplier

      setResult({
        currentAmount: current,
        newAmount,
        increase,
        percentage,
        period,
        periodMultiplier,
        periodLabel,
        totalIncrease,
        totalNewAmount,
        currency
      })
    } catch (error) {
      alert('Error en el cálculo')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: currency === 'USD' ? 'USD' : 'ARS',
      minimumFractionDigits: 2
    }).format(amount)
  }

  return (
    <div className="bg-white rounded-2xl shadow p-6 border border-gray-100 mb-8">
      <h2 className="text-xl font-bold mb-4 text-indigo-700">Calculadora de Ajustes de Alquiler</h2>
      <p className="text-sm text-gray-600 mb-6">
        Calculá ajustes por IPC, acuerdos o índices para contratos de alquiler en Argentina
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Monto actual del alquiler</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500 text-sm">
              {currency === 'USD' ? 'USD' : 'ARS'}
            </span>
            <input
              type="number"
              value={currentAmount}
              onChange={e => setCurrentAmount(e.target.value)}
              placeholder="Ej: 50000"
              className="w-full pl-12 pr-4 py-2 border rounded"
              min="0"
              step="0.01"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Porcentaje de ajuste (%)</label>
          <div className="relative">
            <span className="absolute left-3 top-3 text-gray-500 text-sm">%</span>
            <input
              type="number"
              value={adjustmentPercentage}
              onChange={e => setAdjustmentPercentage(e.target.value)}
              placeholder="Ej: 15.5"
              className="w-full pl-8 pr-4 py-2 border rounded"
              min="0"
              step="0.1"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-semibold mb-1">Moneda</label>
          <select
            value={currency}
            onChange={e => setCurrency(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="ARS">Pesos Argentinos (ARS)</option>
            <option value="USD">Dólares (USD)</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold mb-1">Período de ajuste</label>
          <select
            value={period}
            onChange={e => setPeriod(e.target.value)}
            className="w-full px-3 py-2 border rounded"
          >
            <option value="mensual">Mensual</option>
            <option value="trimestral">Trimestral</option>
            <option value="semestral">Semestral</option>
            <option value="anual">Anual</option>
          </select>
        </div>
      </div>

      <button
        onClick={handleCalculate}
        disabled={loading || !currentAmount || !adjustmentPercentage}
        className="bg-indigo-600 text-white px-4 py-2 rounded font-bold disabled:bg-gray-300 w-full md:w-auto"
      >
        {loading ? 'Calculando...' : 'Calcular Ajuste'}
      </button>

      {result && (
        <div className="mt-6 bg-indigo-50 rounded p-4">
          <h3 className="font-semibold text-lg mb-4 text-indigo-800">Resultado del Ajuste</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">Monto actual</div>
              <div className="text-lg font-bold text-gray-800">
                {formatCurrency(result.currentAmount, result.currency)}
              </div>
            </div>

            <div className="bg-white p-3 rounded border">
              <div className="text-sm text-gray-600">Nuevo monto</div>
              <div className="text-lg font-bold text-green-600">
                {formatCurrency(result.newAmount, result.currency)}
              </div>
            </div>
          </div>

          <div className="bg-white p-4 rounded border mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-600">Aumento por {result.period}</div>
                <div className="text-xl font-bold text-blue-600">
                  {formatCurrency(result.increase, result.currency)}
                </div>
                <div className="text-xs text-gray-500">({result.percentage}%)</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Diferencia</div>
                <div className="text-xl font-bold text-indigo-600">
                  +{formatCurrency(result.increase, result.currency)}
                </div>
              </div>
            </div>
          </div>

          {result.periodMultiplier > 1 && (
            <div className="bg-gradient-to-r from-indigo-100 to-purple-100 p-4 rounded border">
              <h4 className="font-semibold text-indigo-800 mb-2">
                Proyección a {result.periodMultiplier} {result.periodLabel === 'mes' ? 'meses' : result.periodLabel === 'trimestre' ? 'trimestres' : result.periodLabel === 'semestre' ? 'semestres' : 'años'}
              </h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-sm text-gray-700">Aumento total</div>
                  <div className="text-lg font-bold text-purple-600">
                    {formatCurrency(result.totalIncrease, result.currency)}
                  </div>
                </div>
                <div>
                  <div className="text-sm text-gray-700">Monto total</div>
                  <div className="text-lg font-bold text-indigo-600">
                    {formatCurrency(result.totalNewAmount, result.currency)}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="text-xs text-gray-600 mt-4 space-y-1">
        <p><strong>💡 Consejos:</strong></p>
        <ul className="list-disc ml-5 space-y-1">
          <li>Para ajustes por IPC, usa el porcentaje oficial publicado por INDEC</li>
          <li>Los ajustes trimestrales son comunes en contratos de alquiler</li>
          <li>Verificá la legislación vigente para contratos de locación</li>
          <li>Los montos en dólares se convierten usando la cotización actual</li>
        </ul>
      </div>
    </div>
  )
}