'use client'

import { useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import ValuationForm from '../../components/ValuationForm'

export default function ValuadorPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Cargando...</div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-gray-100 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
            Tasador de Propiedades
          </h1>
          <p className="text-gray-600">
            Obtén una estimación precisa del valor de tu propiedad en USD utilizando inteligencia artificial
          </p>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6">
          <p className="text-sm text-blue-800">
            💡 <strong>Tip:</strong> Cuanta más información proporciones, más precisa será la valuación. 
            Incluye amenities y características especiales para obtener mejores resultados.
          </p>
        </div>

        <ValuationForm />
      </div>
    </div>
  )
}
