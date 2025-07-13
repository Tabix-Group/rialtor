'use client';

import { useState, useRef } from 'react'
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

  const [documents, setDocuments] = useState<Document[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [editingDoc, setEditingDoc] = useState<Document | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents from API
  const fetchDocuments = async () => {
    setLoadingDocs(true);
    try {
      const res = await fetch('/api/documents');
      const data = await res.json();
      setDocuments(data.documents || []);
    } catch (e) {
      setDocuments([]);
    } finally {
      setLoadingDocs(false);
    }
  };

  // On mount
  useState(() => { fetchDocuments(); }, []);


  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [uploadCategory, setUploadCategory] = useState('Contratos')
  const [showCategoryModal, setShowCategoryModal] = useState(false)
  const [editingCategory, setEditingCategory] = useState<string | null>(null)
  const [categories, setCategories] = useState<string[]>(['all', 'Contratos', 'Formularios', 'Manuales', 'Checklists'])

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

  // Handlers
  const handleView = (doc: Document) => {
    if (doc.url && doc.url !== '#') window.open(doc.url, '_blank');
  };

  const handleDownload = (doc: Document) => {
    if (doc.url && doc.url !== '#') window.open(doc.url + '?download=1', '_blank');
  };

  const handleDelete = async (doc: Document) => {
    if (!confirm('¿Eliminar este documento?')) return;
    try {
      const res = await fetch(`/api/documents?id=${doc.id}`, { method: 'DELETE' });
      if (res.ok) setDocuments(docs => docs.filter(d => d.id !== doc.id));
    } catch {}
  };

  const handleEdit = (doc: Document) => {
    setEditingDoc(doc);
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };


  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Siempre tomar el valor actual del select
    const categoryToSend = uploadCategory || (categories.find(c => c !== 'all') || 'General');
    const formData = new FormData();
    formData.append('file', file);
    formData.append('category', categoryToSend);
    try {
      const res = await fetch('/api/documents', { method: 'POST', body: formData });
      if (res.ok) fetchDocuments();
    } catch {}
  };

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
              <div className="flex gap-2 items-center">
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
                {/* Upload controls: select category + file */}
                <select
                  value={uploadCategory}
                  onChange={e => setUploadCategory(e.target.value)}
                  className="py-2 px-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  {categories.filter(cat => cat !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button className="bg-gray-200 text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-300" onClick={() => setShowCategoryModal(true)} type="button">
                  + Categoría
                </button>
                <button className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2" onClick={handleUploadClick} type="button">
                  <Upload className="w-5 h-5" />
                  Subir
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
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
                          {typeof doc.uploadDate === 'string' ? new Date(doc.uploadDate).toLocaleDateString('es-AR') : doc.uploadDate.toLocaleDateString('es-AR')}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" onClick={() => handleView(doc)}>
                      <Eye className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors" onClick={() => handleDownload(doc)}>
                      <Download className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors" onClick={() => handleEdit(doc)}>
                      <Edit className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" onClick={() => handleDelete(doc)}>
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
              </div>
            )}
          </div>

      {/* Modal para crear/editar categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-lg shadow-lg w-full max-w-sm p-6 relative">
            <button onClick={() => { setEditingCategory(null); setShowCategoryModal(false); }} className="absolute top-2 right-2 text-gray-400 hover:text-gray-600">✕</button>
            <h3 className="text-lg font-semibold mb-4">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
            <form
              onSubmit={e => {
                e.preventDefault();
                const name = (e.currentTarget.elements.namedItem('catname') as HTMLInputElement).value.trim();
                if (!name) return;
                if (editingCategory) {
                  setCategories(prev => prev.map(cat => cat === editingCategory ? name : cat));
                  if (uploadCategory === editingCategory) setUploadCategory(name);
                  if (selectedCategory === editingCategory) setSelectedCategory(name);
                  setEditingCategory(null);
                } else if (!categories.includes(name)) {
                  setCategories(prev => [...prev, name]);
                  setUploadCategory(name);
                }
                setShowCategoryModal(false);
              }}
              className="space-y-4"
            >
              <input name="catname" type="text" className="w-full border rounded px-3 py-2" placeholder="Nombre de la categoría" defaultValue={editingCategory || ''} required />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-4 py-2 bg-gray-200 rounded" onClick={() => { setEditingCategory(null); setShowCategoryModal(false); }}>Cerrar</button>
                <button type="submit" className="px-4 py-2 bg-red-600 text-white rounded">{editingCategory ? 'Guardar cambios' : 'Agregar'}</button>
              </div>
            </form>
            <div className="mt-6">
              <h4 className="font-semibold mb-2">Categorías existentes</h4>
              <ul className="space-y-2">
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <li key={cat} className="flex items-center justify-between border rounded px-3 py-1">
                    <span>{cat}</span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm" onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}>Editar</button>
                      <button className="text-red-600 hover:underline text-sm" onClick={() => {
                        setCategories(prev => prev.filter(c => c !== cat));
                        if (uploadCategory === cat) setUploadCategory(categories.find(c => c !== 'all' && c !== cat) || '');
                        if (selectedCategory === cat) setSelectedCategory('all');
                      }}>Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
        </div>
      </div>
    </div>
  )
}
