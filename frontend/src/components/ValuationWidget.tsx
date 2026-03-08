"use client"

import Link from 'next/link'
import { Gavel, ArrowRight } from 'lucide-react'

export default function ValuationWidget() {
  return (
    <Link href="/valuador">
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 hover:shadow-md hover:border-purple-300 transition cursor-pointer h-full">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Gavel className="w-5 h-5 text-purple-600" />
              </div>
            </div>
            <h3 className="font-semibold text-slate-800">Tasador</h3>
            <p className="text-sm text-gray-600 mt-1">
              Valúa propiedades con IA en segundos
            </p>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-400" />
        </div>
      </div>
    </Link>
  )
}
