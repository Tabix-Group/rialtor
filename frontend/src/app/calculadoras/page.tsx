"use client"

import Link from 'next/link'
import { Calculator, ShieldCheck, Home } from 'lucide-react'

export default function CalculadorasPage() {

  const calculators = [
    {
      name: 'Calculadora de gastos inmobiliarios',
      href: '/calcescritura',
      description: 'Calculá impuestos, aranceles notariales y costos asociados a la firma de escritura en Argentina por provincia.',
      color: 'bg-blue-50',
      icon: Calculator,
    },
    {
      name: 'Calculadora de días hábiles',
      href: '/dias',
      description: 'Calculá días hábiles y días de corrido entre dos fechas, considerando feriados y fines de semana en Argentina.',
      color: 'bg-green-50',
      icon: Calculator,
    },
    {
      name: 'Créditos Hipotecarios',
      href: '/hipotecarios',
      description: 'Calculá las cuotas de tu crédito hipotecario usando el sistema de amortización francés.',
      color: 'bg-purple-50',
      icon: Home,
    },
    {
      name: 'Seguro de Caución',
      href: '/creditos',
      description: 'Accedé a la calculadora de costo de caución (seguros) para operaciones de alquiler y garantías.',
      color: 'bg-blue-50',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Calculator className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">Calculadoras</h1>
          </div>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Todas las herramientas para estimar costos y obligaciones en una sola pantalla. Elegí la calculadora que necesites.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {calculators.map((c) => {
            const Icon = c.icon
            return (
              <div key={c.name} className="bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                <div className="flex flex-col h-full">
                  <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-3">{c.name}</h3>
                    <p className="text-gray-600 mb-6 leading-relaxed">{c.description}</p>
                  </div>
                  <div className="mt-auto">
                    <Link href={c.href} className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium">
                      Ir a calculadora
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <p className="text-gray-600">
              <strong>Consejo:</strong> si no sabés por dónde empezar, probá con "Calculadora de gastos inmobiliarios" para obtener una visión integral de los costos de la operación.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
