'use client'

import { useState, useEffect } from 'react'
import { Receipt, DollarSign, Percent, Calculator, MapPin } from 'lucide-react'
import { useAuth } from '../../auth/authContext'

interface Province {
  key: string
  name: string
  defaultStampRate: number
}

interface StampCalculationResult {
  amount: number
  province: string
  stampRate: number
  stamps: number
  total: number
}

export default function StampCalculatorPage() {
  const { user } = useAuth();

  const [amount, setAmount] = useState('')
  const [province, setProvince] = useState('caba')
  const [stampRate, setStampRate] = useState('1.5')
  const [result, setResult] = useState<StampCalculationResult | null>(null)
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

  // Actualizar alícuota de sellos cuando cambia la provincia
  useEffect(() => {
    const selectedProvince = provinces.find(p => p.key === province);
    if (selectedProvince) {
      setStampRate(selectedProvince.defaultStampRate.toString());
    }
  }, [province, provinces]);

  const calculateStamps = async () => {
    if (!amount || !stampRate) return;

    setLoading2(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/calculator/taxes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          amount: parseFloat(amount),
          taxType: 'STAMPS',
          province,
          stampRate: parseFloat(stampRate)
        })
      });

      if (response.ok) {
        const data = await response.json();
        setResult(data.data);
      } else {
        const error = await response.json();
        alert(error.message || 'Error al calcular sellos');
      }
    } catch (error) {
      console.error('Error calculating stamps:', error);
      alert('Error al calcular sellos');
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
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2 flex items-center justify-center gap-2">
              <Receipt className="w-8 h-8 text-blue-600" />
              Calculadora de Sellos
            </h1>
            <p className="text-gray-600">
              Calcula el impuesto de sellos según la provincia argentina
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Formulario */}
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Monto de la operación
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="1000000"
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="inline w-4 h-4 mr-1" />
                  Provincia
                </label>
                <select
                  value={province}
                  onChange={(e) => setProvince(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Valor estándar para {provinces.find(p => p.key === province)?.name || 'la provincia seleccionada'}
                </p>
              </div>

              <button
                onClick={calculateStamps}
                disabled={!amount || !stampRate || loading2}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-medium"
              >
                {loading2 ? 'Calculando...' : 'Calcular Sellos'}
              </button>
            </div>

            {/* Resultados */}
            <div className="space-y-6">
              {result && (
                <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-blue-800 mb-4 flex items-center gap-2">
                    <Calculator className="w-5 h-5" />
                    Resultado del Cálculo
                  </h3>

                  <div className="space-y-4">
                    <div className="bg-white rounded-lg p-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Monto de la operación:</span>
                        <span className="font-medium">{formatCurrency(result.amount)}</span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Provincia:</span>
                        <span className="font-medium">{provinces.find(p => p.key === result.province)?.name || result.province}</span>
                      </div>

                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm text-gray-600">Alícuota de sellos:</span>
                        <span className="font-medium">{formatPercentage(result.stampRate)}</span>
                      </div>

                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between items-center mb-2">
                          <span className="text-sm text-gray-600">Impuesto de sellos:</span>
                          <span className="font-bold text-blue-600">{formatCurrency(result.stamps)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-base font-medium text-gray-800">Total a pagar:</span>
                          <span className="text-xl font-bold text-green-600">{formatCurrency(result.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-semibold text-yellow-800 mb-2">Información sobre Sellos</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                  <li>• Los sellos se calculan sobre el monto total de la operación</li>
                  <li>• Cada provincia tiene su propia alícuota</li>
                  <li>• Algunas operaciones pueden tener exenciones o reducciones</li>
                  <li>• Consulta con un profesional para casos específicos</li>
                </ul>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-800 mb-2">Alícuotas por Provincia</h4>
                <div className="grid grid-cols-1 gap-1 text-xs">
                  {provinces.slice(0, 5).map((prov) => (
                    <div key={prov.key} className="flex justify-between">
                      <span>{prov.name}:</span>
                      <span>{formatPercentage(prov.defaultStampRate)}</span>
                    </div>
                  ))}
                  {provinces.length > 5 && (
                    <div className="text-center text-gray-500 mt-2">
                      Y {provinces.length - 5} provincias más...
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
