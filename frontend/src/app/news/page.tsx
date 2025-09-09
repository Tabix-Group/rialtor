'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Newspaper, ExternalLink, Calendar, User } from 'lucide-react'
import { authenticatedFetch } from '../../utils/api'

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
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pagination, setPagination] = useState<NewsResponse['pagination'] | null>(null)

    useEffect(() => {
        fetchNews(currentPage)
    }, [currentPage])

    const fetchNews = async (page: number) => {
        try {
            setLoading(true)
            const response = await authenticatedFetch(`/api/news?page=${page}&limit=12`)
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-7xl mx-auto px-4 py-16">
                    <div className="text-center">
                        <div className="flex items-center justify-center gap-3 mb-4">
                            <Newspaper className="w-12 h-12" />
                            <h1 className="text-4xl font-bold">Noticias Inmobiliarias</h1>
                        </div>
                        <p className="text-xl text-blue-100 max-w-2xl mx-auto">
                            Mantente informado con las últimas noticias y tendencias del mercado inmobiliario
                        </p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {news.length === 0 ? (
                    <div className="text-center py-12">
                        <Newspaper className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-600 mb-2">No hay noticias disponibles</h3>
                        <p className="text-gray-500">Pronto publicaremos las últimas novedades del sector inmobiliario.</p>
                    </div>
                ) : (
                    <>
                        {/* News Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                            {news.map((item) => (
                                <article key={item.id} className="bg-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
                                    <div className="p-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500 mb-3">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(item.publishedAt)}</span>
                                            <span className="mx-2">•</span>
                                            <span className="font-medium text-blue-600">{item.source}</span>
                                        </div>

                                        <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                                            {item.title}
                                        </h2>

                                        <p className="text-gray-600 mb-4 line-clamp-3">
                                            {item.synopsis}
                                        </p>

                                        <div className="flex items-center justify-between">
                                            <Link
                                                href={item.externalUrl}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
                                            >
                                                <span>Leer más</span>
                                                <ExternalLink className="w-4 h-4" />
                                            </Link>

                                            <Link
                                                href={`/news/${item.id}`}
                                                className="text-blue-600 hover:text-blue-800 font-medium"
                                            >
                                                Ver detalles
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        {/* Pagination */}
                        {pagination && pagination.pages > 1 && (
                            <div className="flex justify-center items-center gap-2">
                                <button
                                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Anterior
                                </button>

                                {Array.from({ length: pagination.pages }, (_, i) => i + 1).map((page) => (
                                    <button
                                        key={page}
                                        onClick={() => setCurrentPage(page)}
                                        className={`px-4 py-2 border rounded-lg ${currentPage === page
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                ))}

                                <button
                                    onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                                    disabled={currentPage === pagination.pages}
                                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Siguiente
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    )
}
