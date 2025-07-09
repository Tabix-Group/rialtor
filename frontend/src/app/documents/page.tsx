'use client'

import { useState } from 'react'
import { FileText, Upload, Download, Search, Filter, Eye, Edit, Trash2 } from 'lucide-react'

interface Document {
  id: string
  title: string
  type: string
  category: string
  uploadDate: Date
  size: string
  url: string
}

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'

export default function DocumentsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: si no está logueado, redirigir a login
  if (!loading && !user && typeof window !== 'undefined') {
    router.replace('/auth/login');
    return null;
  }

  const [documents] = useState<Document[]>([
    {
      id: '1',
      title: 'Contrato de Compraventa Modelo',
      type: 'PDF',
      category: 'Contratos',
      uploadDate: new Date('2024-01-15'),
      size: '245 KB',
      url: '#'
    },
    {
      id: '2',
      title: 'Formulario de Tasación',
      type: 'PDF',
      category: 'Formularios',
      uploadDate: new Date('2024-01-10'),
      size: '180 KB',
      url: '#'
    },
    {
      id: '3',
      title: 'Manual de Procedimientos',
      type: 'PDF',
      category: 'Manuales',
      uploadDate: new Date('2024-01-05'),
      size: '1.2 MB',
      url: '#'
    },
    {
      id: '4',
      title: 'Checklist Pre-Venta',
      type: 'PDF',
      category: 'Checklists',
      uploadDate: new Date('2024-01-03'),
      size: '95 KB',
      url: '#'
    }
  ])

  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = ['all', 'Contratos', 'Formularios', 'Manuales', 'Checklists']

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || doc.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-8 h-8 text-red-500" />
      default:
        return <FileText className="w-8 h-8 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg">
          {/* Header */}
          <div className="bg-red-600 text-white p-6 rounded-t-lg">
            <h1 className="text-2xl font-bold mb-2">Gestión de Documentos</h1>
            <p className="text-red-100">
              Accede y gestiona todos los documentos importantes de RE/MAX
            </p>
          </div>

          {/* Controls */}
          <div className="p-6 border-b">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                />
              </div>
              
              <div className="flex gap-2">
                <div className="relative">
                  <Filter className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  >
                    {categories.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'Todas las categorías' : cat}
                      </option>
                    ))}
                  </select>
                </div>
                
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2">
                  <Upload className="w-5 h-5" />
                  Subir
                </button>
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="p-6">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">No se encontraron documentos</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDocuments.map((doc) => (
                  <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        {getFileIcon(doc.type)}
                        <div>
                          <h3 className="font-semibold text-gray-800">{doc.title}</h3>
                          <div className="flex items-center gap-4 text-sm text-gray-500 mt-1">
                            <span className="bg-gray-100 px-2 py-1 rounded">
                              {doc.category}
                            </span>
                            <span>{doc.size}</span>
                            <span>
                              {doc.uploadDate.toLocaleDateString('es-AR')}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                          <Eye className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                          <Download className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors">
                          <Edit className="w-5 h-5" />
                        </button>
                        <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Upload Area */}
          <div className="p-6 border-t bg-gray-50">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-red-400 transition-colors">
              <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">
                Arrastra y suelta archivos aquí o haz clic para seleccionar
              </p>
              <p className="text-sm text-gray-500">
                Formatos soportados: PDF, DOC, DOCX, XLS, XLSX (máx. 10MB)
              </p>
              <button className="mt-4 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition-colors">
                Seleccionar archivos
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
