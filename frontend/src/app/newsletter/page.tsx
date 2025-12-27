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

// Importar html2canvas para generar PDFs
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// Definición de plantillas disponibles con diseños mejorados de alta gama
const AVAILABLE_TEMPLATES = [
  {
    id: 'default',
    name: 'Minimalista Premium',
    description: 'Diseño limpio y sofisticado con elegancia minimalista',
    features: [
      'Tipografía Helvetica y espaciados amplios',
      'Paleta monocromática refinada',
      'Diseño breathing space para contenido premium',
      'Experiencia de lectura excepcional'
    ],
    preview: {
      background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)',
      headerBorder: 'none',
      headerBg: '',
      headerGradient: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)',
      textColor: '#0f172a',
      accentColor: '#64748b',
      cardBg: '#ffffff',
      cardBorder: '1px solid #e2e8f0',
      cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
      headerPadding: '60px 40px',
      contentPadding: '40px',
      fontFamily: "'Helvetica Neue', Arial, sans-serif",
      lineHeight: '1.8'
    }
  },
  {
    id: 'modern',
    name: 'Vanguardia Digital',
    description: 'Diseño ultramoderno con elementos visuales de alto impacto',
    features: [
      'Gradientes vibrantes y dinámicos',
      'Elementos glassmorphism de última generación',
      'Animaciones sutiles y transiciones elegantes',
      'Perfecto para marcas innovadoras'
    ],
    preview: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 50%, #f093fb 100%)',
      headerBorder: 'none',
      headerBg: 'rgba(255, 255, 255, 0.95)',
      headerGradient: '',
      textColor: '#1a202c',
      accentColor: '#667eea',
      cardBg: 'rgba(255, 255, 255, 0.95)',
      cardBorder: '1px solid rgba(255, 255, 255, 0.3)',
      cardShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
      headerPadding: '50px 40px',
      contentPadding: '40px',
      fontFamily: "'Inter', -apple-system, sans-serif",
      lineHeight: '1.7',
      backdropBlur: 'blur(10px)'
    }
  },
  {
    id: 'classic',
    name: 'Elegancia Atemporal',
    description: 'Diseño editorial de alta categoría con toques dorados',
    features: [
      'Paleta tierra con acentos dorados',
      'Tipografía serif de revista premium',
      'Detalles ornamentales sofisticados',
      'Exuda lujo y exclusividad'
    ],
    preview: {
      background: 'linear-gradient(180deg, #fdfcfb 0%, #f6f3ed 100%)',
      headerBorder: '3px solid #d4af37',
      headerBg: '',
      headerGradient: 'linear-gradient(135deg, #8b7355 0%, #a0826d 100%)',
      textColor: '#5a4a3a',
      accentColor: '#d4af37',
      cardBg: '#fffaf5',
      cardBorder: '2px solid #e8d5c4',
      cardShadow: '0 8px 16px rgba(139, 115, 85, 0.15)',
      headerPadding: '50px 40px',
      contentPadding: '40px',
      fontFamily: "'Playfair Display', Georgia, serif",
      lineHeight: '1.9',
      accentGold: '#d4af37'
    }
  },
  {
    id: 'professional',
    name: 'Corporativo Elite',
    description: 'Diseño ejecutivo de nivel C-Suite con máxima sofisticación',
    features: [
      'Esquema de color navy y platinum',
      'Estructura grid de precisión suiza',
      'Micro-interacciones profesionales',
      'Autoridad y credibilidad máxima'
    ],
    preview: {
      background: 'linear-gradient(180deg, #f8fafc 0%, #e2e8f0 100%)',
      headerBorder: 'none',
      headerBg: '',
      headerGradient: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 50%, #3b82f6 100%)',
      textColor: '#1e293b',
      accentColor: '#3b82f6',
      cardBg: '#ffffff',
      cardBorder: '1px solid #cbd5e1',
      cardShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      headerPadding: '60px 40px',
      contentPadding: '40px',
      fontFamily: "'SF Pro Display', -apple-system, sans-serif",
      lineHeight: '1.75',
      accentLine: '4px solid #3b82f6'
    }
  }
];

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
    agentBio: '',
    agentPhoto: ''
  });
  const [agentPhotoFile, setAgentPhotoFile] = useState<File | null>(null);
  const [agentPhotoPreview, setAgentPhotoPreview] = useState<string>('');
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

  const handleAgentPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAgentPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAgentPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeAgentPhoto = () => {
    setAgentPhotoFile(null);
    setAgentPhotoPreview('');
    setFormData(prev => ({ ...prev, agentPhoto: '' }));
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
        bio: formData.agentBio,
        photo: formData.agentPhoto
      };

      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('content', formData.content);
      formDataToSend.append('template', formData.template);
      formDataToSend.append('agentInfo', JSON.stringify(agentInfo));
      formDataToSend.append('news', JSON.stringify(selectedNews));
      formDataToSend.append('properties', JSON.stringify(selectedProperties));

      // Agregar foto del agente si existe
      if (agentPhotoFile) {
        formDataToSend.append('agentPhoto', agentPhotoFile);
      }

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
      agentBio: '',
      agentPhoto: ''
    });
    setSelectedImages([]);
    setSelectedNews([]);
    setSelectedProperties([]);
    setAgentPhotoFile(null);
    setAgentPhotoPreview('');
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
      agentBio: newsletter.agentInfo?.bio || '',
      agentPhoto: newsletter.agentInfo?.photo || ''
    });
    if (newsletter.agentInfo?.photo) {
      setAgentPhotoPreview(newsletter.agentInfo.photo);
    }
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
      // Obtener configuración de plantilla
      const templateConfig = AVAILABLE_TEMPLATES.find(t => t.id === newsletter.template) || AVAILABLE_TEMPLATES[0];
      const styles = templateConfig.preview;

      // Crear contenedor principal con estilos mejorados
      const tempDiv = document.createElement('div');
      tempDiv.style.width = '210mm'; // A4 width
      tempDiv.style.maxWidth = '210mm';
      tempDiv.style.margin = '0 auto';
      tempDiv.style.background = '#ffffff';
      tempDiv.style.fontFamily = styles.fontFamily || "'Helvetica Neue', Arial, sans-serif";
      tempDiv.style.color = styles.textColor;
      tempDiv.style.fontSize = '11pt';
      tempDiv.style.lineHeight = styles.lineHeight || '1.6';
      tempDiv.style.overflowWrap = 'break-word';
      tempDiv.style.wordBreak = 'break-word';

      // Generar HTML con diseño profesional optimizado para PDF
      const headerBackground = styles.headerGradient || styles.headerBg || styles.background;
      const isGradientHeader = headerBackground.includes('gradient');

      tempDiv.innerHTML = `
        <div style="padding: 20mm; box-sizing: border-box; width: 100%; margin: 0; padding: 15mm 20mm;">
          <!-- Header Section -->
          <div style="
            ${isGradientHeader ? `background: ${headerBackground};` : `background-color: ${headerBackground};`}
            padding: ${styles.headerPadding || '40px'};
            margin: -15mm -20mm 30px -20mm;
            text-align: center;
            ${styles.headerBorder || ''}
            ${styles.accentLine ? `border-bottom: ${styles.accentLine};` : ''}
            page-break-inside: avoid;
          ">
            <h1 style="
              color: ${isGradientHeader ? '#ffffff' : styles.textColor};
              font-size: 28pt;
              margin: 0 0 8px 0;
              font-weight: 700;
              letter-spacing: -0.5px;
              line-height: 1.2;
            ">${newsletter.title}</h1>
            <p style="
              color: ${isGradientHeader ? 'rgba(255, 255, 255, 0.9)' : styles.accentColor};
              margin: 0;
              font-size: 10pt;
              font-weight: 500;
            ">${new Date(newsletter.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>

          <!-- Content Section -->
          <div style="
            margin-bottom: 30px;
            line-height: ${styles.lineHeight || '1.8'};
            color: ${styles.textColor};
            font-size: 11pt;
            page-break-inside: avoid;
            orphans: 3;
            widows: 3;
          ">
            ${newsletter.content}
          </div>

          <!-- News Section -->
          ${newsletter.news && newsletter.news.length > 0 ? `
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: avoid;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 16pt;
                margin: 30px 0 20px 0;
                font-weight: 700;
                ${styles.accentGold ? `border-bottom: 3px solid ${styles.accentGold}; padding-bottom: 12px;` : 'border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;'}
                page-break-inside: avoid;
                page-break-after: avoid;
                orphans: 5;
                widows: 5;
              ">Últimas Noticias</h3>
              ${newsletter.news.map((newsId: string) => {
                const news = availableNews.find(n => n.id === newsId);
                return news ? `
                  <div style="
                    background: ${styles.cardBg};
                    padding: 20px;
                    border-radius: 8px;
                    margin-bottom: 20px;
                    border: ${styles.cardBorder};
                    page-break-inside: avoid;
                    orphans: 3;
                    widows: 3;
                    min-height: 80px;
                  ">
                    <h4 style="color: ${styles.textColor}; font-size: 12pt; margin: 0 0 10px 0; font-weight: 600; line-height: 1.3;">${news.title}</h4>
                    <p style="color: ${styles.textColor}; margin: 0 0 10px 0; line-height: 1.6; font-size: 10pt;">${news.synopsis}</p>
                    <p style="color: ${styles.accentColor}; margin: 0; font-size: 8.5pt;">${news.source} • ${new Date(news.publishedAt).toLocaleDateString('es-AR')}</p>
                  </div>
                ` : '';
              }).join('')}
            </div>
          ` : ''}

          <!-- Properties Section -->
          ${newsletter.properties && newsletter.properties.length > 0 ? `
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: avoid;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 16pt;
                margin: 30px 0 20px 0;
                font-weight: 700;
                ${styles.accentGold ? `border-bottom: 3px solid ${styles.accentGold}; padding-bottom: 12px;` : 'border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;'}
                page-break-inside: avoid;
                page-break-after: avoid;
                orphans: 5;
                widows: 5;
              ">Propiedades Destacadas</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; orphans: 2; widows: 2;">
                ${newsletter.properties.map((propertyId: string) => {
                  const property = availableProperties.find(p => p.id === propertyId);
                  return property ? `
                    <div style="
                      background: ${styles.cardBg};
                      padding: 15px;
                      border-radius: 8px;
                      border: ${styles.cardBorder};
                      page-break-inside: avoid;
                      min-height: 100px;
                      margin-bottom: 10px;
                    ">
                      ${property.generatedImages.length > 0 ? `
                        <img src="${property.generatedImages[0]}" 
                             alt="${property.title}" 
                             style="width: 100%; height: 120px; object-fit: cover; border-radius: 6px; margin-bottom: 12px; display: block;" />
                      ` : ''}
                      <h4 style="color: ${styles.textColor}; font-size: 11pt; margin: 0 0 10px 0; font-weight: 600; line-height: 1.3;">${property.title}</h4>
                      <div style="font-size: 9pt; color: ${styles.accentColor}; line-height: 1.6;">
                        <p style="margin: 0 0 5px 0;">📍 ${property.propertyData.direccion || 'Sin dirección'}</p>
                        <p style="margin: 0 0 5px 0;">🏠 ${property.propertyData.tipo}</p>
                        <p style="margin: 0; font-weight: 700; color: ${styles.textColor}; font-size: 11pt;">
                          ${property.propertyData.moneda} ${property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}
                        </p>
                      </div>
                    </div>
                  ` : '';
                }).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Additional Images Section (antes del agente) -->
          ${newsletter.images && newsletter.images.length > 0 ? `
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: avoid;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 16pt;
                margin: 30px 0 20px 0;
                font-weight: 700;
                ${styles.accentGold ? `border-bottom: 3px solid ${styles.accentGold}; padding-bottom: 12px;` : 'border-bottom: 2px solid #e5e7eb; padding-bottom: 10px;'}
                page-break-inside: avoid;
                page-break-after: avoid;
                orphans: 5;
                widows: 5;
              ">Imágenes Adicionales</h3>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; orphans: 2; widows: 2; page-break-inside: avoid;">
                ${newsletter.images.map((imageUrl: string) => `
                  <div style="page-break-inside: avoid;">
                    <img src="${imageUrl}" 
                         alt="Imagen adicional" 
                         style="width: 100%; height: 150px; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);" />
                  </div>
                `).join('')}
              </div>
            </div>
          ` : ''}

          <!-- Agent Info Section (al final) -->
          ${newsletter.agentInfo ? `
            <div style="
              background: ${styles.cardBg};
              padding: 25px;
              border-radius: 12px;
              margin-bottom: 30px;
              border: ${styles.cardBorder};
              ${styles.cardShadow ? `box-shadow: ${styles.cardShadow};` : ''}
              page-break-inside: avoid;
              margin-top: 40px;
              orphans: 3;
              widows: 3;
            ">
              <h3 style="
                color: ${styles.textColor};
                font-size: 16pt;
                margin: 0 0 20px 0;
                font-weight: 700;
                ${styles.accentGold ? `border-bottom: 2px solid ${styles.accentGold}; padding-bottom: 10px;` : ''}
              ">Información del Agente</h3>
              <div style="display: flex; align-items: flex-start; gap: 20px;">
                ${newsletter.agentInfo.photo ? `
                  <div style="flex-shrink: 0;">
                    <img src="${newsletter.agentInfo.photo}" 
                         alt="${newsletter.agentInfo.name}"
                         style="
                           width: 80px;
                           height: 80px;
                           border-radius: 50%;
                           object-fit: cover;
                           border: 4px solid ${styles.accentColor};
                           box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                         " />
                  </div>
                ` : ''}
                <div style="flex: 1;">
                  <h4 style="
                    color: ${styles.textColor};
                    font-size: 14pt;
                    margin: 0 0 5px 0;
                    font-weight: 600;
                  ">${newsletter.agentInfo.name}</h4>
                  ${newsletter.agentInfo.agency ? `
                    <p style="
                      color: ${styles.accentColor};
                      margin: 0 0 12px 0;
                      font-size: 11pt;
                      font-weight: 500;
                    ">${newsletter.agentInfo.agency}</p>
                  ` : ''}
                  ${newsletter.agentInfo.bio ? `
                    <p style="
                      color: ${styles.textColor};
                      margin: 0 0 15px 0;
                      line-height: 1.6;
                      font-size: 10pt;
                    ">${newsletter.agentInfo.bio}</p>
                  ` : ''}
                  <div style="display: flex; flex-wrap: wrap; gap: 15px; font-size: 9.5pt;">
                    ${newsletter.agentInfo.email ? `
                      <div style="color: ${styles.accentColor};">
                        <strong>📧</strong> ${newsletter.agentInfo.email}
                      </div>
                    ` : ''}
                    ${newsletter.agentInfo.phone ? `
                      <div style="color: ${styles.accentColor};">
                        <strong>📱</strong> ${newsletter.agentInfo.phone}
                      </div>
                    ` : ''}
                  </div>
                </div>
              </div>
            </div>
          ` : ''}

          <!-- Footer -->
          <div style="
            text-align: center;
            color: ${styles.accentColor};
            font-size: 8pt;
            border-top: 1px solid ${styles.accentColor};
            padding-top: 15px;
            margin-top: 40px;
            page-break-inside: avoid;
          ">
            <p style="margin: 0;">Newsletter creada con RIALTOR • www.rialtor.app</p>
          </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // Generar PDF con configuración mejorada para evitar cortes
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Escala optimizada para calidad y tamaño
        useCORS: true,
        allowTaint: false,
        backgroundColor: '#ffffff',
        width: tempDiv.scrollWidth,
        windowWidth: 794, // A4 width in pixels at 96 DPI
        logging: false,
        // Agregar padding para evitar cortes en los bordes
        imageTimeout: 5000
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png', 1);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margins = 10; // mm - márgenes generosos
      const effectivePageHeight = pageHeight - (margins * 2);
      
      const imgWidth = pageWidth - (margins * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Algoritmo mejorado para evitar cortar contenido en medio de secciones
      // Divide en páginas con overlap pequeño para evitar cortes abruptos
      const totalPages = Math.ceil(imgHeight / effectivePageHeight);
      const overlap = 5; // mm de overlap para transición suave
      
      for (let pageNum = 0; pageNum < totalPages; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }
        
        // Calcular posición con overlap para evitar cortes bruscos
        let yPosition = -(pageNum * effectivePageHeight);
        
        // Para páginas intermedias, agregar overlap para no cortar elementos
        if (pageNum > 0) {
          yPosition += overlap;
        }
        
        // Agregar la imagen - usar máxima calidad
        pdf.addImage(
          imgData, 
          'PNG', 
          margins, 
          yPosition + margins, 
          imgWidth, 
          imgHeight, 
          undefined, 
          'SLOW' // Cambiar a SLOW para mejor calidad
        );
        
        // Si no es la última página, agregar una pequeña marca de continuación
        if (pageNum < totalPages - 1) {
          // Opcional: agregar indicador visual de continuación
        }
      }

      const fileName = `newsletter_${newsletter.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().getTime()}.pdf`;
      pdf.save(fileName);
      
      alert('PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-pink-500/20 to-purple-500/20 backdrop-blur-3xl"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24">
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
        <div className="bg-gradient-to-br from-white via-blue-50/30 to-purple-50/30 rounded-2xl shadow-lg border-2 border-gray-200 p-8 mb-8 relative overflow-hidden">
          {/* Decorative background elements */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-400/10 to-purple-400/10 rounded-full blur-3xl"></div>
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-pink-400/10 to-orange-400/10 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                    <FileText className="w-7 h-7 text-white" />
                  </div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                    Plantillas Premium
                  </h2>
                </div>
                <p className="text-gray-600 text-sm md:text-base">Diseños profesionales de alta gama para newsletters excepcionales</p>
              </div>
              <button
                onClick={() => setShowTemplatesModal(true)}
                className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 text-sm font-semibold hover:scale-105"
              >
                <Eye className="w-4 h-4 group-hover:scale-110 transition-transform" />
                Ver Todas las Plantillas
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {AVAILABLE_TEMPLATES.map((template) => (
                <div 
                  key={template.id} 
                  className="group relative border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-105 hover:border-blue-400 transition-all duration-300 cursor-pointer bg-white"
                  onClick={() => {
                    setFormData(prev => ({ ...prev, template: template.id }));
                    setShowCreateModal(true);
                  }}
                >
                  {/* Badge Premium */}
                  <div className="absolute top-3 right-3 z-20 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                    PRO
                  </div>

                  {/* Preview del template mejorado */}
                  <div 
                    className="h-40 flex items-center justify-center p-6 relative overflow-hidden"
                    style={{
                      background: template.preview.headerGradient || template.preview.background
                    }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="text-center relative z-10 transform group-hover:scale-110 transition-transform duration-300">
                      <div className="mb-3 inline-block">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center shadow-lg border-2 border-white/30">
                          <Mail className="w-7 h-7" style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }} />
                        </div>
                      </div>
                      <h4 
                        className="font-bold text-base mb-2 drop-shadow-sm"
                        style={{
                          color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor
                        }}
                      >
                        {template.name}
                      </h4>
                      <div 
                        className="h-1 w-20 mx-auto rounded-full shadow-sm"
                        style={{
                          backgroundColor: template.preview.accentGold || template.preview.accentColor,
                          opacity: 0.8
                        }}
                      ></div>
                    </div>
                  </div>

                  {/* Información del template mejorada */}
                  <div className="p-5 bg-gradient-to-b from-white to-gray-50/50">
                    <p className="text-xs text-gray-700 mb-3 line-clamp-2 font-medium leading-relaxed">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-blue-600">
                        <Check className="w-3.5 h-3.5" />
                        <span>{template.features.length} features</span>
                      </div>
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <span>Usar</span>
                          <Eye className="w-3.5 h-3.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
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
                    
                    {/* Foto del Agente */}
                    <div className="mb-6">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Foto del Agente (Opcional)
                      </label>
                      <div className="flex items-center gap-4">
                        {agentPhotoPreview ? (
                          <div className="relative">
                            <img
                              src={agentPhotoPreview}
                              alt="Preview"
                              className="w-24 h-24 rounded-full object-cover border-4 border-blue-100 shadow-md"
                            />
                            <button
                              type="button"
                              onClick={removeAgentPhoto}
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center">
                            <User className="w-10 h-10 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAgentPhotoSelect}
                            className="hidden"
                            id="agent-photo-upload"
                          />
                          <label
                            htmlFor="agent-photo-upload"
                            className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors border border-blue-200"
                          >
                            <Upload className="w-4 h-4" />
                            {agentPhotoPreview ? 'Cambiar foto' : 'Subir foto'}
                          </label>
                          <p className="text-xs text-gray-500 mt-2">
                            La foto aparecerá con marco circular junto a tu información
                          </p>
                        </div>
                      </div>
                    </div>

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

        {/* Modal de plantillas mejorado */}
        {showTemplatesModal && (
          <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fadeIn">
            <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-7xl w-full max-h-[90vh] overflow-y-auto border-2 border-gray-200">
              <div className="p-8">
                {/* Header del modal */}
                <div className="flex items-center justify-between mb-8 pb-6 border-b-2 border-gray-200">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-xl shadow-lg">
                      <FileText className="w-8 h-8 text-white" />
                    </div>
                    <div>
                      <h2 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-purple-800 bg-clip-text text-transparent">
                        Galería de Plantillas Premium
                      </h2>
                      <p className="text-gray-600 text-sm mt-1">Selecciona el diseño perfecto para tu newsletter</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowTemplatesModal(false)}
                    className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-all"
                  >
                    <X className="w-7 h-7" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {AVAILABLE_TEMPLATES.map((template, index) => (
                    <div 
                      key={template.id} 
                      className="group border-2 border-gray-200 rounded-2xl overflow-hidden hover:shadow-2xl hover:scale-[1.02] hover:border-blue-400 transition-all duration-300 bg-white"
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      {/* Preview del template mejorado */}
                      <div 
                        className="h-64 p-8 flex items-center justify-center text-center relative overflow-hidden"
                        style={{
                          background: template.preview.headerGradient || template.preview.background
                        }}
                      >
                        {/* Overlay decorativo */}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        
                        {/* Elementos decorativos */}
                        <div className="absolute top-4 right-4 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                        <div className="absolute bottom-4 left-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        
                        <div className="relative z-10 transform group-hover:scale-105 transition-transform duration-300">
                          <div className="mb-4 inline-block">
                            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center shadow-xl border-4 border-white/40">
                              <Mail className="w-10 h-10" style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }} />
                            </div>
                          </div>
                          <h3 
                            className="text-2xl font-bold mb-3 drop-shadow-lg"
                            style={{
                              color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor
                            }}
                          >
                            {template.name}
                          </h3>
                          <div 
                            className="h-1.5 w-24 mx-auto rounded-full shadow-lg"
                            style={{
                              backgroundColor: template.preview.accentGold || template.preview.accentColor,
                              opacity: 0.9
                            }}
                          ></div>
                          <p 
                            className="text-sm mt-3 opacity-90"
                            style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.accentColor }}
                          >
                            Newsletter Premium
                          </p>
                        </div>

                        {/* Badge Premium */}
                        <div className="absolute top-4 left-4 bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg z-20">
                          ✨ PREMIUM
                        </div>
                      </div>

                      {/* Información del template mejorada */}
                      <div className="p-6 bg-gradient-to-b from-white to-gray-50/50">
                        <div className="mb-4">
                          <h4 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h4>
                          <p className="text-sm text-gray-600 leading-relaxed">{template.description}</p>
                        </div>
                        
                        <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200">
                          <h5 className="text-sm font-bold text-gray-900 mb-3 flex items-center gap-2">
                            <Check className="w-4 h-4 text-green-600" />
                            Características destacadas:
                          </h5>
                          <ul className="text-xs text-gray-700 space-y-2">
                            {template.features.map((feature, idx) => (
                              <li key={idx} className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-green-100 flex items-center justify-center mt-0.5">
                                  <Check className="w-3 h-3 text-green-600" />
                                </span>
                                <span className="leading-relaxed">{feature}</span>
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
                          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 px-6 rounded-xl hover:shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 text-sm font-bold group hover:scale-105"
                        >
                          <span className="flex items-center justify-center gap-2">
                            Usar esta plantilla
                            <span className="group-hover:translate-x-1 transition-transform">→</span>
                          </span>
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

        {/* Modal de Vista Previa */}
        {showPreviewModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">Vista Previa: {previewNewsletter?.title}</h2>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => downloadNewsletterAsPDF(previewNewsletter!)}
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
                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                    return template ? `bg-gradient-to-br` : 'bg-gray-50';
                  })()
                }`}
                style={{
                  background: (() => {
                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                    return template ? template.preview.background : '#f9fafb';
                  })()
                }}>
                  {/* Header */}
                  <div className={`text-center mb-8 ${
                    (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template ? `border-b-4` : 'border-b-2 border-gray-300';
                    })()
                  }`}
                  style={{
                    borderBottom: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template ? template.preview.headerBorder : '2px solid #d1d5db';
                    })(),
                    backgroundColor: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template?.preview.headerBg || '';
                    })(),
                    padding: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template?.preview.headerBg ? '20px' : '';
                    })(),
                    borderRadius: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template?.preview.headerBg ? '8px' : '';
                    })()
                  }}>
                    <h1 className={`mb-2 font-bold ${
                      (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template ? 'text-4xl' : 'text-3xl text-gray-900';
                      })()
                    }`}
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template?.preview.textColor || '#111827';
                      })()
                    }}>{previewNewsletter!.title}</h1>
                    <p style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template?.preview.accentColor || '#374151';
                      })()
                    }}>{new Date(previewNewsletter!.createdAt).toLocaleDateString('es-AR')}</p>
                  </div>

                  {/* Content */}
                  <div
                    className="prose prose-lg max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: previewNewsletter!.content }}
                  />

                  {/* News Section */}
                  {previewNewsletter!.news && previewNewsletter!.news.length > 0 && (
                    <div className="mb-8">
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Últimas Noticias</h3>
                      <div className="space-y-4">
                        {previewNewsletter!.news.map((newsId: string) => {
                          const news = availableNews.find(n => n.id === newsId);
                          return news ? (
                            <div key={news.id} className={`p-4 rounded-lg border ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template ? 'shadow-md' : 'border-gray-200';
                              })()
                            }`}
                            style={{
                              backgroundColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.cardBg || '#ffffff';
                              })(),
                              borderColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                              })(),
                              boxShadow: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.cardShadow || 'none';
                              })()
                            }}>
                              <h4 className={`font-semibold mb-2 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? 'text-lg' : 'text-lg text-gray-900';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.textColor || '#1f2937';
                                })()
                              }}>{news.title}</h4>
                              <p className={`mb-2 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? '' : 'text-gray-700';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.textColor || '#374151';
                                })()
                              }}>{news.synopsis}</p>
                              <p className={`text-sm ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? '' : 'text-gray-500';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
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
                  {previewNewsletter!.properties && previewNewsletter!.properties.length > 0 && (
                    <div className="mb-8">
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Propiedades Destacadas</h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {previewNewsletter!.properties.map((propertyId: string) => {
                          const property = availableProperties.find(p => p.id === propertyId);
                          return property ? (
                            <div key={property.id} className={`p-4 rounded-lg border ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template ? 'shadow-md' : 'border-gray-200';
                              })()
                            }`}
                            style={{
                              backgroundColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.cardBg || '#ffffff';
                              })(),
                              borderColor: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                              })(),
                              boxShadow: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
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
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? 'text-lg' : 'text-lg text-gray-900';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.textColor || '#1f2937';
                                })()
                              }}>{property.title}</h4>
                              <div className="space-y-1 text-sm">
                                <p className={`flex items-center gap-1 ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                    return template ? '' : 'text-gray-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}>
                                  <MapPin className="w-4 h-4" />
                                  {property.propertyData.direccion || 'Sin dirección'}
                                </p>
                                <p className={`flex items-center gap-1 ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                    return template ? '' : 'text-gray-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}>
                                  <Home className="w-4 h-4" />
                                  {property.propertyData.tipo}
                                </p>
                                <p className={`font-semibold text-lg ${
                                  (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                    return template ? '' : 'text-green-600';
                                  })()
                                }`}
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
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

                  {/* Images - Antes de la información del agente */}
                  {previewNewsletter!.images.length > 0 && (
                    <div className="mb-8">
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Imágenes Adicionales</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewNewsletter!.images.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg shadow-md"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Info - al final */}
                  {previewNewsletter!.agentInfo && (
                    <div className={`p-6 rounded-lg border mb-8 ${
                      (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template ? 'shadow-lg' : '';
                      })()
                    }`}
                    style={{
                      backgroundColor: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template?.preview.cardBg || '#ffffff';
                      })(),
                      borderColor: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template?.preview.cardBorder.split(' ')[2] || '#e5e7eb';
                      })(),
                      boxShadow: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                        return template?.preview.cardShadow || 'none';
                      })()
                    }}>
                      <h3 className={`font-semibold mb-4 ${
                        (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template ? 'text-xl' : 'text-xl text-gray-900';
                        })()
                      }`}
                      style={{
                        color: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                          return template?.preview.textColor || '#1f2937';
                        })()
                      }}>Información del Agente</h3>
                      <div className="flex items-start gap-4">
                        {previewNewsletter!.agentInfo.photo && (
                          <div className="flex-shrink-0">
                            <img
                              src={previewNewsletter!.agentInfo.photo}
                              alt={previewNewsletter!.agentInfo.name}
                              className="w-24 h-24 rounded-full object-cover shadow-lg"
                              style={{
                                border: `4px solid ${(() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.accentColor || '#3b82f6';
                                })()}`
                              }}
                            />
                          </div>
                        )}
                        <div className="flex-1">
                          <h4 className={`font-semibold ${
                            (() => {
                              const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                              return template ? 'text-lg' : 'text-lg text-gray-900';
                            })()
                          }`}
                          style={{
                            color: (() => {
                              const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                              return template?.preview.textColor || '#1f2937';
                            })()
                          }}>{previewNewsletter!.agentInfo.name}</h4>
                          {previewNewsletter!.agentInfo.agency && (
                            <p className={`mb-2 ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template ? '' : 'text-gray-600';
                              })()
                            }`}
                            style={{
                              color: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.accentColor || '#6b7280';
                              })()
                            }}>{previewNewsletter!.agentInfo.agency}</p>
                          )}
                          {previewNewsletter!.agentInfo.bio && (
                            <p className={`mb-3 ${
                              (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template ? '' : 'text-gray-700';
                              })()
                            }`}
                            style={{
                              color: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                return template?.preview.textColor || '#374151';
                              })()
                            }}>{previewNewsletter!.agentInfo.bio}</p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {previewNewsletter!.agentInfo.email && (
                              <div className={`flex items-center gap-1 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? '' : 'text-gray-600';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.accentColor || '#6b7280';
                                })()
                              }}>
                                <Mail className="w-4 h-4" />
                                {previewNewsletter!.agentInfo.email}
                              </div>
                            )}
                            {previewNewsletter!.agentInfo.phone && (
                              <div className={`flex items-center gap-1 ${
                                (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template ? '' : 'text-gray-600';
                                })()
                              }`}
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                                  return template?.preview.accentColor || '#6b7280';
                                })()
                              }}>
                                <Phone className="w-4 h-4" />
                                {previewNewsletter!.agentInfo.phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div className={`text-center text-sm border-t pt-4 ${
                    (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template ? '' : 'text-gray-500 border-gray-200';
                    })()
                  }`}
                  style={{
                    color: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
                      return template?.preview.accentColor || '#9ca3af';
                    })(),
                    borderTopColor: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter!.template);
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
