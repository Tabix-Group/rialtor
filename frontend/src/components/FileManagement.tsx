'use client'

import { useState, useEffect, useRef } from 'react'
import { File, Trash2, Download, Search, Plus, X } from 'lucide-react'
import { authenticatedFetch } from '@/utils/api'

interface FileUpload {
    id: string
    filename: string
    originalName: string
    mimeType: string
    size: number
    cloudinaryUrl: string
    cloudinaryId: string
    folder: string
    subfolder: string | null
    createdAt: string
    user: {
        id: string
        name: string
        email: string
    }
}

interface FolderStructure {
    name: string
    subfolders: string[]
}

export default function FileManagement() {
    const [files, setFiles] = useState<FileUpload[]>([])
    const [folders, setFolders] = useState<FolderStructure[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)
    const [selectedFolder, setSelectedFolder] = useState('Contenido')
    const [selectedSubfolder, setSelectedSubfolder] = useState('')
    const [newSubfolder, setNewSubfolder] = useState('')
    const [showNewSubfolder, setShowNewSubfolder] = useState(false)
    const [searchTerm, setSearchTerm] = useState('')
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Cargar archivos
    const loadFiles = async (page = 1, search = '') => {
        try {
            setLoading(true)
            const params = new URLSearchParams({
                page: page.toString(),
                limit: '10',
                folder: selectedFolder,
                ...(selectedSubfolder && { subfolder: selectedSubfolder }),
                ...(search && { search })
            })

            const response = await authenticatedFetch(`/api/files?${params}`)
            const data = await response.json()

            if (data.success) {
                setFiles(data.data)
                setTotalPages(data.pagination.pages)
                setCurrentPage(data.pagination.page)
            }
        } catch (error) {
            console.error('Error loading files:', error)
        } finally {
            setLoading(false)
        }
    }

    // Cargar estructura de carpetas
    const loadFolders = async () => {
        try {
            const response = await authenticatedFetch('/api/files/folders')
            const data = await response.json()
            if (data.success) {
                setFolders(data.data)
            }
        } catch (error) {
            console.error('Error loading folders:', error)
        }
    }

    useEffect(() => {
        loadFolders()
        loadFiles()
    }, [selectedFolder, selectedSubfolder]) // loadFiles no se incluye porque es una función que cambia en cada render

    // Manejar subida de archivo
    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setUploading(true)
        try {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('folder', selectedFolder)
            if (selectedSubfolder) {
                formData.append('subfolder', selectedSubfolder)
            }

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })

            const data = await response.json()
            if (data.success) {
                alert('Archivo subido exitosamente')
                loadFiles(currentPage, searchTerm)
                loadFolders()
                if (fileInputRef.current) {
                    fileInputRef.current.value = ''
                }
            } else {
                alert('Error al subir el archivo: ' + (data.message || 'Error desconocido'))
            }
        } catch (error) {
            console.error('Error uploading file:', error)
            alert('Error al subir el archivo')
        } finally {
            setUploading(false)
        }
    }

    // Crear nueva subcarpeta
    const createSubfolder = async () => {
        if (!newSubfolder.trim()) return

        try {
            // Crear una carpeta temporal subiendo un archivo dummy
            const formData = new FormData()
            const dummyBlob = new Blob([''], { type: 'text/plain' })
            formData.append('file', dummyBlob, 'dummy.txt')
            formData.append('folder', selectedFolder)
            formData.append('subfolder', newSubfolder.trim())

            const response = await fetch('/api/files/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: formData
            })

            if (response.ok) {
                setNewSubfolder('')
                setShowNewSubfolder(false)
                loadFolders()
                alert('Subcarpeta creada exitosamente')
            }
        } catch (error) {
            console.error('Error creating subfolder:', error)
        }
    }

    // Eliminar archivo
    const deleteFile = async (fileId: string, filename: string) => {
        if (!confirm(`¿Está seguro de que desea eliminar "${filename}"?`)) {
            return
        }

        try {
            const response = await authenticatedFetch(`/api/files/${fileId}`, {
                method: 'DELETE'
            })

            if (response.ok) {
                alert('Archivo eliminado exitosamente')
                loadFiles(currentPage, searchTerm)
                loadFolders()
            } else {
                alert('Error al eliminar el archivo')
            }
        } catch (error) {
            console.error('Error deleting file:', error)
            alert('Error al eliminar el archivo')
        }
    }

    // Buscar archivos
    const handleSearch = () => {
        loadFiles(1, searchTerm)
    }

    // Cambiar página
    const handlePageChange = (page: number) => {
        loadFiles(page, searchTerm)
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

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Gestión de Archivos</h2>
                <p className="text-gray-600">Sube y administra archivos para contenido de redes sociales</p>
            </div>

            {/* Controles de subida */}
            <div className="bg-white rounded-lg shadow p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Subir Archivo</h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Selector de carpeta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Carpeta</label>
                        <select
                            value={selectedFolder}
                            onChange={(e) => {
                                setSelectedFolder(e.target.value)
                                setSelectedSubfolder('')
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            {folders.map(folder => (
                                <option key={folder.name} value={folder.name}>{folder.name}</option>
                            ))}
                            {!folders.find(f => f.name === 'Contenido') && (
                                <option value="Contenido">Contenido</option>
                            )}
                        </select>
                    </div>

                    {/* Selector de subcarpeta */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Subcarpeta</label>
                        <div className="flex gap-2">
                            <select
                                value={selectedSubfolder}
                                onChange={(e) => setSelectedSubfolder(e.target.value)}
                                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Sin subcarpeta</option>
                                {folders.find(f => f.name === selectedFolder)?.subfolders.map(sub => (
                                    <option key={sub} value={sub}>{sub}</option>
                                ))}
                            </select>
                            <button
                                onClick={() => setShowNewSubfolder(!showNewSubfolder)}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200"
                                title="Crear nueva subcarpeta"
                            >
                                <Plus className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Input de archivo */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Archivo</label>
                        <input
                            ref={fileInputRef}
                            type="file"
                            onChange={handleFileUpload}
                            disabled={uploading}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip"
                        />
                    </div>
                </div>

                {/* Crear nueva subcarpeta */}
                {showNewSubfolder && (
                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newSubfolder}
                            onChange={(e) => setNewSubfolder(e.target.value)}
                            placeholder="Nombre de la nueva subcarpeta"
                            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={createSubfolder}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Crear
                        </button>
                        <button
                            onClick={() => {
                                setShowNewSubfolder(false)
                                setNewSubfolder('')
                            }}
                            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                )}

                {uploading && (
                    <div className="text-center py-4">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Subiendo archivo...</p>
                    </div>
                )}
            </div>

            {/* Búsqueda y filtros */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex gap-4 mb-4">
                    <div className="flex-1">
                        <input
                            type="text"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Buscar archivos..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                        />
                    </div>
                    <button
                        onClick={handleSearch}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        <Search className="w-4 h-4" />
                    </button>
                </div>

                {/* Lista de archivos */}
                {loading ? (
                    <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Cargando archivos...</p>
                    </div>
                ) : files.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                        No se encontraron archivos
                    </div>
                ) : (
                    <div className="space-y-4">
                        {files.map((file) => (
                            <div key={file.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">{getFileIcon(file.mimeType)}</span>
                                    <div>
                                        <p className="font-medium text-gray-900">{file.originalName}</p>
                                        <p className="text-sm text-gray-500">
                                            {formatFileSize(file.size)} • {file.folder}
                                            {file.subfolder && `/${file.subfolder}`} •
                                            Subido por {file.user.name} •
                                            {new Date(file.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <a
                                        href={file.cloudinaryUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="px-3 py-1 bg-blue-100 text-blue-600 rounded-md hover:bg-blue-200"
                                    >
                                        <Download className="w-4 h-4" />
                                    </a>
                                    <button
                                        onClick={() => deleteFile(file.id, file.originalName)}
                                        className="px-3 py-1 bg-red-100 text-red-600 rounded-md hover:bg-red-200"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Paginación */}
                {totalPages > 1 && (
                    <div className="flex justify-center gap-2 mt-6">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Anterior
                        </button>
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                            <button
                                key={page}
                                onClick={() => handlePageChange(page)}
                                className={`px-3 py-1 border rounded-md ${page === currentPage
                                        ? 'bg-blue-600 text-white border-blue-600'
                                        : 'border-gray-300 hover:bg-gray-50'
                                    }`}
                            >
                                {page}
                            </button>
                        ))}
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                        >
                            Siguiente
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
