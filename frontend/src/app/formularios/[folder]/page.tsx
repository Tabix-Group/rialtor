'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../auth/authContext'

interface Document {
    id: string
    filename: string
    originalName: string
    url: string
    format: string
    size: number
    createdAt: string
    folder: string
}

export default function FolderDocumentsPage() {
    const router = useRouter()
    const params = useParams()
    const { user } = useAuth()
    const folder = (params?.folder as string) || ''

    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState<string | null>(null)
    const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
    const [favorites, setFavorites] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (folder) {
            loadDocuments()
        }
        if (user) {
            loadFavorites()
        }
    }, [folder, user])

    const loadDocuments = async () => {
        try {
            setLoading(true)
            const response = await fetch(`/api/forms/${folder}/documents`)
            if (!response.ok) throw new Error('Error al cargar documentos')
            
            const data = await response.json()
            setDocuments(data.data || [])
        } catch (err) {
            console.error('Error loading documents:', err)
            setError('Error al cargar los documentos')
        } finally {
            setLoading(false)
        }
    }

    const loadFavorites = async () => {
        try {
            const token = localStorage.getItem('token')
            const response = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            })
            if (!response.ok) return
            
            const data = await response.json()
            const favoriteIds = new Set<string>(data.data?.map((fav: any) => fav.documentId) || [])
            setFavorites(favoriteIds)
        } catch (err) {
            console.error('Error loading favorites:', err)
        }
    }

    const toggleFavorite = async (doc: Document) => {
        if (!user) return

        try {
            const token = localStorage.getItem('token')
            const isFavorite = favorites.has(doc.id)

            if (isFavorite) {
                // Remove from favorites
                const response = await fetch(`/api/favorites/${encodeURIComponent(doc.id)}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
                if (response.ok) {
                    setFavorites(prev => {
                        const newSet = new Set(prev)
                        newSet.delete(doc.id)
                        return newSet
                    })
                }
            } else {
                // Add to favorites
                const response = await fetch('/api/favorites', {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        documentId: doc.id,
                        documentName: doc.originalName,
                        folder: doc.folder
                    })
                })
                if (response.ok) {
                    setFavorites(prev => new Set(Array.from(prev).concat(doc.id)))
                }
            }
        } catch (err) {
            console.error('Error toggling favorite:', err)
        }
    }

    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
    }

    const getFolderIcon = (folderName: string) => {
        switch (folderName.toLowerCase()) {
            case 'alquiler':
                return '🏠'
            case 'boletos':
                return '📝'
            case 'reservas':
                return '🔖'
            default:
                return '📁'
        }
    }

    const getFolderTitle = (folderName: string) => {
        const titles: { [key: string]: string } = {
            alquiler: 'Formularios de Alquiler',
            boletos: 'Boletos de Compraventa',
            reservas: 'Reservas y Ofertas'
        }
        return titles[folderName.toLowerCase()] || folderName.charAt(0).toUpperCase() + folderName.slice(1)
    }

    const handleDownloadOriginal = async (doc: Document) => {
        try {
            setDownloading(doc.id)
            console.log('📥 Descargando documento original:', doc.originalName)

            const encodedId = encodeURIComponent(doc.id)
            const downloadUrl = `/api/forms/document/${encodedId}/download`

            // Crear un link temporal para la descarga
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = doc.originalName
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('✅ Descarga iniciada')
        } catch (error) {
            console.error('❌ Error al descargar:', error)
            alert('Error al descargar el documento')
        } finally {
            setDownloading(null)
        }
    }

    const handleEditDocument = (doc: Document) => {
        // Codificar el ID del documento para la URL
        const encodedId = encodeURIComponent(doc.id)
        router.push(`/formularios/${folder}/${encodedId}`)
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Cargando documentos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white border border-red-200 rounded-lg p-6 max-w-md shadow-sm">
                    <div className="flex items-center gap-3 text-red-800 mb-3">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <h3 className="font-semibold text-base">Error</h3>
                    </div>
                    <p className="text-red-600 text-sm mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/formularios')}
                        className="text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors"
                    >
                        ← Volver a formularios
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-6">
                    <button
                        onClick={() => router.push('/formularios')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 font-medium mb-4 transition-colors text-sm"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Formularios
                    </button>

                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="bg-blue-50 p-2.5 rounded-lg">
                                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    {folder === 'alquiler' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    )}
                                    {folder === 'boletos' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    )}
                                    {folder === 'reservas' && (
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                    )}
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    {getFolderTitle(folder)}
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    {documents.length} {documents.length === 1 ? 'documento disponible' : 'documentos disponibles'}
                                </p>
                            </div>
                        </div>

                        {/* Toggle de vista */}
                        {documents.length > 0 && (
                            <div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1">
                                <button
                                    onClick={() => setViewMode('grid')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'grid'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    title="Vista de tarjetas"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                                    </svg>
                                </button>
                                <button
                                    onClick={() => setViewMode('list')}
                                    className={`p-2 rounded transition-colors ${
                                        viewMode === 'list'
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-600 hover:bg-gray-100'
                                    }`}
                                    title="Vista de lista"
                                >
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Lista de documentos */}
                {documents.length > 0 ? (
                    <>
                        {/* Vista de Tarjetas */}
                        {viewMode === 'grid' && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {documents.map((doc) => (
                                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 p-4">
                                        {/* Icono y título */}
                                        <div className="flex items-start gap-3 mb-3">
                                            <div className="bg-blue-50 p-2 rounded flex-shrink-0">
                                                <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                </svg>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-medium text-gray-900 text-sm truncate" title={doc.originalName}>
                                                    {doc.originalName}
                                                </h3>
                                                <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                                                    <span>{doc.format?.toUpperCase() || 'DOCX'}</span>
                                                    <span>•</span>
                                                    <span>{formatFileSize(doc.size)}</span>
                                                </div>
                                            </div>
                                            {user && (
                                                <button
                                                    onClick={() => toggleFavorite(doc)}
                                                    className={`p-1.5 rounded-full transition-colors ${
                                                        favorites.has(doc.id)
                                                            ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                                                            : 'text-gray-400 hover:text-yellow-500 bg-gray-50 hover:bg-yellow-50'
                                                    }`}
                                                    title={favorites.has(doc.id) ? 'Remover de favoritos' : 'Agregar a favoritos'}
                                                >
                                                    <svg className="w-4 h-4" fill={favorites.has(doc.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                    </svg>
                                                </button>
                                            )}
                                        </div>

                                        {/* Acciones */}
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => handleDownloadOriginal(doc)}
                                                disabled={downloading === doc.id}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                title="Descargar original"
                                            >
                                                {downloading === doc.id ? (
                                                    <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-700 border-t-transparent"></div>
                                                ) : (
                                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                    </svg>
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleEditDocument(doc)}
                                                className="flex-1 flex items-center justify-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                </svg>
                                                <span>Editar</span>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}

                        {/* Vista de Lista */}
                        {viewMode === 'list' && (
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                                <div className="divide-y divide-gray-200">
                                    {documents.map((doc) => (
                                        <div
                                            key={doc.id}
                                            className="p-4 hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="flex items-center justify-between gap-4">
                                                {/* Info del documento */}
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                    <div className="bg-blue-50 p-2 rounded flex-shrink-0">
                                                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h3 className="font-medium text-gray-900 text-sm truncate" title={doc.originalName}>
                                                            {doc.originalName}
                                                        </h3>
                                                        <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-500">
                                                            <span>{doc.format?.toUpperCase() || 'DOCX'}</span>
                                                            <span>•</span>
                                                            <span>{formatFileSize(doc.size)}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Acciones */}
                                                <div className="flex items-center gap-2 flex-shrink-0">
                                                    {user && (
                                                        <button
                                                            onClick={() => toggleFavorite(doc)}
                                                            className={`p-2 rounded transition-colors ${
                                                                favorites.has(doc.id)
                                                                    ? 'text-yellow-500 hover:text-yellow-600 bg-yellow-50'
                                                                    : 'text-gray-400 hover:text-yellow-500 bg-gray-50 hover:bg-yellow-50'
                                                            }`}
                                                            title={favorites.has(doc.id) ? 'Remover de favoritos' : 'Agregar a favoritos'}
                                                        >
                                                            <svg className="w-4 h-4" fill={favorites.has(doc.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                                                            </svg>
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDownloadOriginal(doc)}
                                                        disabled={downloading === doc.id}
                                                        className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                        title="Descargar original"
                                                    >
                                                        {downloading === doc.id ? (
                                                            <>
                                                                <div className="animate-spin rounded-full h-3.5 w-3.5 border-2 border-gray-700 border-t-transparent"></div>
                                                                <span className="hidden sm:inline">Descargando...</span>
                                                            </>
                                                        ) : (
                                                            <>
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                                </svg>
                                                                <span className="hidden sm:inline">Descargar</span>
                                                            </>
                                                        )}
                                                    </button>
                                                    <button
                                                        onClick={() => handleEditDocument(doc)}
                                                        className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium py-2 px-3 rounded transition-colors"
                                                    >
                                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                        </svg>
                                                        <span className="hidden sm:inline">Editar</span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 text-base font-medium mb-2">
                            No se encontraron documentos en esta carpeta
                        </p>
                        <p className="text-gray-500 text-sm">
                            Asegúrate de que los documentos estén subidos en Cloudinary en la carpeta docgen/{folder}
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
