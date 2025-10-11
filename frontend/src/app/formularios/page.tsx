'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Folder {
    name: string
    path: string
}

interface FolderStats {
    [key: string]: number
}

export default function FormulariosPage() {
    const router = useRouter()
    const [folders, setFolders] = useState<Folder[]>([])
    const [stats, setStats] = useState<FolderStats>({})
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        loadFolders()
        loadStats()
    }, [])

    const loadFolders = async () => {
        try {
            const response = await fetch('/api/forms/folders')
            if (!response.ok) throw new Error('Error al cargar carpetas')
            
            const data = await response.json()
            setFolders(data.data || [])
        } catch (err) {
            console.error('Error loading folders:', err)
            setError('Error al cargar las carpetas de formularios')
        } finally {
            setLoading(false)
        }
    }

    const loadStats = async () => {
        try {
            const response = await fetch('/api/forms/stats')
            if (!response.ok) return
            
            const data = await response.json()
            setStats(data.data || {})
        } catch (err) {
            console.error('Error loading stats:', err)
        }
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

    const getFolderDescription = (folderName: string) => {
        const descriptions: { [key: string]: string } = {
            alquiler: 'Contratos y documentos para alquileres',
            boletos: 'Documentos de compraventa de propiedades',
            reservas: 'Formularios de reserva y ofertas de compra'
        }
        return descriptions[folderName.toLowerCase()] || 'Documentos disponibles para completar'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-3 border-blue-600 border-t-transparent mx-auto mb-3"></div>
                    <p className="text-gray-600 text-sm">Cargando formularios...</p>
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
                    <p className="text-red-600 text-sm">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">
                                    Formularios y Documentos
                                </h1>
                                <p className="text-sm text-gray-500 mt-0.5">
                                    Completa y descarga documentos del sector inmobiliario
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Instrucciones - Más compactas */}
                <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
                    <div className="flex items-start gap-3">
                        <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="flex-1">
                            <h3 className="font-semibold text-gray-900 text-sm mb-2">¿Cómo usar?</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-600">
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-semibold">1.</span>
                                    <span>Selecciona una categoría</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-semibold">2.</span>
                                    <span>Elige tu documento</span>
                                </div>
                                <div className="flex items-start gap-2">
                                    <span className="text-blue-600 font-semibold">3.</span>
                                    <span>Edita y descarga</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Carpetas de formularios - Diseño más compacto */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {folders.map((folder) => (
                        <button
                            key={folder.name}
                            onClick={() => router.push(`/formularios/${folder.name}`)}
                            className="group bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 p-5 border border-gray-200 hover:border-blue-400 text-left"
                        >
                            {/* Header con icono y badge */}
                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-3">
                                    <div className="bg-blue-50 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                                        <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            {folder.name === 'alquiler' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                            )}
                                            {folder.name === 'boletos' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                            )}
                                            {folder.name === 'reservas' && (
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                                            )}
                                        </svg>
                                    </div>
                                    <div>
                                        <h3 className="text-base font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                                            {getFolderTitle(folder.name)}
                                        </h3>
                                        {stats[folder.name] > 0 && (
                                            <span className="text-xs text-gray-500">
                                                {stats[folder.name]} {stats[folder.name] === 1 ? 'documento' : 'documentos'}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <svg
                                    className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                </svg>
                            </div>

                            {/* Descripción */}
                            <p className="text-sm text-gray-600">
                                {getFolderDescription(folder.name)}
                            </p>
                        </button>
                    ))}
                </div>

                {folders.length === 0 && (
                    <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-gray-600 text-base font-medium">
                            No se encontraron carpetas de formularios
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
