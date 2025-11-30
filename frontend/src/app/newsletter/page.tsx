'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { usePermission } from '../../hooks/usePermission'
import { authenticatedFetch } from '@/utils/api'
import dynamic from 'next/dynamic'
import {
  Upload,
  Mail,
  Trash2,
  Download,
  Eye,
  Loader2,
  Plus,
  Edit,
  Send,
  FileText,
  Image as ImageIcon,
  Newspaper,
  Home,
  CheckCircle,
  XCircle,
  Clock,
} from 'lucide-react'

// Importar ReactQuill dinámicamente para evitar SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

interface Newsletter {
  id: string;
  title: string;
  content: string;
  images: string[];
  properties?: any;
  news?: any;
  agentInfo?: any;
  template: string;
  status: 'DRAFT' | 'PUBLISHED' | 'SENT';
  createdAt: string;
  updatedAt: string;
}

export default function NewsletterPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasPermission = usePermission('use_placas'); // Usar mismo permiso por ahora

  // Estados
  const [newsletters, setNewsletters] = useState<Newsletter[]>([]);
  const [loadingNewsletters, setLoadingNewsletters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalNewsletters, setTotalNewsletters] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    template: 'default'
  });
  const [creating, setCreating] = useState(false);

  // Proteger ruta
  useEffect(() => {
    if (!loading && (!user || !hasPermission)) {
      router.replace('/auth/login');
    }
  }, [user, loading, hasPermission, router]);

  // Cargar newsletters
  useEffect(() => {
    if (user && hasPermission) {
      fetchNewsletters();
    }
  }, [user, hasPermission]);

  const fetchNewsletters = async (page = 1, limit = 10) => {
    try {
      const res = await authenticatedFetch(`/api/newsletters?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) {
        setNewsletters(data.newsletters || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalNewsletters(data.pagination?.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error cargando newsletters:', error);
    } finally {
      setLoadingNewsletters(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files.slice(0, 10)); // Máximo 10 imágenes
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('Completa título y contenido');
      return;
    }

    setCreating(true);

    try {
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('template', formData.template);

      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const url = editingNewsletter
        ? `/api/newsletters/${editingNewsletter.id}`
        : '/api/newsletters';
      const method = editingNewsletter ? 'PUT' : 'POST';

      const res = await authenticatedFetch(url, {
        method,
        body: formDataToSend
      });

      const data = await res.json();

      if (res.ok) {
        setShowCreateModal(false);
        setEditingNewsletter(null);
        setSelectedImages([]);
        setFormData({
          title: '',
          content: '',
          template: 'default'
        });
        fetchNewsletters(currentPage);
        alert(`Newsletter ${editingNewsletter ? 'actualizada' : 'creada'} exitosamente`);
      } else {
        alert(data.message || 'Error guardando newsletter');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error guardando newsletter');
    } finally {
      setCreating(false);
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta newsletter?')) return;

    try {
      const res = await authenticatedFetch(`/api/newsletters/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchNewsletters(currentPage);
        alert('Newsletter eliminada exitosamente');
      } else {
        alert('Error eliminando newsletter');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando newsletter');
    }
  };

  const editNewsletter = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      content: newsletter.content,
      template: newsletter.template
    });
    setSelectedImages([]);
    setShowCreateModal(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'SENT':
        return <Send className="w-5 h-5 text-blue-500" />;
      case 'DRAFT':
      default:
        return <Clock className="w-5 h-5 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'Publicada';
      case 'SENT':
        return 'Enviada';
      case 'DRAFT':
      default:
        return 'Borrador';
    }
  };

  if (loading || !hasPermission) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/20 to-indigo-50/10">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

        <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 lg:gap-8">
            <div className="flex-1 w-full lg:w-auto">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Marketing</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                Mis <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Newsletters</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Crea newsletters profesionales para promocionar tus propiedades y mantener contacto con tus clientes.
              </p>

              <button
                onClick={() => setShowCreateModal(true)}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nueva Newsletter
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Lista de newsletters */}
        {loadingNewsletters ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Mail className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay newsletters creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primera newsletter de marketing
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primera Newsletter
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {newsletters.map((newsletter) => (
                <div key={newsletter.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Preview */}
                  <div className="h-32 bg-gray-200 relative">
                    {newsletter.images.length > 0 ? (
                      <img
                        src={newsletter.images[0]}
                        alt={newsletter.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Mail className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Status overlay */}
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                        {getStatusIcon(newsletter.status)}
                        <span className="hidden sm:inline">{getStatusText(newsletter.status)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Información */}
                  <div className="p-3">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm truncate">
                      {newsletter.title}
                    </h3>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <FileText className="w-3 h-3 text-blue-600" />
                        <span>{new Date(newsletter.createdAt).toLocaleDateString('es-AR')}</span>
                      </div>
                      {newsletter.images.length > 0 && (
                        <div className="flex items-center gap-1">
                          <ImageIcon className="w-3 h-3 text-purple-600" />
                          <span>{newsletter.images.length} imagen(es)</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => editNewsletter(newsletter)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
                        Editar
                      </button>

                      <button
                        onClick={() => deleteNewsletter(newsletter.id)}
                        className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={() => currentPage > 1 && fetchNewsletters(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => fetchNewsletters(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${
                        currentPage === page
                          ? 'bg-blue-600 text-white'
                          : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => currentPage < totalPages && fetchNewsletters(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                </button>
              </div>
            )}

            {/* Información de paginación */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Mostrando {newsletters.length} de {totalNewsletters} newsletters
            </div>
          </>
        )}

        {/* Modal de creación/edición */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingNewsletter ? 'Editar Newsletter' : 'Nueva Newsletter'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Título *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Ej: Propiedades destacadas - Noviembre 2025"
                    />
                  </div>

                  {/* Plantilla */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Plantilla
                    </label>
                    <select
                      value={formData.template}
                      onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="default">Predeterminada</option>
                      <option value="modern">Moderna</option>
                      <option value="classic">Clásica</option>
                    </select>
                  </div>

                  {/* Contenido */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contenido *
                    </label>
                    <div className="border border-gray-300 rounded-md">
                      <ReactQuill
                        value={formData.content}
                        onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                        theme="snow"
                        placeholder="Escribe el contenido de tu newsletter..."
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  </div>

                  {/* Subida de imágenes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes
                    </label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        onChange={handleImageSelect}
                        className="hidden"
                        id="image-upload"
                      />
                      <label
                        htmlFor="image-upload"
                        className="cursor-pointer flex flex-col items-center"
                      >
                        <Upload className="w-12 h-12 text-gray-400 mb-4" />
                        <span className="text-sm text-gray-600">
                          Haz clic para seleccionar imágenes o arrastra aquí
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Máximo 10 imágenes
                        </span>
                      </label>
                    </div>

                    {/* Preview de imágenes seleccionadas */}
                    {selectedImages.length > 0 && (
                      <div className="mt-4 grid grid-cols-3 gap-2">
                        {selectedImages.map((image, index) => (
                          <div key={index} className="relative">
                            <img
                              src={URL.createObjectURL(image)}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                            <button
                              type="button"
                              onClick={() => removeImage(index)}
                              className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Imágenes existentes si editando */}
                    {editingNewsletter && editingNewsletter.images.length > 0 && (
                      <div className="mt-4">
                        <p className="text-sm text-gray-600 mb-2">Imágenes actuales:</p>
                        <div className="grid grid-cols-3 gap-2">
                          {editingNewsletter.images.map((url, index) => (
                            <img
                              key={index}
                              src={url}
                              alt={`Current ${index + 1}`}
                              className="w-full h-24 object-cover rounded"
                            />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => {
                        setShowCreateModal(false);
                        setEditingNewsletter(null);
                        setFormData({ title: '', content: '', template: 'default' });
                        setSelectedImages([]);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      disabled={creating}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {creating ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {editingNewsletter ? 'Actualizando...' : 'Creando...'}
                        </>
                      ) : (
                        editingNewsletter ? 'Actualizar Newsletter' : 'Crear Newsletter'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}