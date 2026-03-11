'use client'

import { useState, useEffect } from 'react'
import { Lock, ArrowRight, Sparkles, CheckCircle, AlertCircle } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

export default function ResetPasswordContent() {
  const searchParams = useSearchParams()
  const token = searchParams?.get('token') || null

  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [tokenValid, setTokenValid] = useState<boolean | null>(null)

  useEffect(() => {
    if (token) {
      verifyToken()
    } else {
      setTokenValid(false)
    }
  }, [token])

  const verifyToken = async () => {
    try {
      const getApiUrl = () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname
          if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
            return 'https://remax-be-production.up.railway.app'
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      }

      const response = await fetch(`${getApiUrl()}/api/auth/verify-reset-token/${token}`, {
        method: 'GET',
      })

      if (response.ok) {
        setTokenValid(true)
      } else {
        setTokenValid(false)
        setError('El enlace es inválido o ha expirado')
      }
    } catch (error) {
      setTokenValid(false)
      setError('Error al verificar el enlace')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (newPassword !== confirmPassword) {
      setError('Las contraseñas no coinciden')
      return
    }

    if (newPassword.length < 8) {
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }

    setIsLoading(true)

    try {
      const getApiUrl = () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname
          if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
            return 'https://remax-be-production.up.railway.app'
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'
      }

      const response = await fetch(`${getApiUrl()}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword })
      })

      if (response.ok) {
        setSuccess(true)
      } else {
        const data = await response.json()
        setError(data.error || 'Error al restablecer la contraseña')
      }
    } catch (error) {
      setError('Error de conexión con el servidor.')
    } finally {
      setIsLoading(false)
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
          <linearGradient id="lineGrad2" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 0.2 }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed', stopOpacity: 0 }} />
          </linearGradient>
        </defs>

        <line x1="0" y1="0" x2="1000" y2="1000" stroke="url(#lineGrad1)" strokeWidth="2" />
        <line x1="1000" y1="0" x2="0" y2="1000" stroke="url(#lineGrad2)" strokeWidth="2" />
        <line x1="500" y1="0" x2="500" y2="1000" stroke="url(#lineGrad1)" strokeWidth="1" opacity="0.5" />

        <polygon points="800,100 900,300 700,300" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
        <polygon points="100,600 200,750 0,750" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.3" />

        <circle cx="200" cy="200" r="3" fill="#a78bfa" opacity="0.5" />
        <circle cx="800" cy="300" r="2" fill="#c084fc" opacity="0.4" />
        <circle cx="400" cy="600" r="2.5" fill="#a78bfa" opacity="0.4" />
        <circle cx="750" cy="700" r="2" fill="#7c3aed" opacity="0.3" />
        <circle cx="100" cy="800" r="3" fill="#c084fc" opacity="0.3" />
      </svg>

      <div className="absolute bottom-20 right-10 w-96 h-64 border border-violet-500/30 rounded-3xl opacity-40 transform rotate-12" />
      <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-purple-500/20 rounded-full opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border border-violet-500/25 rounded-lg opacity-25 transform -rotate-45" />
    </div>
  )

  if (success) {
    return (
      <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white overflow-hidden">
        <BackgroundElements />
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                <CheckCircle className="h-10 w-10 text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">¡Contraseña actualizada!</h2>
              <p className="text-purple-200 mb-8">
                Tu contraseña ha sido restablecida correctamente. Ahora puedes iniciar sesión con tu nueva contraseña.
              </p>
              
              <Link
                href="/auth/login"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors"
              >
                Ir a login
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === false) {
    return (
      <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white overflow-hidden">
        <BackgroundElements />
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl text-center">
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-500/20 border border-red-500/30 mb-6">
                <AlertCircle className="h-10 w-10 text-red-400" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Enlace Inválido</h2>
              <p className="text-purple-200 mb-8">
                {error || 'El enlace para restablecer tu contraseña es inválido o ha expirado.'}
              </p>
              
              <Link
                href="/auth/forgot-password"
                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-violet-500 text-white font-semibold rounded-lg hover:bg-violet-600 transition-colors"
              >
                Solicitar un nuevo enlace
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (tokenValid === null) {
    return (
      <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white overflow-hidden">
        <BackgroundElements />
        <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
          <div className="mx-auto w-full max-w-sm lg:w-96">
            <div className="text-center">
              <svg className="animate-spin h-8 w-8 text-violet-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <p className="text-purple-300 mt-4">Verificando enlace...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white overflow-hidden">
      <BackgroundElements />
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 animate-fade-in relative z-10">
        <div className="absolute top-6 left-6">
          <Link
            href="/auth/login"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-300/70 hover:text-white transition-colors"
          >
            ← Volver al login
          </Link>
        </div>

        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center lg:items-start">
            <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-6">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Nueva Contraseña
            </h2>
            <p className="mt-2 text-sm text-purple-300/70 text-center lg:text-left">
              Ingresa tu nueva contraseña
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="newPassword" className="block text-sm font-medium text-purple-200">
                  Nueva Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="newPassword"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-violet-500 focus:border-violet-500 focus:outline-none focus:ring-2 sm:text-sm transition-colors hover:bg-white/15"
                    placeholder="Mínimo 8 caracteres"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-200"
                  >
                    {showPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-purple-200">
                  Confirmar Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-violet-500 focus:border-violet-500 focus:outline-none focus:ring-2 sm:text-sm transition-colors hover:bg-white/15"
                    placeholder="Repite tu contraseña"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-400 hover:text-purple-200"
                  >
                    {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-500/10 p-4 border border-red-500/30">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-200">{error}</h3>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative w-full flex justify-center py-3 px-4 border border-transparent rounded-lg text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 focus:ring-offset-[#0f0627] transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Restableciendo...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Cambiar Contraseña
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
