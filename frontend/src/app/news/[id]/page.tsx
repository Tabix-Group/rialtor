'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Newspaper, ExternalLink, Calendar, ArrowLeft, Share2 } from 'lucide-react'

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

export default function NewsDetailPage() {
    const params = useParams()
    const router = useRouter()
    const [newsItem, setNewsItem] = useState<NewsItem | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        if (params?.id) {
            fetchNewsDetail(params.id as string)
        }
    }, [params?.id])

    const fetchNewsDetail = async (id: string) => {
        try {
            setLoading(true)
            const response = await fetch(`/api/news/${id}`)
            if (!response.ok) {
                if (response.status === 404) {
                    throw new Error('Noticia no encontrada')
                }
                throw new Error('Error al cargar la noticia')
            }
            const data = await response.json()
            setNewsItem(data.news)
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
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: newsItem?.title,
                    text: newsItem?.synopsis,
                    url: window.location.href,
                })
            } catch (err) {
                console.log('Error sharing:', err)
            }
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(window.location.href)
            alert('Enlace copiado al portapapeles')
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Cargando noticia...</p>
                    </div>
                </div>
            </div>
        )
    }

    if (error || !newsItem) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
                <div className="max-w-4xl mx-auto px-4 py-12">
                    <div className="text-center">
                        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
                            <p className="text-red-600">{error || 'Noticia no encontrada'}</p>
                        </div>
                        <Link
                            href="/news"
                            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-4 h-4" />
                            Volver a Noticias
                        </Link>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <div className="max-w-4xl mx-auto px-4 py-8">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 text-blue-100 hover:text-white transition-colors mb-6"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver a Noticias
                    </Link>

                    <div className="flex items-center gap-3 mb-4">
                        <Newspaper className="w-8 h-8" />
                        <span className="text-blue-100">Noticia Inmobiliaria</span>
                    </div>
                </div>
            </div>

            <div className="max-w-4xl mx-auto px-4 py-8">
                <article className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <div className="p-8">
                        {/* Meta information */}
                        <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-6">
                            <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(newsItem.publishedAt)}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Fuente:</span>
                                <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full font-medium">
                                    {newsItem.source}
                                </span>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">
                            {newsItem.title}
                        </h1>

                        {/* Synopsis */}
                        <div className="prose prose-lg max-w-none mb-8">
                            <p className="text-gray-700 text-lg leading-relaxed">
                                {newsItem.synopsis}
                            </p>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col sm:flex-row gap-4 pt-6 border-t border-gray-200">
                            <Link
                                href={newsItem.externalUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 font-medium"
                            >
                                <span>Leer la noticia completa</span>
                                <ExternalLink className="w-4 h-4" />
                            </Link>

                            <button
                                onClick={handleShare}
                                className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors duration-200"
                            >
                                <Share2 className="w-4 h-4" />
                                Compartir
                            </button>
                        </div>
                    </div>
                </article>

                {/* Related content suggestion */}
                <div className="mt-8 text-center">
                    <Link
                        href="/news"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <Newspaper className="w-4 h-4" />
                        Ver más noticias
                    </Link>
                </div>
            </div>
        </div>
    )
}
