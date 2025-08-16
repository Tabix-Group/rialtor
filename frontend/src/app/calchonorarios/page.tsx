"use client"
import React, { useMemo, useState } from "react"

type Operation = "compra-venta" | "alquiler-residencial" | "alquiler-comercial" | "alquiler-temporal"

export default function CalcHonorariosPage() {
  const [operation, setOperation] = useState<Operation>("compra-venta")
  const [currency, setCurrency] = useState<string>("USD")
  const [amount, setAmount] = useState<string>("") // total contract or sale price
  const [zone, setZone] = useState<string>("CABA") // for alquiler residencial
  const [months, setMonths] = useState<string>("") // optional for temporal/commercial
  const [monthly, setMonthly] = useState<string>("")

  const numericAmount = useMemo(() => {
    const v = Number((amount || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [amount])

  const numericMonthly = useMemo(() => {
    const v = Number((monthly || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [monthly])

  const numericMonths = useMemo(() => {
    const v = Number((months || "").toString().replace(/[^0-9]/g, ""))
    return isNaN(v) ? 0 : v
  }, [months])

  const { partyAName, partyBName, amountA, amountB } = useMemo(() => {
    // We will name parties according to operation: for compra-venta: Vendedor / Comprador
    // For alquiler: Propietario / Inquilino
    let aName = "Propietario"
    let bName = "Inquilino"
    let a = 0
    let b = 0

    if (operation === "compra-venta") {
      aName = "Vendedor"
      bName = "Comprador"
      // default suggested percentages from the sheet
      const pctA = 0.03 // vendedor
      const pctB = 0.04 // comprador
      a = numericAmount * pctA
      b = numericAmount * pctB
    } else if (operation === "alquiler-residencial") {
      aName = "Propietario"
      bName = "Inquilino"
      // zone-based
      if (zone === "CABA") {
        // CABA: Propietario 4.15%, Inquilino 0%
        a = numericAmount * 0.0415
        b = numericAmount * 0.0
      } else {
        // Pcia. Bs As: Propietario 3%, Inquilino 5%
        a = numericAmount * 0.03
        b = numericAmount * 0.05
      }
    } else if (operation === "alquiler-comercial") {
      aName = "Propietario"
      bName = "Inquilino"
      // suggested 3% / 5%
      a = numericAmount * 0.03
      b = numericAmount * 0.05
    } else if (operation === "alquiler-temporal") {
      aName = "Propietario"
      bName = "Inquilino"
      // if user provided monthly and months, compute total
      const total = numericAmount > 0 ? numericAmount : numericMonthly * (numericMonths || 1)
      // suggested 10% / 20%
      a = total * 0.10
      b = total * 0.20
    }

    return { partyAName: aName, partyBName: bName, amountA: a, amountB: b }
  }, [operation, numericAmount, zone, numericMonthly, numericMonths])

  function formatMoney(n: number) {
    const currencyCode = currency === "USD" ? "USD" : "ARS"
    return n.toLocaleString(undefined, { style: "currency", currency: currencyCode, maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-3xl">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Calculadora — Honorarios</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Tipo de operación</span>
              <select value={operation} onChange={(e) => setOperation(e.target.value as Operation)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="compra-venta">Compra / Venta</option>
                <option value="alquiler-residencial">Alquiler Residencial</option>
                <option value="alquiler-comercial">Alquiler Comercial</option>
                <option value="alquiler-temporal">Alquiler Temporal</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Moneda</span>
              <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Monto (total del contrato o precio)</span>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Ej. 100000" inputMode="numeric" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>
          </div>

          {operation === "alquiler-residencial" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Zona</span>
                <select value={zone} onChange={(e) => setZone(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                  <option value="CABA">CABA</option>
                  <option value="Pcia">Pcia. Bs As.</option>
                </select>
              </label>
            </div>
          )}

          {operation === "alquiler-temporal" && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-4">
              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Monto mensual (opcional)</span>
                <input value={monthly} onChange={(e) => setMonthly(e.target.value)} placeholder="Ej. 1500" inputMode="numeric" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </label>

              <label className="flex flex-col">
                <span className="text-sm text-gray-600 mb-1">Plazo (meses) (opcional)</span>
                <input value={months} onChange={(e) => setMonths(e.target.value)} placeholder="Ej. 3" inputMode="numeric" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
              </label>

              <div className="flex items-end">
                <div className="text-xs text-gray-500">Si no ingresás Monto total, se calculará como mensual × plazo.</div>
              </div>
            </div>
          )}

          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-lg p-5 flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div>
              <div className="text-sm text-gray-600">{partyAName} — Total a pagar</div>
              <div className="text-2xl font-bold text-emerald-700">{formatMoney(amountA)}</div>
            </div>

            <div>
              <div className="text-sm text-gray-600">{partyBName} — Total a pagar</div>
              <div className="text-2xl font-bold text-gray-700">{formatMoney(amountB)}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-gray-500">Los resultados muestran cuánto paga cada parte. No se muestran las alícuotas ni el detalle del cálculo.</div>
        </div>
      </div>
    </div>
  )
}
