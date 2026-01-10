'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import SalesFunnel from '@/components/SalesFunnel'

export default function MisProyecciones() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Mis Proyecciones</h1>
          <p className="mt-2 text-gray-600">
            Visualiza y gestiona tu pipeline de ventas en tiempo real
          </p>
        </div>

        {/* Main Content */}
        <SalesFunnel />
      </div>
    </div>
  )
}
