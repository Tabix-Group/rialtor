'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper, ExternalLink, Calendar, User } from 'lucide-react'
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
        <div className="min-h-screen bg-gray-50">
            {/* Newspaper Header */}
            <div className="bg-white border-b-4 border-black">
                <div className="max-w-7xl mx-auto px-4 py-8">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-4 mb-4">
                            <Newspaper className="w-16 h-16 text-black" />
                            <div>
                                <h1 className="text-5xl font-black text-black uppercase tracking-wider">Rialtor News</h1>
                                <p className="text-lg text-gray-600 font-medium">Mercado Inmobiliario • {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                            </div>
                        </div>
                        <p className="text-xl text-gray-700 max-w-4xl mx-auto font-serif italic">
                            "Las últimas tendencias, análisis y noticias del sector inmobiliario"
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                {/* Category Navigation */}
                <div className="bg-white border-2 border-gray-300 rounded-lg p-6 mb-8 shadow-sm">
                    <div className="flex flex-wrap items-center gap-4">
                        <span className="text-lg font-bold text-black uppercase tracking-wide">Secciones:</span>
                        <div className="flex flex-wrap gap-3">
                            <button
                                onClick={() => {
                                    setSelectedCategory('')
                                    setCurrentPage(1)
                                }}
                                className={`px-6 py-3 rounded text-sm font-bold uppercase tracking-wide transition-all border-2 ${
                                    selectedCategory === ''
                                        ? 'bg-black text-white border-black'
                                        : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
                                }`}
                            >
                                Todas las noticias
                            </button>
                            {categories.map((category) => (
                                <button
                                    key={category.id}
                                    onClick={() => {
                                        setSelectedCategory(category.id)
                                        setCurrentPage(1)
                                    }}
                                    className={`px-6 py-3 rounded text-sm font-bold uppercase tracking-wide transition-all border-2 flex items-center gap-3 ${
                                        selectedCategory === category.id
                                            ? 'bg-black text-white border-black'
                                            : 'bg-white text-black border-gray-300 hover:border-black hover:bg-gray-50'
                                    }`}
                                >
                                    <div
                                        className="w-4 h-4 rounded-full border border-gray-400"
                                        style={{ backgroundColor: category.color }}
                                    ></div>
                                    {category.name}
                                    <span className="text-xs opacity-75 font-normal">({category.articleCount})</span>
                                </button>
                            ))}
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
                                    <div className="bg-black text-white px-6 py-3">
                                        <h2 className="text-xl font-bold uppercase tracking-wide">Portada</h2>
                                    </div>
                                    <div className="p-8">
                                        <article className="border-b-2 border-gray-200 pb-8 mb-8">
                                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                                <div>
                                                    <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
                                                        <Calendar className="w-5 h-5" />
                                                        <span className="uppercase tracking-wide">{formatDate(news[0].publishedAt)}</span>
                                                        <span className="text-black">•</span>
                                                        <span className="font-bold text-black uppercase">{news[0].source}</span>
                                                        {news[0].category && (
                                                            <>
                                                                <span className="text-black">•</span>
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className="w-4 h-4 rounded-full border border-gray-400"
                                                                        style={{ backgroundColor: news[0].category.color }}
                                                                    ></div>
                                                                    <span className="font-bold uppercase" style={{ color: news[0].category.color }}>
                                                                        {news[0].category.name}
                                                                    </span>
                                                                </div>
                                                            </>
                                                        )}
                                                    </div>

                                                    <h2 className="text-3xl font-black text-black mb-6 leading-tight uppercase tracking-wide">
                                                        <Link href={news[0].externalUrl} target="_blank" rel="noopener noreferrer" className="hover:text-gray-700 transition-colors">
                                                            {news[0].title}
                                                        </Link>
                                                    </h2>

                                                    <p className="text-lg text-gray-700 mb-6 leading-relaxed font-serif">
                                                        {news[0].synopsis}
                                                    </p>

                                                    <div className="flex gap-4">
                                                        <Link
                                                            href={news[0].externalUrl}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="inline-flex items-center gap-3 px-6 py-3 bg-black text-white font-bold uppercase tracking-wide hover:bg-gray-800 transition-colors"
                                                        >
                                                            <span>Leer artículo completo</span>
                                                            <ExternalLink className="w-5 h-5" />
                                                        </Link>
                                                    </div>
                                                </div>
                                                <div className="bg-gray-100 p-6 rounded-lg">
                                                    <h3 className="text-lg font-bold text-black mb-4 uppercase tracking-wide">Más noticias destacadas</h3>
                                                    <div className="space-y-4">
                                                        {news.slice(1, 4).map((item, index) => (
                                                            <div key={item.id} className="border-b border-gray-300 pb-3 last:border-b-0">
                                                                <div className="flex items-center gap-2 text-xs text-gray-500 mb-1">
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
                                                                    className="text-sm font-bold text-black hover:text-gray-600 leading-tight block"
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
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                            {/* Left Column - Large Articles */}
                            <div className="lg:col-span-2 space-y-8">
                                {news.slice(1, 4).map((item, index) => (
                                    <article key={item.id} className="bg-white border-2 border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                                        <div className="p-6">
                                            <div className="flex items-center gap-3 text-sm text-gray-500 mb-4 font-medium">
                                                <Calendar className="w-4 h-4" />
                                                <span className="uppercase tracking-wide">{formatDate(item.publishedAt)}</span>
                                                <span className="text-black">•</span>
                                                <span className="font-bold text-black">{item.source}</span>
                                                {item.category && (
                                                    <>
                                                        <span className="text-black">•</span>
                                                        <div className="flex items-center gap-2">
                                                            <div
                                                                className="w-3 h-3 rounded-full"
                                                                style={{ backgroundColor: item.category.color }}
                                                            ></div>
                                                            <span className="font-bold" style={{ color: item.category.color }}>
                                                                {item.category.name}
                                                            </span>
                                                        </div>
                                                    </>
                                                )}
                                            </div>

                                            <h2 className="text-2xl font-bold text-black mb-4 leading-tight hover:text-gray-700 transition-colors">
                                                <Link href={item.externalUrl} target="_blank" rel="noopener noreferrer" className="block">
                                                    {item.title}
                                                </Link>
                                            </h2>

                                            <p className="text-gray-700 mb-6 leading-relaxed font-serif">
                                                {item.synopsis}
                                            </p>

                                            <div className="flex items-center justify-between">
                                                <Link
                                                    href={item.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 px-4 py-2 bg-black text-white font-bold uppercase tracking-wide text-sm hover:bg-gray-800 transition-colors"
                                                >
                                                    <span>Leer más</span>
                                                    <ExternalLink className="w-4 h-4" />
                                                </Link>
                                            </div>
                                        </div>
                                    </article>
                                ))}
                            </div>

                            {/* Right Column - Sidebar */}
                            <div className="space-y-8">
                                {/* Latest News Sidebar */}
                                <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
                                        Últimas noticias
                                    </h3>
                                    <div className="space-y-3">
                                        {news.slice(0, 5).map((item, index) => (
                                            <div key={item.id} className="border-b border-gray-200 pb-3 last:border-b-0">
                                                <Link
                                                    href={item.externalUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-sm font-bold text-black hover:text-gray-600 leading-tight block"
                                                >
                                                    {item.title}
                                                </Link>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
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
                                <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
                                    <h3 className="text-lg font-bold text-black mb-6 uppercase tracking-wide border-b-2 border-gray-300 pb-2">
                                        Secciones
                                    </h3>
                                    <div className="space-y-3">
                                        {categories.map((category) => (
                                            <div key={category.id} className="flex items-center justify-between">
                                                <button
                                                    onClick={() => {
                                                        setSelectedCategory(category.id)
                                                        setCurrentPage(1)
                                                    }}
                                                    className="flex items-center gap-3 text-sm font-bold text-black hover:text-gray-600 uppercase tracking-wide"
                                                >
                                                    <div
                                                        className="w-4 h-4 rounded-full border border-gray-400"
                                                        style={{ backgroundColor: category.color }}
                                                    ></div>
                                                    {category.name}
                                                </button>
                                                <span className="text-sm text-gray-500 font-medium">
                                                    {category.articleCount}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="bg-white border-2 border-gray-300 rounded-lg p-6 shadow-sm">
                                <div className="flex justify-center items-center gap-3">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                        disabled={currentPage === 1}
                                        className="px-6 py-3 border-2 border-gray-300 bg-white text-black font-bold uppercase tracking-wide hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        ← Anterior
                                    </button>

                                    <div className="flex gap-2">
                                        {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                            <button
                                                key={page}
                                                onClick={() => setCurrentPage(page)}
                                                className={`px-4 py-3 border-2 font-bold uppercase tracking-wide transition-all ${
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
                                        className="px-6 py-3 border-2 border-gray-300 bg-white text-black font-bold uppercase tracking-wide hover:bg-black hover:text-white hover:border-black transition-all disabled:opacity-50 disabled:cursor-not-allowed"
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
