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
  User,
  Building,
  MapPin,
  Phone,
  Globe,
  Check,
  X,
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

interface NewsItem {
  id: string;
  title: string;
  synopsis: string;
  source: string;
  publishedAt: string;
}

interface PropertyPlaque {
  id: string;
  title: string;
  propertyData: any;
  generatedImages: string[];
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
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [editingNewsletter, setEditingNewsletter] = useState<Newsletter | null>(null);
  const [previewNewsletter, setPreviewNewsletter] = useState<Newsletter | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    template: 'default',
    agentName: '',
    agentEmail: '',
    agentPhone: '',
    agency: '',
    agentBio: ''
  });
  const [selectedNews, setSelectedNews] = useState<string[]>([]);
  const [selectedProperties, setSelectedProperties] = useState<string[]>([]);
  const [availableNews, setAvailableNews] = useState<NewsItem[]>([]);
  const [availableProperties, setAvailableProperties] = useState<PropertyPlaque[]>([]);
  const [loadingNews, setLoadingNews] = useState(false);
  const [loadingProperties, setLoadingProperties] = useState(false);
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

  // Cargar noticias y propiedades disponibles cuando se abre el modal
  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableNews();
      fetchAvailableProperties();
    }
  }, [showCreateModal]);

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

  const fetchAvailableNews = async () => {
    setLoadingNews(true);
    try {
      const res = await authenticatedFetch('/api/news?limit=50');
      const data = await res.json();
      if (res.ok) {
        setAvailableNews(data.news || []);
      }
    } catch (error) {
      console.error('Error cargando noticias:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchAvailableProperties = async () => {
    setLoadingProperties(true);
    try {
      const res = await authenticatedFetch('/api/placas?page=1&limit=50');
      const data = await res.json();
      if (res.ok) {
        setAvailableProperties(data.plaques || []);
      }
    } catch (error) {
      console.error('Error cargando propiedades:', error);
    } finally {
      setLoadingProperties(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files.slice(0, 10)); // Máximo 10 imágenes
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const toggleNewsSelection = (newsId: string) => {
    setSelectedNews(prev =>
      prev.includes(newsId)
        ? prev.filter(id => id !== newsId)
        : [...prev, newsId]
    );
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev =>
      prev.includes(propertyId)
        ? prev.filter(id => id !== propertyId)
        : [...prev, propertyId]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title || !formData.content) {
      alert('Completa título y contenido');
      return;
    }

    setCreating(true);

    try {
      const agentInfo = {
        name: formData.agentName,
        email: formData.agentEmail,
        phone: formData.agentPhone,
        agency: formData.agency,
        bio: formData.agentBio
      };

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('template', formData.template);
      formDataToSend.append('agentInfo', JSON.stringify(agentInfo));
      formDataToSend.append('news', JSON.stringify(selectedNews));
      formDataToSend.append('properties', JSON.stringify(selectedProperties));

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
        resetForm();
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

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      template: 'default',
      agentName: '',
      agentEmail: '',
      agentPhone: '',
      agency: '',
      agentBio: ''
    });
    setSelectedImages([]);
    setSelectedNews([]);
    setSelectedProperties([]);
  };

  const publishNewsletter = async (id: string) => {
    try {
      const res = await authenticatedFetch(`/api/newsletters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });

      if (res.ok) {
        fetchNewsletters(currentPage);
        alert('Newsletter publicada exitosamente');
      } else {
        alert('Error publicando newsletter');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error publicando newsletter');
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
      template: newsletter.template,
      agentName: newsletter.agentInfo?.name || '',
      agentEmail: newsletter.agentInfo?.email || '',
      agentPhone: newsletter.agentInfo?.phone || '',
      agency: newsletter.agentInfo?.agency || '',
      agentBio: newsletter.agentInfo?.bio || ''
    });
    setSelectedNews(newsletter.news || []);
    setSelectedProperties(newsletter.properties || []);
    setSelectedImages([]);
    setShowCreateModal(true);
  };

  const openPreviewModal = (newsletter: Newsletter) => {
    setPreviewNewsletter(newsletter);
    setShowPreviewModal(true);
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
                Crea newsletters profesionales con contenido, noticias e información para tus clientes.
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
              Comienza creando tu primera newsletter de marketing con contenido e información
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
                      {newsletter.news && newsletter.news.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Newspaper className="w-3 h-3 text-green-600" />
                          <span>{newsletter.news.length} noticia(s)</span>
                        </div>
                      )}
                      {newsletter.properties && newsletter.properties.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Home className="w-3 h-3 text-orange-600" />
                          <span>{newsletter.properties.length} propiedad(es)</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex flex-wrap gap-1">
                      <button
                        onClick={() => openPreviewModal(newsletter)}
                        className="flex-1 flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-2 py-1.5 rounded text-xs hover:bg-blue-200 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>

                      {newsletter.status === 'DRAFT' && (
                        <button
                          onClick={() => publishNewsletter(newsletter.id)}
                          className="flex items-center justify-center gap-1 bg-green-100 text-green-700 px-2 py-1.5 rounded text-xs hover:bg-green-200 transition-colors"
                        >
                          <CheckCircle className="w-3 h-3" />
                          Publicar
                        </button>
                      )}

                      <button
                        onClick={() => editNewsletter(newsletter)}
                        className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Edit className="w-3 h-3" />
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
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">
                  {editingNewsletter ? 'Editar Newsletter' : 'Nueva Newsletter'}
                </h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Título y Plantilla */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        placeholder="Ej: Actualización del Mercado Inmobiliario - Noviembre 2025"
                      />
                    </div>

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
                        placeholder="Escribe el contenido de tu newsletter. Puedes incluir información sobre el mercado, consejos, análisis, etc."
                        style={{ minHeight: '300px' }}
                      />
                    </div>
                  </div>

                  {/* Información del Agente */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <User className="w-5 h-5" />
                      Información del Agente
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nombre del Agente
                        </label>
                        <input
                          type="text"
                          value={formData.agentName}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Tu nombre completo"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Agencia
                        </label>
                        <input
                          type="text"
                          value={formData.agency}
                          onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="Nombre de tu agencia"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Email de Contacto
                        </label>
                        <input
                          type="email"
                          value={formData.agentEmail}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentEmail: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="tu@email.com"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Teléfono
                        </label>
                        <input
                          type="tel"
                          value={formData.agentPhone}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentPhone: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="+54 11 1234-5678"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Biografía / Descripción
                        </label>
                        <textarea
                          value={formData.agentBio}
                          onChange={(e) => setFormData(prev => ({ ...prev, agentBio: e.target.value }))}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          rows={3}
                          placeholder="Breve descripción sobre ti y tu experiencia en el sector inmobiliario"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Selector de Noticias */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Newspaper className="w-5 h-5" />
                      Incluir Noticias ({selectedNews.length} seleccionadas)
                    </h3>
                    {loadingNews ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        {availableNews.map((news) => (
                          <div
                            key={news.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              selectedNews.includes(news.id) ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => toggleNewsSelection(news.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                selectedNews.includes(news.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {selectedNews.includes(news.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">{news.title}</h4>
                                <p className="text-xs text-gray-600 mt-1">{news.synopsis}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                  {news.source} • {new Date(news.publishedAt).toLocaleDateString('es-AR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Selector de Propiedades */}
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <Home className="w-5 h-5" />
                      Incluir Propiedades ({selectedProperties.length} seleccionadas)
                    </h3>
                    {loadingProperties ? (
                      <div className="flex items-center justify-center py-4">
                        <Loader2 className="w-6 h-6 animate-spin" />
                      </div>
                    ) : (
                      <div className="max-h-60 overflow-y-auto border border-gray-200 rounded-md">
                        {availableProperties.map((property) => (
                          <div
                            key={property.id}
                            className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${
                              selectedProperties.includes(property.id) ? 'bg-blue-50 border-blue-200' : ''
                            }`}
                            onClick={() => togglePropertySelection(property.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center mt-0.5 ${
                                selectedProperties.includes(property.id)
                                  ? 'bg-blue-600 border-blue-600'
                                  : 'border-gray-300'
                              }`}>
                                {selectedProperties.includes(property.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium text-sm text-gray-900">{property.title}</h4>
                                <div className="flex items-center gap-4 text-xs text-gray-600 mt-1">
                                  <span className="flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {property.propertyData.direccion || 'Sin dirección'}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {property.propertyData.tipo}
                                  </span>
                                  <span className="font-semibold text-green-600">
                                    {property.propertyData.moneda} {property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}
                                  </span>
                                </div>
                              </div>
                              {property.generatedImages.length > 0 && (
                                <img
                                  src={property.generatedImages[0]}
                                  alt={property.title}
                                  className="w-12 h-12 object-cover rounded"
                                />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Subida de imágenes */}
                  <div className="border-t pt-6">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes adicionales
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
                          Haz clic para seleccionar imágenes adicionales o arrastra aquí
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
                        resetForm();
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

        {/* Modal de Preview */}
        {showPreviewModal && previewNewsletter && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Vista Previa: {previewNewsletter.title}</h2>
                  <button
                    onClick={() => setShowPreviewModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                {/* Newsletter Preview */}
                <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
                  {/* Header */}
                  <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">{previewNewsletter.title}</h1>
                    <p className="text-gray-600">{new Date(previewNewsletter.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>

                  {/* Content */}
                  <div
                    className="prose prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: previewNewsletter.content }}
                  />

                  {/* Agent Info */}
                  {previewNewsletter.agentInfo && (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-8">
                      <h3 className="text-xl font-semibold mb-4">Sobre el Agente</h3>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-semibold text-lg">{previewNewsletter.agentInfo.name}</h4>
                          {previewNewsletter.agentInfo.agency && (
                            <p className="text-gray-600 mb-2">{previewNewsletter.agentInfo.agency}</p>
                          )}
                          {previewNewsletter.agentInfo.bio && (
                            <p className="text-gray-700 mb-3">{previewNewsletter.agentInfo.bio}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                            {previewNewsletter.agentInfo.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="w-4 h-4" />
                                {previewNewsletter.agentInfo.email}
                              </div>
                            )}
                            {previewNewsletter.agentInfo.phone && (
                              <div className="flex items-center gap-1">
                                <Phone className="w-4 h-4" />
                                {previewNewsletter.agentInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* News Section */}
                  {previewNewsletter.news && previewNewsletter.news.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Últimas Noticias</h3>
                      <div className="space-y-4">
                        {previewNewsletter.news.map((newsId: string) => {
                          const news = availableNews.find(n => n.id === newsId);
                          return news ? (
                            <div key={news.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              <h4 className="font-semibold text-lg mb-2">{news.title}</h4>
                              <p className="text-gray-700 mb-2">{news.synopsis}</p>
                              <p className="text-sm text-gray-500">
                                {news.source} • {new Date(news.publishedAt).toLocaleDateString('es-AR')}
                              </p>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Properties Section */}
                  {previewNewsletter.properties && previewNewsletter.properties.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Propiedades Destacadas</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {previewNewsletter.properties.map((propertyId: string) => {
                          const property = availableProperties.find(p => p.id === propertyId);
                          return property ? (
                            <div key={property.id} className="bg-white p-4 rounded-lg border border-gray-200">
                              {property.generatedImages.length > 0 && (
                                <img
                                  src={property.generatedImages[0]}
                                  alt={property.title}
                                  className="w-full h-32 object-cover rounded mb-3"
                                />
                              )}
                              <h4 className="font-semibold text-lg mb-2">{property.title}</h4>
                              <div className="space-y-1 text-sm text-gray-600">
                                <p className="flex items-center gap-1">
                                  <MapPin className="w-4 h-4" />
                                  {property.propertyData.direccion || 'Sin dirección'}
                                </p>
                                <p className="flex items-center gap-1">
                                  <Home className="w-4 h-4" />
                                  {property.propertyData.tipo}
                                </p>
                                <p className="font-semibold text-green-600 text-lg">
                                  {property.propertyData.moneda} {property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}
                                </p>
                              </div>
                            </div>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}

                  {/* Images */}
                  {previewNewsletter.images.length > 0 && (
                    <div className="mb-8">
                      <h3 className="text-xl font-semibold mb-4">Imágenes</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewNewsletter.images.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-32 object-cover rounded"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className="text-center text-gray-500 text-sm border-t border-gray-200 pt-4">
                    <p>Newsletter creada con RIALTOR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}