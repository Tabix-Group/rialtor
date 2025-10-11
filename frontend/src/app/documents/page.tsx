'use client';

import Link from 'next/link'
import { Search, Wand2, Edit3 } from 'lucide-react'

export default function DocumentsPage() {

  const documentOptions = [
    {
      title: 'Resumir Documentos',
      description: 'Sube tus documentos y obtén resúmenes inteligentes con IA. Analiza contratos, informes y documentos legales de forma rápida y eficiente.',
      icon: Search,
      href: '/documents/summary',
      iconColor: 'text-blue-600',
      iconBg: 'bg-blue-50',
      iconBgHover: 'group-hover:bg-blue-100'
    },
    {
      title: 'Generar Documentos',
      description: 'Crea documentos legales profesionales en segundos. Genera modelos de reserva, autorizaciones, boletos y contratos con datos personalizados.',
      icon: Wand2,
      href: '/documents/generator',
      iconColor: 'text-green-600',
      iconBg: 'bg-green-50',
      iconBgHover: 'group-hover:bg-green-100'
    },
    {
      title: 'Formularios Editables',
      description: 'Edita formularios y documentos directamente en el navegador. Completa contratos de alquiler, boletos de compraventa y reservas con un editor WYSIWYG intuitivo.',
      icon: Edit3,
      href: '/formularios',
      iconColor: 'text-purple-600',
      iconBg: 'bg-purple-50',
      iconBgHover: 'group-hover:bg-purple-100'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Documentos Inteligentes
              </h1>
              <p className="text-sm text-gray-500 mt-0.5">
                Gestiona y crea documentos legales con IA
              </p>
            </div>
          </div>
        </div>

        {/* Options Grid - Más compacto */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {documentOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="block group bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md hover:border-blue-400 transition-all duration-200"
            >
              <div className="flex flex-col h-full">
                {/* Icono y título */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`${option.iconBg} p-2.5 rounded-lg ${option.iconBgHover} transition-colors flex-shrink-0`}>
                      <option.icon className={`w-5 h-5 ${option.iconColor}`} />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                      {option.title}
                    </h3>
                  </div>
                  <svg
                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>

                {/* Descripción */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {option.description}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info - Más compacto */}
        <div className="mt-6">
          <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="flex-1">
                <h4 className="text-sm font-semibold text-gray-900 mb-1">
                  ¿Necesitas ayuda?
                </h4>
                <p className="text-sm text-gray-600">
                  Consulta nuestro
                  <Link href="/knowledge" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                    centro de ayuda
                  </Link>
                  {' '}o contacta al soporte técnico.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
