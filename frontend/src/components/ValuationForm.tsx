"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react'
import { AlertCircle, Loader2, CheckCircle2, Gavel } from 'lucide-react'
import ValuationEmailButton from './ValuationEmailButton'

interface ValuationFormData {
  provincia: string
  localidad: string
  direccion: string
  tipoPropiedad: string
  antiguedad: number | ''
  metrosCubiertos: number | ''
  metrosDescubiertos: number | ''
  ambientes: number | ''
  banos: number | ''
  amenities: string
  otrosDatos: string
}

interface ValuationResult {
  valorMinimo: number
  valorMaximo: number
  valorAlquilerUSD?: number | null
  valorAlquilerARS?: number | null
  porcentajeAlquiler?: number | null
  analisis: string
  factoresConsiderados: string[]
}

interface ValuationFormProps {
  onSuccess?: () => void
}

export default function ValuationForm({ onSuccess }: ValuationFormProps) {
  const [form, setForm] = useState<ValuationFormData>({
    provincia: 'Buenos Aires',
    localidad: '',
    direccion: '',
    tipoPropiedad: '',
    antiguedad: '',
    metrosCubiertos: '',
    metrosDescubiertos: '',
    ambientes: '',
    banos: '',
    amenities: '',
    otrosDatos: '',
  })

  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ValuationResult | null>(null)
  const [error, setError] = useState('')

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target as HTMLInputElement
    setForm(s => ({
      ...s,
      [name]: type === 'number' 
        ? (value === '' ? '' : Number(value))
        : value
    }))
  }

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setResult(null)
    setLoading(true)

    // Validación de campos requeridos
    if (
      !form.provincia ||
      !form.localidad ||
      form.metrosCubiertos === '' ||
      form.metrosDescubiertos === '' ||
      form.ambientes === '' ||
      form.banos === ''
    ) {
      setError('Por favor completa todos los campos requeridos')
      setLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No estás autenticado. Por favor, inicia sesión.')
        setLoading(false)
        return
      }

      const response = await fetch('/api/valuations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          provincia: form.provincia,
          localidad: form.localidad,
          direccion: form.direccion || '',
          tipoPropiedad: form.tipoPropiedad || '',
          antiguedad: form.antiguedad === '' ? null : Number(form.antiguedad),
          metrosCubiertos: Number(form.metrosCubiertos),
          metrosDescubiertos: Number(form.metrosDescubiertos),
          ambientes: Number(form.ambientes),
          banos: Number(form.banos),
          amenities: form.amenities || '',
          otrosDatos: form.otrosDatos || null,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error creando tasación')
      }

      const data = await response.json()
      setResult({
        valorMinimo: data.valorMinimo,
        valorMaximo: data.valorMaximo,
        valorAlquilerUSD: data.valorAlquilerUSD,
        valorAlquilerARS: data.valorAlquilerARS,
        porcentajeAlquiler: data.porcentajeAlquiler,
        analisis: data.analisis || '',
        factoresConsiderados: data.factoresConsiderados || [],
      })
      
      // Llamar callback de éxito
      if (onSuccess) {
        onSuccess()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error inesperado')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Gavel className="w-5 h-5" />
          Tasador de Propiedades
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Row 1: Provincia y Localidad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Provincia
              </label>
              <select
                name="provincia"
                value={form.provincia}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="Buenos Aires">Buenos Aires</option>
                <option value="CABA">CABA</option>
                <option value="Córdoba">Córdoba</option>
                <option value="Santa Fe">Santa Fe</option>
                <option value="Mendoza">Mendoza</option>
                <option value="La Pampa">La Pampa</option>
                <option value="Tucumán">Tucumán</option>
                <option value="Misiones">Misiones</option>
                <option value="Salta">Salta</option>
                <option value="Jujuy">Jujuy</option>
                <option value="Catamarca">Catamarca</option>
                <option value="La Rioja">La Rioja</option>
                <option value="Santiago del Estero">Santiago del Estero</option>
                <option value="Formosa">Formosa</option>
                <option value="Chaco">Chaco</option>
                <option value="Corrientes">Corrientes</option>
                <option value="Entre Ríos">Entre Ríos</option>
                <option value="Tierra del Fuego">Tierra del Fuego</option>
                <option value="Santa Cruz">Santa Cruz</option>
                <option value="Chubut">Chubut</option>
                <option value="Río Negro">Río Negro</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Localidad
              </label>
              <input
                type="text"
                name="localidad"
                value={form.localidad}
                onChange={handleChange}
                placeholder="Ej: San Isidro"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 1.5: Dirección y Tipo de Propiedad */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Dirección (opcional)
              </label>
              <input
                type="text"
                name="direccion"
                value={form.direccion}
                onChange={handleChange}
                placeholder="Ej: Av. Córdoba 1500"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Tipo de Propiedad (opcional)
              </label>
              <select
                name="tipoPropiedad"
                value={form.tipoPropiedad}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Seleccionar</option>
                <option value="casa">Casa</option>
                <option value="departamento">Departamento</option>
                <option value="local">Local</option>
                <option value="oficina">Oficina</option>
                <option value="terreno">Terreno</option>
              </select>
            </div>
          </div>

          {/* Row 1.7: Antigüedad */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Antigüedad en años (opcional)
            </label>
            <input
              type="number"
              name="antiguedad"
              value={form.antiguedad}
              onChange={handleChange}
              placeholder="Ej: 10"
              min="0"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                M² Cubiertos
              </label>
              <input
                type="number"
                name="metrosCubiertos"
                value={form.metrosCubiertos}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                M² Descubiertos
              </label>
              <input
                type="number"
                name="metrosDescubiertos"
                value={form.metrosDescubiertos}
                onChange={handleChange}
                placeholder="20"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 3: Ambientes y Baños */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Ambientes
              </label>
              <input
                type="number"
                name="ambientes"
                value={form.ambientes}
                onChange={handleChange}
                placeholder="3"
                min="1"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
                Baños
              </label>
              <input
                type="number"
                name="banos"
                value={form.banos}
                onChange={handleChange}
                placeholder="2"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Row 4: Amenities */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Amenities (opcional)
            </label>
            <input
              type="text"
              name="amenities"
              value={form.amenities}
              onChange={handleChange}
              placeholder="Ej: Cochera, balcón, AC, calefacción"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Row 5: Otros datos */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5 uppercase tracking-wider">
              Detalles adicionales (opcional)
            </label>
            <input
              type="text"
              name="otrosDatos"
              value={form.otrosDatos}
              onChange={handleChange}
              placeholder="Ej: Renovado, apto profesional, vista al río"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:shadow-lg disabled:opacity-70 disabled:cursor-not-allowed transition font-semibold text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Tasando...
              </>
            ) : (
              <>
                <Gavel className="w-4 h-4" />
                Valuar Propiedad
              </>
            )}
          </button>
        </form>
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl border border-purple-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-800">Valuación Completada</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div className="bg-white rounded-lg p-4 border border-purple-100">
              <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Valor Mínimo</p>
              <p className="text-2xl font-bold text-purple-600">
                ${result.valorMinimo.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">USD</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-pink-100">
              <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Valor Máximo</p>
              <p className="text-2xl font-bold text-pink-600">
                ${result.valorMaximo.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">USD</p>
            </div>
          </div>

          {result.valorAlquilerUSD && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="bg-white rounded-lg p-4 border border-green-100">
                <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Alquiler Mensual</p>
                <p className="text-2xl font-bold text-green-600">
                  ${result.valorAlquilerUSD.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">USD/mes</p>
              </div>
              <div className="bg-white rounded-lg p-4 border border-emerald-100">
                <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Alquiler Mensual</p>
                <p className="text-2xl font-bold text-emerald-600">
                  ${result.valorAlquilerARS?.toLocaleString('es-AR', { maximumFractionDigits: 2 })}
                </p>
                <p className="text-xs text-gray-500 mt-1">ARS/mes</p>
              </div>
            </div>
          )}

          {result.porcentajeAlquiler && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg p-3 border border-blue-200 mb-4">
              <p className="text-xs text-gray-700">
                <span className="font-semibold">Cálculo:</span> El alquiler se estima como <span className="font-bold text-blue-600">{result.porcentajeAlquiler}%</span> anual del valor de compraventa (÷ 12 meses).
              </p>
            </div>
          )}

          {result.analisis && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="font-semibold text-slate-700 mb-2 text-sm">Análisis</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.analisis}
              </p>
            </div>
          )}

          {result.factoresConsiderados && result.factoresConsiderados.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="font-semibold text-slate-700 mb-2 text-sm">Factores Considerados</h4>
              <ul className="space-y-1">
                {result.factoresConsiderados.map((factor, idx) => (
                  <li key={idx} className="text-xs text-gray-700 flex items-start gap-2">
                    <span className="text-purple-600 font-bold">⚡</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-2">
            <ValuationEmailButton
              valuationData={result}
              metrosCubiertos={form.metrosCubiertos as number}
              ambientes={form.ambientes as number}
              banos={form.banos as number}
            />
            <button
              onClick={() => {
                setResult(null)
                setForm({
                  provincia: 'Buenos Aires',
                  localidad: '',
                  direccion: '',
                  tipoPropiedad: '',
                  antiguedad: '',
                  metrosCubiertos: '',
                  metrosDescubiertos: '',
                  ambientes: '',
                  banos: '',
                  amenities: '',
                  otrosDatos: '',
                })
              }}
              className="flex-1 px-4 py-2 border border-purple-300 rounded-lg text-purple-700 hover:bg-purple-50 transition font-medium text-sm"
            >
              ↻ Valuar otra propiedad
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
