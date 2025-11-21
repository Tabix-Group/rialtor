'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
    Newspaper, 
    ExternalLink, 
    Calendar, 
    Globe, 
    TrendingUp, 
    Building2, 
    Lightbulb, 
    Landmark, 
    MapPin, 
    Calculator 
} from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'

interface NewsItem {
    id: string
    title: string
    synopsis: string
    source: string
    externalUrl: string
    publishedAt: string
    isActive: boolean
    createdAt: string
    updatedAt: string
    categoryId: string | null
    category?: {
        id: string
        name: string
        color: string
    }
}

interface Category {
    id: string
    name: string
    color: string
    articleCount: number
}

interface NewsResponse {
    news: NewsItem[]
    pagination: {
        page: number
        limit: number
        total: number
        pages: number
    }
}

// Función para obtener el icono según el nombre de la categoría
const getCategoryIcon = (categoryName: string) => {
    const name = categoryName.toLowerCase()
    
    if (name.includes('internacional')) return Globe
    if (name.includes('mercado') || name.includes('nacional')) return TrendingUp
    if (name.includes('tendencia')) return Lightbulb
    if (name.includes('construcción') || name.includes('construc')) return Building2
    if (name.includes('tecnología') || name.includes('tecnolog')) return Landmark
    if (name.includes('caba') || name.includes('buenos aires')) return MapPin
    if (name.includes('córdoba') || name.includes('cordoba')) return MapPin
    if (name.includes('índice') || name.includes('indice') || name.includes('costo')) return Calculator
    
    return Newspaper // icono por defecto
}

export default function NewsPage() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [selectedCategory, setSelectedCategory] = useState<string>('')
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<NewsResponse['pagination'] | null>(null)

    useEffect(() => {
        fetchCategories()
        fetchNews(currentPage, selectedCategory)
    }, [currentPage, selectedCategory])

    const fetchCategories = async () => {
        try {
            const response = await authenticatedFetch('/api/categories')
            if (response.ok) {
                const data = await response.json()
                setCategories(data.categories || [])
            }
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchNews = async (page: number, category: string = '') => {
        try {
            setLoading(true)
            const categoryParam = category ? `&category=${category}` : ''
            const response = await authenticatedFetch(`/api/news?page=${page}&limit=12${categoryParam}`)
            if (!response.ok) {
                throw new Error('Failed to fetch news')
            }
            const data: NewsResponse = await response.json()
            setNews(data.news)
            setPagination(data.pagination)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred')
        } finally {
            setLoading(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando noticias...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-white">
                <div className="max-w-7xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                            <p className="text-red-600">Error al cargar las noticias: {error}</p>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
            {/* Header */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

                <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex-1 w-full">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                            <Newspaper className="w-3 h-3 sm:w-4 sm:h-4 text-amber-400" />
                            <span className="text-xs sm:text-sm font-semibold text-white">Centro de Noticias</span>
                        </div>

                        <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                            Mis <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Noticias</span>
                        </h1>

                        <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-2 sm:mb-3 max-w-2xl leading-relaxed">
                            Las últimas tendencias, análisis y noticias del sector inmobiliario argentino.
                        </p>

                        <p className="text-xs sm:text-sm text-slate-400">
                            {new Date().toLocaleDateString('es-ES', {
                                weekday: 'long',
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric'
                            })}
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Category Navigation */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-3 sm:p-4 lg:p-6 mb-6 sm:mb-8 shadow-sm">
                    <div className="flex flex-col gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-base sm:text-lg font-bold text-black uppercase tracking-wide">Secciones:</span>
                        </div>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory('')
                                    setCurrentPage(1)
                                }}
                                className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded text-xs sm:text-sm font-bold uppercase tracking-wide transition-all border-2 ${
                                    selectedCategory === ''
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
                                }`}
                            >
                                Todas las noticias
                            </button>
                            {categories.map((category) => {
                                const Icon = getCategoryIcon(category.name)
                                return (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id)
                                            setCurrentPage(1)
                                        }}
                                        className={`px-3 sm:px-4 lg:px-6 py-2 sm:py-3 rounded text-xs sm:text-sm font-bold uppercase tracking-wide transition-all border-2 flex items-center gap-1 sm:gap-2 lg:gap-3 ${
                                            selectedCategory === category.id
                                                ? 'bg-black text-white border-black'
                                                : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
                                        }`}
                                    >
                                        <Icon 
                                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" 
                                            style={{ color: selectedCategory === category.id ? 'white' : category.color }}
                                            strokeWidth={2.5}
                                        />
                                        <span className="truncate">{category.name}</span>
                                        <span className="text-xs opacity-75 font-normal hidden sm:inline">({category.articleCount})</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {news.length === 0 ? (
                    <div className="bg-white border-2 border-gray-300 rounded-lg p-12 text-center shadow-sm">
                        <Newspaper className="w-20 h-20 text-gray-400 mx-auto mb-6" />
                        <h3 className="text-2xl font-bold text-gray-600 mb-4 uppercase tracking-wide">No hay noticias disponibles</h3>
                        <p className="text-gray-500 text-lg">Pronto publicaremos las últimas novedades del sector inmobiliario.</p>
                    </div>
                ) : (
                    <>
                        {/* Featured News Section */}
                        {news.length > 0 && (
                            <div className="mb-12">
                                <div className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm">
                                    <div className="bg-black text-white px-4 sm:px-6 py-2 sm:py-3">
                                        <h2 className="text-base sm:text-xl font-bold uppercase tracking-wide">Portada</h2>
                                    </div>
                                    <div className="p-4 sm:p-6 lg:p-8">
                                        <article className="border-b-2 border-gray-200 pb-4 sm:pb-6 lg:pb-8 mb-4 sm:mb-6 lg:mb-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                                                <div>
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-medium">
                                                        <div className="flex items-center gap-1 sm:gap-2">
                                                            <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                            <span className="uppercase tracking-wide">{formatDate(news[0].publishedAt)}</span>
                                                        </div>
                                                        <span className="text-black hidden sm:inline">•</span>
                                                        <span className="font-bold text-black uppercase text-xs sm:text-sm">{news[0].source}</span>
                                                        {news[0].category && (() => {
                                                            const Icon = getCategoryIcon(news[0].category.name)
                                                            return (
                                                                <>
                                                                    <span className="text-black hidden sm:inline">•</span>
                                                                    <div className="flex items-center gap-1 sm:gap-2">
                                                                        <Icon
                                                                            className="w-3 h-3 sm:w-4 sm:h-4"
                                                                            style={{ color: news[0].category.color }}
                                                                            strokeWidth={2.5}
                                                                        />
                                                                        <span className="font-bold uppercase text-xs sm:text-sm" style={{ color: news[0].category.color }}>
                                                                            {news[0].category.name}
                                                                        </span>
                                                                    </div>
                                                                </>
                                                            )
                                                        })()}
                                                    </div>

                                                    <h2 className="text-xl sm:text-2xl lg:text-3xl font-black text-black mb-4 sm:mb-6 leading-tight uppercase tracking-wide">
                                                        <Link href={news[0].externalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">
                                                            {news[0].title}
                                                        </Link>
                                                    </h2>

                                                    <p className="text-sm sm:text-base lg:text-lg text-gray-700 mb-4 sm:mb-6 leading-relaxed font-serif">
                                                        {news[0].synopsis}
                                                    </p>

                                                    <div className="flex gap-3 sm:gap-4">
                                                        <Link
                                                            href={news[0].externalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-2 px-4 sm:px-6 py-2 sm:py-3 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors text-xs sm:text-sm"
                                                        >
                                                            <span>Leer artículo completo</span>
                                                            <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 p-3 sm:p-4 lg:p-6 rounded-lg">
                                                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-black mb-3 sm:mb-4 uppercase tracking-wide">
                                                        Más noticias destacadas
                                                    </h3>
                                                    <div className="space-y-3 sm:space-y-4">
                                                        {news.slice(1, 4).map((item, index) => (
                                                            <div key={item.id} className="border-b border-gray-300 pb-2 sm:pb-3 last:border-b-0">
                                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500 mb-1">
                                                                    <span className="font-medium">{formatDate(item.publishedAt)}</span>
                                                                    {item.category && (
                                                                        <>
                                                                            <span>•</span>
                                                                            <span className="font-bold" style={{ color: item.category.color }}>
                                                                                {item.category.name}
                                                                            </span>
                                                                        </>
                                                                    )}
                                                                </div>
                                                                <Link
                                                                    href={item.externalUrl}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="text-xs sm:text-sm font-bold text-black hover:text-gray-600 leading-tight block"
                                                                >
                                                                    {item.title}
                                                                </Link>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </article>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Main News Grid - Newspaper Style */}
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
                            {/* Left Column - Large Articles */}
                            <div className="lg:col-span-2 space-y-4 sm:space-y-6 lg:space-y-8">
                                {news.slice(1, 4).map((item, index) => (
                                    <article key={item.id} className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-4 sm:p-6">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500 mb-3 sm:mb-4 font-medium">
                                                <div className="flex items-center gap-1 sm:gap-2">
                                                    <Calendar className="w-3 h-3 sm:w-4 sm:h-4" />
                                                    <span className="uppercase tracking-wide">{formatDate(item.publishedAt)}</span>
                                                </div>
                                                <span className="text-black hidden sm:inline">•</span>
                                                <span className="font-bold text-black text-xs sm:text-sm">{item.source}</span>
                                                {item.category && (() => {
                                                    const Icon = getCategoryIcon(item.category.name)
                                                    return (
                                                        <>
                                                            <span className="text-black hidden sm:inline">•</span>
                                                            <div className="flex items-center gap-1 sm:gap-2">
                                                                <Icon
                                                                    className="w-3 h-3 sm:w-4 sm:h-4"
                                                                    style={{ color: item.category.color }}
                                                                    strokeWidth={2.5}
                                                                />
                                                                <span className="font-bold text-xs sm:text-sm" style={{ color: item.category.color }}>
                                                                    {item.category.name}
                                                                </span>
                                                            </div>
                                                        </>
                                                    )
                                                })()}
                                            </div>

                                            <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-black mb-3 sm:mb-4 leading-tight hover:text-gray-700 transition-colors">
                                                <Link href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                    {item.title}
                                                </Link>
                                            </h2>

                                            <p className="text-sm sm:text-base text-gray-700 mb-4 sm:mb-6 leading-relaxed font-serif line-clamp-3">
                                                {item.synopsis}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={item.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2 bg-black text-white font-bold uppercase tracking-wide text-xs sm:text-sm hover:bg-gray-800 transition-colors"
                                                >
                                                    <span>Leer más</span>
                                                    <ExternalLink className="w-3 h-3 sm:w-4 sm:h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                                {/* Latest News Sidebar */}
                                <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-6 shadow-sm">
                                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-black mb-4 sm:mb-6 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
                                        Últimas noticias
                                    </h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        {news.slice(0, 5).map((item, index) => (
                                            <div key={item.id} className="border-b border-gray-200 pb-2 sm:pb-3 last:border-b-0">
                                                <Link
                                                    href={item.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-xs sm:text-sm font-bold text-black hover:text-gray-600 leading-tight block"
                                                >
                                                    {item.title}
                                                </Link>
                                                <div className="flex flex-wrap items-center gap-1 sm:gap-2 text-xs text-gray-500 mt-1">
                                                    <span className="font-medium">{formatDate(item.publishedAt)}</span>
                                                    {item.category && (
                                                        <>
                                                            <span>•</span>
                                                            <span className="font-bold" style={{ color: item.category.color }}>
                                                                {item.category.name}
                                                            </span>
                                                        </>
                                                    )}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Categories Summary */}
                                <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-6 shadow-sm">
                                    <h3 className="text-sm sm:text-base lg:text-lg font-bold text-black mb-4 sm:mb-6 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
                                        Secciones
                                    </h3>
                                    <div className="space-y-2 sm:space-y-3">
                                        {categories.map((category) => {
                                            const Icon = getCategoryIcon(category.name)
                                            return (
                                                <div key={category.id} className="flex items-center justify-between">
                                                    <button
                                                        onClick={() => {
                                                            setSelectedCategory(category.id)
                                                            setCurrentPage(1)
                                                        }}
                                                        className="flex items-center gap-2 sm:gap-3 text-xs sm:text-sm font-bold text-black hover:text-gray-600 uppercase tracking-wide"
                                                    >
                                                        <Icon
                                                            className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0"
                                                            style={{ color: category.color }}
                                                            strokeWidth={2.5}
                                                        />
                                                        <span className="truncate">{category.name}</span>
                                                    </button>
                                                    <span className="text-xs text-gray-500 font-medium">
                                                        {category.articleCount}
                                                    </span>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-4 sm:p-6 shadow-sm">
                                <div className="flex flex-col sm:flex-row justify-center items-center gap-3 sm:gap-4">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 bg-white text-black font-bold uppercase tracking-wide hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        ← Anterior
                                    </button>

                                    <div className="flex gap-1 sm:gap-2 overflow-x-auto">
                                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-3 sm:px-4 py-2 border-2 font-bold uppercase tracking-wide transition-all flex-shrink-0 text-sm ${
                                                    currentPage === page
                                                        ? 'bg-black text-white border-black'
                                                        : 'bg-white text-black border-gray-300 hover:bg-gray-50 hover:border-black'
                                                }`}
                                            >
                                                {page}
                                            </button>
                                        ))}
                                    </div>

                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                        disabled={currentPage === pagination.pages}
                                        className="w-full sm:w-auto px-4 sm:px-6 py-2 sm:py-3 border-2 border-gray-300 bg-white text-black font-bold uppercase tracking-wide hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                    >
                                        Siguiente →
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
