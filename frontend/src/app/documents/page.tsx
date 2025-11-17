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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex-1 w-full">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
              <Wand2 className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-400" />
              <span className="text-xs sm:text-sm font-semibold text-white">Inteligencia Artificial</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
              Mis <span className="bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Documentos</span>
            </h1>

            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
              Gestiona y crea documentos legales con IA. Resume contratos y edita formularios de forma inteligente.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

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
