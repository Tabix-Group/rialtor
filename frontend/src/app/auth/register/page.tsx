'use client'

import { useState } from 'react'
import { Eye, EyeOff, User, Lock, Mail, Phone, Building, ArrowRight, CheckCircle } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    office: '',
    role: 'agente'
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
        setError(data.message || 'Error al registrar usuario')
      }
    } catch (error) {
      setError('Error de conexión. Intenta nuevamente.')
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in">
                <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Cuenta creada!</h2>
                <p className="text-gray-600 mb-6">Te estamos redirigiendo al inicio de sesión...</p>
                <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                    <div className="bg-remax-blue h-2.5 rounded-full animate-[width_2s_ease-in-out]" style={{width: '100%'}}></div>
                </div>
            </div>
        </div>
    )
  }

  return (
    <div className="min-h-screen flex bg-background">
      {/* Lado Izquierdo - Formulario */}
      <div className="flex-1 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-20 xl:px-24 animate-slide-in">
        <div className="mx-auto w-full max-w-sm lg:w-[32rem]">
          <div className="mb-10">
            <Link href="/auth/login" className="text-sm font-medium text-remax-blue hover:text-remax-blue-dark flex items-center mb-6">
                ← Volver al inicio de sesión
            </Link>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Crear una cuenta
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              Únete a la plataforma líder para gestión inmobiliaria.
            </p>
          </div>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={handleChange}
                    className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                    placeholder="Juan"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                <input
                  id="lastName"
                  name="lastName"
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={handleChange}
                  className="block w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                  placeholder="Pérez"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                        placeholder="juan@remax.com"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                        placeholder="+54 9 11..."
                    />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Oficina</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="office"
                        name="office"
                        type="text"
                        required
                        value={formData.office}
                        onChange={handleChange}
                        className="block w-full pl-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                        placeholder="RE/MAX Premium"
                    />
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Rol</label>
                    <select
                        id="role"
                        name="role"
                        required
                        value={formData.role}
                        onChange={handleChange}
                        className="block w-full pl-3 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm bg-white"
                    >
                        <option value="agente">Agente</option>
                        <option value="broker">Broker</option>
                        <option value="manager">Manager</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4 pt-2">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                        placeholder="Mínimo 8 caracteres"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowPassword(!showPassword)}
                    >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar Contraseña</label>
                    <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        className="block w-full pl-10 pr-10 px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-remax-blue focus:border-remax-blue sm:text-sm"
                        placeholder="Repite tu contraseña"
                    />
                    <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="bg-remax-red-light/10 border border-remax-red-light/20 rounded-lg p-4 animate-pulse-subtle">
                <p className="text-sm text-remax-red-dark font-medium text-center">{error}</p>
                </div>
            )}

            <div className="flex items-center pt-2">
                <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 text-remax-blue focus:ring-remax-blue border-gray-300 rounded cursor-pointer"
                />
                <label htmlFor="terms" className="ml-2 block text-sm text-gray-900 cursor-pointer">
                Acepto los{' '}
                <a href="/terminos" className="font-medium text-remax-blue hover:text-remax-blue-dark">
                    términos y condiciones
                </a>
                </label>
            </div>

            <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-remax-blue hover:bg-remax-blue-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-remax-blue transition-all disabled:opacity-70 disabled:cursor-not-allowed"
            >
                {isLoading ? 'Procesando...' : 'Crear Cuenta'}
            </button>
          </form>
        </div>
      </div>

      {/* Lado Derecho - Imagen (Oculto en móvil) */}
      <div className="hidden lg:block relative w-0 flex-1 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-l from-remax-blue/80 to-transparent z-10" />
        <Image
          className="absolute inset-0 h-full w-full object-cover"
          src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?ixlib=rb-4.0.3&auto=format&fit=crop&w=1973&q=80"
          alt="Office Background"
          width={1920}
          height={1080}
        />
        <div className="absolute bottom-0 right-0 p-12 z-20 text-white text-right max-w-lg">
            <h3 className="text-3xl font-bold mb-4">Potencia tu carrera inmobiliaria</h3>
            <p className="text-remax-orange-50 text-lg opacity-90">Únete a la red de agentes más productiva del mercado con herramientas diseñadas para tu éxito.</p>
        </div>
      </div>
    </div>
  )
}