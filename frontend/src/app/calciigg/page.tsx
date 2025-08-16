"use client"
import React, { useMemo, useState } from "react"

// Nota: las alícuotas se mantienen como constantes editables en el archivo (no se muestran al usuario).
// Esto permite ajustar las tasas cuando tengas las fuentes oficiales.

const RATES: Record<string, number> = {
  "Buenos Aires": 0.15,
  "CABA": 0.15,
}

export default function CalcIIGGPage() {
  const [jurisdiction, setJurisdiction] = useState<string>("Buenos Aires")
  const [precioCompra, setPrecioCompra] = useState<string>("")
  const [precioVenta, setPrecioVenta] = useState<string>("")
  const [gastosDeducibles, setGastosDeducibles] = useState<string>("")
  const [anoAdquisicion, setAnoAdquisicion] = useState<string>("")
  const [esViviendaUnica, setEsViviendaUnica] = useState<boolean>(false)
  const [moneda, setMoneda] = useState<string>("USD")

  const numericCompra = useMemo(() => {
    const v = Number(precioCompra.replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [precioCompra])

  const numericVenta = useMemo(() => {
    const v = Number(precioVenta.replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [precioVenta])

  const numericGastos = useMemo(() => {
    const v = Number(gastosDeducibles.replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [gastosDeducibles])

  const gain = useMemo(() => {
    return Math.max(0, numericVenta - numericCompra - numericGastos)
  }, [numericVenta, numericCompra, numericGastos])

  const numericAnoAdq = useMemo(() => {
    const v = Number(anoAdquisicion.replace(/[^0-9]/g, ""))
    return isNaN(v) ? 0 : v
  }, [anoAdquisicion])

  // Reglas: aplica solo si comprado a partir de 2018 y NO es vivienda única, familiar y de uso permanente
  const aplica = useMemo(() => {
    if (numericAnoAdq === 0) return false
    if (numericAnoAdq < 2018) return false
    if (esViviendaUnica) return false
    return true
  }, [numericAnoAdq, esViviendaUnica])

  const rate = RATES[jurisdiction] ?? 0
  const impuesto = useMemo(() => {
    if (!aplica) return 0
    return gain * rate
  }, [gain, rate, aplica])

  function formatMoney(n: number) {
    const currencyCode = moneda === "USD" ? "USD" : "ARS"
    return n.toLocaleString(undefined, { style: "currency", currency: currencyCode, maximumFractionDigits: 2 })
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-semibold text-gray-800 mb-6">Calculadora — Impuesto cedular (Ganancia Inmobiliaria)</h1>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Precio de compra (primero)</span>
              <input inputMode="numeric" value={precioCompra} onChange={(e) => setPrecioCompra(e.target.value)} placeholder="Ej. 80000" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Precio de venta</span>
              <input inputMode="numeric" value={precioVenta} onChange={(e) => setPrecioVenta(e.target.value)} placeholder="Ej. 120000" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Gastos deducibles (comisiones, mejoras, etc.)</span>
              <input inputMode="numeric" value={gastosDeducibles} onChange={(e) => setGastosDeducibles(e.target.value)} placeholder="Ej. 5000" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Jurisdicción</span>
              <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option>Buenos Aires</option>
                <option>CABA</option>
              </select>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Año de adquisición</span>
              <input inputMode="numeric" value={anoAdquisicion} onChange={(e) => setAnoAdquisicion(e.target.value)} placeholder="Ej. 2019" className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400" />
            </label>

            <label className="flex items-center gap-3">
              <input type="checkbox" checked={esViviendaUnica} onChange={(e) => setEsViviendaUnica(e.target.checked)} className="w-4 h-4" />
              <span className="text-sm text-gray-600">Vivienda única, familiar y de uso permanente</span>
            </label>

            <label className="flex flex-col">
              <span className="text-sm text-gray-600 mb-1">Moneda</span>
              <select value={moneda} onChange={(e) => setMoneda(e.target.value)} className="px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-400">
                <option value="USD">USD</option>
                <option value="ARS">ARS</option>
              </select>
            </label>

          </div>

          <div className="mt-6 bg-indigo-50 border border-indigo-100 rounded-lg p-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
              <div>
                <div className="text-sm text-gray-600">Ganancia neta</div>
                <div className="text-2xl font-bold text-indigo-700">{formatMoney(gain)}</div>
              </div>

              <div>
                <div className="text-sm text-gray-600">Impuesto cedular estimado ({jurisdiction})</div>
                {aplica ? (
                  <div className="text-2xl font-bold text-gray-700">{formatMoney(impuesto)}</div>
                ) : (
                  <div className="text-2xl font-bold text-red-600">No aplica</div>
                )}
              </div>
            </div>

            {!aplica && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded text-sm text-red-700">
                {numericAnoAdq === 0 ? (
                  <div>Ingrese el año de adquisición para evaluar si aplica.</div>
                ) : numericAnoAdq < 2018 ? (
                  <div>No aplica: el inmueble fue adquirido antes de 2018.</div>
                ) : esViviendaUnica ? (
                  <div>No aplica: es vivienda única, familiar y de uso permanente.</div>
                ) : (
                  <div>No aplica.</div>
                )}
              </div>
            )}
          </div>

          <div className="mt-4 text-xs text-gray-500">Los resultados muestran el impuesto estimado por la ganancia inmobiliaria según la jurisdicción seleccionada. Las alícuotas están configuradas en el código y no se muestran al usuario.</div>
        </div>
      </div>
    </div>
  )
}
