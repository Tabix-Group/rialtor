"use client"
import React, { useMemo, useState } from "react"
import { Calculator, DollarSign, MapPin, FileText } from 'lucide-react'

type Bracket = { amount: number; pct: number }

// Helper to pick percentage for a given value from sorted brackets
function getPercent(value: number, brackets: Bracket[]) {
  for (const b of brackets) {
    if (value <= b.amount) return b.pct
  }
  return brackets[brackets.length - 1].pct
}

// Data taken from user's tables. amounts are USD, pct is decimal (e.g. 0.061 = 6.1%)
const BA_withSellos_buyer: Bracket[] = [
  { amount: 20000, pct: 0.061 },
  { amount: 30000, pct: 0.058 },
  { amount: 40000, pct: 0.055 },
  { amount: 50000, pct: 0.052 },
  { amount: 60000, pct: 0.047 },
  { amount: 70000, pct: 0.0455 },
  { amount: 80000, pct: 0.044 },
  { amount: 90000, pct: 0.043 },
  { amount: 100000, pct: 0.042 },
  { amount: 115000, pct: 0.041 },
  { amount: 130000, pct: 0.038 },
  { amount: 145000, pct: 0.037 },
  { amount: 160000, pct: 0.036 },
  { amount: 175000, pct: 0.035 },
  { amount: 190000, pct: 0.034 },
  { amount: 205000, pct: 0.033 },
  { amount: 230000, pct: 0.032 },
  { amount: 245000, pct: 0.031 },
  { amount: 260000, pct: 0.03 },
  { amount: 275000, pct: 0.029 },
  { amount: 290000, pct: 0.028 },
  { amount: 310000, pct: 0.027 },
  { amount: 350000, pct: 0.026 },
  { amount: 400000, pct: 0.0255 },
  { amount: 500000, pct: 0.025 },
  { amount: 600000, pct: 0.0245 },
  { amount: 700000, pct: 0.024 },
  { amount: 800000, pct: 0.0235 },
  { amount: 900000, pct: 0.023 },
  { amount: 1000000, pct: 0.0225 },
]

const BA_withSellos_seller: Bracket[] = [
  { amount: 20000, pct: 0.034 },
  { amount: 30000, pct: 0.034 },
  { amount: 40000, pct: 0.032 },
  { amount: 50000, pct: 0.032 },
  { amount: 60000, pct: 0.03 },
  { amount: 70000, pct: 0.0285 },
  { amount: 80000, pct: 0.027 },
  { amount: 90000, pct: 0.026 },
  { amount: 100000, pct: 0.025 },
  { amount: 115000, pct: 0.024 },
  { amount: 130000, pct: 0.024 },
  { amount: 145000, pct: 0.023 },
  { amount: 160000, pct: 0.022 },
  { amount: 175000, pct: 0.021 },
  { amount: 190000, pct: 0.02 },
  { amount: 205000, pct: 0.019 },
  { amount: 230000, pct: 0.019 },
  { amount: 245000, pct: 0.019 },
  { amount: 260000, pct: 0.018 },
  { amount: 275000, pct: 0.0179 },
  { amount: 290000, pct: 0.0178 },
  { amount: 310000, pct: 0.0177 },
  { amount: 350000, pct: 0.0176 },
  { amount: 400000, pct: 0.0175 },
  { amount: 500000, pct: 0.0174 },
  { amount: 600000, pct: 0.0173 },
  { amount: 700000, pct: 0.0172 },
  { amount: 800000, pct: 0.0171 },
  { amount: 900000, pct: 0.017 },
  { amount: 1000000, pct: 0.0169 },
]

const BA_noSellos_buyer: Bracket[] = [
  { amount: 20000, pct: 0.053 },
  { amount: 30000, pct: 0.05 },
  { amount: 40000, pct: 0.047 },
  { amount: 50000, pct: 0.044 },
  { amount: 60000, pct: 0.039 },
  { amount: 70000, pct: 0.0375 },
  { amount: 80000, pct: 0.036 },
  { amount: 90000, pct: 0.035 },
  { amount: 100000, pct: 0.034 },
  { amount: 115000, pct: 0.033 },
  { amount: 130000, pct: 0.03 },
  { amount: 145000, pct: 0.029 },
  { amount: 160000, pct: 0.028 },
  { amount: 175000, pct: 0.028 },
  { amount: 190000, pct: 0.027 },
  { amount: 205000, pct: 0.026 },
  { amount: 230000, pct: 0.025 },
  { amount: 245000, pct: 0.024 },
  { amount: 260000, pct: 0.023 },
  { amount: 275000, pct: 0.022 },
  { amount: 290000, pct: 0.021 },
  { amount: 310000, pct: 0.021 },
  { amount: 350000, pct: 0.02 },
  { amount: 400000, pct: 0.0195 },
  { amount: 500000, pct: 0.019 },
  { amount: 600000, pct: 0.0185 },
  { amount: 700000, pct: 0.019 },
  { amount: 800000, pct: 0.0185 },
  { amount: 900000, pct: 0.018 },
  { amount: 1000000, pct: 0.0175 },
]

const BA_noSellos_seller: Bracket[] = [
  { amount: 20000, pct: 0.024 },
  { amount: 30000, pct: 0.024 },
  { amount: 40000, pct: 0.024 },
  { amount: 50000, pct: 0.023 },
  { amount: 60000, pct: 0.023 },
  { amount: 70000, pct: 0.023 },
  { amount: 80000, pct: 0.018 },
  { amount: 90000, pct: 0.018 },
  { amount: 100000, pct: 0.018 },
  { amount: 115000, pct: 0.018 },
  { amount: 130000, pct: 0.018 },
  { amount: 145000, pct: 0.018 },
  { amount: 160000, pct: 0.018 },
  { amount: 175000, pct: 0.018 },
  { amount: 190000, pct: 0.018 },
  { amount: 205000, pct: 0.012 },
  { amount: 230000, pct: 0.012 },
  { amount: 245000, pct: 0.012 },
  { amount: 260000, pct: 0.012 },
  { amount: 275000, pct: 0.0109 },
  { amount: 290000, pct: 0.0109 },
  { amount: 310000, pct: 0.0109 },
  { amount: 350000, pct: 0.0109 },
  { amount: 400000, pct: 0.0097 },
  { amount: 500000, pct: 0.0097 },
  { amount: 600000, pct: 0.0097 },
  { amount: 700000, pct: 0.0077 },
  { amount: 800000, pct: 0.0077 },
  { amount: 900000, pct: 0.0077 },
  { amount: 1000000, pct: 0.0077 },
]

const CABA_buyer: Bracket[] = [
  { amount: 20000, pct: 0.068 },
  { amount: 30000, pct: 0.065 },
  { amount: 40000, pct: 0.062 },
  { amount: 50000, pct: 0.059 },
  { amount: 60000, pct: 0.054 },
  { amount: 70000, pct: 0.0525 },
  { amount: 80000, pct: 0.051 },
  { amount: 90000, pct: 0.05 },
  { amount: 100000, pct: 0.049 },
  { amount: 115000, pct: 0.048 },
  { amount: 130000, pct: 0.045 },
  { amount: 145000, pct: 0.044 },
  { amount: 160000, pct: 0.043 },
  { amount: 175000, pct: 0.042 },
  { amount: 190000, pct: 0.041 },
  { amount: 205000, pct: 0.04 },
  { amount: 230000, pct: 0.039 },
  { amount: 245000, pct: 0.038 },
  { amount: 260000, pct: 0.037 },
  { amount: 275000, pct: 0.036 },
  { amount: 290000, pct: 0.035 },
  { amount: 310000, pct: 0.034 },
  { amount: 350000, pct: 0.033 },
  { amount: 400000, pct: 0.0325 },
  { amount: 500000, pct: 0.032 },
  { amount: 600000, pct: 0.0315 },
  { amount: 700000, pct: 0.031 },
  { amount: 800000, pct: 0.0305 },
  { amount: 900000, pct: 0.03 },
  { amount: 1000000, pct: 0.0295 },
]

const CABA_seller: Bracket[] = [
  { amount: 20000, pct: 0.039 },
  { amount: 30000, pct: 0.039 },
  { amount: 40000, pct: 0.035 },
  { amount: 50000, pct: 0.035 },
  { amount: 60000, pct: 0.036 },
  { amount: 70000, pct: 0.0345 },
  { amount: 80000, pct: 0.033 },
  { amount: 90000, pct: 0.032 },
  { amount: 100000, pct: 0.031 },
  { amount: 115000, pct: 0.03 },
  { amount: 130000, pct: 0.027 },
  { amount: 145000, pct: 0.026 },
  { amount: 160000, pct: 0.025 },
  { amount: 175000, pct: 0.024 },
  { amount: 190000, pct: 0.023 },
  { amount: 205000, pct: 0.022 },
  { amount: 230000, pct: 0.022 },
  { amount: 245000, pct: 0.022 },
  { amount: 260000, pct: 0.021 },
  { amount: 275000, pct: 0.0209 },
  { amount: 290000, pct: 0.0208 },
  { amount: 310000, pct: 0.0207 },
  { amount: 350000, pct: 0.0206 },
  { amount: 400000, pct: 0.0205 },
  { amount: 500000, pct: 0.0204 },
  { amount: 600000, pct: 0.0203 },
  { amount: 700000, pct: 0.0202 },
  { amount: 800000, pct: 0.0201 },
  { amount: 900000, pct: 0.02 },
  { amount: 1000000, pct: 0.0199 },
]

export default function CalceEscrituraPage() {
  const [usd, setUsd] = useState<string>("")
  const [locality, setLocality] = useState<string>("Buenos Aires")
  const [sellos, setSellos] = useState<string>("con")

  const numericUsd = useMemo(() => {
    const v = Number((usd || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [usd])

  const { buyerAmount, sellerAmount, buyerPct, sellerPct } = useMemo(() => {
    let buyerPct = 0
    let sellerPct = 0

    if (locality === "Buenos Aires") {
      if (sellos === "con") {
        buyerPct = getPercent(numericUsd, BA_withSellos_buyer)
        sellerPct = getPercent(numericUsd, BA_withSellos_seller)
      } else {
        buyerPct = getPercent(numericUsd, BA_noSellos_buyer)
        sellerPct = getPercent(numericUsd, BA_noSellos_seller)
      }
    } else {
      // CABA
      buyerPct = getPercent(numericUsd, CABA_buyer)
      sellerPct = getPercent(numericUsd, CABA_seller)
    }

    const buyerAmount = numericUsd * buyerPct
    const sellerAmount = numericUsd * sellerPct
    return { buyerAmount, sellerAmount, buyerPct, sellerPct }
  }, [numericUsd, locality, sellos])

  function formatUSD(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Calculadora de gastos inmobiliarios</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Calculá los costos asociados a la firma de escritura en Argentina por provincia
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Calculadora de Gastos Inmobiliarios</h2>
            </div>
          </div>

          <div className="p-8">
            {/* Form */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Valor de la propiedad (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    inputMode="numeric"
                    value={usd}
                    onChange={(e) => setUsd(e.target.value)}
                    placeholder="Ej. 120000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Localidad
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option>Buenos Aires</option>
                    <option>CABA</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sellos
                </label>
                <div className="relative">
                  <FileText className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={sellos}
                    onChange={(e) => setSellos(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="con">Con sellos</option>
                    <option value="sin">Sin sellos</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Results */}
            {numericUsd > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-8 border border-gray-100">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Cálculo de Gastos</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Comprador</h4>
                        <p className="text-sm text-gray-600">Total a pagar</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-blue-600">{formatUSD(buyerAmount)}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {((buyerPct * 100)).toFixed(2)}% del valor de la propiedad
                    </p>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-green-600" />
                      </div>
                      <div>
                        <h4 className="text-lg font-semibold text-gray-900">Vendedor</h4>
                        <p className="text-sm text-gray-600">Total a pagar</p>
                      </div>
                    </div>
                    <p className="text-3xl font-bold text-green-600">{formatUSD(sellerAmount)}</p>
                    <p className="text-sm text-gray-500 mt-2">
                      {((sellerPct * 100)).toFixed(2)}% del valor de la propiedad
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Los cálculos incluyen impuestos, aranceles notariales y otros costos asociados.
                    Los valores son estimativos y pueden variar según la jurisdicción y condiciones específicas.
                  </p>
                </div>
              </div>
            )}

            {numericUsd === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Ingresa el valor de la propiedad para ver los cálculos</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            <strong>Información:</strong> Esta calculadora utiliza las alícuotas vigentes para cada jurisdicción.
            Para cálculos precisos, consultá con un escribano o profesional especializado.
          </p>
        </div>
      </div>
    </div>
  )
}
