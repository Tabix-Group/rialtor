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

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('')

  const features = [
    {
      name: 'Base de Conocimiento',
      description: 'Accede a artículos, guías y documentación del sector inmobiliario argentino',
      icon: BookOpenIcon,
      href: '/knowledge',
      color: 'bg-blue-500'
    },
    {
      name: 'Asistente IA',
      description: 'Consulta con nuestro bot inteligente sobre regulaciones y procesos',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-green-500'
    },
    {
      name: 'Generador de Documentos',
      description: 'Crea contratos, formularios y documentos legales personalizados',
      icon: DocumentTextIcon,
      href: '/documents',
      color: 'bg-purple-500'
    },
    {
      name: 'Calculadora Argentina',
      description: 'Calcula comisiones, impuestos, sellos y tasas provinciales',
      icon: CalculatorIcon,
      href: '/calculator',
      color: 'bg-orange-500'
    },
    {
      name: 'Gestión de Usuarios',
      description: 'Administra usuarios, roles y permisos del sistema',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-red-500'
    },
    {
      name: 'Reportes y Métricas',
      description: 'Visualiza estadísticas de uso y rendimiento de la plataforma',
      icon: ChartBarIcon,
      href: '/admin/reports',
      color: 'bg-indigo-500'
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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-remax-blue rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-xl">R</span>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">RE/MAX</h1>
                  <p className="text-sm text-gray-600">Knowledge Platform</p>
                </div>
              </div>
            </div>
            <nav className="flex items-center space-x-6">
              <Link href="/knowledge" className="text-gray-600 hover:text-remax-blue transition-colors">
                Base de Conocimiento
              </Link>
              <Link href="/chat" className="text-gray-600 hover:text-remax-blue transition-colors">
                Asistente IA
              </Link>
              <Link href="/calculator" className="text-gray-600 hover:text-remax-blue transition-colors">
                Calculadora
              </Link>
              <Link href="/login" className="btn-primary px-4 py-2 text-sm">
                Iniciar Sesión
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-remax-blue to-remax-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6">
              Plataforma de Conocimiento
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
              <Link href="/knowledge" className="btn-outline px-6 py-3">
                Explorar Conocimiento
              </Link>
              <Link href="/chat" className="btn-secondary px-6 py-3">
                Consultar Asistente
              </Link>
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
            {features.map((feature) => (
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
                <li><Link href="/knowledge" className="text-gray-400 hover:text-white transition-colors">Base de Conocimiento</Link></li>
                <li><Link href="/documents" className="text-gray-400 hover:text-white transition-colors">Documentos</Link></li>
                <li><Link href="/calculator" className="text-gray-400 hover:text-white transition-colors">Calculadora</Link></li>
                <li><Link href="/chat" className="text-gray-400 hover:text-white transition-colors">Asistente IA</Link></li>
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
