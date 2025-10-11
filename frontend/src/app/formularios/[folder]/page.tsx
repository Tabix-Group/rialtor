'use client'

import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'

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
    const folder = (params?.folder as string) || ''

    const [documents, setDocuments] = useState<Document[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [downloading, setDownloading] = useState<string | null>(null)

    useEffect(() => {
        if (folder) {
            loadDocuments()
        }
    }, [folder])

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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando documentos...</p>
                </div>
            </div>
        )
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 max-w-md">
                    <div className="flex items-center gap-3 text-red-800 mb-2">
                        <span className="text-2xl">⚠️</span>
                        <h3 className="font-semibold">Error</h3>
                    </div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={() => router.push('/formularios')}
                        className="text-blue-600 hover:underline font-semibold"
                    >
                        ← Volver a formularios
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/formularios')}
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-semibold mb-4 transition-colors"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                        Volver a Formularios
                    </button>

                    <div className="flex items-center gap-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <span className="text-3xl">{getFolderIcon(folder)}</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                {getFolderTitle(folder)}
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">
                                {documents.length} {documents.length === 1 ? 'documento disponible' : 'documentos disponibles'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Lista de documentos */}
                {documents.length > 0 ? (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {documents.map((doc) => (
                            <div
                                key={doc.id}
                                className="bg-white rounded-xl shadow-lg border-2 border-gray-100 hover:border-blue-300 transition-all duration-300 p-6"
                            >
                                {/* Icono y nombre */}
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="bg-blue-100 p-3 rounded-lg flex-shrink-0">
                                        <span className="text-3xl">📄</span>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-gray-900 text-lg mb-1 truncate" title={doc.originalName}>
                                            {doc.originalName}
                                        </h3>
                                        <div className="flex items-center gap-3 text-sm text-gray-500">
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                                </svg>
                                                {doc.format?.toUpperCase() || 'DOCX'}
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4" />
                                                </svg>
                                                {formatFileSize(doc.size)}
                                            </span>
                                        </div>
                                    </div>
                                </div>

                                {/* Acciones */}
                                <div className="flex flex-col sm:flex-row gap-3">
                                    {/* Botón Descargar Original */}
                                    <button
                                        onClick={() => handleDownloadOriginal(doc)}
                                        disabled={downloading === doc.id}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {downloading === doc.id ? (
                                            <>
                                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-700"></div>
                                                <span>Descargando...</span>
                                            </>
                                        ) : (
                                            <>
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                                </svg>
                                                <span>Descargar Original</span>
                                            </>
                                        )}
                                    </button>

                                    {/* Botón Editar */}
                                    <button
                                        onClick={() => handleEditDocument(doc)}
                                        className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 px-4 rounded-lg transition-all shadow-md hover:shadow-lg"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                        </svg>
                                        <span>Abrir y Editar</span>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 bg-white rounded-xl shadow-lg">
                        <span className="text-6xl mb-4 block">📭</span>
                        <p className="text-gray-600 text-lg mb-2">
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
