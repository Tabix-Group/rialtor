
'use client'


import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Percent, TrendingUp, MapPin, Receipt } from 'lucide-react'
import EscribanoCalculator from '../../components/EscribanoCalculator'
import OtrosGastosCalculator from '../../components/OtrosGastosCalculator'
import GananciaInmobiliariaCalculator from '../../components/GananciaInmobiliariaCalculator'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'

interface CalculationResult {
  saleAmount: number
  commissionRate: number
  zone: string
  province: string
  stampRate: number
  ivaRate: number
  incomeTaxRate: number
  iibbRate: number
  otherRate: number
  isIndependent: boolean
  grossCommission: number
  taxes: {
    iva: number
    incomeTax: number
    iibb: number
    stamps: number
    other: number
    total: number
  }
  details: {
    grossCommission: number
    iva: number
    incomeTax: number
    iibb: number
    stamps: number
    other: number
    totalTaxes: number
  }
}

interface Province {
  key: string
  name: string
  defaultStampRate: number
}

export default function CalculatorPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: si no está logueado, redirigir a login
  if (!loading && !user && typeof window !== 'undefined') {
    router.replace('/auth/login');
    return null;
  }

  // --- STATES ---
  const [saleAmount, setSaleAmount] = useState('')
  const [commissionRate, setCommissionRate] = useState('3')
  const [zone, setZone] = useState('caba')
  const [isIndependent, setIsIndependent] = useState(true)
  const [province, setProvince] = useState('caba')
  const [stampRate, setStampRate] = useState('1.5')
  const [ivaRate, setIvaRate] = useState('21')
  const [incomeTaxRate, setIncomeTaxRate] = useState('0')
  const [iibbRate, setIibbRate] = useState('1.5')
  const [otherRate, setOtherRate] = useState('1')
  const [operationType, setOperationType] = useState('A')
  const [dealType, setDealType] = useState('compra_venta')
  const [buyerType, setBuyerType] = useState('fisica')
  const [sellerType, setSellerType] = useState('fisica')
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [isOnlyHome, setIsOnlyHome] = useState(false)
  const [usdRate, setUsdRate] = useState('')
  const [usdRateLoading, setUsdRateLoading] = useState(false)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading2, setLoading2] = useState(false)
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showSummary, setShowSummary] = useState(false)

  // --- EFFECTS ---
  useEffect(() => {
    const fetchUsdRate = async () => {
      setUsdRateLoading(true);
      try {
        const res = await fetch('https://dolarapi.com/v1/dolares/oficial');
        if (res.ok) {
          const data = await res.json();
          if (data && data.venta) {
            setUsdRate(data.venta.toString());
          }
        }
      } catch (e) {
        // Si falla, dejar vacío para que el usuario lo ingrese
      } finally {
        setUsdRateLoading(false);
      }
    };
    fetchUsdRate();
  }, []);

  useEffect(() => {
    const fetchProvinces = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/provincias`);
        if (response.ok) {
          const data = await response.json();
          setProvinces(data.data);
        }
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchProvinces();
  }, []);

  useEffect(() => {
    if (operationType === 'A') {
      setIvaRate('21')
      setIncomeTaxRate(isIndependent ? '35' : '0')
      setIibbRate('1.5')
      setOtherRate('1')
    } else {
      setIvaRate('0')
      setIncomeTaxRate('0')
      setIibbRate('0')
      setOtherRate('0')
    }
  }, [operationType, isIndependent]);

  useEffect(() => {
    const selectedProvince = provinces.find(p => p.key === province);
    if (selectedProvince) {
      if ((province === 'caba' && (buyerType === 'juridica' || sellerType === 'juridica'))) {
        setStampRate('3.5');
      } else if (province === 'buenos_aires' && (buyerType === 'juridica' || sellerType === 'juridica')) {
        setStampRate('2');
      } else {
        setStampRate(selectedProvince.defaultStampRate.toString());
      }
    }
  }, [province, provinces, buyerType, sellerType]);

  // --- FUNCIONES INTERNAS ---
  const calculateCommission = async () => {
    if (!saleAmount || !commissionRate || !stampRate) return;
    setLoading2(true);
    const requestData = {
      saleAmount: parseFloat(saleAmount),
      commissionRate: parseFloat(commissionRate),
      zone,
      isIndependent,
      province,
      stampRate: parseFloat(stampRate),
      ivaRate: parseFloat(ivaRate),
      incomeTaxRate: parseFloat(incomeTaxRate),
      iibbRate: parseFloat(iibbRate),
      otherRate: parseFloat(otherRate),
      dealType,
      buyerType,
      sellerType,
      isOnlyHome,
      cotizacionUsdOficial: usdRate ? parseFloat(usdRate) : undefined
    };
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/commission`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(requestData)
      });
      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al calcular comisión');
      }
    } catch (error) {
      console.error('Error calculating commission:', error);
      alert('Error al calcular comisión');
    } finally {
      setLoading2(false);
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount)
  }

  const formatPercentage = (rate: number) => `${rate.toFixed(2)}%`

  // --- MAIN RENDER ---
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-0">
      {/* Sticky Header & Navigation */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-gray-100 shadow-sm flex flex-col md:flex-row items-center justify-between px-6 py-3">
        <div className="w-full flex flex-col items-center justify-center">
          <span className="text-2xl font-extrabold text-gray-900 tracking-tight mb-1">Calculadora Integral</span>
          <nav className="flex gap-4 mt-2 md:mt-0 justify-center">
            <a href="#comision" className="text-red-600 font-semibold hover:underline">Comisión</a>
            <a href="#escribano" className="text-blue-600 font-semibold hover:underline">Escribano</a>
            <a href="#otros" className="text-yellow-600 font-semibold hover:underline">Otros Gastos</a>
            <a href="#ganancia" className="text-green-600 font-semibold hover:underline">Ganancia Inmobiliaria</a>
          </nav>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form & Results */}
          <div className="lg:col-span-2">
          {/* Comisión */}
          <section id="comision" className="mb-12">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md flex flex-col gap-8 mb-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Calculator className="w-8 h-8 text-red-500" />
                <h2 className="text-2xl font-bold tracking-tight text-red-700">Cálculo de Comisión</h2>
              </div>
              <p className="text-base text-gray-500 max-w-2xl mb-2">
                Calculá comisiones, impuestos y gastos asociados a operaciones inmobiliarias en Argentina. Incluye cálculo de comisión, honorarios de escribano, otros gastos y ganancia inmobiliaria, todo en un solo lugar.
              </p>
              <div className="flex flex-col md:flex-row gap-10 items-start">
                {/* Formulario */}
                <form className="w-full max-w-2xl mx-auto space-y-7" onSubmit={e => { e.preventDefault(); calculateCommission(); setShowSummary(true); }}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          Valor de la operación
                          <span className="ml-1 text-xs text-gray-400" title="Monto total de la operación en ARS">ⓘ</span>
                        </label>
                        <div className="relative">
                          <DollarSign className="absolute left-3 top-3 w-5 h-5 text-red-400" />
                          <input
                            type="number"
                            value={saleAmount}
                            onChange={(e) => setSaleAmount(e.target.value)}
                            placeholder="Ej: 1000000"
                            step="1"
                            min="1"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          Porcentaje de comisión
                          <span className="ml-1 text-xs text-gray-400" title="Porcentaje sobre el valor de la operación">ⓘ</span>
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-3 w-5 h-5 text-red-400" />
                          <input
                            type="number"
                            value={commissionRate}
                            onChange={(e) => setCommissionRate(e.target.value)}
                            step="0.1"
                            min="0"
                            max="100"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Tipo de operación</label>
                        <select
                          value={dealType}
                          onChange={(e) => setDealType(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                        >
                          <option value="compra_venta">Compra-Venta</option>
                          <option value="alquiler">Alquiler</option>
                          <option value="comercial">Comercial</option>
                          <option value="temporal">Temporal</option>
                        </select>
                      </div>
                      {/* Campo de cotización oficial USD/ARS */}
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center gap-1">
                          Cotización oficial USD/ARS
                          <span className="ml-1 text-xs text-gray-400" title="Cotización oficial del dólar para el cálculo de única vivienda">ⓘ</span>
                        </label>
                        <input
                          type="number"
                          value={usdRate}
                          onChange={e => setUsdRate(e.target.value)}
                          min="0"
                          step="0.01"
                          className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg shadow-sm"
                          disabled={usdRateLoading}
                        />
                        <p className="text-xs text-blue-700 mt-1 font-medium">
                          {usdRateLoading ? 'Obteniendo cotización oficial...' : 'Puedes editar este valor si lo deseas.'}
                        </p>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2">Zona</label>
                        <select
                          value={zone}
                          onChange={(e) => setZone(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                        >
                          <option value="caba">Ciudad Autónoma de Buenos Aires</option>
                          <option value="gba">Gran Buenos Aires</option>
                          <option value="interior">Interior del país</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                          <MapPin className="inline w-5 h-5 mr-2 text-blue-400" />
                          Provincia (para cálculo de sellos)
                        </label>
                        <select
                          value={province}
                          onChange={(e) => setProvince(e.target.value)}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-300 focus:border-transparent text-lg shadow-sm"
                        >
                          {provinces.map((prov) => (
                            <option key={prov.key} value={prov.key}>
                              {prov.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                          <Receipt className="inline w-5 h-5 mr-2 text-yellow-500" />
                          Alícuota de sellos (%)
                          <span className="ml-1 text-xs text-gray-400" title="Porcentaje de sellos según provincia y tipo de persona">ⓘ</span>
                        </label>
                        <div className="relative">
                          <Percent className="absolute left-3 top-3 w-5 h-5 text-yellow-400" />
                          <input
                            type="number"
                            value={stampRate}
                            onChange={(e) => setStampRate(e.target.value)}
                            step="0.1"
                            min="0"
                            max="10"
                            className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-400 focus:border-transparent text-lg shadow-sm"
                          />
                        </div>
                        <p className="text-xs text-yellow-700 mt-1 font-medium">
                          Valor sugerido para <span className="font-semibold">{provinces.find(p => p.key === province)?.name || 'la provincia seleccionada'}</span>
                        </p>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Tipo de persona (Comprador)</label>
                          <select
                            value={buyerType}
                            onChange={e => setBuyerType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg shadow-sm"
                          >
                            <option value="fisica">Física</option>
                            <option value="juridica">Jurídica</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-base font-semibold text-gray-700 mb-2">Tipo de persona (Vendedor)</label>
                          <select
                            value={sellerType}
                            onChange={e => setSellerType(e.target.value)}
                            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-400 focus:border-transparent text-lg shadow-sm"
                          >
                            <option value="fisica">Física</option>
                            <option value="juridica">Jurídica</option>
                          </select>
                        </div>
                      </div>
                    </div>
                    {/* Única vivienda en CABA */}
                    {province === 'caba' && buyerType === 'fisica' && sellerType === 'fisica' && (
                      <div className="flex items-center mb-4 mt-2">
                        <input
                          type="checkbox"
                          id="onlyHome"
                          checked={isOnlyHome}
                          onChange={e => setIsOnlyHome(e.target.checked)}
                          className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-400 accent-blue-500"
                        />
                        <label htmlFor="onlyHome" className="ml-3 text-base text-gray-700 font-medium select-none cursor-pointer">
                          ¿Comprador única vivienda en CABA?
                        </label>
                      </div>
                    )}
                    {/* Acordeón configuración avanzada */}
                    <div className="mt-2">
                      <button
                        type="button"
                        className="w-full flex items-center justify-between bg-gradient-to-r from-gray-50 to-red-50 p-3 rounded-xl border border-gray-100 shadow-inner font-bold text-base text-gray-700 hover:bg-red-50 transition"
                        onClick={() => setShowAdvanced(v => !v)}
                        aria-expanded={showAdvanced}
                        aria-controls="advanced-config"
                      >
                        <span className="flex items-center gap-2"><Percent className="w-5 h-5 text-red-400" /> Configuración de Impuestos</span>
                        <svg className={`w-5 h-5 ml-2 transition-transform ${showAdvanced ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                      </button>
                      <div id="advanced-config" className={`overflow-hidden transition-all duration-300 ${showAdvanced ? 'max-h-96 mt-3' : 'max-h-0'}`}
                        aria-hidden={!showAdvanced}
                      >
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1 font-semibold">IVA (%)</label>
                            <input
                              type="number"
                              value={ivaRate}
                              onChange={(e) => setIvaRate(e.target.value)}
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1 font-semibold">Ganancias (%)</label>
                            <input
                              type="number"
                              value={incomeTaxRate}
                              onChange={(e) => setIncomeTaxRate(e.target.value)}
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1 font-semibold">IIBB (%)</label>
                            <input
                              type="number"
                              value={iibbRate}
                              onChange={(e) => setIibbRate(e.target.value)}
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1 font-semibold">Otros gastos (%)</label>
                            <input
                              type="number"
                              value={otherRate}
                              onChange={(e) => setOtherRate(e.target.value)}
                              step="0.1"
                              min="0"
                              max="100"
                              className="w-full px-3 py-2 text-base border border-gray-200 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent shadow-sm"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={!saleAmount || !commissionRate || loading2}
                      className="w-full bg-gradient-to-r from-red-500 to-red-700 text-white py-3 px-4 rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all font-bold text-lg mt-2"
                    >
                      {loading2 ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg>
                          Calculando...
                        </span>
                      ) : 'Calcular Comisión'}
                    </button>
                  </form>

                </div>
              </div>
            </section>
            {/* Calculadoras adicionales */}
            <section id="escribano" className="mb-12">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md flex flex-col gap-8 mb-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Receipt className="w-8 h-8 text-blue-500" />
                <h2 className="text-2xl font-bold tracking-tight text-blue-700">Honorarios de Escribano</h2>
              </div>
              <EscribanoCalculator />
            </div>
            </section>
            <section id="otros" className="mb-12">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md flex flex-col gap-8 mb-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <Percent className="w-8 h-8 text-yellow-500" />
                <h2 className="text-2xl font-bold tracking-tight text-yellow-700">Otros Gastos</h2>
              </div>
              <OtrosGastosCalculator />
            </div>
            </section>
            <section id="ganancia" className="mb-12">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md flex flex-col gap-8 mb-4 animate-fade-in">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-green-500" />
                <h2 className="text-2xl font-bold tracking-tight text-green-700">Ganancia Inmobiliaria</h2>
              </div>
              <GananciaInmobiliariaCalculator />
            </div>
            </section>
          </div>
          {/* Resumen lateral fijo */}
          <aside className="hidden lg:block sticky top-24 self-start">
            <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md flex flex-col gap-8 mb-4 animate-fade-in ml-0 md:ml-8 mt-10 md:mt-0">
              <div className="flex items-center gap-3 mb-4">
                <TrendingUp className="w-8 h-8 text-red-500" />
                <h2 className="text-2xl font-bold tracking-tight text-red-700">Resumen del Cálculo</h2>
              </div>
              <div className="flex-1">
                {result && showSummary && (
                  <>
                    <div className="grid grid-cols-1 gap-4 mb-8">
                      <div className="bg-gradient-to-r from-blue-100 to-red-100 rounded-xl p-6 flex flex-col items-center shadow">
                        <div className="text-4xl font-extrabold text-blue-700">
                          {formatCurrency(result.grossCommission)}
                        </div>
                        <div className="text-base text-gray-600 mt-1">Comisión Bruta</div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-base text-gray-700">Monto de la operación:</span>
                        <span className="font-semibold">{formatCurrency(result.saleAmount)}</span>
                      </div>
                      <div className="flex justify-between items-center py-2 border-b border-red-100">
                        <span className="text-base text-gray-700">Comisión ({formatPercentage(result.commissionRate)}):</span>
                        <span className="font-semibold">{formatCurrency(result.grossCommission)}</span>
                      </div>
                      <div className="bg-white rounded-xl p-5 mt-4 border border-gray-100 shadow-sm">
                        <h4 className="font-bold text-gray-800 mb-4 text-lg">Detalle de Impuestos y Gastos</h4>
                        <div className="space-y-3">
                          {result.taxes.iva > 0 && (
                            <div className="flex justify-between text-base">
                              <span>IVA ({formatPercentage(result.ivaRate)}):</span>
                              <span>{formatCurrency(result.taxes.iva)}</span>
                            </div>
                          )}
                          {result.taxes.incomeTax > 0 && (
                            <div className="flex justify-between text-base">
                              <span>Impuesto a las Ganancias ({formatPercentage(result.incomeTaxRate)}):</span>
                              <span>{formatCurrency(result.taxes.incomeTax)}</span>
                            </div>
                          )}
                          {result.taxes.iibb > 0 && (
                            <div className="flex justify-between text-base">
                              <span>IIBB ({formatPercentage(result.iibbRate)}):</span>
                              <span>{formatCurrency(result.taxes.iibb)}</span>
                            </div>
                          )}
                          {result.taxes.stamps > 0 && (
                            <div className="flex justify-between text-base bg-yellow-50 p-2 rounded-lg border border-yellow-100">
                              <span>
                                <strong>Sellos {provinces.find(p => p.key === result.province)?.name || result.province} ({formatPercentage(result.stampRate)}):</strong>
                              </span>
                              <span className="font-bold text-yellow-700">{formatCurrency(result.taxes.stamps)}</span>
                            </div>
                          )}
                          {result.taxes.other > 0 && (
                            <div className="flex justify-between text-base">
                              <span>Otros gastos ({formatPercentage(result.otherRate)}):</span>
                              <span>{formatCurrency(result.taxes.other)}</span>
                            </div>
                          )}
                          <div className="border-t pt-3 mt-3">
                            <div className="flex justify-between font-bold text-red-600 text-lg">
                              <span>Total Impuestos y Gastos:</span>
                              <span>{formatCurrency(result.taxes.total)}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
