'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, Wand2, Edit3, ArrowRight } from 'lucide-react'

export default function DocumentsPage() {

  const documentOptions = [
    {
      title: 'Resumir Documentos',
      description: 'Sube tus documentos y obtén resúmenes inteligentes con IA. Analiza contratos, informes y documentos legales de forma rápida y eficiente.',
      icon: Search,
      href: '/documents/summary',
      color: 'from-blue-500 to-blue-700',
      bgColor: 'from-blue-50 to-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      title: 'Generar Documentos',
      description: 'Crea documentos legales profesionales en segundos. Genera modelos de reserva, autorizaciones, boletos y contratos con datos personalizados.',
      icon: Wand2,
      href: '/documents/generator',
      color: 'from-green-500 to-green-700',
      bgColor: 'from-green-50 to-green-100',
      borderColor: 'border-green-200'
    },
    {
      title: 'Formularios Editables',
      description: 'Edita formularios y documentos directamente en el navegador. Completa contratos de alquiler, boletos de compraventa y reservas con un editor WYSIWYG intuitivo.',
      icon: Edit3,
      href: '/formularios',
      color: 'from-purple-500 to-purple-700',
      bgColor: 'from-purple-50 to-purple-100',
      borderColor: 'border-purple-200'
    }
  ];

  return (
    <div className="min-h-screen bg-white py-12">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <FileText className="w-10 h-10 text-blue-600" />
            Documentos Inteligentes
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Gestiona y crea documentos legales con la ayuda de inteligencia artificial
          </p>
        </div>

        {/* Options Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {documentOptions.map((option, index) => (
            <Link
              key={index}
              href={option.href}
              className="block group bg-white border border-gray-200 rounded-xl p-8 hover:shadow-lg hover:border-blue-300 transition-all duration-300"
            >
              <div className="flex flex-col h-full">
                <div className="w-16 h-16 bg-blue-50 rounded-xl flex items-center justify-center mb-6 group-hover:bg-blue-100 transition-colors">
                  <option.icon className="w-8 h-8 text-blue-600" />
                </div>

                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {option.title}
                </h3>

                <p className="text-gray-600 text-lg leading-relaxed mb-6 flex-grow">
                  {option.description}
                </p>

                <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all duration-300">
                  Comenzar
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Additional Info */}
        <div className="mt-16 text-center">
          <div className="bg-gray-50 rounded-xl p-8 border border-gray-200">
            <h4 className="text-lg font-semibold text-gray-900 mb-3">
              ¿Necesitas ayuda?
            </h4>
            <p className="text-gray-600">
              Si tienes dudas sobre cómo usar estas herramientas, puedes consultar nuestro
              <Link href="/knowledge" className="text-blue-600 hover:text-blue-700 font-medium ml-1">
                centro de ayuda
              </Link>
              o contactar al soporte técnico.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
