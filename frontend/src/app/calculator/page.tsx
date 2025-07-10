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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Calculator className="w-8 h-8 text-red-600" />
              Calculadora de Comisiones con Sellos
            </h1>
            <p className="text-gray-600">
              Calcula tu comisión después de impuestos incluyendo sellos provinciales
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-8">
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
                    step="1"
                    min="1"
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
                    max="100"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de operación
                </label>
                <select
                  value={operationType}
                  onChange={(e) => setOperationType(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="A">Operación A (Registrada)</option>
                  <option value="B">Operación B (No registrada)</option>
                </select>
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
                  <option value="caba">Ciudad Autónoma de Buenos Aires</option>
                  <option value="gba">Gran Buenos Aires</option>
                  <option value="interior">Interior del país</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Provincia (para cálculo de sellos)
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {provinces.map((prov) => (
                    <option key={prov.key} value={prov.key}>
                      {prov.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Receipt className="inline w-4 h-4 mr-1" />
                  Alícuota de sellos (%)
                </label>
                <div className="relative">
                  <Percent className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={stampRate}
                    onChange={(e) => setStampRate(e.target.value)}
                    step="0.1"
                    min="0"
                    max="10"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor sugerido para {provinces.find(p => p.key === province)?.name || 'la provincia seleccionada'}
                </p>
              </div>

              {/* Configuración de impuestos */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-3">Configuración de Impuestos</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      IVA (%)
                    </label>
                    <input
                      type="number"
                      value={ivaRate}
                      onChange={(e) => setIvaRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Ganancias (%)
                    </label>
                    <input
                      type="number"
                      value={incomeTaxRate}
                      onChange={(e) => setIncomeTaxRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      IIBB (%)
                    </label>
                    <input
                      type="number"
                      value={iibbRate}
                      onChange={(e) => setIibbRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-600 mb-1">
                      Otros gastos (%)
                    </label>
                    <input
                      type="number"
                      value={otherRate}
                      onChange={(e) => setOtherRate(e.target.value)}
                      step="0.1"
                      min="0"
                      max="100"
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>
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
                disabled={!saleAmount || !commissionRate || loading2}
                className="w-full bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading2 ? 'Calculando...' : 'Calcular Comisión'}
              </button>
            </div>

            {/* Resultados */}
            <div className="space-y-6">
              {result && (
                <div className="bg-gradient-to-r from-red-50 to-red-100 border border-red-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-red-800 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    Resultados del Cálculo
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4 mb-6">
                    <div className="bg-white rounded-lg p-4">
                      <div className="text-2xl font-bold text-blue-600">
                        {formatCurrency(result.grossCommission)}
                      </div>
                      <div className="text-sm text-gray-600">Comisión Bruta</div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center py-2 border-b border-red-200">
                      <span className="text-sm text-gray-700">Monto de la operación:</span>
                      <span className="font-medium">{formatCurrency(result.saleAmount)}</span>
                    </div>
                    
                    <div className="flex justify-between items-center py-2 border-b border-red-200">
                      <span className="text-sm text-gray-700">Comisión ({formatPercentage(result.commissionRate)}):</span>
                      <span className="font-medium">{formatCurrency(result.grossCommission)}</span>
                    </div>
                    
                    <div className="bg-white rounded-lg p-4 mt-4">
                      <h4 className="font-semibold text-gray-800 mb-3">Detalle de Impuestos y Gastos</h4>
                      <div className="space-y-2">
                        {/* Solo mostrar impuestos que tienen valor > 0 */}
                        {result.taxes.iva > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>IVA ({formatPercentage(result.ivaRate)}):</span>
                            <span>{formatCurrency(result.taxes.iva)}</span>
                          </div>
                        )}
                        
                        {result.taxes.incomeTax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Impuesto a las Ganancias ({formatPercentage(result.incomeTaxRate)}):</span>
                            <span>{formatCurrency(result.taxes.incomeTax)}</span>
                          </div>
                        )}
                        
                        {result.taxes.iibb > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>IIBB ({formatPercentage(result.iibbRate)}):</span>
                            <span>{formatCurrency(result.taxes.iibb)}</span>
                          </div>
                        )}
                        
                        {result.taxes.stamps > 0 && (
                          <div className="flex justify-between text-sm bg-yellow-50 p-2 rounded">
                            <span>
                              <strong>Sellos {provinces.find(p => p.key === result.province)?.name || result.province} ({formatPercentage(result.stampRate)}):</strong>
                            </span>
                            <span className="font-medium">{formatCurrency(result.taxes.stamps)}</span>
                          </div>
                        )}
                        
                        {result.taxes.other > 0 && (
                          <div className="flex justify-between text-sm">
                            <span>Otros gastos ({formatPercentage(result.otherRate)}):</span>
                            <span>{formatCurrency(result.taxes.other)}</span>
                          </div>
                        )}
                        
                        <div className="border-t pt-2 mt-2">
                          <div className="flex justify-between font-semibold text-red-600">
                            <span>Total Impuestos y Gastos:</span>
                            <span>{formatCurrency(result.taxes.total)}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Información Importante</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Los cálculos son aproximados y pueden variar según la situación específica</li>
                  <li>• Las alícuotas de sellos pueden cambiar según la provincia y el tipo de operación</li>
                  <li>• Consulta con un contador para obtener cálculos precisos</li>
                  <li>• Los valores de impuestos pueden estar sujetos a cambios normativos</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
