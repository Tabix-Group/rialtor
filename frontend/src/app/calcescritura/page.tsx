"use client"
import React, { useMemo, useState } from "react"

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

  const { buyerAmount, sellerAmount } = useMemo(() => {
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
    return { buyerAmount, sellerAmount }
  }, [numericUsd, locality, sellos])

  function formatUSD(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Calculadora — Gastos de escritura</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Valor (USD)</span>
              <input
                inputMode="numeric"
                value={usd}
                onChange={(e) => setUsd(e.target.value)}
                placeholder="Ej. 120000"
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Localidad</span>
              <select
                value={locality}
                onChange={(e) => setLocality(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option>Buenos Aires</option>
                <option>CABA</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Sellos</span>
              <select
                value={sellos}
                onChange={(e) => setSellos(e.target.value)}
                className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400"
              >
                <option value="con">Con sellos</option>
                <option value="sin">Sin sellos</option>
              </select>
            </label>
          </div>

          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">Total a pagar por el comprador</div>
              <div className="text-2xl font-bold text-indigo-700">{formatUSD(buyerAmount)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">Total a pagar por el vendedor</div>
              <div className="text-2xl font-bold text-gray-700">{formatUSD(sellerAmount)}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">Seleccioná las opciones y el resultado se mostrará arriba. No se muestran las alícuotas.</div>
        </div>
      </div>
    </div>
  )
}
