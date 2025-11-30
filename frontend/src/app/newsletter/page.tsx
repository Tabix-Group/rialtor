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

// Definición de plantillas disponibles
const AVAILABLE_TEMPLATES = [
  {
    id: 'default',
    name: 'Minimalista',
    description: 'Diseño limpio y simple, perfecto para contenido directo',
    features: [
      'Colores neutros y tipografía clara',
      'Enfoque en el contenido sin distracciones',
      'Ideal para newsletters corporativos',
      'Fácil de leer en dispositivos móviles'
    ],
    preview: {
      background: '#f9fafb',
      headerBorder: '2px solid #d1d5db',
      headerBg: '',
      textColor: '#111827',
      accentColor: '#374151',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e5e7eb',
      cardShadow: 'none'
    }
  },
  {
    id: 'modern',
    name: 'Moderna',
    description: 'Diseño contemporáneo con gradientes y elementos visuales atractivos',
    features: [
      'Gradientes azules modernos',
      'Elementos visuales destacados',
      'Perfecto para inmobiliarias modernas',
      'Alta conversión visual'
    ],
    preview: {
      background: 'linear-gradient(135deg, #eff6ff 0%, #e0e7ff 100%)',
      headerBorder: '4px solid #3b82f6',
      headerBg: '',
      textColor: '#1e40af',
      accentColor: '#2563eb',
      cardBg: '#ffffff',
      cardBorder: '1px solid #bfdbfe',
      cardShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.1)'
    }
  },
  {
    id: 'classic',
    name: 'Clásica',
    description: 'Estilo tradicional y elegante, ideal para clientes conservadores',
    features: [
      'Colores cálidos y tradicionales',
      'Tipografía serif elegante',
      'Perfecto para mercados maduros',
      'Transmite confianza y estabilidad'
    ],
    preview: {
      background: '#fef3c7',
      headerBorder: '2px solid #d97706',
      headerBg: '#fed7aa',
      textColor: '#92400e',
      accentColor: '#d97706',
      cardBg: '#fef3c7',
      cardBorder: '1px solid #fcd34d',
      cardShadow: 'none'
    }
  },
  {
    id: 'professional',
    name: 'Profesional',
    description: 'Diseño corporativo y sofisticado para comunicaciones empresariales',
    features: [
      'Paleta de colores grises profesionales',
      'Layout estructurado y organizado',
      'Ideal para comunicaciones B2B',
      'Transmite seriedad y profesionalismo'
    ],
    preview: {
      background: '#f8fafc',
      headerBorder: '2px solid #64748b',
      headerBg: '',
      textColor: '#0f172a',
      accentColor: '#475569',
      cardBg: '#ffffff',
      cardBorder: '1px solid #cbd5e1',
      cardShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
    }
  }
];

interface Newsletter {

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
  category?: {
    id: string;
    name: string;
    slug: string;
  };
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
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
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
  const [showInternationalNews, setShowInternationalNews] = useState(false);
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
  }, [showCreateModal, showInternationalNews]);

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
      const res = await authenticatedFetch('/api/news?limit=100');
      const data = await res.json();
      if (res.ok) {
        // Filtrar noticias: excluir "Internacional" por defecto, incluir solo si showInternationalNews es true
        let filteredNews = data.news || [];
        if (!showInternationalNews) {
          filteredNews = filteredNews.filter((news: NewsItem) => news.category?.name !== 'Internacional');
        }
        setAvailableNews(filteredNews);
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

  const downloadNewsletterAsPDF = async (newsletter: Newsletter) => {
    try {
      // Crear un elemento temporal con el contenido de la newsletter
      const tempDiv = document.createElement('div');
      // Aplicar estilos según la plantilla
      const getTemplateStyles = (template: string) => {
        const templateConfig = AVAILABLE_TEMPLATES.find(t => t.id === template);
        return templateConfig ? templateConfig.preview : AVAILABLE_TEMPLATES[0].preview;
      };

      const styles = getTemplateStyles(newsletter.template);

      tempDiv.style.width = '800px';
      tempDiv.style.padding = '40px';
      tempDiv.style.background = styles.background;
      tempDiv.style.fontFamily = 'Arial, sans-serif';
      tempDiv.innerHTML = `
        <div style="text-align: center; margin-bottom: 40px; ${styles.headerBorder}; padding-bottom: 20px; ${styles.headerBg ? `background-color: ${styles.headerBg}; padding: 20px; border-radius: 8px;` : ''}">
          <h1 style="color: ${styles.textColor}; font-size: 32px; margin: 0; font-weight: bold;">${newsletter.title}</h1>
          <p style="color: ${styles.accentColor}; margin: 10px 0 0 0; font-size: 14px;">${new Date(newsletter.createdAt).toLocaleDateString('es-AR')}</p>
        </div>

        <div style="margin-bottom: 40px; line-height: 1.6; color: #374151;">
          ${newsletter.content}
        </div>

        ${newsletter.agentInfo ? `
          <div style="background-color: #f9fafb; padding: 30px; border-radius: 8px; margin-bottom: 40px; border: 1px solid #e5e7eb;">
            <h3 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Sobre el Agente</h3>
            <div style="display: flex; align-items: flex-start; gap: 20px;">
              <div style="flex: 1;">
                <h4 style="color: #1f2937; font-size: 20px; margin: 0 0 10px 0; font-weight: bold;">${newsletter.agentInfo.name}</h4>
                ${newsletter.agentInfo.agency ? `<p style="color: #6b7280; margin: 0 0 15px 0; font-size: 16px;">${newsletter.agentInfo.agency}</p>` : ''}
                ${newsletter.agentInfo.bio ? `<p style="color: #374151; margin: 0 0 20px 0; line-height: 1.5;">${newsletter.agentInfo.bio}</p>` : ''}
                <div style="display: flex; flex-wrap: wrap; gap: 20px; font-size: 14px; color: #6b7280;">
                  ${newsletter.agentInfo.email ? `<div>📧 ${newsletter.agentInfo.email}</div>` : ''}
                  ${newsletter.agentInfo.phone ? `<div>📱 ${newsletter.agentInfo.phone}</div>` : ''}
                </div>
              </div>
            </div>
          </div>
        ` : ''}

        ${newsletter.news && newsletter.news.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h3 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Últimas Noticias</h3>
            <div style="display: flex; flex-direction: column; gap: 20px;">
              ${newsletter.news.map((newsId: string) => {
                const news = availableNews.find(n => n.id === newsId);
                return news ? `
                  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    <h4 style="color: #1f2937; font-size: 18px; margin: 0 0 10px 0; font-weight: bold;">${news.title}</h4>
                    <p style="color: #374151; margin: 0 0 10px 0; line-height: 1.5;">${news.synopsis}</p>
                    <p style="color: #9ca3af; margin: 0; font-size: 12px;">${news.source} • ${new Date(news.publishedAt).toLocaleDateString('es-AR')}</p>
                  </div>
                ` : '';
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${newsletter.properties && newsletter.properties.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h3 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Propiedades Destacadas</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              ${newsletter.properties.map((propertyId: string) => {
                const property = availableProperties.find(p => p.id === propertyId);
                return property ? `
                  <div style="background-color: #ffffff; padding: 20px; border-radius: 8px; border: 1px solid #e5e7eb;">
                    ${property.generatedImages.length > 0 ? `<img src="${property.generatedImages[0]}" alt="${property.title}" style="width: 100%; height: 150px; object-fit: cover; border-radius: 4px; margin-bottom: 15px;" />` : ''}
                    <h4 style="color: #1f2937; font-size: 18px; margin: 0 0 15px 0; font-weight: bold;">${property.title}</h4>
                    <div style="font-size: 14px; color: #6b7280; line-height: 1.4;">
                      <p style="margin: 0 0 5px 0;">📍 ${property.propertyData.direccion || 'Sin dirección'}</p>
                      <p style="margin: 0 0 5px 0;">🏠 ${property.propertyData.tipo}</p>
                      <p style="margin: 0; font-weight: bold; color: #059669; font-size: 16px;">${property.propertyData.moneda} ${property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}</p>
                    </div>
                  </div>
                ` : '';
              }).join('')}
            </div>
          </div>
        ` : ''}

        ${newsletter.images.length > 0 ? `
          <div style="margin-bottom: 40px;">
            <h3 style="color: #1f2937; font-size: 24px; margin: 0 0 20px 0; font-weight: bold;">Imágenes</h3>
            <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 15px;">
              ${newsletter.images.map((url, index) => `
                <img src="${url}" alt="Imagen ${index + 1}" style="width: 100%; height: 120px; object-fit: cover; border-radius: 4px;" />
              `).join('')}
            </div>
          </div>
        ` : ''}

        <div style="text-align: center; color: #9ca3af; font-size: 12px; border-top: 1px solid #e5e7eb; padding-top: 20px; margin-top: 40px;">
          <p style="margin: 0;">Newsletter creada con RIALTOR</p>
        </div>
      `;

      document.body.appendChild(tempDiv);

      const canvas = await html2canvas(tempDiv, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: 800,
        height: tempDiv.scrollHeight
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');

      const imgWidth = 210; // A4 width in mm
      const pageHeight = 295; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${newsletter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`);
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Inténtalo de nuevo.');
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

              <button
                onClick={() => setShowTemplatesModal(true)}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-slate-800/50 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:bg-slate-700/50 hover:shadow-2xl hover:shadow-slate-900/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base ml-4"
              >
                <FileText className="w-4 h-4 sm:w-5 sm:h-5 group-hover:scale-110 transition-transform duration-300" />
                Ver Plantillas
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Sección de Plantillas Disponibles */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Plantillas Disponibles</h2>
              <p className="text-gray-600">Elige la plantilla que mejor se adapte a tu estilo de comunicación</p>
            </div>
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Ver Todas las Plantillas
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_TEMPLATES.slice(0, 4).map((template) => (
              <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                   onClick={() => {
                     setFormData(prev => ({ ...prev, template: template.id }));
                     setShowCreateModal(true);
                   }}>
                {/* Preview del template */}
                <div 
                  className="h-24 p-3 flex items-center justify-center text-center"
                  style={{
                    background: template.preview.background,
                    borderBottom: template.preview.headerBorder
                  }}
                >
                  <div>
                    <h4 
                      className="text-sm font-bold"
                      style={{ color: template.preview.textColor }}
                    >
                      {template.name}
                    </h4>
                  </div>
                </div>

                {/* Información del template */}
                <div className="p-3">
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{template.description}</p>
                  <div className="text-xs text-blue-600 font-medium">
                    {template.features.length} características
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

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

                      <button
                        onClick={() => downloadNewsletterAsPDF(newsletter)}
                        className="flex items-center justify-center gap-1 bg-purple-100 text-purple-700 px-2 py-1.5 rounded text-xs hover:bg-purple-200 transition-colors"
                      >
                        <Download className="w-3 h-3" />
                        PDF
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
                        {AVAILABLE_TEMPLATES.map(template => (
                          <option key={template.id} value={template.id}>
                            {template.name} - {template.description}
                          </option>
                        ))}
                      </select>
                      
                      {/* Mostrar características de la plantilla seleccionada */}
                      {(() => {
                        const selectedTemplate = AVAILABLE_TEMPLATES.find(t => t.id === formData.template);
                        return selectedTemplate ? (
                          <div className="mt-3 p-3 bg-gray-50 rounded-md border">
                            <h4 className="text-sm font-medium text-gray-900 mb-2">{selectedTemplate.name}</h4>
                            <p className="text-xs text-gray-600 mb-2">{selectedTemplate.description}</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                              {selectedTemplate.features.map((feature, index) => (
                                <li key={index} className="flex items-center gap-1">
                                  <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : null;
                      })()}
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
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                        <Newspaper className="w-5 h-5" />
                        Incluir Noticias ({selectedNews.length} seleccionadas)
                      </h3>
                      <label className="flex items-center gap-2 text-sm text-gray-600">
                        <input
                          type="checkbox"
                          checked={showInternationalNews}
                          onChange={(e) => setShowInternationalNews(e.target.checked)}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        Incluir noticias internacionales
                      </label>
                    </div>
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

        {/* Modal de Templates */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Plantillas Disponibles</h2>
                  <button
                    onClick={() => setShowTemplatesModal(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {AVAILABLE_TEMPLATES.map((template) => (
                    <div key={template.id} className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                      {/* Preview del template */}
                      <div 
                        className="h-48 p-4 flex items-center justify-center text-center"
                        style={{
                          background: template.preview.background,
                          borderBottom: template.preview.headerBorder
                        }}
                      >
                        <div>
                          <h3 
                            className="text-xl font-bold mb-2"
                            style={{ color: template.preview.textColor }}
                          >
                            {template.name}
                          </h3>
                          <p 
                            className="text-sm"
                            style={{ color: template.preview.accentColor }}
                          >
                            Newsletter de ejemplo
                          </p>
                        </div>
                      </div>

                      {/* Información del template */}
                      <div className="p-4">
                        <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                        <p className="text-sm text-gray-600 mb-3">{template.description}</p>
                        
                        <div className="mb-4">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Características:</h5>
                          <ul className="text-xs text-gray-600 space-y-1">
                            {template.features.map((feature, index) => (
                              <li key={index} className="flex items-center gap-1">
                                <Check className="w-3 h-3 text-green-600 flex-shrink-0" />
                                {feature}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <button
                          onClick={() => {
                            setFormData(prev => ({ ...prev, template: template.id }));
                            setShowTemplatesModal(false);
                            setShowCreateModal(true);
                          }}
                          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                          Usar esta plantilla
                        </button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowTemplatesModal(false)}
                    className="bg-gray-100 text-gray-700 py-2 px-6 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Vista Previa: {previewNewsletter.title}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadNewsletterAsPDF(previewNewsletter)}
                      className="flex items-center gap-2 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Descargar PDF
                    </button>
                    <button
                      onClick={() => setShowPreviewModal(false)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-6 h-6" />
                    </button>
                  </div>
                </div>

                {/* Newsletter Preview */}
                <div className={`border border-gray-200 rounded-lg p-6 ${
                  (() => {
                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                    return template ? `bg-gradient-to-br` : 'bg-gray-50';
                  })()
                }`}
                style={{
                  background: (() => {
                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                    return template ? template.preview.background : '#f9fafb';
                  })()
                }}>
                  {/* Header */}
                  <div className={`text-center mb-8 ${
                    (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template ? `border-b-4` : 'border-b-2 border-gray-300';
                    })()
                  }`}
                  style={{
                    borderBottom: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template ? template.preview.headerBorder : '2px solid #d1d5db';
                    })(),
                    backgroundColor: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.headerBg || '';
                    })(),
                    padding: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.headerBg ? '20px' : '';
                    })(),
                    borderRadius: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.headerBg ? '8px' : '';
                    })()
                  }}>
                    <h1 className={`mb-2 font-bold ${
                      (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template ? 'text-4xl' : 'text-3xl text-gray-900';
                      })()
                    }`}
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.textColor || '#111827';
                      })()
                    }}>{previewNewsletter.title}</h1>
                    <p style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.accentColor || '#374151';
                      })()
                    }}>{new Date(previewNewsletter.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>

                  {/* Content */}
                  <div
                    className="prose prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: previewNewsletter.content }}
                  />

                  {/* Agent Info */}
                  {previewNewsletter.agentInfo && (
                    <div className={`p-6 rounded-lg border mb-8 ${
                      (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template ? 'shadow-lg' : '';
                      })()
                    }`}
                    style={{
                      backgroundColor: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.cardBg || '#ffffff';
                      })(),
                      borderColor: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                      })(),
                      boxShadow: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.cardShadow || 'none';
                      })()
                    }}>
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Sobre el Agente</h3>
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            (() => {
                              const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                              return template ? 'text-lg' : 'text-lg text-gray-900';
                            })()
                          }`}
                          style={{
                            color: (() => {
                              const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                              return template?.preview.textColor || '#1f2937';
                            })()
                          }}>{previewNewsletter.agentInfo.name}</h4>
                          {previewNewsletter.agentInfo.agency && (
                            <p className={`mb-2 ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template ? '' : 'text-gray-600';
                              })()
                            }`}
                            style={{
                              color: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.accentColor || '#6b7280';
                              })()
                            }}>{previewNewsletter.agentInfo.agency}</p>
                          )}
                          {previewNewsletter.agentInfo.bio && (
                            <p className={`mb-3 ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template ? '' : 'text-gray-700';
                              })()
                            }`}
                            style={{
                              color: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.textColor || '#374151';
                              })()
                            }}>{previewNewsletter.agentInfo.bio}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {previewNewsletter.agentInfo.email && (
                              <div className={`flex items-center gap-1 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? '' : 'text-gray-600';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.accentColor || '#6b7280';
                                })()
                              }}>
                                <Mail className="w-4 h-4" />
                                {previewNewsletter.agentInfo.email}
                              </div>
                            )}
                            {previewNewsletter.agentInfo.phone && (
                              <div className={`flex items-center gap-1 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? '' : 'text-gray-600';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.accentColor || '#6b7280';
                                })()
                              }}>
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
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Últimas Noticias</h3>
                      <div className="space-y-4">
                        {previewNewsletter.news.map((newsId: string) => {
                          const news = availableNews.find(n => n.id === newsId);
                          return news ? (
                            <div key={news.id} className={`p-4 rounded-lg border ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template ? 'shadow-md' : 'border-gray-200';
                              })()
                            }`}
                            style={{
                              backgroundColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardBg || '#ffffff';
                              })(),
                              borderColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                              })(),
                              boxShadow: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardShadow || 'none';
                              })()
                            }}>
                              <h4 className={`font-semibold mb-2 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? 'text-lg' : 'text-lg text-gray-900';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.textColor || '#1f2937';
                                })()
                              }}>{news.title}</h4>
                              <p className={`mb-2 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? '' : 'text-gray-700';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.textColor || '#374151';
                                })()
                              }}>{news.synopsis}</p>
                              <p className={`text-sm ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? '' : 'text-gray-500';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.accentColor || '#9ca3af';
                                })()
                              }}>
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
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Propiedades Destacadas</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {previewNewsletter.properties.map((propertyId: string) => {
                          const property = availableProperties.find(p => p.id === propertyId);
                          return property ? (
                            <div key={property.id} className={`p-4 rounded-lg border ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template ? 'shadow-md' : 'border-gray-200';
                              })()
                            }`}
                            style={{
                              backgroundColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardBg || '#ffffff';
                              })(),
                              borderColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                              })(),
                              boxShadow: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.cardShadow || 'none';
                              })()
                            }}>
                              {property.generatedImages.length > 0 && (
                                <img
                                  src={property.generatedImages[0]}
                                  alt={property.title}
                                  className="w-full h-32 object-cover rounded mb-3"
                                />
                              )}
                              <h4 className={`font-semibold mb-2 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template ? 'text-lg' : 'text-lg text-gray-900';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.textColor || '#1f2937';
                                })()
                              }}>{property.title}</h4>
                              <div className="space-y-1 text-sm">
                                <p className={`flex items-center gap-1 ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template ? '' : 'text-gray-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}>
                                  <MapPin className="w-4 h-4" />
                                  {property.propertyData.direccion || 'Sin dirección'}
                                </p>
                                <p className={`flex items-center gap-1 ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template ? '' : 'text-gray-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}>
                                  <Home className="w-4 h-4" />
                                  {property.propertyData.tipo}
                                </p>
                                <p className={`font-semibold text-lg ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template ? '' : 'text-green-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template?.preview.accentColor || '#059669';
                                  })()
                                }}>
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
                  <div className={`text-center text-sm border-t pt-4 ${
                    (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template ? '' : 'text-gray-500 border-gray-200';
                    })()
                  }`}
                  style={{
                    color: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.accentColor || '#9ca3af';
                    })(),
                    borderTopColor: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                    })()
                  }}>
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