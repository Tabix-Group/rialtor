'use client'

import { useState, useEffect } from 'react'
import { Check, Sparkles, Zap, Crown, Loader2, AlertCircle } from 'lucide-react'
import { useSearchParams } from 'next/navigation'

export default function PricingPage() {
  const searchParams = useSearchParams()
  const userId = searchParams.get('userId')
  const canceled = searchParams.get('canceled')
  
  const [isLoading, setIsLoading] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (canceled === 'true') {
      setError('Has cancelado el proceso de pago. Puedes intentar nuevamente cuando desees.')
    }
  }, [canceled])

  const getApiUrl = () => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname;
      if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
        return 'https://remax-be-production.up.railway.app';
      }
    }
    return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
  };

  const handleSelectPlan = async (planType: 'monthly' | 'yearly') => {
    if (!userId) {
      setError('No se pudo identificar el usuario. Por favor, regístrate nuevamente.')
      return
    }

    setIsLoading(planType)
    setError('')

    try {
      const token = localStorage.getItem('token')
      
      if (!token) {
        setError('Sesión no válida. Por favor, regístrate nuevamente.')
        setTimeout(() => {
          window.location.href = '/auth/register'
        }, 2000)
        return
      }

      const response = await fetch(`${getApiUrl()}/api/stripe/create-checkout-session`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          planType,
          userId
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear la sesión de pago')
      }

      const data = await response.json()
      
      // Redirigir a Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      } else {
        throw new Error('No se recibió URL de checkout')
      }
    } catch (err: any) {
      console.error('Error al procesar el pago:', err)
      setError(err.message || 'Error al procesar tu solicitud. Por favor, intenta nuevamente.')
      setIsLoading(null)
    }
  }

  const BackgroundElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <svg
        className="absolute inset-0 w-full h-full opacity-30"
        viewBox="0 0 1000 1000"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="lineGrad1" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.3 }} />
            <stop offset="100%" style={{ stopColor: '#6366f1', stopOpacity: 0 }} />
          </linearGradient>
        </defs>
        <line x1="0" y1="0" x2="1000" y2="1000" stroke="url(#lineGrad1)" strokeWidth="2" />
      </svg>

      <svg className="absolute -top-20 -right-20 w-96 h-96 opacity-20" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="triangleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a78bfa' }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed' }} />
          </linearGradient>
        </defs>
        <polygon points="100,10 190,190 10,190" fill="url(#triangleGrad)" fillOpacity="0.3" />
      </svg>

      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <radialGradient id="nodeGrad1">
            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx="20%" cy="30%" r="100" fill="url(#nodeGrad1)" />
        <circle cx="80%" cy="70%" r="80" fill="url(#nodeGrad1)" />
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] relative overflow-hidden">
      <BackgroundElements />
      
      <div className="relative z-10 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl shadow-lg mb-6">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Elige tu plan
            </h1>
            <p className="text-lg text-purple-200 max-w-2xl mx-auto">
              Accede a todas las herramientas profesionales para gestionar tu negocio inmobiliario
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="max-w-4xl mx-auto mb-8">
              <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-200 text-sm">{error}</p>
              </div>
            </div>
          )}

          {/* Pricing Cards */}
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
            {/* Plan Mensual */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 hover:border-purple-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-purple-500/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-violet-500/20 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Plan Mensual</h3>
                  <p className="text-sm text-purple-200">Flexibilidad total</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$25</span>
                  <span className="text-purple-200">/mes</span>
                </div>
                <p className="text-sm text-purple-300 mt-2">Pago mensual automático</p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Acceso completo a la plataforma',
                  'Chat con IA especializado',
                  'Generación de documentos',
                  'Calculadora avanzada',
                  'Gestión de prospectos',
                  'Placas profesionales',
                  'Indicadores económicos',
                  'Soporte prioritario'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className="h-5 w-5 text-emerald-400 flex-shrink-0" />
                    <span className="text-purple-100">{feature}</span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('monthly')}
                disabled={!!isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isLoading === 'monthly' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Seleccionar Plan Mensual'
                )}
              </button>
            </div>

            {/* Plan Anual */}
            <div className="bg-gradient-to-br from-violet-500/10 to-purple-500/10 backdrop-blur-md border-2 border-purple-500/50 rounded-2xl p-8 relative hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300">
              {/* Badge de ahorro */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                <div className="bg-gradient-to-r from-emerald-500 to-green-500 text-white px-4 py-1.5 rounded-full text-sm font-semibold shadow-lg">
                  Ahorra $60/año (20%)
                </div>
              </div>

              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 bg-gradient-to-br from-yellow-500/30 to-orange-500/30 rounded-lg flex items-center justify-center">
                  <Crown className="h-6 w-6 text-yellow-400" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Plan Anual</h3>
                  <p className="text-sm text-purple-200">Mejor valor</p>
                </div>
              </div>

              <div className="mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-bold text-white">$240</span>
                  <span className="text-purple-200">/año</span>
                </div>
                <p className="text-sm text-emerald-400 mt-2 font-medium">
                  Equivalente a $20/mes • Ahorra $60 al año
                </p>
              </div>

              <ul className="space-y-4 mb-8">
                {[
                  'Acceso completo a la plataforma',
                  'Chat con IA especializado',
                  'Generación de documentos',
                  'Calculadora avanzada',
                  'Gestión de prospectos',
                  'Placas profesionales',
                  'Indicadores económicos',
                  'Soporte prioritario',
                  '✨ 2 meses gratis'
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-3">
                    <Check className={`h-5 w-5 flex-shrink-0 ${index === 8 ? 'text-yellow-400' : 'text-emerald-400'}`} />
                    <span className={`${index === 8 ? 'text-yellow-300 font-semibold' : 'text-purple-100'}`}>
                      {feature}
                    </span>
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleSelectPlan('yearly')}
                disabled={!!isLoading}
                className="w-full py-4 px-6 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-xl"
              >
                {isLoading === 'yearly' ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Procesando...
                  </>
                ) : (
                  'Seleccionar Plan Anual'
                )}
              </button>
            </div>
          </div>

          {/* FAQ o información adicional */}
          <div className="max-w-3xl mx-auto mt-16 text-center">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                💳 Pago seguro con Stripe
              </h3>
              <p className="text-purple-200 text-sm">
                Tus datos de pago están protegidos con encriptación de nivel bancario. 
                Puedes cancelar tu suscripción en cualquier momento sin cargos adicionales.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
