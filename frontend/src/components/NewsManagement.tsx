'use client'

import { useState, useEffect } from 'react'
import { Plus, Edit, Trash2, ExternalLink, Calendar, Eye, EyeOff, RefreshCw, Download } from 'lucide-react'
import { authenticatedFetch, publicFetch } from '@/utils/api'

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
}

interface RSSSource {
    key: string
    name: string
    url: string
    category: string
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

export default function NewsManagement() {
    const [news, setNews] = useState<NewsItem[]>([])
    const [categories, setCategories] = useState<Category[]>([])
    const [rssSources, setRssSources] = useState<RSSSource[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [editingNews, setEditingNews] = useState<NewsItem | null>(null)
    const [currentPage, setCurrentPage] = useState(1)
    const [pageSize, setPageSize] = useState(10)
    const [pagination, setPagination] = useState<NewsResponse['pagination'] | null>(null)
    const [syncing, setSyncing] = useState(false)
    const [syncMessage, setSyncMessage] = useState<string | null>(null)
    const [showSyncOptions, setShowSyncOptions] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        synopsis: '',
        source: '',
        externalUrl: '',
        publishedAt: '',
        categoryId: ''
    })

    useEffect(() => {
        fetchCategories()
        fetchRSSSources()
        fetchNews(currentPage, pageSize)
    }, [currentPage, pageSize])

    useEffect(() => {
        // Categories state changed
    }, [categories])

    const fetchCategories = async () => {
        try {
            const response = await publicFetch('/api/categories')
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`)
            }
            const data = await response.json()
            setCategories(data.categories || [])
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const fetchRSSSources = async () => {
        try {
            const response = await authenticatedFetch('/api/news/sources')
            if (response.ok) {
                const data = await response.json()
                setRssSources(data.sources || [])
            }
        } catch (error) {
            console.error('Error fetching RSS sources:', error)
        }
    }

    const fetchNews = async (page: number = 1, limit: number = 10) => {
        try {
            setLoading(true)
            const response = await authenticatedFetch(`/api/news/admin/all?page=${page}&limit=${limit}`)
            const data: NewsResponse = await response.json()
            setNews(data.news)
            setPagination(data.pagination)
        } catch (error) {
            console.error('Error fetching news:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        try {
            const url = editingNews ? `/api/news/${editingNews.id}` : '/api/news'
            const method = editingNews ? 'PUT' : 'POST'

            const requestData = {
                ...formData,
                publishedAt: formData.publishedAt ? new Date(formData.publishedAt).toISOString() : new Date().toISOString(),
                categoryId: formData.categoryId || null
            }

            const response = await authenticatedFetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(requestData)
            })

            if (response.ok) {
                await fetchNews(currentPage, pageSize)
                setShowForm(false)
                setEditingNews(null)
                resetForm()
                alert(editingNews ? 'Noticia actualizada exitosamente' : 'Noticia creada exitosamente')
            } else {
                const errorData = await response.json().catch(() => ({}))
                console.error('Error response:', errorData)
                alert(`Error al guardar la noticia: ${errorData.message || 'Error desconocido'}`)
            }
        } catch (error) {
            console.error('Error saving news:', error)
            alert('Error al guardar la noticia')
        }
    }

    const handleEdit = (newsItem: NewsItem) => {
        setEditingNews(newsItem)
        setFormData({
            title: newsItem.title,
            synopsis: newsItem.synopsis,
            source: newsItem.source,
            externalUrl: newsItem.externalUrl,
            publishedAt: new Date(newsItem.publishedAt).toISOString().slice(0, 16),
            categoryId: newsItem.categoryId || ''
        })
        setShowForm(true)
    }

    const handleDelete = async (id: string) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta noticia?')) return

        try {
            const response = await authenticatedFetch(`/api/news/${id}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                await fetchNews(currentPage, pageSize)
                alert('Noticia eliminada exitosamente')
            } else {
                alert('Error al eliminar la noticia')
            }
        } catch (error) {
            console.error('Error deleting news:', error)
            alert('Error al eliminar la noticia')
        }
    }

    const toggleActive = async (id: string, currentStatus: boolean) => {
        try {
            const response = await authenticatedFetch(`/api/news/${id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            })

            if (response.ok) {
                await fetchNews(currentPage, pageSize)
            } else {
                alert('Error al cambiar el estado de la noticia')
            }
        } catch (error) {
            console.error('Error toggling news status:', error)
            alert('Error al cambiar el estado de la noticia')
        }
    }

    const resetForm = () => {
        setFormData({
            title: '',
            synopsis: '',
            source: '',
            externalUrl: '',
            publishedAt: '',
            categoryId: ''
        })
    }

    const handleSyncRSS = async () => {
        try {
            setSyncing(true)
            setSyncMessage(null)
            
            const response = await authenticatedFetch('/api/news/sync', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ limit: 30 })
            })

            const data = await response.json()

            if (response.ok) {
                setSyncMessage(`✅ ${data.message}`)
                await fetchNews(currentPage, pageSize)
                
                // Limpiar mensaje después de 8 segundos
                setTimeout(() => setSyncMessage(null), 8000)
            } else {
                setSyncMessage(`❌ Error: ${data.error || 'No se pudo sincronizar'}`)
            }
        } catch (error) {
            console.error('Error syncing RSS:', error)
            setSyncMessage('❌ Error al sincronizar noticias')
        } finally {
            setSyncing(false)
            setShowSyncOptions(false)
        }
    }

    const handleSyncSpecificSource = async (sourceKey: string) => {
        try {
            setSyncing(true)
            setSyncMessage(null)
            
            const response = await authenticatedFetch(`/api/news/sync/${sourceKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ limit: 30 })
            })

            const data = await response.json()

            if (response.ok) {
                setSyncMessage(`✅ ${data.message}`)
                await fetchNews(currentPage, pageSize)
                
                setTimeout(() => setSyncMessage(null), 8000)
            } else {
                setSyncMessage(`❌ Error: ${data.error || 'No se pudo sincronizar'}`)
            }
        } catch (error) {
            console.error('Error syncing specific source:', error)
            setSyncMessage('❌ Error al sincronizar fuente')
        } finally {
            setSyncing(false)
            setShowSyncOptions(false)
        }
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        })
    }

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando noticias...</p>
            </div>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header with Add Button and Sync */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h4 className="text-lg font-semibold text-gray-900">Noticias ({pagination?.total || news.length})</h4>
                <div className="flex flex-wrap gap-3">
                    {/* Sync Dropdown */}
                    <div className="relative">
                        <button
                            onClick={() => setShowSyncOptions(!showSyncOptions)}
                            disabled={syncing}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} />
                            {syncing ? 'Sincronizando...' : 'Sincronizar RSS'}
                            <span className="text-xs">▼</span>
                        </button>

                        {/* Dropdown Menu */}
                        {showSyncOptions && !syncing && (
                            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                <div className="py-1">
                                    <button
                                        onClick={handleSyncRSS}
                                        className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" />
                                        <span className="font-semibold">Sincronizar todas las fuentes</span>
                                    </button>
                                    <div className="border-t border-gray-200 my-1"></div>
                                    <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                                        Fuentes individuales:
                                    </div>
                                    {rssSources.map((source) => (
                                        <button
                                            key={source.key}
                                            onClick={() => handleSyncSpecificSource(source.key)}
                                            className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100"
                                        >
                                            <div className="flex flex-col">
                                                <span className="font-medium">{source.name}</span>
                                                <span className="text-xs text-gray-500">{source.category}</span>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={() => {
                            setEditingNews(null)
                            resetForm()
                            setShowForm(true)
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Agregar Noticia
                    </button>
                </div>
            </div>

            {/* Sync Message */}
            {syncMessage && (
                <div className={`p-4 rounded-lg ${syncMessage.startsWith('✅') ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'}`}>
                    <p className="text-sm font-medium">{syncMessage}</p>
                </div>
            )}

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                        <h3 className="text-xl font-semibold mb-4">
                            {editingNews ? 'Editar Noticia' : 'Agregar Nueva Noticia'}
                        </h3>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Título *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Título de la noticia"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Sinopsis *
                                </label>
                                <textarea
                                    required
                                    rows={4}
                                    value={formData.synopsis}
                                    onChange={(e) => setFormData({ ...formData, synopsis: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Breve descripción de la noticia"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Fuente *
                                    </label>
                                    <input
                                        type="text"
                                        required
                                        value={formData.source}
                                        onChange={(e) => setFormData({ ...formData, source: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder="Ej: Reuters, Bloomberg"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Categoría
                                    </label>
                                    <select
                                        value={formData.categoryId}
                                        onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    >
                                        <option value="">Sin categoría</option>
                                        {categories.map((category) => (
                                            <option key={category.id} value={category.id}>
                                                {category.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Fecha de Publicación
                                </label>
                                <input
                                    type="datetime-local"
                                    value={formData.publishedAt}
                                    onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    URL Externa *
                                </label>
                                <input
                                    type="url"
                                    required
                                    value={formData.externalUrl}
                                    onChange={(e) => setFormData({ ...formData, externalUrl: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="https://ejemplo.com/noticia"
                                />
                            </div>

                            <div className="flex justify-end gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowForm(false)
                                        setEditingNews(null)
                                        resetForm()
                                    }}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                                >
                                    {editingNews ? 'Actualizar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* News List */}
            {news.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-gray-500">No hay noticias. Crea la primera noticia.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {news.map((item) => (
                        <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <h4 className="font-semibold text-gray-900">{item.title}</h4>
                                        {item.isActive ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                                Activa
                                            </span>
                                        ) : (
                                            <span className="px-2 py-1 bg-gray-100 text-gray-800 text-xs rounded-full">
                                                Inactiva
                                            </span>
                                        )}
                                    </div>

                                    <p className="text-gray-600 text-sm mb-2 line-clamp-2">{item.synopsis}</p>

                                    <div className="flex items-center gap-4 text-sm text-gray-500">
                                        <span>Fuente: {item.source}</span>
                                        {item.category && (
                                            <div className="flex items-center gap-1">
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: item.category.color }}
                                                ></div>
                                                <span>{item.category.name}</span>
                                            </div>
                                        )}
                                        <div className="flex items-center gap-1">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(item.publishedAt)}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 ml-4">
                                    <button
                                        onClick={() => window.open(item.externalUrl, '_blank')}
                                        className="p-2 text-gray-500 hover:text-blue-600"
                                        title="Ver noticia externa"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => toggleActive(item.id, item.isActive)}
                                        className={`p-2 ${item.isActive ? 'text-green-600 hover:text-green-800' : 'text-gray-400 hover:text-gray-600'}`}
                                        title={item.isActive ? 'Desactivar' : 'Activar'}
                                    >
                                        {item.isActive ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                                    </button>

                                    <button
                                        onClick={() => handleEdit(item)}
                                        className="p-2 text-blue-600 hover:text-blue-800"
                                        title="Editar"
                                    >
                                        <Edit className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => handleDelete(item.id)}
                                        className="p-2 text-gray-600 hover:text-gray-800"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Pagination Controls */}
            {pagination && pagination.pages > 1 && (
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4 pt-6 border-t border-gray-200">
                    {/* Page Size Selector */}
                    <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-700">Mostrar:</label>
                        <select
                            value={pageSize}
                            onChange={(e) => {
                                const newSize = parseInt(e.target.value)
                                setPageSize(newSize)
                                setCurrentPage(1) // Reset to first page when changing page size
                            }}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-500">
                            de {pagination.total} noticias
                        </span>
                    </div>

                    {/* Page Navigation */}
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Anterior
                        </button>

                        {/* Page Numbers */}
                        {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                            const pageNum = Math.max(1, Math.min(pagination.pages - 4, currentPage - 2)) + i
                            if (pageNum > pagination.pages) return null

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 border rounded-md text-sm ${currentPage === pageNum
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            )
                        })}

                        <button
                            onClick={() => setCurrentPage(prev => Math.min(pagination.pages, prev + 1))}
                            disabled={currentPage === pagination.pages}
                            className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Siguiente
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
