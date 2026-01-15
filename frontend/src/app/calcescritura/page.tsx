"use client"
import React, { useMemo, useState, useEffect } from "react"
import { Calculator, DollarSign, MapPin, AlertTriangle, FileText, CheckCircle, Info, Building2 } from 'lucide-react'

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
          const cleanRate = data.venta.replace(',', '.')
          setExchangeRate(cleanRate)
          setExchangeRateError(false)
        } else {
          throw new Error('Invalid response format')
        }
      } catch (error) {
        console.warn('Error fetching exchange rate from Ámbito:', error)
        setExchangeRateError(true)
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
      realEstateFee = numericTransactionPrice * 0.04
      realEstateFeeIVA = realEstateFee * ivaRate
      notaryFees = numericTransactionPrice * 0.02
      notaryFeesIVA = notaryFees * ivaRate
      const stampRate = location === 'CABA' ? 0.027 : 0.02
      const exemptionThreshold = 226100000
      if (stampExemption && location === 'CABA') {
        if (arsWritingPrice <= exemptionThreshold) {
          stamps = 0
        } else {
          stamps = (arsWritingPrice - exemptionThreshold) * (stampRate / 2) / numericExchangeRate
        }
      } else {
        stamps = numericWritingPrice * (stampRate / 2)
      }
      otros = numericTransactionPrice * 0.0075
      totalCosts = realEstateFee + notaryFees + stamps + otros
      finalAmount = numericTransactionPrice + totalCosts

    } else if (activeTab === 'vendedor') {
      realEstateFee = numericTransactionPrice * 0.03
      realEstateFeeIVA = realEstateFee * ivaRate
      const stampRate = location === 'CABA' ? 0.027 : 0.02
      const exemptionThreshold = 226100000
      if (stampExemption && location === 'CABA') {
        if (arsWritingPrice <= exemptionThreshold) {
          stamps = 0
        } else {
          stamps = (arsWritingPrice - exemptionThreshold) * (stampRate / 2) / numericExchangeRate
        }
      } else {
        stamps = numericWritingPrice * (stampRate / 2)
      }
      writingCosts = arsWritingPrice * 0.02 / numericExchangeRate
      totalCosts = realEstateFee + stamps + writingCosts
      finalAmount = numericTransactionPrice - totalCosts

    } else if (activeTab === 'primera') {
      realEstateFee = numericTransactionPrice * 0.04
      realEstateFeeIVA = realEstateFee * ivaRate
      notaryFees = numericTransactionPrice * 0.035
      notaryFeesIVA = notaryFees * ivaRate
      const stampRate = location === 'CABA' ? 0.027 : 0.02
      const exemptionThreshold = 226100000
      if (arsWritingPrice <= exemptionThreshold) {
        stamps = 0
      } else {
        stamps = (arsWritingPrice - exemptionThreshold) * stampRate / numericExchangeRate
      }
      reserveFund = numericTransactionPrice * 0.01
      totalCosts = realEstateFee + realEstateFeeIVA + notaryFees + notaryFeesIVA + stamps + reserveFund
      finalAmount = numericTransactionPrice + totalCosts
    }

    return {
      realEstateFee, realEstateFeeIVA, notaryFees, notaryFeesIVA,
      stamps, otros, writingCosts, reserveFund, totalCosts, finalAmount,
      arsTransactionPrice, arsWritingPrice
    }
  }, [activeTab, location, numericExchangeRate, numericWritingPrice, numericTransactionPrice, stampExemption])

  function formatUSD(n: number) {
    return n.toLocaleString(undefined, { style: "currency", currency: "USD", maximumFractionDigits: 2 })
  }

  function formatARS(n: number) {
    return n.toLocaleString('es-AR', { style: "currency", currency: "ARS", maximumFractionDigits: 0 })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/20 to-emerald-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-green-900 to-emerald-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-green-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
              <FileText className="w-3 h-3 sm:w-4 sm:h-4 text-green-300" />
              <span className="text-xs sm:text-sm font-semibold text-white">Calculadora Notarial</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Gastos de <span className="bg-gradient-to-r from-green-300 to-emerald-300 bg-clip-text text-transparent">Escrituración</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Simulá tu operación inmobiliaria y calculá todos los costos asociados para compradores, vendedores y primera escritura.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Columna Izquierda: Formulario */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Calculator className="w-5 h-5 text-green-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Parámetros</h2>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de la propiedad
                  </label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value as 'CABA' | 'PBA')}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                      <option value="CABA">CABA</option>
                      <option value="PBA">Provincia de Buenos Aires</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Cambio {isLoadingExchangeRate && <span className="text-xs text-gray-500">(cargando...)</span>}
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm font-bold">USD</span>
                    <input
                      inputMode="numeric"
                      value={exchangeRate}
                      onChange={(e) => setExchangeRate(e.target.value)}
                      disabled={isLoadingExchangeRate}
                      className={`w-full pl-12 pr-12 py-3 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${exchangeRateError ? 'border-red-300 bg-red-50' : 'border-gray-300'}`}
                    />
                    <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">ARS</span>
                  </div>
                  {exchangeRateError ? (
                     <p className="mt-1 text-xs text-red-600">Error al cargar dólar oficial.</p>
                  ) : (
                     <p className="mt-1 text-xs text-green-600">Actualizado desde Ámbito.</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Escrituración
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      inputMode="numeric"
                      value={writingPrice}
                      onChange={(e) => setWritingPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Precio de Transacción
                  </label>
                  <div className="relative">
                    <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      inputMode="numeric"
                      value={transactionPrice}
                      onChange={(e) => setTransactionPrice(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <input
                      type="checkbox"
                      id="exemption"
                      checked={stampExemption}
                      onChange={(e) => setStampExemption(e.target.checked)}
                      className="w-4 h-4 text-green-600 border-gray-300 rounded focus:ring-green-500"
                    />
                    <label htmlFor="exemption" className="text-sm text-gray-700 cursor-pointer select-none">
                      Vivienda única (Exención sellos)
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Resultados */}
          <div className="lg:col-span-2">
             {/* Tabs de Selección */}
             <div className="bg-white rounded-xl shadow-lg p-2 mb-6">
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => setActiveTab('comprador')}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'comprador'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Comprador
                  </button>
                  <button
                    onClick={() => setActiveTab('vendedor')}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'vendedor'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    Vendedor
                  </button>
                  <button
                    onClick={() => setActiveTab('primera')}
                    className={`py-3 px-4 rounded-lg font-medium text-sm transition-all ${
                      activeTab === 'primera'
                        ? 'bg-green-600 text-white shadow-md'
                        : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    1ª Escritura
                  </button>
                </div>
            </div>

            {numericTransactionPrice > 0 ? (
              <div className="space-y-6">
                {/* Resumen Final */}
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-5 h-5 text-emerald-600" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Resumen {activeTab === 'comprador' ? 'Comprador' : activeTab === 'vendedor' ? 'Vendedor' : '1ª Escritura'}
                    </h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm text-gray-600">Gastos Totales</p>
                      <p className="text-2xl font-bold text-gray-900">{formatUSD(calculations.totalCosts)}</p>
                      <p className="text-xs text-gray-500 mt-1">{formatARS(calculations.totalCosts * numericExchangeRate)}</p>
                    </div>
                    <div className="bg-green-50 rounded-lg p-4 border border-green-100">
                      <p className="text-sm text-green-800">
                         {activeTab === 'vendedor' ? 'Monto neto a recibir' : 'Monto total a pagar'}
                      </p>
                      <p className="text-2xl font-bold text-green-700">{formatUSD(calculations.finalAmount)}</p>
                      <p className="text-xs text-green-600 mt-1">{formatARS(calculations.finalAmount * numericExchangeRate)}</p>
                    </div>
                  </div>

                  {/* Detalle de Gastos */}
                  <div className="border rounded-lg border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h3 className="font-semibold text-gray-700">Desglose de Costos</h3>
                    </div>
                    <div className="divide-y divide-gray-100">
                        {/* Real Estate Fee */}
                        {calculations.realEstateFee > 0 && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Comisión Inmobiliaria</div>
                                    <div className="text-xs text-gray-500">{activeTab === 'comprador' ? '4,00%' : '3,00%'} + IVA</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.realEstateFee)}</div>
                                </div>
                            </div>
                        )}
                        
                        {/* IVA Real Estate */}
                        {calculations.realEstateFeeIVA > 0 && activeTab === 'primera' && (
                            <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50">
                                <div className="text-xs text-gray-600 pl-4">↳ IVA Comisión</div>
                                <div className="text-xs font-medium text-gray-700">{formatUSD(calculations.realEstateFeeIVA)}</div>
                            </div>
                        )}

                        {/* Notary Fees */}
                        {calculations.notaryFees > 0 && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Honorarios Escribanía</div>
                                    <div className="text-xs text-gray-500">{activeTab === 'primera' && location === 'CABA' ? '3,50%' : '2,00%'} + IVA</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.notaryFees)}</div>
                                </div>
                            </div>
                        )}

                         {/* IVA Notary */}
                         {calculations.notaryFeesIVA > 0 && activeTab === 'primera' && (
                            <div className="flex justify-between items-center px-4 py-2 bg-gray-50/50">
                                <div className="text-xs text-gray-600 pl-4">↳ IVA Escribanía</div>
                                <div className="text-xs font-medium text-gray-700">{formatUSD(calculations.notaryFeesIVA)}</div>
                            </div>
                        )}

                        {/* Stamps */}
                        {(activeTab !== 'primera' && (calculations.stamps > 0 || (stampExemption && location === 'CABA'))) && (
                             <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Sellos</div>
                                    <div className="text-xs text-gray-500">{stampExemption && location === 'CABA' && calculations.stamps === 0 ? 'Exento' : `${location === 'CABA' ? '1,35%' : '1,00%'}`}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{calculations.stamps === 0 && stampExemption ? 'Exento' : formatUSD(calculations.stamps)}</div>
                                </div>
                            </div>
                        )}

                        {/* Stamps Primera */}
                         {calculations.stamps > 0 && activeTab === 'primera' && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Sellos</div>
                                    <div className="text-xs text-gray-500">{location === 'CABA' ? '3,50%' : '2,00%'}</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.stamps)}</div>
                                </div>
                            </div>
                        )}

                        {/* Otros */}
                        {calculations.otros > 0 && activeTab === 'comprador' && (
                             <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Otros gastos</div>
                                    <div className="text-xs text-gray-500">0,75%</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.otros)}</div>
                                </div>
                            </div>
                        )}

                        {/* Writing Costs (Vendedor) */}
                        {calculations.writingCosts > 0 && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Gastos Administrativos</div>
                                    <div className="text-xs text-gray-500">Estudio de títulos, certificados, etc (2,00%)</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.writingCosts)}</div>
                                </div>
                            </div>
                        )}
                        
                        {/* Reserve Fund */}
                        {calculations.reserveFund > 0 && (
                            <div className="flex justify-between items-center px-4 py-3">
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Fondo de reserva</div>
                                    <div className="text-xs text-gray-500">Alhajamiento y equipamiento (1,00%)</div>
                                </div>
                                <div className="text-right">
                                    <div className="text-sm font-semibold text-gray-900">{formatUSD(calculations.reserveFund)}</div>
                                </div>
                            </div>
                        )}
                    </div>
                  </div>

                  <div className="mt-6 flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                      <p className="text-sm text-blue-700">
                        Los cálculos son estimativos y pueden variar según condiciones específicas. Los honorarios e impuestos pueden sufrir modificaciones.
                      </p>
                  </div>
                </div>
              </div>
            ) : (
                <div className="bg-white rounded-xl shadow-lg p-12 text-center h-full flex flex-col items-center justify-center">
                    <Building2 className="w-20 h-20 text-gray-400 mb-6" />
                    <h3 className="text-2xl font-bold text-gray-600 mb-4">Calculadora de Escrituración</h3>
                    <p className="text-gray-500 text-lg max-w-md mx-auto">
                      Ingresa los valores de la propiedad en el panel izquierdo para obtener el desglose detallado de los costos.
                    </p>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}