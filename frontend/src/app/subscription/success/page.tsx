'use client'

import { useEffect, useState } from 'react'
import { CheckCircle, Loader2, Home, Sparkles } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function SubscriptionSuccessPage() {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('session_id')
  
  const [isVerifying, setIsVerifying] = useState(true)
  const [isActivated, setIsActivated] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Dar unos segundos para que el webhook de Stripe procese y active la cuenta
    const verifyActivation = async () => {
      try {
        // Esperar 3 segundos para dar tiempo al webhook
        await new Promise(resolve => setTimeout(resolve, 3000))
        
        setIsVerifying(false)
        setIsActivated(true)
        
        // Redirigir al dashboard después de 3 segundos
        setTimeout(() => {
          window.location.href = '/dashboard'
        }, 3000)
      } catch (err) {
        console.error('Error verificando activación:', err)
        setError('No pudimos verificar tu suscripción. Por favor, contacta a soporte.')
        setIsVerifying(false)
      }
    }

    if (sessionId) {
      verifyActivation()
    } else {
      setError('No se encontró información de la sesión de pago.')
      setIsVerifying(false)
    }
  }, [sessionId])

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

      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <radialGradient id="nodeGrad1">
            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx="50%" cy="50%" r="200" fill="url(#nodeGrad1)" />
      </svg>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] flex items-center justify-center px-4 relative overflow-hidden">
      <BackgroundElements />
      
      <div className="relative z-10 max-w-md w-full">
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-2xl">
          {isVerifying ? (
            // Estado de verificación
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-violet-500/20 border border-violet-500/30 mb-6">
                <Loader2 className="h-10 w-10 text-violet-400 animate-spin" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Procesando tu suscripción
              </h2>
              <p className="text-purple-200 mb-6">
                Estamos verificando tu pago y activando tu cuenta...
              </p>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
              </div>
            </div>
          ) : error ? (
            // Estado de error
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <svg className="h-10 w-10 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Algo salió mal
              </h2>
              <p className="text-red-200 mb-6">
                {error}
              </p>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all"
              >
                <Home className="h-5 w-5" />
                Ir al Dashboard
              </Link>
            </div>
          ) : isActivated ? (
            // Estado de éxito
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-20 w-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6 animate-bounce">
                <CheckCircle className="h-12 w-12 text-emerald-400" />
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">
                ¡Bienvenido a Rialtor!
              </h2>
              <p className="text-purple-200 mb-2">
                Tu suscripción está activa
              </p>
              <p className="text-sm text-purple-300 mb-8">
                Ya tienes acceso completo a todas las funcionalidades de la plataforma
              </p>
              
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="flex items-start gap-3 text-left">
                  <Sparkles className="h-5 w-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h3 className="text-white font-semibold mb-1">Próximos pasos</h3>
                    <ul className="text-sm text-purple-200 space-y-1">
                      <li>• Completa tu perfil</li>
                      <li>• Explora el chat con IA</li>
                      <li>• Genera tus primeros documentos</li>
                      <li>• Prueba la calculadora avanzada</li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <Link
                  href="/dashboard"
                  className="block w-full py-3 px-6 bg-gradient-to-r from-violet-500 to-purple-500 text-white font-semibold rounded-xl hover:from-violet-600 hover:to-purple-600 transition-all shadow-lg"
                >
                  Ir al Dashboard
                </Link>
                <p className="text-xs text-purple-300">
                  Redirigiendo automáticamente en 3 segundos...
                </p>
              </div>
            </div>
          ) : null}
        </div>

        {/* Información adicional */}
        {isActivated && (
          <div className="mt-6 text-center">
            <p className="text-sm text-purple-300">
              Recibirás un email de confirmación con los detalles de tu suscripción
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
