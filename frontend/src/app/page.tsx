'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

import { useAuth } from './auth/authContext'

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')
  const { user } = useAuth();

  // Features protegidas
  const features = [
    {
      name: 'Artículos',
      description: 'Accede a artículos, guías y documentación del sector inmobiliario argentino',
      icon: BookOpenIcon,
      href: '/knowledge',
      color: 'bg-blue-500',
      protected: true
    },
    {
      name: 'Agente IA',
      description: 'Consulta con nuestro bot inteligente sobre regulaciones y procesos',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-green-500',
      protected: true
    },
    {
      name: 'Generador de Documentos',
      description: 'Crea contratos, formularios y documentos legales personalizados',
      icon: DocumentTextIcon,
      href: '/documents',
      color: 'bg-purple-500',
      protected: true
    },
    {
      name: 'Calculadora Argentina',
      description: 'Calcula comisiones, impuestos, sellos y tasas provinciales',
      icon: CalculatorIcon,
      href: '/calculator',
      color: 'bg-orange-500',
      protected: true
    },
    {
      name: 'Gestión de Usuarios',
      description: 'Administra usuarios, roles y permisos del sistema',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-red-500',
      protected: true
    },
    {
      name: 'Reportes y Métricas',
      description: 'Visualiza estadísticas de uso y rendimiento de la plataforma',
      icon: ChartBarIcon,
      href: '/admin/reports',
      color: 'bg-indigo-500',
      protected: true
    }
  ]

  const recentArticles = [
    {
      id: 1,
      title: 'Nuevas regulaciones AFIP para operaciones inmobiliarias 2024',
      excerpt: 'Guía completa sobre los cambios en la normativa fiscal...',
      category: 'Regulaciones',
      date: '2024-01-15',
      views: 1250
    },
    {
      id: 2,
      title: 'Cálculo de comisiones en ventas de propiedades',
      excerpt: 'Métodos y fórmulas para el cálculo correcto de comisiones...',
      category: 'Comisiones',
      date: '2024-01-10',
      views: 980
    },
    {
      id: 3,
      title: 'Documentación necesaria para escrituración',
      excerpt: 'Lista completa de documentos requeridos para el proceso...',
      category: 'Documentación',
      date: '2024-01-08',
      views: 1100
    }
  ]

  // Si no está logueado, mostrar solo home básica
  if (!user) {
    return (
      <div className="min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-remax-blue via-remax-blue-light to-remax-blue-dark">
          <div className="absolute inset-0 hero-pattern opacity-10"></div>
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
            <div className="text-center">
              <div className="flex justify-center mb-8">
                <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                  <h1 className="text-5xl md:text-7xl font-bold text-white mb-2">
                    RE/MAX
                  </h1>
                  <div className="text-remax-red text-2xl md:text-3xl font-semibold bg-white px-4 py-2 rounded-lg">
                    Argentina
                  </div>
                </div>
              </div>
              <h2 className="text-2xl md:text-4xl font-bold text-white mb-6 max-w-4xl mx-auto">
                Agente de Conocimiento
              </h2>
              <p className="text-xl text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
                Accede a información actualizada, herramientas de cálculo especializadas, 
                asistencia inteligente y recursos completos para el sector inmobiliario argentino.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link href="/auth/login" className="btn-secondary px-8 py-4 text-lg font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Iniciar Sesión
                </Link>
                <Link href="/auth/register" className="btn-outline px-8 py-4 text-lg font-semibold rounded-lg bg-white/10 backdrop-blur-sm border-white/30 text-white hover:bg-white hover:text-remax-blue shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                  Registrarse
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Features Preview */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Herramientas Profesionales
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Descubre las funcionalidades que transformarán tu trabajo inmobiliario
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {features.slice(0, 6).map((feature, index) => (
                <div key={feature.name} className="group">
                  <div className="bg-white rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100">
                    <div className="flex items-center mb-6">
                      <div className={`${feature.color} w-14 h-14 rounded-xl flex items-center justify-center shadow-lg`}>
                        <feature.icon className="w-7 h-7 text-white" />
                      </div>
                      <div className="ml-4">
                        <h3 className="text-xl font-bold text-gray-900 group-hover:text-remax-blue transition-colors">
                          {feature.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* About Section */}
        <section className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                  Tu Socio en el Éxito Inmobiliario
                </h2>
                <p className="text-lg text-gray-600 mb-8 leading-relaxed">
                  RE/MAX Argentina presenta una plataforma integral diseñada específicamente 
                  para agentes inmobiliarios que buscan excellence y eficiencia en su trabajo diario.
                </p>
                <div className="space-y-6">
                  <div className="flex items-start">
                    <div className="bg-remax-blue w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Información Actualizada</h3>
                      <p className="text-gray-600">Acceso a regulaciones, normativas y cambios del sector en tiempo real.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-remax-red w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Herramientas Especializadas</h3>
                      <p className="text-gray-600">Calculadoras, generadores de documentos y asistencia inteligente.</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="bg-remax-blue w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                      <span className="text-white font-bold text-sm">✓</span>
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Soporte Profesional</h3>
                      <p className="text-gray-600">Respaldo completo para todas tus operaciones inmobiliarias.</p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="lg:text-right">
                <div className="bg-gradient-to-br from-remax-blue to-remax-blue-light rounded-3xl p-8 shadow-2xl">
                  <div className="text-center">
                    <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
                      <h3 className="text-3xl font-bold text-white mb-2">+10,000</h3>
                      <p className="text-blue-100">Agentes Activos</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <h4 className="text-2xl font-bold text-white">150+</h4>
                        <p className="text-blue-100 text-sm">Oficinas</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                        <h4 className="text-2xl font-bold text-white">24/7</h4>
                        <p className="text-blue-100 text-sm">Soporte</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 bg-gradient-to-r from-remax-red to-remax-red-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              ¿Listo para Transformar tu Negocio?
            </h2>
            <p className="text-xl text-red-100 mb-10 max-w-3xl mx-auto">
              Únete a miles de agentes que ya confían en RE/MAX Argentina para su éxito profesional
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register" className="bg-white text-remax-red px-8 py-4 rounded-lg font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Comenzar Ahora
              </Link>
              <Link href="/auth/login" className="border-2 border-white text-white px-8 py-4 rounded-lg font-semibold hover:bg-white hover:text-remax-red transition-colors shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                Ya Tengo Cuenta
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="md:col-span-2">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="bg-remax-blue w-10 h-10 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-lg">R</span>
                  </div>
                  <span className="text-2xl font-bold">RE/MAX Argentina</span>
                </div>
                <p className="text-gray-400 mb-6 max-w-md">
                  Plataforma de conocimiento y herramientas profesionales para agentes inmobiliarios argentinos. 
                  Transformando el sector con tecnología e innovación.
                </p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Recursos</h3>
                <ul className="space-y-2">
                  <li><span className="text-gray-400">Artículos</span></li>
                  <li><span className="text-gray-400">Documentos Legales</span></li>
                  <li><span className="text-gray-400">Calculadora Argentina</span></li>
                  <li><span className="text-gray-400">Agente IA</span></li>
                </ul>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                <ul className="space-y-2">
                  <li><span className="text-gray-400">Centro de Ayuda</span></li>
                  <li><span className="text-gray-400">Contacto</span></li>
                  <li><span className="text-gray-400">Capacitación</span></li>
                  <li><span className="text-gray-400">Documentación</span></li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
              <p>&copy; 2024 RE/MAX Argentina. Todos los derechos reservados.</p>
            </div>
          </div>
        </footer>
      </div>
    )
  }

  // Si está logueado, mostrar la home completa
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-remax-blue to-remax-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Agente de Conocimiento
              <span className="block text-remax-red">RE/MAX Argentina</span>
            </h1>
            <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Tu centro de recursos completo para el sector inmobiliario. 
              Accede a información actualizada, herramientas de cálculo y asistencia inteligente.
            </p>
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  placeholder="Buscar artículos, regulaciones, formularios..."
                  className="w-full pl-10 pr-4 py-4 text-gray-900 placeholder-gray-500 bg-white border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-red focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <span className="btn-secondary px-6 py-2 text-sm">Buscar</span>
                </button>
              </div>
            </div>
            <div className="flex justify-center space-x-4">
              {features.filter(f => !f.protected).map((feature) => (
                <Link key={feature.name} href={feature.href} className="btn-outline px-6 py-3">
                  {feature.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
      {/* Features Grid */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Herramientas y Recursos
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Descubre todas las funcionalidades disponibles para optimizar tu trabajo inmobiliario
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.filter(f => !f.protected || user).map((feature) => (
              <Link key={feature.name} href={feature.href} className="group">
                <div className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-center mb-4">
                    <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                      <feature.icon className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="ml-4 text-xl font-semibold text-gray-900 group-hover:text-remax-blue transition-colors">
                      {feature.name}
                    </h3>
                  </div>
                  <p className="text-gray-600">
                    {feature.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
      {/* Recent Articles */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-gray-900">
              Artículos Recientes
            </h2>
            <Link href="/knowledge" className="btn-ghost">
              Ver todos →
            </Link>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {recentArticles.map((article) => (
              <div key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                <div className="flex items-center justify-between mb-3">
                  <span className="badge-blue">{article.category}</span>
                  <span className="text-sm text-gray-500">{article.views} vistas</span>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2 hover:text-remax-blue transition-colors">
                  <Link href={`/knowledge/article/${article.id}`}>
                    {article.title}
                  </Link>
                </h3>
                <p className="text-gray-600 mb-3">
                  {article.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <time className="text-sm text-gray-500">
                    {new Date(article.date).toLocaleDateString('es-AR')}
                  </time>
                  <Link href={`/knowledge/article/${article.id}`} className="text-remax-blue hover:text-remax-blue-dark text-sm font-medium">
                    Leer más →
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      {/* CTA Section */}
      <section className="bg-remax-red">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Listo para comenzar?
            </h2>
            <p className="text-xl text-red-100 mb-8">
              Accede a todas las herramientas y recursos que necesitas para tu trabajo inmobiliario
            </p>
            <div className="flex justify-center space-x-4">
              <Link href="/register" className="bg-white text-remax-red px-8 py-3 rounded-lg font-medium hover:bg-gray-100 transition-colors">
                Registrarse
              </Link>
              <Link href="/login" className="border border-white text-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-remax-red transition-colors">
                Iniciar Sesión
              </Link>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-remax-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold">R</span>
                </div>
                <span className="text-xl font-bold">RE/MAX</span>
              </div>
              <p className="text-gray-400">
                Plataforma de conocimiento para agentes inmobiliarios argentinos
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2">
                <li><Link href="/knowledge" className="text-gray-400 hover:text-white transition-colors">Artículos</Link></li>
                <li><Link href="/documents" className="text-gray-400 hover:text-white transition-colors">Documentos</Link></li>
                <li><Link href="/calculator" className="text-gray-400 hover:text-white transition-colors">Calculadora</Link></li>
                <li><Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Agente IA</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Soporte</h3>
              <ul className="space-y-2">
                <li><Link href="/help" className="text-gray-400 hover:text-white transition-colors">Ayuda</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition-colors">Contacto</Link></li>
                <li><Link href="/faq" className="text-gray-400 hover:text-white transition-colors">FAQ</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Legal</h3>
              <ul className="space-y-2">
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition-colors">Privacidad</Link></li>
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition-colors">Términos</Link></li>
                <li><Link href="/cookies" className="text-gray-400 hover:text-white transition-colors">Cookies</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 RE/MAX Argentina. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
