use client

import Link from 'next/link'
import { Calculator, FileText, Percent, ShieldCheck } from 'lucide-react'
import { useAuth } from '../auth/authContext'

export default function CalculadorasPage() {
  const { user } = useAuth()

  const calculators = [
    {
      name: 'Gastos de Escritura',
      href: '/calcescritura',
      description: 'Calculá impuestos, aranceles notariales y costos asociados a la firma de escritura en Argentina por provincia.',
      color: 'bg-blue-50',
      icon: Calculator,
    },
    {
      name: 'Honorarios',
      href: '/calchonorarios',
      description: 'Simulá honorarios inmobiliarios según porcentaje, plazos y escenarios (vendedor/comprador).',
      color: 'bg-yellow-50',
      icon: FileText,
    },
    {
      name: 'Impuesto — Ganancia Inmobiliaria',
      href: '/calciigg',
      description: 'Estimá el impuesto cedular sobre la ganancia inmobiliaria y cómo impacta en tu operación.',
      color: 'bg-green-50',
      icon: Percent,
    },
    {
      name: 'Seguro de Caución',
      href: '/creditos',
      description: 'Accedé a la calculadora de costo de caución (seguros) para operaciones de alquiler y garantías.',
      color: 'bg-red-50',
      icon: ShieldCheck,
    },
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Calculadoras</h1>
          <p className="mt-2 text-gray-600 max-w-2xl mx-auto">Todas las herramientas para estimar costos y obligaciones en una sola pantalla. Elegí la calculadora que necesites.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {calculators.map((c) => {
            const Icon = c.icon
            const locked = c.name === 'Seguro de Caución' && !user
            return (
              <div key={c.name} className={`p-6 rounded-lg border ${c.color} shadow-sm hover:shadow-lg transition`}>
                <div className="flex items-start gap-4">
                  <div className="p-3 rounded-md bg-white border">
                    <Icon className="w-6 h-6 text-gray-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">{c.name}</h3>
                    <p className="text-sm text-gray-600 mt-1">{c.description}</p>
                    <div className="mt-4">
                      {locked ? (
                        <button disabled className="px-4 py-2 rounded bg-gray-200 text-gray-500">Ingresá para usar</button>
                      ) : (
                        <Link href={c.href} className="inline-block px-4 py-2 rounded bg-remax-red text-white hover:bg-red-600">Ir a calculadora</Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-10 text-sm text-gray-500">
          <p>Consejo: si no sabés por dónde empezar, probá con "Gastos de Escritura" para obtener una visión integral de los costos de la operación.</p>
        </div>
      </div>
    </div>
  )
}
