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
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando formularios...</p>
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
                    <p className="text-red-600">{error}</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 py-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-12">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="bg-blue-600 p-3 rounded-xl">
                            <span className="text-3xl">📋</span>
                        </div>
                        <div>
                            <h1 className="text-4xl font-bold text-gray-900">
                                Formularios y Documentos
                            </h1>
                            <p className="text-lg text-gray-600 mt-2">
                                Completa y descarga formularios del sector inmobiliario
                            </p>
                        </div>
                    </div>
                </div>

                {/* Instrucciones */}
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-8">
                    <div className="flex items-start gap-4">
                        <span className="text-3xl">💡</span>
                        <div className="flex-1">
                            <h3 className="font-semibold text-blue-900 mb-2">¿Cómo funciona?</h3>
                            <ul className="space-y-2 text-blue-800">
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">1.</span>
                                    <span>Selecciona una categoría de formularios</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">2.</span>
                                    <span>Elige el documento que necesitas</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">3.</span>
                                    <span>Descarga el original o ábrelo en el editor para completarlo</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">4.</span>
                                    <span>Completa los campos directamente en el navegador</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-blue-600 mt-1">5.</span>
                                    <span>Descarga el documento completado listo para imprimir o enviar</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>

                {/* Carpetas de formularios */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {folders.map((folder) => (
                        <button
                            key={folder.name}
                            onClick={() => router.push(`/formularios/${folder.name}`)}
                            className="group bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 p-8 border-2 border-gray-100 hover:border-blue-500 text-left"
                        >
                            {/* Icono */}
                            <div className="flex items-center justify-between mb-4">
                                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-4 rounded-xl group-hover:scale-110 transition-transform duration-300">
                                    <span className="text-4xl">{getFolderIcon(folder.name)}</span>
                                </div>
                                {stats[folder.name] > 0 && (
                                    <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                                        {stats[folder.name]} docs
                                    </div>
                                )}
                            </div>

                            {/* Título */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {getFolderTitle(folder.name)}
                            </h3>

                            {/* Descripción */}
                            <p className="text-gray-600 text-sm mb-4">
                                {getFolderDescription(folder.name)}
                            </p>

                            {/* Acción */}
                            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-3 transition-all">
                                <span>Ver formularios</span>
                                <svg
                                    className="w-5 h-5 group-hover:translate-x-1 transition-transform"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M9 5l7 7-7 7"
                                    />
                                </svg>
                            </div>
                        </button>
                    ))}
                </div>

                {folders.length === 0 && (
                    <div className="text-center py-12">
                        <span className="text-6xl mb-4 block">📭</span>
                        <p className="text-gray-600 text-lg">
                            No se encontraron carpetas de formularios
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
