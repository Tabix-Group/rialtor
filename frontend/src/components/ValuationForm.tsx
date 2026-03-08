"use client"

import React, { useState, ChangeEvent, FormEvent } from 'react'
import { AlertCircle, Loader2, CheckCircle2, DollarSign } from 'lucide-react'

interface ValuationFormData {
  provincia: string
  localidad: string
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
  analisis: string
  factoresConsiderados: string[]
}

export default function ValuationForm() {
  const [form, setForm] = useState<ValuationFormData>({
    provincia: 'Buenos Aires',
    localidad: '',
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
        analisis: data.analisis || '',
        factoresConsiderados: data.factoresConsiderados || [],
      })
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
          <DollarSign className="w-5 h-5" />
          Tasador de Propiedades
        </h2>

        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Ubicación */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Ubicación</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Provincia <span className="text-red-500">*</span>
                </label>
                <select
                  name="provincia"
                  value={form.provincia}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Seleccionar provincia</option>
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Localidad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="localidad"
                  value={form.localidad}
                  onChange={handleChange}
                  placeholder="Ej: San Isidro"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Dimensiones */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Dimensiones</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metros Cubiertos (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="metrosCubiertos"
                  value={form.metrosCubiertos}
                  onChange={handleChange}
                  placeholder="Ej: 100"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Metros Descubiertos (m²) <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="metrosDescubiertos"
                  value={form.metrosDescubiertos}
                  onChange={handleChange}
                  placeholder="Ej: 20"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Características */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Características</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ambientes <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="ambientes"
                  value={form.ambientes}
                  onChange={handleChange}
                  placeholder="Ej: 3"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Baños <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="banos"
                  value={form.banos}
                  onChange={handleChange}
                  placeholder="Ej: 2"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Amenities y otros datos */}
          <div className="border-t pt-4">
            <h3 className="font-semibold text-slate-700 mb-3">Detalles Adicionales</h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <textarea
                name="amenities"
                value={form.amenities}
                onChange={handleChange}
                placeholder="Ej: Cochera, balcón, aire acondicionado, calefacción central"
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Otros Datos
              </label>
              <textarea
                name="otrosDatos"
                value={form.otrosDatos}
                onChange={handleChange}
                placeholder="Ej: Renovado, apto profesional, pisos de madera..."
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Botón */}
          <div className="border-t pt-4 flex gap-3">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Tasando...
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Obtener Tasación
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Resultado */}
      {result && (
        <div className="mt-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border border-green-200 shadow-sm p-6">
          <div className="flex items-center gap-2 mb-4">
            <CheckCircle2 className="w-6 h-6 text-green-600" />
            <h3 className="text-xl font-bold text-slate-800">Rango de Valuación</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="bg-white rounded-lg p-4 border border-green-100">
              <p className="text-sm text-gray-600 mb-1">Valor Mínimo</p>
              <p className="text-2xl font-bold text-green-600">
                ${result.valorMinimo.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">USD</p>
            </div>
            <div className="bg-white rounded-lg p-4 border border-blue-100">
              <p className="text-sm text-gray-600 mb-1">Valor Máximo</p>
              <p className="text-2xl font-bold text-blue-600">
                ${result.valorMaximo.toLocaleString('es-AR')}
              </p>
              <p className="text-xs text-gray-500 mt-1">USD</p>
            </div>
          </div>

          {result.analisis && (
            <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
              <h4 className="font-semibold text-slate-700 mb-2">Análisis</h4>
              <p className="text-sm text-gray-700 leading-relaxed">
                {result.analisis}
              </p>
            </div>
          )}

          {result.factoresConsiderados && result.factoresConsiderados.length > 0 && (
            <div className="bg-white rounded-lg p-4 border border-gray-200">
              <h4 className="font-semibold text-slate-700 mb-2">Factores Considerados</h4>
              <ul className="space-y-1">
                {result.factoresConsiderados.map((factor, idx) => (
                  <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                    <span className="text-blue-600 font-bold">•</span>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <button
            onClick={() => {
              setResult(null)
              setForm({
                provincia: 'Buenos Aires',
                localidad: '',
                metrosCubiertos: '',
                metrosDescubiertos: '',
                ambientes: '',
                banos: '',
                amenities: '',
                otrosDatos: '',
              })
            }}
            className="mt-4 w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition"
          >
            Nueva Tasación
          </button>
        </div>
      )}
    </div>
  )
}
