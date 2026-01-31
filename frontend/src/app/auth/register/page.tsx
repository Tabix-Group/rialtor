'use client'

import { useState } from 'react'
import { Eye, EyeOff, User, Lock, Mail, Phone, Building, ArrowRight, CheckCircle, Sparkles } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
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
        <line x1="0" y1="0" x2="1000" y2="1000" stroke="url(#lineGrad1)" strokeWidth="2" />
        <line x1="1000" y1="0" x2="0" y2="1000" stroke="url(#lineGrad2)" strokeWidth="2" />
      </svg>

      {/* Triángulos decorativos */}
      <svg className="absolute -top-20 -right-20 w-96 h-96 opacity-20" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="triangleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style={{ stopColor: '#a78bfa' }} />
            <stop offset="100%" style={{ stopColor: '#7c3aed' }} />
          </linearGradient>
        </defs>
        <polygon points="100,10 190,190 10,190" fill="url(#triangleGrad)" fillOpacity="0.3" />
      </svg>

      {/* Triángulo inferior izquierdo */}
      <svg className="absolute -bottom-16 -left-20 w-80 h-80 opacity-15" viewBox="0 0 200 200">
        <defs>
          <linearGradient id="triangleGrad2" x1="100%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" style={{ stopColor: '#c084fc' }} />
            <stop offset="100%" style={{ stopColor: '#a78bfa' }} />
          </linearGradient>
        </defs>
        <polygon points="100,10 190,190 10,190" fill="url(#triangleGrad2)" fillOpacity="0.4" />
      </svg>

      {/* Círculos/nodos decorativos */}
      <svg className="absolute inset-0 w-full h-full opacity-20">
        <defs>
          <radialGradient id="nodeGrad1">
            <stop offset="0%" style={{ stopColor: '#a78bfa', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#a78bfa', stopOpacity: 0 }} />
          </radialGradient>
          <radialGradient id="nodeGrad2">
            <stop offset="0%" style={{ stopColor: '#c084fc', stopOpacity: 0.6 }} />
            <stop offset="100%" style={{ stopColor: '#c084fc', stopOpacity: 0 }} />
          </radialGradient>
        </defs>
        <circle cx="20%" cy="30%" r="100" fill="url(#nodeGrad1)" />
        <circle cx="80%" cy="70%" r="80" fill="url(#nodeGrad2)" />
        <circle cx="50%" cy="50%" r="60" fill="url(#nodeGrad1)" fillOpacity="0.5" />
      </svg>
    </div>
  )
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    office: '',
    role: 'USUARIO'
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      setIsLoading(false)
      return
    }

    try {
      const getApiUrl = () => {
        if (typeof window !== 'undefined') {
          const hostname = window.location.hostname;
          if (hostname === 'rialtor.app' || hostname === 'www.rialtor.app') {
            return 'https://remax-be-production.up.railway.app';
          }
        }
        return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003'; // Ajustado puerto default a 3003 por consistencia
      };

      const payload = {
        name: formData.firstName.trim() + ' ' + formData.lastName.trim(),
        email: formData.email,
        password: formData.password,
        phone: formData.phone,
        office: formData.office,
        role: formData.role
      };

      const response = await fetch(`${getApiUrl()}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        setSuccess(true)
        setTimeout(() => {
            window.location.href = '/auth/login'
        }, 2000)
      } else {
        const data = await response.json()
        
        // Si hay detalles de validación, mostrarlos
        if (data.details && Array.isArray(data.details) && data.details.length > 0) {
          const errorMessages = data.details.map((detail: any) => `${detail.field}: ${detail.message}`).join('\n')
          setError(errorMessages)
        } else {
          setError(data.message || 'Error al registrar usuario')
        }
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <BackgroundElements />
            <div className="max-w-md w-full bg-white/5 backdrop-blur-md border border-white/10 p-8 rounded-2xl shadow-2xl text-center animate-fade-in relative z-10">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                    <CheckCircle className="h-10 w-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">¡Cuenta creada!</h2>
                <p className="text-purple-200 mb-6">Te estamos redirigiendo al inicio de sesión...</p>
                <div className="w-full bg-white/10 rounded-full h-2.5">
                    <div className="bg-gradient-to-r from-violet-500 to-purple-500 h-2.5 rounded-full animate-[width_2s_ease-in-out]" style={{width: '100%'}}></div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] relative overflow-hidden">
      <BackgroundElements />
      
      {/* Lado Izquierdo - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 relative z-10">
        <div className="mx-auto w-full max-w-sm lg:w-[32rem]">
          {/* Botón Volver */}
          <Link href="/auth/login" className="text-sm font-medium text-purple-200 hover:text-purple-100 flex items-center mb-6 group transition-colors">
              <ArrowRight className="w-4 h-4 mr-1 transform rotate-180 group-hover:-translate-x-1 transition-transform" />
              Volver al inicio de sesión
          </Link>

          <div className="mb-8">
            {/* Icono con Sparkles */}
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-lg bg-gradient-to-br from-violet-500/30 to-purple-500/30 border border-purple-500/20 mb-4">
              <Sparkles className="h-7 w-7 text-transparent bg-gradient-to-b from-purple-300 to-violet-500 bg-clip-text" />
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-sm text-purple-200">
              Únete a la plataforma líder para gestión inmobiliaria.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Nombre</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-purple-400/50" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Apellido</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Email</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-purple-400/50" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                        placeholder="juan@remax.com"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Teléfono</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-purple-400/50" />
                    </div>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                        placeholder="+54 9 11..."
                    />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-purple-200 mb-2">Oficina</label>
                <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Building className="h-5 w-5 text-purple-400/50" />
                </div>
                <input
                    id="office"
                    name="office"
                    type="text"
                    required
                    value={formData.office}
                    onChange={handleChange}
                    className="block w-full pl-10 pr-3 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                    placeholder="RE/MAX Premium"
                />
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Contraseña</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-purple-400/50" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                        placeholder="Mínimo 8 caracteres"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/50 hover:text-purple-200 transition-colors"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-purple-200 mb-2">Confirmar Contraseña</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-purple-400/50" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 py-2.5 bg-white/10 border border-purple-500/30 rounded-lg text-white placeholder-purple-300/50 focus:bg-white/15 focus:border-purple-500/50 focus:ring-0 focus:outline-none sm:text-sm transition-colors"
                        placeholder="Repite tu contraseña"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-purple-300/50 hover:text-purple-200 transition-colors"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                  <p className="text-sm text-red-200 font-medium whitespace-pre-wrap text-center">
                    {error}
                  </p>
                </div>
            )}

            <div className="flex items-center pt-2">
                <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 accent-violet-500 bg-white/10 border-purple-500/30 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-purple-200 cursor-pointer">
                Acepto los{' '}
                <a href="/terminos" className="font-medium text-violet-400 hover:text-violet-300 transition-colors">
                    términos y condiciones
                </a>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-lg text-sm font-medium text-white bg-gradient-to-r from-violet-500 to-purple-500 hover:from-violet-600 hover:to-purple-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 transition-all disabled:opacity-70 disabled:cursor-not-allowed gap-2"
            >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border border-transparent border-t-current"></div>
                    Procesando...
                  </>
                ) : (
                  <>
                    Crear Cuenta
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
            </button>
          </form>
        </div>
      </div>

      {/* Lado Derecho - Imagen Decorativa */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-violet-600/40 to-transparent z-10" />
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1973&q=80"
          alt="Office Background"
          width={1920}
          height={1080}
        />
        <div className="absolute bottom-0 right-0 p-12 z-20 text-white text-right max-w-lg">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20">
              <h3 className="text-2xl font-bold mb-3 text-white">Potencia tu carrera</h3>
              <p className="text-purple-200 text-base">Únete a la red de agentes más productiva del mercado con herramientas diseñadas para tu éxito.</p>
            </div>
        </div>
      </div>
    </div>
  )
}