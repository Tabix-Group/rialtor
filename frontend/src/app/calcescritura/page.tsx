"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Calculator, DollarSign, MapPin, AlertTriangle } from 'lucide-react'

export default function CalceEscrituraPage() {
  const [activeTab, setActiveTab] = useState<'comprador' | 'vendedor' | 'primera'>('comprador')
  const [location, setLocation] = useState<'CABA' | 'PBA'>('CABA')
  const [exchangeRate, setExchangeRate] = useState<string>('1456.89')
  const [writingPrice, setWritingPrice] = useState<string>('100000')
  const [transactionPrice, setTransactionPrice] = useState<string>('100000')
  const [stampExemption, setStampExemption] = useState<boolean>(false)
  const [isLoadingExchangeRate, setIsLoadingExchangeRate] = useState<boolean>(true)
  const [exchangeRateError, setExchangeRateError] = useState<boolean>(false)

  // Fetch exchange rate from Ámbito API
  useEffect(() => {
    const fetchExchangeRate = async () => {
      try {
        const response = await fetch('https://mercados.ambito.com//dolar/oficial/variacion')
        const data = await response.json()

        if (data.venta) {
          // Remove commas and convert to number, then back to string
          const cleanRate = data.venta.replace(',', '.')
          setExchangeRate(cleanRate)
          setExchangeRateError(false)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.warn('Error fetching exchange rate from Ámbito:', error)
        setExchangeRateError(true)
        // Keep the default value if API fails
      } finally {
        setIsLoadingExchangeRate(false)
      }
    }

    fetchExchangeRate()
  }, [])

  const numericExchangeRate = useMemo(() => {
    const v = Number((exchangeRate || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) || v === 0 ? 1456.89 : v
  }, [exchangeRate])

  const numericWritingPrice = useMemo(() => {
    const v = Number((writingPrice || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [writingPrice])

  const numericTransactionPrice = useMemo(() => {
    const v = Number((transactionPrice || "").toString().replace(/[^0-9.]/g, ""))
    return isNaN(v) ? 0 : v
  }, [transactionPrice])

  const calculations = useMemo(() => {
    const arsTransactionPrice = numericTransactionPrice * numericExchangeRate
    const arsWritingPrice = numericWritingPrice * numericExchangeRate

    // IVA rate
    const ivaRate = 0.21

    let realEstateFee = 0
    let realEstateFeeIVA = 0
    let notaryFees = 0
    let notaryFeesIVA = 0
    let stamps = 0
    let otros = 0
    let writingCosts = 0
    let reserveFund = 0
    let totalCosts = 0
    let finalAmount = 0

    if (activeTab === 'comprador') {
      // Real estate fee: 4% + IVA
      realEstateFee = numericTransactionPrice * 0.04
      realEstateFeeIVA = realEstateFee * ivaRate

      // Notary fees: 2% + IVA
      notaryFees = numericTransactionPrice * 0.02
      notaryFeesIVA = notaryFees * ivaRate

      // Stamps: 1.75% (3.5% in CABA, but split between buyer/seller)
      const stampRate = location === 'CABA' ? 0.035 : 0.02
      const exemptionThreshold = 205000000 // ARS
      if (stampExemption && location === 'CABA') {
        if (arsTransactionPrice <= exemptionThreshold) {
          stamps = 0
        } else {
          stamps = (arsTransactionPrice - exemptionThreshold) * (stampRate / 2) / numericExchangeRate
        }
      } else {
        stamps = numericTransactionPrice * (stampRate / 2)
      }

      // Otros: 0.75%
      otros = numericTransactionPrice * 0.0075

      totalCosts = realEstateFee + realEstateFeeIVA + notaryFees + notaryFeesIVA + stamps + otros
      finalAmount = numericTransactionPrice + totalCosts

    } else if (activeTab === 'vendedor') {
      // Real estate fee: 3% + IVA
      realEstateFee = numericTransactionPrice * 0.03
      realEstateFeeIVA = realEstateFee * ivaRate

      // Stamps: 1.75% (3.5% in CABA, but split between buyer/seller)
      const stampRate = location === 'CABA' ? 0.035 : 0.02
      const exemptionThreshold = 205000000 // ARS
      if (stampExemption && location === 'CABA') {
        if (arsTransactionPrice <= exemptionThreshold) {
          stamps = 0
        } else {
          stamps = (arsTransactionPrice - exemptionThreshold) * (stampRate / 2) / numericExchangeRate
        }
      } else {
        stamps = numericTransactionPrice * (stampRate / 2)
      }

      // Writing costs: 2% (no IVA)
      writingCosts = arsWritingPrice * 0.02 / numericExchangeRate // Convert back to USD

      totalCosts = realEstateFee + realEstateFeeIVA + stamps + writingCosts
      finalAmount = numericTransactionPrice - totalCosts

    } else if (activeTab === 'primera') {
      // Real estate fee: 4% + IVA
      realEstateFee = numericTransactionPrice * 0.04
      realEstateFeeIVA = realEstateFee * ivaRate

      // Notary fees: 3.5% in CABA (includes copropiedad) + IVA
      notaryFees = numericTransactionPrice * 0.035
      notaryFeesIVA = notaryFees * ivaRate

      // Stamps: 3.5% in CABA, 2% in PBA, with exemption threshold
      const stampRate = location === 'CABA' ? 0.035 : 0.02
      const exemptionThreshold = 205000000 // ARS
      if (arsTransactionPrice <= exemptionThreshold) {
        stamps = 0
      } else {
        stamps = (arsTransactionPrice - exemptionThreshold) * stampRate / numericExchangeRate
      }

      // Reserve fund: up to 6% (no IVA)
      reserveFund = numericTransactionPrice * 0.01

      totalCosts = realEstateFee + realEstateFeeIVA + notaryFees + notaryFeesIVA + stamps + reserveFund
      finalAmount = numericTransactionPrice + totalCosts
    }

    return {
      realEstateFee,
      realEstateFeeIVA,
      notaryFees,
      notaryFeesIVA,
      stamps,
      otros,
      writingCosts,
      reserveFund,
      totalCosts,
      finalAmount,
      arsTransactionPrice,
      arsWritingPrice
    }
  }, [activeTab, location, numericExchangeRate, numericWritingPrice, numericTransactionPrice, stampExemption])

  function formatUSD(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
  }

  function formatARS(n: number) {
    return n.toLocaleString('es-AR', { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Calculadora de gastos inmobiliarios</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simulá tu operación inmobiliaria y calculá todos los costos asociados
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 px-8 py-6">
            <div className="flex items-center gap-3">
              <Calculator className="w-8 h-8 text-white" />
              <h2 className="text-2xl font-bold text-white">Simulá tu operación</h2>
            </div>
          </div>

          <div className="p-8">
            {/* Input Form */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Ubicación de la propiedad
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value as 'CABA' | 'PBA')}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent appearance-none"
                  >
                    <option value="CABA">CABA</option>
                    <option value="PBA">Provincia de Buenos Aires</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Tipo de Cambio {isLoadingExchangeRate && <span className="text-xs text-gray-500">(cargando...)</span>}
                  {exchangeRateError && !isLoadingExchangeRate && <span className="text-xs text-red-500">(error)</span>}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-400 text-sm">1 USD =</span>
                  <input
                    inputMode="numeric"
                    value={exchangeRate}
                    onChange={(e) => setExchangeRate(e.target.value)}
                    placeholder="1456.89"
                    disabled={isLoadingExchangeRate}
                    className={`w-full pl-16 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:opacity-50 ${isLoadingExchangeRate ? 'animate-pulse bg-gray-50 border-gray-300' : exchangeRateError ? 'border-red-300 bg-red-50' : 'border-gray-300'
                      }`}
                  />
                  {isLoadingExchangeRate && (
                    <div className="absolute right-12 top-3">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-green-500 border-t-transparent"></div>
                    </div>
                  )}
                  {exchangeRateError && !isLoadingExchangeRate && (
                    <div className="absolute right-12 top-3">
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    </div>
                  )}
                  <span className="absolute right-3 top-3 text-gray-400 text-sm">ARS</span>
                </div>
                {exchangeRateError && !isLoadingExchangeRate && (
                  <p className="text-sm text-red-600">
                    Error al cargar el tipo de cambio. Usando valor por defecto.
                  </p>
                )}
                {!exchangeRateError && !isLoadingExchangeRate && (
                  <p className="text-sm text-green-600">
                    Tipo de cambio actualizado automáticamente desde Ámbito.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Escrituración (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    inputMode="numeric"
                    value={writingPrice}
                    onChange={(e) => setWritingPrice(e.target.value)}
                    placeholder="100000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Precio de Transacción (USD)
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    inputMode="numeric"
                    value={transactionPrice}
                    onChange={(e) => setTransactionPrice(e.target.value)}
                    placeholder="100000"
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Exención de sellos
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={stampExemption}
                    onChange={(e) => setStampExemption(e.target.checked)}
                    className="w-4 h-4 text-green-600 bg-gray-100 border-gray-300 rounded focus:ring-green-500"
                  />
                  <span className="text-sm text-gray-600">Vivienda única de uso permanente</span>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                    onClick={() => setActiveTab('comprador')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'comprador'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Comprador
                  </button>
                  <button
                    onClick={() => setActiveTab('vendedor')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'vendedor'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    Vendedor
                  </button>
                  <button
                    onClick={() => setActiveTab('primera')}
                    className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'primera'
                      ? 'border-green-500 text-green-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                      }`}
                  >
                    1ª Escritura
                  </button>
                </nav>
              </div>
            </div>

            {/* Results */}
            {numericTransactionPrice > 0 && (
              <div className="bg-gradient-to-r from-gray-50 to-green-50 rounded-xl p-8 border border-gray-100">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {activeTab === 'comprador' ? 'Comprador' : activeTab === 'vendedor' ? 'Vendedor' : '1ª Escritura'}
                  </h3>
                  <p className="text-gray-600">Detalle de Gastos</p>
                </div>

                <div className="space-y-4">
                  {/* Real Estate Fee */}
                  {calculations.realEstateFee > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Comisión Inmobiliaria</div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'comprador' ? '4,00%' : '3,00%'} + IVA
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.realEstateFee * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.realEstateFee)}</div>
                      </div>
                    </div>
                  )}

                  {/* IVA for Real Estate Fee */}
                  {calculations.realEstateFeeIVA > 0 && (
                    <div className="flex justify-between items-center py-2 pl-4 border-b border-gray-100">
                      <div className="text-sm text-gray-600">IVA</div>
                      <div className="text-right">
                        <div className="font-medium text-gray-700">{formatARS(calculations.realEstateFeeIVA * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.realEstateFeeIVA)}</div>
                      </div>
                    </div>
                  )}

                  {/* Notary Fees */}
                  {calculations.notaryFees > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Honorarios de Escribanía</div>
                        <div className="text-sm text-gray-500">
                          {activeTab === 'primera' && location === 'CABA' ? '3,50%' : '2,00%'} + IVA
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.notaryFees * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.notaryFees)}</div>
                      </div>
                    </div>
                  )}

                  {/* IVA for Notary Fees */}
                  {calculations.notaryFeesIVA > 0 && (
                    <div className="flex justify-between items-center py-2 pl-4 border-b border-gray-100">
                      <div className="text-sm text-gray-600">IVA</div>
                      <div className="text-right">
                        <div className="font-medium text-gray-700">{formatARS(calculations.notaryFeesIVA * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.notaryFeesIVA)}</div>
                      </div>
                    </div>
                  )}

                  {/* Stamps */}
                  {calculations.stamps > 0 && activeTab === 'primera' && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Sellos</div>
                        <div className="text-sm text-gray-500">
                          {location === 'CABA' ? '3,50%' : '2,00%'}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.stamps * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.stamps)}</div>
                      </div>
                    </div>
                  )}

                  {/* Stamps */}
                  {(calculations.stamps > 0 || (stampExemption && location === 'CABA' && activeTab === 'comprador')) && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Sellos</div>
                        <div className="text-sm text-gray-500">
                          {stampExemption && location === 'CABA' && calculations.stamps === 0 ? 'Exento' : `${location === 'CABA' ? '1,75%' : '1,00%'}`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{calculations.stamps === 0 && stampExemption && location === 'CABA' ? 'Exento' : formatARS(calculations.stamps * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{calculations.stamps === 0 && stampExemption && location === 'CABA' ? '' : formatUSD(calculations.stamps)}</div>
                      </div>
                    </div>
                  )}

                  {/* Otros */}
                  {calculations.otros > 0 && activeTab === 'comprador' && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Otros</div>
                        <div className="text-sm text-gray-500">0,75%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.otros * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.otros)}</div>
                      </div>
                    </div>
                  )}

                  {/* Writing Costs */}
                  {calculations.writingCosts > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Gastos Administrativos (Estudio de titulos, Diligenciamiento de certificados , otros)</div>
                        <div className="text-sm text-gray-500">2,00%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.writingCosts * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.writingCosts)}</div>
                      </div>
                    </div>
                  )}

                  {/* Reserve Fund */}
                  {calculations.reserveFund > 0 && (
                    <div className="flex justify-between items-center py-3 border-b border-gray-200">
                      <div>
                        <div className="font-medium text-gray-900">Gastos de alhajamiento y equipamiento (1%)</div>
                        <div className="text-sm text-gray-500">1,00%</div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">{formatARS(calculations.reserveFund * numericExchangeRate)}</div>
                        <div className="text-sm text-gray-500">{formatUSD(calculations.reserveFund)}</div>
                      </div>
                    </div>
                  )}

                  {/* Total */}
                  <div className="flex justify-between items-center py-4 border-t-2 border-gray-300 bg-gray-50 px-4 rounded-lg">
                    <div>
                      <div className="font-bold text-gray-900">Total gastos</div>
                      <div className="text-sm text-gray-500">{((calculations.totalCosts / numericTransactionPrice) * 100).toFixed(2)}% de la transacción</div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-gray-900">{formatARS(calculations.totalCosts * numericExchangeRate)}</div>
                      <div className="text-sm text-gray-500">{formatUSD(calculations.totalCosts)}</div>
                    </div>
                  </div>

                  {/* Final Amount */}
                  <div className="flex justify-between items-center py-4 bg-green-50 px-4 rounded-lg border border-green-200">
                    <div>
                      <div className="font-bold text-green-900">
                        {activeTab === 'comprador' ? 'Monto final' : activeTab === 'vendedor' ? 'Monto a recibir' : 'Monto final'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-green-900">{formatARS(calculations.finalAmount * numericExchangeRate)}</div>
                      <div className="text-sm text-green-700">{formatUSD(calculations.finalAmount)}</div>
                    </div>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    <strong>Nota:</strong> Los cálculos son estimativos y pueden variar según condiciones específicas.
                    Consultá con profesionales especializados para información precisa.
                  </p>
                </div>
              </div>
            )}

            {numericTransactionPrice === 0 && (
              <div className="text-center py-12 text-gray-500">
                <Calculator className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Ingresa los datos de tu operación para ver los cálculos</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-sm text-gray-500 text-center">
          <p>
            <strong>Información:</strong> Esta calculadora proporciona estimaciones aproximadas.
            Los valores reales pueden variar según la legislación vigente y condiciones particulares.
          </p>
        </div>
      </div>
    </div>
  )
}
