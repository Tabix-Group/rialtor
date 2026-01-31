'use client'

import { useState } from 'react'
import { Eye, EyeOff, Lock, Mail, ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'
import { useAuth } from '../authContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()

  // Componente de fondo decorativo con líneas y elementos (igual a la landing)
  const BackgroundElements = () => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      {/* Líneas diagonales */}
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

        {/* Líneas principales */}
        <line x1="0" y1="0" x2="1000" y2="1000" stroke="url(#lineGrad1)" strokeWidth="2" />
        <line x1="1000" y1="0" x2="0" y2="1000" stroke="url(#lineGrad2)" strokeWidth="2" />
        <line x1="500" y1="0" x2="500" y2="1000" stroke="url(#lineGrad1)" strokeWidth="1" opacity="0.5" />

        {/* Triángulos decorativos */}
        <polygon points="800,100 900,300 700,300" fill="none" stroke="#a78bfa" strokeWidth="1" opacity="0.4" />
        <polygon points="100,600 200,750 0,750" fill="none" stroke="#c084fc" strokeWidth="1" opacity="0.3" />

        {/* Puntos/Nodos */}
        <circle cx="200" cy="200" r="3" fill="#a78bfa" opacity="0.5" />
        <circle cx="800" cy="300" r="2" fill="#c084fc" opacity="0.4" />
        <circle cx="400" cy="600" r="2.5" fill="#a78bfa" opacity="0.4" />
        <circle cx="750" cy="700" r="2" fill="#7c3aed" opacity="0.3" />
        <circle cx="100" cy="800" r="3" fill="#c084fc" opacity="0.3" />
      </svg>

      {/* Rectángulo decorativo en la esquina inferior derecha */}
      <div className="absolute bottom-20 right-10 w-96 h-64 border border-violet-500/30 rounded-3xl opacity-40 transform rotate-12" />

      {/* Pequeños elementos flotantes */}
      <div className="absolute top-1/3 right-1/4 w-32 h-32 border border-purple-500/20 rounded-full opacity-30" />
      <div className="absolute bottom-1/4 left-1/3 w-24 h-24 border border-violet-500/25 rounded-lg opacity-25 transform -rotate-45" />
    </div>
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    try {
      const getApiUrl = () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
            return 'https://remax-be-production.up.railway.app';
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003';
      };

      const response = await fetch(`${getApiUrl()}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (response.ok) {
        const data = await response.json();
        if (data.token && data.user) {
          // Usar el método login del authContext
          login(data.token, data.user);
          
          // Si requiere pago, redirigir a pricing
          if (data.requiresPayment) {
            window.location.href = `/pricing?userId=${data.user.id}`;
          } else {
            window.location.href = '/dashboard';
          }
        }
      } else {
        const data = await response.json()
        setError(data.message || 'Credenciales incorrectas')
      }
    } catch (error) {
      setError('Error de conexión con el servidor.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white overflow-hidden">
      <BackgroundElements />
      {/* Lado Izquierdo - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 animate-fade-in relative z-10">
        <div className="absolute top-6 left-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium text-purple-300/70 hover:text-white transition-colors"
          >
            ← Volver a Home
          </Link>
        </div>
        <div className="mx-auto w-full max-w-sm lg:w-96">
          <div className="flex flex-col items-center lg:items-start">
            {/* Logo - Icono mejorado */}
            <div className="h-14 w-14 bg-gradient-to-br from-violet-500 to-purple-500 rounded-xl flex items-center justify-center shadow-lg mb-6 hover:shadow-xl transition-shadow">
              <Sparkles className="h-7 w-7 text-white" />
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">
              Bienvenido
            </h2>
            <p className="mt-2 text-sm text-purple-300/70 text-center lg:text-left">
              Gestiona tus propiedades y clientes con inteligencia
            </p>
          </div>

          <div className="mt-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-purple-200">
                  Correo Electrónico
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="block w-full pl-10 pr-3 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-violet-500 focus:border-violet-500 focus:outline-none focus:ring-2 sm:text-sm transition-colors hover:bg-white/15"
                    placeholder="nombre@ejemplo.com"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-purple-200">
                  Contraseña
                </label>
                <div className="mt-1 relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Lock className="h-5 w-5 text-purple-400" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full pl-10 pr-10 py-3 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:ring-violet-500 focus:border-violet-500 focus:outline-none focus:ring-2 sm:text-sm transition-colors hover:bg-white/15"
                    placeholder="••••••••"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-purple-400 hover:text-purple-200 focus:outline-none transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-violet-500 focus:ring-violet-500 border-purple-500/30 rounded bg-white/10"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-purple-200">
                    Recordarme
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                    ¿Olvidaste tu contraseña?
                  </a>
                </div>
              </div>

              {error && (
                <div className="rounded-md bg-red-500/10 p-4 border border-red-500/30 animate-pulse-subtle">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-red-200 whitespace-pre-wrap">{error}</h3>
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
                      Iniciando sesión...
                    </span>
                  ) : (
                    <span className="flex items-center">
                      Ingresar
                      <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-8">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-purple-500/20" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-purple-300/70">
                    ¿No tienes una cuenta?
                  </span>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/auth/register"
                  className="w-full flex justify-center py-3 px-4 border border-purple-500/30 rounded-lg shadow-sm bg-white/5 text-sm font-medium text-purple-200 hover:bg-white/10 hover:border-purple-500/50 transition-colors"
                >
                  Registrarse ahora
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}