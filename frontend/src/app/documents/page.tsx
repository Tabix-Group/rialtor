'use client';

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { FileText, Search, Wand2, ArrowRight } from 'lucide-react'

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
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-12">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-8 rounded-t-3xl shadow">
            <h1 className="text-3xl font-extrabold mb-2 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-white/80" />
              Documentos Inteligentes
            </h1>
            <p className="text-blue-100 text-lg">
              Gestiona y crea documentos legales con la ayuda de inteligencia artificial
            </p>
          </div>

          {/* Options Grid */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {documentOptions.map((option, index) => (
                <Link
                  key={index}
                  href={option.href}
                  className={`block group bg-gradient-to-br ${option.bgColor} border-2 ${option.borderColor} rounded-2xl p-8 hover:shadow-xl transition-all duration-300 hover:-translate-y-1`}
                >
                  <div className="flex flex-col h-full">
                    <div className={`w-16 h-16 bg-gradient-to-r ${option.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      <option.icon className="w-8 h-8 text-white" />
                    </div>

                    <h3 className="text-2xl font-bold text-gray-800 mb-4 group-hover:text-gray-900 transition-colors">
                      {option.title}
                    </h3>

                    <p className="text-gray-600 text-lg leading-relaxed mb-6 flex-grow">
                      {option.description}
                    </p>

                    <div className={`flex items-center gap-2 text-lg font-semibold bg-gradient-to-r ${option.color} bg-clip-text text-transparent group-hover:gap-3 transition-all duration-300`}>
                      Comenzar
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Additional Info */}
            <div className="mt-12 text-center">
              <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-2">
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
      </div>
    </div>
  )
}
