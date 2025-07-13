'use client'

import { useState, useEffect } from 'react'
import { Calculator, DollarSign, Percent, TrendingUp, MapPin, Receipt } from 'lucide-react'
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

  const [saleAmount, setSaleAmount] = useState('')
  const [commissionRate, setCommissionRate] = useState('3')
  const [zone, setZone] = useState('caba')
  const [isIndependent, setIsIndependent] = useState(true)
  const [province, setProvince] = useState('caba')
  const [stampRate, setStampRate] = useState('1.5')
  const [ivaRate, setIvaRate] = useState('21')
  const [incomeTaxRate, setIncomeTaxRate] = useState('0') // Cambiado a 0 por defecto
  const [iibbRate, setIibbRate] = useState('1.5')
  const [otherRate, setOtherRate] = useState('1')
  const [operationType, setOperationType] = useState('A') // A: Registrada, B: No registrada
  const [result, setResult] = useState<CalculationResult | null>(null)
  const [provinces, setProvinces] = useState<Province[]>([])
  const [loading2, setLoading2] = useState(false)

  // Cargar provincias al montar el componente
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

  // Actualizar valores predeterminados según el tipo de operación
  useEffect(() => {
    if (operationType === 'A') {
      // Operación registrada
      setIvaRate('21')
      setIncomeTaxRate(isIndependent ? '35' : '0')
      setIibbRate('1.5')
      setOtherRate('1')
    } else {
      // Operación no registrada - TODOS en 0
      setIvaRate('0')
      setIncomeTaxRate('0')
      setIibbRate('0')
      setOtherRate('0')
    }
  }, [operationType, isIndependent]);

  // Actualizar alícuota de sellos cuando cambia la provincia
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.key === province);
    if (selectedProvince) {
      setStampRate(selectedProvince.defaultStampRate.toString());
    }
  }, [province, provinces]);

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
      otherRate: parseFloat(otherRate)
    };

    console.log('Sending data to backend:', requestData);
    
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

  const formatPercentage = (rate: number) => {
    return `${rate.toFixed(2)}%`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl p-8 border border-gray-100 backdrop-blur-md">
          <div className="text-center mb-10">
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="inline-flex items-center justify-center bg-red-100 rounded-full p-3 shadow-md">
                <Calculator className="w-10 h-10 text-red-600" />
              </span>
            </div>
            <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-2">Calculadora</h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto">
              Calcula tu comisión, impuestos, sellos provinciales de manera rápida y sencilla.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-10">
            {/* Formulario */}
            <div className="space-y-7 bg-white/80 rounded-2xl shadow p-6 border border-gray-100">
              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Valor de la operación
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Porcentaje de comisión
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
                  />
                </div>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Tipo de operación
                </label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                >
                  <option value="A">Operación A (Registrada)</option>
                  <option value="B">Operación B (No registrada)</option>
                </select>
              </div>

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2">
                  Zona
                </label>
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

              <div>
                <label className="block text-base font-semibold text-gray-700 mb-2 flex items-center">
                  <Receipt className="inline w-5 h-5 mr-2 text-yellow-500" />
                  Alícuota de sellos (%)
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

              {/* Configuración de impuestos */}
              <div className="bg-gradient-to-r from-gray-50 to-red-50 p-5 rounded-2xl border border-gray-100 shadow-inner">
                <h3 className="text-base font-bold text-gray-700 mb-4 flex items-center gap-2">
                  <Percent className="w-5 h-5 text-red-400" /> Configuración de Impuestos
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">
                      IVA (%)
                    </label>
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
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">
                      Ganancias (%)
                    </label>
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
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">
                      IIBB (%)
                    </label>
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
                    <label className="block text-xs text-gray-600 mb-1 font-semibold">
                      Otros gastos (%)
                    </label>
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

              <div className="flex items-center mt-2">
                <input
                  type="checkbox"
                  id="independent"
                  checked={isIndependent}
                  onChange={(e) => setIsIndependent(e.target.checked)}
                  className="w-5 h-5 text-red-600 border-gray-300 rounded focus:ring-red-400 accent-red-500"
                />
                <label htmlFor="independent" className="ml-3 text-base text-gray-700 font-medium select-none cursor-pointer">
                  Trabajador independiente
                </label>
              </div>

              <button
                onClick={calculateCommission}
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
            </div>

            {/* Resultados */}
            <div className="space-y-8">
              {result && (
                <div className="bg-gradient-to-br from-blue-50 via-white to-red-50 border border-red-100 rounded-2xl p-8 shadow-lg">
                  <h3 className="text-2xl font-bold text-red-700 mb-6 flex items-center gap-3">
                    <TrendingUp className="w-7 h-7" />
                    Resultados del Cálculo
                  </h3>
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
                        {/* Solo mostrar impuestos que tienen valor > 0 */}
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
                </div>
              )}
              <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-6 shadow flex flex-col gap-2">
                <h4 className="font-bold text-yellow-800 mb-2 text-lg flex items-center gap-2">
                  <svg className="w-5 h-5 text-yellow-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M12 20a8 8 0 100-16 8 8 0 000 16z" /></svg>
                  Información Importante
                </h4>
                <ul className="text-base text-yellow-700 space-y-1 list-disc list-inside">
                  <li>Los cálculos son aproximados y pueden variar según la situación específica.</li>
                  <li>Las alícuotas de sellos pueden cambiar según la provincia y el tipo de operación.</li>
                  <li>Consulta con un contador para obtener cálculos precisos.</li>
                  <li>Los valores de impuestos pueden estar sujetos a cambios normativos.</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
