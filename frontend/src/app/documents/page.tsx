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
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="max-w-5xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-400 text-white p-8 rounded-t-3xl shadow flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold mb-1 tracking-tight flex items-center gap-3">
              <FileText className="w-8 h-8 text-white/80" />
              Gestión de Documentos
            </h1>
            <p className="text-red-100 text-lg">
              Accede y gestiona todos los documentos importantes de RE/MAX
            </p>
          </div>

          {/* Controls */}
          <div className="p-8 border-b bg-white/80 rounded-b-none rounded-t-none">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Buscar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                />
              </div>
              <div className="flex gap-2 items-center flex-wrap">
                <div className="relative">
                  <Filter className="absolute left-4 top-3 w-5 h-5 text-gray-400" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="pl-12 pr-8 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
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
                  className="py-3 px-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-400 focus:border-transparent text-lg shadow-sm"
                >
                  {categories.filter(cat => cat !== 'all').map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <button className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 px-4 py-3 rounded-xl hover:bg-gray-300 shadow transition-all font-semibold" onClick={() => setShowCategoryModal(true)} type="button">
                  + Categoría
                </button>
                <button className="bg-gradient-to-r from-red-500 to-red-700 text-white px-6 py-3 rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 transition-all flex items-center gap-2 font-bold text-lg" onClick={handleUploadClick} type="button">
                  <Upload className="w-5 h-5" />
                  Subir
                </button>
                <input type="file" ref={fileInputRef} className="hidden" onChange={handleFileChange} />
              </div>
            </div>
          </div>

          {/* Documents List */}
          <div className="p-8">
            {filteredDocuments.length === 0 ? (
              <div className="text-center py-16">
                <FileText className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                <p className="text-gray-500 text-lg">No se encontraron documentos</p>
              </div>
            ) : (
              <div className="space-y-5">
            {filteredDocuments.map((doc) => (
              <div key={doc.id} className="border border-gray-100 rounded-2xl p-6 bg-white/80 hover:bg-blue-50 transition-all shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex items-center gap-5">
                  {getFileIcon(doc.type)}
                  <div>
                    <h3 className="font-bold text-gray-800 text-lg">{doc.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 mt-1">
                      <span className="bg-gray-100 px-2 py-1 rounded font-medium">
                        {doc.category}
                      </span>
                      <span>{doc.size}</span>
                      <span>
                        {typeof doc.uploadDate === 'string' ? new Date(doc.uploadDate).toLocaleDateString('es-AR') : doc.uploadDate.toLocaleDateString('es-AR')}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-100 rounded-xl transition-all" onClick={() => handleView(doc)} title="Ver">
                    <Eye className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-green-600 hover:bg-green-100 rounded-xl transition-all" onClick={() => handleDownload(doc)} title="Descargar">
                    <Download className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-yellow-600 hover:bg-yellow-100 rounded-xl transition-all" onClick={() => handleEdit(doc)} title="Editar">
                    <Edit className="w-5 h-5" />
                  </button>
                  <button className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-100 rounded-xl transition-all" onClick={() => handleDelete(doc)} title="Eliminar">
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            ))}
              </div>
            )}
          </div>

      {/* Modal para crear/editar categoría */}
      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-30">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 relative border border-gray-100">
            <button onClick={() => { setEditingCategory(null); setShowCategoryModal(false); }} className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
            <h3 className="text-2xl font-bold mb-6 text-gray-800">{editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}</h3>
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
              className="space-y-6"
            >
              <input name="catname" type="text" className="w-full border border-gray-200 rounded-xl px-4 py-3 text-lg focus:ring-2 focus:ring-red-400 focus:border-transparent" placeholder="Nombre de la categoría" defaultValue={editingCategory || ''} required />
              <div className="flex justify-end gap-2">
                <button type="button" className="px-5 py-3 bg-gray-100 rounded-xl font-semibold hover:bg-gray-200" onClick={() => { setEditingCategory(null); setShowCategoryModal(false); }}>Cerrar</button>
                <button type="submit" className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl font-bold hover:from-red-600 hover:to-red-800 transition-all">{editingCategory ? 'Guardar cambios' : 'Agregar'}</button>
              </div>
            </form>
            <div className="mt-8">
              <h4 className="font-semibold mb-3 text-gray-700">Categorías existentes</h4>
              <ul className="space-y-2">
                {categories.filter(cat => cat !== 'all').map(cat => (
                  <li key={cat} className="flex items-center justify-between border border-gray-100 rounded-xl px-4 py-2 bg-gray-50">
                    <span className="font-medium text-gray-700">{cat}</span>
                    <div className="flex gap-2">
                      <button className="text-blue-600 hover:underline text-sm font-semibold" onClick={() => { setEditingCategory(cat); setShowCategoryModal(true); }}>Editar</button>
                      <button className="text-red-600 hover:underline text-sm font-semibold" onClick={() => {
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
