'use client'

import { useState } from 'react'
import AjustesCalculator from '../../components/AjustesCalculator'

export default function AjustesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Calculadora de Ajustes de Alquiler</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Herramienta especializada para calcular ajustes de alquiler por IPC, acuerdos entre partes o índices,
            cumpliendo con la legislación argentina de contratos de locación.
          </p>
        </div>

        <AjustesCalculator />

        <div className="mt-8 bg-white rounded-xl p-6 border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Importante</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-gray-800 mb-2">📊 Tipos de Ajuste</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• <strong>IPC:</strong> Índice de Precios al Consumidor (INDEC)</li>
                <li>• <strong>Acuerdos:</strong> Entre locador y locatario</li>
                <li>• <strong>Índices:</strong> RIPTE, ICV u otros indicadores</li>
                <li>• <strong>Moneda:</strong> Pesos o dólares</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-gray-800 mb-2">⚖️ Marco Legal</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Ley 27.551 (Contrato de Locación)</li>
                <li>• Actualización trimestral obligatoria</li>
                <li>• Límite del 20% semestral</li>
                <li>• Contratos desde 2021</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}