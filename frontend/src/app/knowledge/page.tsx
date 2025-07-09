'use client'

import { useState } from 'react'
import Link from 'next/link'
import { 
  MagnifyingGlassIcon, 
  FunnelIcon,
  BookOpenIcon,
  EyeIcon,
  CalendarIcon
} from '@heroicons/react/24/outline'

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'

export default function KnowledgePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: si no está logueado, redirigir a login
  if (!loading && !user && typeof window !== 'undefined') {
    router.replace('/auth/login');
    return null;
  }

  const categories = [
    { id: 'all', name: 'Todas las categorías', count: 156 },
    { id: 'regulations', name: 'Regulaciones', count: 45 },
    { id: 'taxes', name: 'Impuestos', count: 38 },
    { id: 'contracts', name: 'Contratos', count: 29 },
    { id: 'procedures', name: 'Procedimientos', count: 44 }
  ]

  const articles = [
    {
      id: 1,
      title: 'Nuevas regulaciones AFIP para operaciones inmobiliarias 2024',
      excerpt: 'Guía completa sobre los cambios en la normativa fiscal que afectan las operaciones inmobiliarias...',
      category: 'Regulaciones',
      author: 'Sistema',
      date: '2024-01-15',
      views: 1250,
      readTime: '8 min'
    },
    {
      id: 2,
      title: 'Cálculo de comisiones en ventas de propiedades',
      excerpt: 'Métodos y fórmulas para el cálculo correcto de comisiones según diferentes tipos de operaciones...',
      category: 'Comisiones',
      author: 'Sistema',
      date: '2024-01-10',
      views: 980,
      readTime: '12 min'
    },
    {
      id: 3,
      title: 'Documentación necesaria para escrituración',
      excerpt: 'Lista completa de documentos requeridos para el proceso de escrituración en diferentes provincias...',
      category: 'Documentación',
      author: 'Sistema',
      date: '2024-01-08',
      views: 1100,
      readTime: '6 min'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Link href="/" className="text-gray-600 hover:text-remax-blue transition-colors">
                ← Volver al inicio
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <h1 className="text-2xl font-bold text-gray-900">Base de Conocimiento</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categorías</h3>
              <ul className="space-y-2">
                {categories.map((category) => (
                  <li key={category.id}>
                    <button
                      onClick={() => setSelectedCategory(category.id)}
                      className={`w-full text-left px-3 py-2 rounded-lg transition-colors ${
                        selectedCategory === category.id
                          ? 'bg-remax-blue text-white'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <div className="flex justify-between items-center">
                        <span>{category.name}</span>
                        <span className="text-sm">{category.count}</span>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Search and Filters */}
            <div className="card mb-8">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Buscar en la base de conocimiento..."
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-remax-blue focus:border-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <button className="btn-primary px-6 py-3 flex items-center space-x-2">
                  <FunnelIcon className="h-5 w-5" />
                  <span>Filtros</span>
                </button>
              </div>
            </div>

            {/* Articles Grid */}
            <div className="space-y-6">
              {articles.map((article) => (
                <div key={article.id} className="card hover:shadow-lg transition-shadow duration-300">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-12 h-12 bg-remax-blue rounded-lg flex items-center justify-center">
                        <BookOpenIcon className="h-6 w-6 text-white" />
                      </div>
                      <div>
                        <span className="badge-blue">{article.category}</span>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-gray-500">
                          <span className="flex items-center">
                            <CalendarIcon className="h-4 w-4 mr-1" />
                            {new Date(article.date).toLocaleDateString('es-AR')}
                          </span>
                          <span className="flex items-center">
                            <EyeIcon className="h-4 w-4 mr-1" />
                            {article.views} vistas
                          </span>
                          <span>{article.readTime}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-remax-blue transition-colors">
                    <Link href={`/knowledge/article/${article.id}`}>
                      {article.title}
                    </Link>
                  </h3>
                  
                  <p className="text-gray-600 mb-4">
                    {article.excerpt}
                  </p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">
                      Por {article.author}
                    </span>
                    <Link 
                      href={`/knowledge/article/${article.id}`}
                      className="text-remax-blue hover:text-remax-blue-dark font-medium"
                    >
                      Leer artículo →
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex justify-center mt-12">
              <nav className="flex items-center space-x-2">
                <button className="px-3 py-2 text-gray-500 hover:text-gray-700 disabled:opacity-50" disabled>
                  ← Anterior
                </button>
                <button className="px-3 py-2 bg-remax-blue text-white rounded-lg">1</button>
                <button className="px-3 py-2 text-gray-700 hover:text-gray-900">2</button>
                <button className="px-3 py-2 text-gray-700 hover:text-gray-900">3</button>
                <button className="px-3 py-2 text-gray-700 hover:text-gray-900">
                  Siguiente →
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
