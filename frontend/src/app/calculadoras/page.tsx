"use client"

import Link from 'next/link'
import { Calculator, ShieldCheck, Home, CalendarDays } from 'lucide-react'

export default function CalculadorasPage() {

  const calculators = [
    {
      name: 'Calculadora de ajustes de alquiler',
      href: '/ajustes',
      description: 'Calculá ajustes por IPC, acuerdos o índices para contratos de alquiler en Argentina.',
      color: 'bg-indigo-50',
      icon: Calculator,
    },
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
      icon: CalendarDays,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0djItaDJWMzZoLTJ6bTAtNHYyaDJWMzBoLTJ6bTAtNHYyaDJWMjZoLTJ6bTAtNHYyaDJWMjJoLTJ6bTAtNHYyaDJWMThoLTJ6bTAtNHYyaDJWMTRoLTJ6bTAtNHYyaDJWMTBoLTJ6bTAtNHYyaDJWNmgtMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-40"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
              <Calculator className="w-3 h-3 sm:w-4 sm:h-4 text-orange-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Herramientas de Cálculo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Mis <span className="bg-gradient-to-r from-orange-400 to-yellow-400 bg-clip-text text-transparent">Calculadoras</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Todas las herramientas para estimar costos y obligaciones en una sola pantalla. Elegí la calculadora que necesites.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

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
    </div>
  )
}
