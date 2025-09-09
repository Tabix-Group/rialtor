'use client'

import { useState, useEffect } from 'react'
import { Folder, File, Download, ArrowLeft, Search } from 'lucide-react'
import { publicFetch } from '@/utils/api'

interface FileUpload {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    cloudinaryUrl: string
    folder: string
    subfolder: string | null
    createdAt: string
}

interface FolderStructure {
    name: string
    subfolders: string[]
}

export default function DownloadsPage() {
    const [folders, setFolders] = useState<FolderStructure[]>([])
    const [files, setFiles] = useState<FileUpload[]>([])
    const [currentFolder, setCurrentFolder] = useState<string | null>(null)
    const [currentSubfolder, setCurrentSubfolder] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [breadcrumb, setBreadcrumb] = useState<string[]>([])

    // Cargar estructura de carpetas
    const loadFolders = async () => {
        try {
            setLoading(true)
            console.log('🔄 Loading folders...')
            const response = await publicFetch('/api/files/public/folders')
            console.log('📦 Folders response:', response.status)
            const data = await response.json()
            console.log('📁 Folders data:', data)
            if (data.success) {
                setFolders(data.data)
                console.log('✅ Folders loaded successfully:', data.data.length)
            } else {
                console.error('❌ Failed to load folders:', data)
            }
        } catch (error) {
            console.error('❌ Error loading folders:', error)
        } finally {
            setLoading(false)
            console.log('🏁 Loading complete')
        }
    }

    // Cargar archivos de una carpeta específica
    const loadFiles = async (folder: string, subfolder?: string) => {
        try {
            setLoading(true)
            console.log('🔄 Loading files for:', { folder, subfolder })
            const params = new URLSearchParams({
                folder,
                ...(subfolder && { subfolder })
            })

            const response = await publicFetch(`/api/files/public/files?${params}`)
            console.log('📦 Files response:', response.status)
            const data = await response.json()
            console.log('📄 Files data:', data)

            if (data.success) {
                setFiles(data.data)
                console.log('✅ Files loaded successfully:', data.data.length)
            } else {
                console.error('❌ Failed to load files:', data)
            }
        } catch (error) {
            console.error('❌ Error loading files:', error)
        } finally {
            setLoading(false)
            console.log('🏁 Files loading complete')
        }
    }

    useEffect(() => {
        loadFolders()
    }, [])

    // Navegar a una carpeta
    const navigateToFolder = (folderName: string, subfolderName?: string) => {
        setCurrentFolder(folderName)
        setCurrentSubfolder(subfolderName || null)
        setBreadcrumb(subfolderName ? [folderName, subfolderName] : [folderName])
        loadFiles(folderName, subfolderName)
    }

    // Volver a la vista de carpetas principales
    const goBack = () => {
        if (currentSubfolder) {
            // Volver a la carpeta principal
            setCurrentSubfolder(null)
            setBreadcrumb([currentFolder!])
            loadFiles(currentFolder!)
        } else {
            // Volver a la vista general
            setCurrentFolder(null)
            setCurrentSubfolder(null)
            setBreadcrumb([])
            setFiles([])
            setLoading(false)
        }
    }

    // Buscar archivos
    const handleSearch = () => {
        if (!searchTerm.trim()) {
            if (currentFolder) {
                loadFiles(currentFolder, currentSubfolder || undefined)
            }
            return
        }

        // Filtrar archivos localmente por el término de búsqueda
        const filteredFiles = files.filter(file =>
            file.originalName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            file.filename.toLowerCase().includes(searchTerm.toLowerCase())
        )
        setFiles(filteredFiles)
    }

    // Formatear tamaño de archivo
    const formatFileSize = (bytes: number) => {
        if (bytes === 0) return '0 Bytes'
        const k = 1024
        const sizes = ['Bytes', 'KB', 'MB', 'GB']
        const i = Math.floor(Math.log(bytes) / Math.log(k))
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    // Obtener icono según tipo de archivo
    const getFileIcon = (mimeType: string) => {
        if (mimeType.startsWith('image/')) return '🖼️'
        if (mimeType.startsWith('video/')) return '🎥'
        if (mimeType === 'application/pdf') return '📄'
        if (mimeType.includes('word') || mimeType.includes('document')) return '📝'
        if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
        return '📄'
    }

    // Descargar archivo
    const downloadFile = async (file: FileUpload) => {
        try {
            console.log('📥 Downloading file:', file.originalName)

            // Usar el endpoint de descarga del backend
            const downloadUrl = `/api/files/public/download/${file.id}`

            // Crear un link temporal para la descarga
            const link = document.createElement('a')
            link.href = downloadUrl
            link.download = file.originalName
            link.style.display = 'none'

            document.body.appendChild(link)
            link.click()
            document.body.removeChild(link)

            console.log('✅ File download initiated')
        } catch (error) {
            console.error('❌ Error downloading file:', error)
            // Fallback: open cloudinary URL in new tab
            window.open(file.cloudinaryUrl, '_blank')
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg">
                <div className="max-w-7xl mx-auto px-6 py-8">
                    <div className="flex items-center gap-4">
                        {currentFolder && (
                            <button
                                onClick={goBack}
                                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                        )}
                        <div>
                            <h1 className="text-3xl font-extrabold tracking-tight">Descargas</h1>
                            <p className="text-blue-100 text-lg">
                                {currentFolder
                                    ? `Archivos en ${breadcrumb.join(' / ')}`
                                    : 'Explora y descarga archivos de contenido'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Breadcrumb */}
                    {breadcrumb.length > 0 && (
                        <div className="mt-4 flex items-center gap-2 text-blue-100">
                            <span>📁</span>
                            {breadcrumb.map((item, index) => (
                                <span key={index} className="flex items-center gap-2">
                                    {index > 0 && <span>/</span>}
                                    <span className="font-medium">{item}</span>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-12">
                {/* Barra de búsqueda */}
                {currentFolder && (
                    <div className="mb-6">
                        <div className="flex gap-4">
                            <div className="flex-1">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder="Buscar archivos..."
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                />
                            </div>
                            <button
                                onClick={handleSearch}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Search className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                )}

                {/* Contenido */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-4">Cargando...</p>
                    </div>
                ) : !currentFolder ? (
                    /* Vista de carpetas principales */
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {folders.map((folder) => (
                            <div key={folder.name}>
                                {/* Carpeta principal */}
                                <div
                                    onClick={() => navigateToFolder(folder.name)}
                                    className="bg-white rounded-xl shadow-lg p-6 cursor-pointer hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                            <Folder className="w-6 h-6 text-blue-600" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">{folder.name}</h3>
                                            <p className="text-gray-500 text-sm">
                                                {folder.subfolders.length} subcarpeta{folder.subfolders.length !== 1 ? 's' : ''}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Subcarpetas */}
                                {folder.subfolders.length > 0 && (
                                    <div className="mt-4 space-y-2">
                                        {folder.subfolders.slice(0, 3).map((subfolder) => (
                                            <div
                                                key={subfolder}
                                                onClick={() => navigateToFolder(folder.name, subfolder)}
                                                className="bg-gray-50 rounded-lg p-4 cursor-pointer hover:bg-gray-100 transition-colors"
                                            >
                                                <div className="flex items-center gap-3">
                                                    <Folder className="w-5 h-5 text-gray-500" />
                                                    <span className="text-gray-700 font-medium">{subfolder}</span>
                                                </div>
                                            </div>
                                        ))}
                                        {folder.subfolders.length > 3 && (
                                            <div className="text-center text-gray-500 text-sm">
                                                +{folder.subfolders.length - 3} más...
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Vista de archivos */
                    <div className="space-y-4">
                        {files.length === 0 ? (
                            <div className="text-center py-12">
                                <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No hay archivos en esta carpeta</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div
                                    key={file.id}
                                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-3xl">{getFileIcon(file.mimeType)}</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{file.originalName}</h3>
                                                <p className="text-gray-500 text-sm">
                                                    {formatFileSize(file.size)} •
                                                    Subido el {new Date(file.createdAt).toLocaleDateString('es-ES', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric'
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => downloadFile(file)}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Download className="w-4 h-4" />
                                            Descargar
                                        </button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
