'use client'

import React from "react"

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { usePermission } from '../../hooks/usePermission'
import { authenticatedFetchJson } from '@/utils/api'
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
  ImageIcon,
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
  Sparkles,
  ArrowRight,
  Palette,
  Zap,
  Crown,
  Star,
  Layout,
} from 'lucide-react'

// Importar ReactQuill dinámicamente para evitar SSR issues
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })

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
      const data = await authenticatedFetchJson(`/api/newsletters?page=${page}&limit=${limit}`);
      setNewsletters(data.newsletters || []);
      setTotalPages(data.pagination?.pages || 1);
      setTotalNewsletters(data.pagination?.total || 0);
      setCurrentPage(page);
    } catch (error) {
      console.error('Error cargando newsletters:', error);
    } finally {
      setLoadingNewsletters(false);
    }
  };

  const fetchAvailableNews = async () => {
    setLoadingNews(true);
    try {
      const data = await authenticatedFetchJson('/api/news?limit=100');
      // Filtrar noticias: excluir "Internacional" por defecto, incluir solo si showInternationalNews es true
      let filteredNews = data.news || [];
      if (!showInternationalNews) {
        filteredNews = filteredNews.filter((news: NewsItem) => news.category?.name !== 'Internacional');
      }
      setAvailableNews(filteredNews);
    } catch (error) {
      console.error('Error cargando noticias:', error);
    } finally {
      setLoadingNews(false);
    }
  };

  const fetchAvailableProperties = async () => {
    setLoadingProperties(true);
    try {
      const data = await authenticatedFetchJson('/api/placas?page=1&limit=50');
      setAvailableProperties(data.plaques || []);
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

      await authenticatedFetchJson(url, {
        method,
        body: formDataToSend
      });

      setShowCreateModal(false);
      setEditingNewsletter(null);
      resetForm();
      fetchNewsletters(currentPage);
      alert(`Newsletter ${editingNewsletter ? 'actualizada' : 'creada'} exitosamente`);
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
      await authenticatedFetchJson(`/api/newsletters/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'PUBLISHED' })
      });

      fetchNewsletters(currentPage);
      alert('Newsletter publicada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error publicando newsletter');
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta newsletter?')) return;

    try {
      await authenticatedFetchJson(`/api/newsletters/${id}`, {
        method: 'DELETE'
      });

      fetchNewsletters(currentPage);
      alert('Newsletter eliminada exitosamente');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Error eliminando newsletter');
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
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'SENT':
        return <Send className="w-4 h-4 text-blue-500" />;
      case 'DRAFT':
      default:
        return <Clock className="w-4 h-4 text-amber-500" />;
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

  const getStatusStyles = (status: string) => {
    switch (status) {
      case 'PUBLISHED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'SENT':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'DRAFT':
      default:
        return 'bg-amber-50 text-amber-700 border-amber-200';
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
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: auto;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 12pt;
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
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: auto;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 12pt;
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
                        <p style="margin: 0 0 5px 0;">${property.propertyData.direccion || 'Sin dirección'}</p>
                        <p style="margin: 0 0 5px 0;">${property.propertyData.tipo}</p>
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
            <div style="margin-bottom: 40px; page-break-inside: avoid; page-break-before: auto;">
              <h3 style="
                color: ${styles.textColor};
                font-size: 12pt;
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
                        <strong>Email:</strong> ${newsletter.agentInfo.email}
                      </div>
                    ` : ''}
                    ${newsletter.agentInfo.phone ? `
                      <div style="color: ${styles.accentColor};">
                        <strong>Tel:</strong> ${newsletter.agentInfo.phone}
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


      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
        compress: true,
        precision: 2
      });

      const pageWidth = 210; // A4 width in mm
      const pageHeight = 297; // A4 height in mm
      const margins = 10; // mm - márgenes
      const effectivePageHeight = pageHeight - (margins * 2);
      
      const imgWidth = pageWidth - (margins * 2);
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      // Calcular páginas necesarias sin repetición
      const totalPagesCount = Math.ceil(imgHeight / effectivePageHeight);
      
      // Calcular la relación de píxeles por milímetro
      const pixelsPerMM = canvas.width / imgWidth; // píxeles por mm
      const pageHeightInPixels = Math.round(effectivePageHeight * pixelsPerMM);
      
      for (let pageNum = 0; pageNum < totalPagesCount; pageNum++) {
        if (pageNum > 0) {
          pdf.addPage();
        }
        
        // Calcular la posición exacta de corte en píxeles del canvas
        const srcX = 0;
        const srcY = pageNum * pageHeightInPixels;
        const srcW = canvas.width;
        const srcH = Math.min(pageHeightInPixels, canvas.height - srcY);
        
        // Crear canvas temporal para esta página
        const pageCanvas = document.createElement('canvas');
        pageCanvas.width = srcW;
        pageCanvas.height = srcH;
        
        const ctx = pageCanvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(canvas, srcX, srcY, srcW, srcH, 0, 0, srcW, srcH);
          const pageImgData = pageCanvas.toDataURL('image/png', 1);
          
          // Agregar imagen sin repetición
          pdf.addImage(
            pageImgData, 
            'PNG', 
            margins, 
            margins, 
            imgWidth, 
            (srcH / pixelsPerMM) // Ajustar altura según lo que realmente se capturó
          );
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
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Cargando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Profesional */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="py-8 lg:py-12">
            <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-slate-900 text-white">
                    <Mail className="w-5 h-5" />
                  </div>
                  <span className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Centro de Marketing</span>
                </div>
                <h1 className="text-3xl lg:text-4xl font-bold text-slate-900 tracking-tight">
                  Newsletters
                </h1>
                <p className="mt-2 text-base text-slate-600 max-w-xl">
                  Crea y gestiona newsletters profesionales para mantener a tus clientes informados
                </p>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowTemplatesModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 hover:border-slate-400 transition-all"
                >
                  <Palette className="w-4 h-4" />
                  Ver Plantillas
                </button>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  Nueva Newsletter
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 lg:px-8 py-8">
        {/* Sección de Plantillas Disponibles */}
        <section className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Plantillas Disponibles</h2>
              <p className="text-sm text-slate-500 mt-0.5">Selecciona un diseño profesional para tu newsletter</p>
            </div>
            <button
              onClick={() => setShowTemplatesModal(true)}
              className="text-sm font-medium text-slate-600 hover:text-slate-900 inline-flex items-center gap-1 transition-colors"
            >
              Ver todas
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {AVAILABLE_TEMPLATES.map((template) => (
              <button
                key={template.id}
                onClick={() => {
                  setFormData(prev => ({ ...prev, template: template.id }));
                  setShowCreateModal(true);
                }}
                className="group relative bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all text-left"
              >
                {/* Preview del template */}
                <div 
                  className="h-28 flex items-center justify-center relative"
                  style={{
                    background: template.preview.headerGradient || template.preview.background
                  }}
                >
                  <div className="text-center relative z-10">
                    <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-2 group-hover:scale-110 transition-transform">
                      <Mail className="w-5 h-5" style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }} />
                    </div>
                    <span 
                      className="text-sm font-semibold"
                      style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }}
                    >
                      {template.name}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors" />
                </div>

                {/* Info */}
                <div className="p-4">
                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
                    {template.description}
                  </p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-slate-400">{template.features.length} características</span>
                    <span className="text-xs font-medium text-slate-900 opacity-0 group-hover:opacity-100 transition-opacity inline-flex items-center gap-1">
                      Usar <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* Lista de newsletters */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Mis Newsletters</h2>
              <p className="text-sm text-slate-500 mt-0.5">
                {totalNewsletters} {totalNewsletters === 1 ? 'newsletter creada' : 'newsletters creadas'}
              </p>
            </div>
          </div>

          {loadingNewsletters ? (
            <div className="flex items-center justify-center py-20">
              <div className="flex flex-col items-center gap-4">
                <div className="w-10 h-10 rounded-full border-2 border-slate-200 border-t-slate-900 animate-spin" />
                <p className="text-sm text-slate-500">Cargando newsletters...</p>
              </div>
            </div>
          ) : newsletters.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <Mail className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-2">
                No hay newsletters todavía
              </h3>
              <p className="text-sm text-slate-500 mb-6 max-w-sm mx-auto">
                Comienza creando tu primera newsletter profesional para mantener informados a tus clientes
              </p>
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-all"
              >
                <Plus className="w-4 h-4" />
                Crear Primera Newsletter
              </button>
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {newsletters.map((newsletter) => {
                  const template = AVAILABLE_TEMPLATES.find(t => t.id === newsletter.template);
                  return (
                    <div 
                      key={newsletter.id} 
                      className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-md transition-all"
                    >
                      {/* Preview */}
                      <div 
                        className="h-32 relative"
                        style={{
                          background: template?.preview.headerGradient || template?.preview.background || '#f1f5f9'
                        }}
                      >
                        {newsletter.images.length > 0 ? (
                          <img
                            src={newsletter.images[0] || "/placeholder.svg"}
                            alt={newsletter.title}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Mail className="w-8 h-8 text-white/50" />
                          </div>
                        )}

                        {/* Status Badge */}
                        <div className="absolute top-3 right-3">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${getStatusStyles(newsletter.status)}`}>
                            {getStatusIcon(newsletter.status)}
                            <span>{getStatusText(newsletter.status)}</span>
                          </div>
                        </div>

                        {/* Template Badge */}
                        <div className="absolute bottom-3 left-3">
                          <span className="inline-flex items-center px-2 py-1 rounded-md bg-black/30 backdrop-blur-sm text-xs font-medium text-white">
                            {template?.name || 'Plantilla'}
                          </span>
                        </div>
                      </div>

                      {/* Información */}
                      <div className="p-4">
                        <h3 className="font-semibold text-slate-900 mb-2 line-clamp-1 group-hover:text-slate-700 transition-colors">
                          {newsletter.title}
                        </h3>

                        <div className="flex flex-wrap gap-3 text-xs text-slate-500 mb-4">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {new Date(newsletter.createdAt).toLocaleDateString('es-AR')}
                          </span>
                          {newsletter.news && newsletter.news.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Newspaper className="w-3.5 h-3.5" />
                              {newsletter.news.length}
                            </span>
                          )}
                          {newsletter.properties && newsletter.properties.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <Home className="w-3.5 h-3.5" />
                              {newsletter.properties.length}
                            </span>
                          )}
                          {newsletter.images.length > 0 && (
                            <span className="inline-flex items-center gap-1">
                              <ImageIcon className="w-3.5 h-3.5" />
                              {newsletter.images.length}
                            </span>
                          )}
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                          <button
                            onClick={() => openPreviewModal(newsletter)}
                            className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            Ver
                          </button>

                          <button
                            onClick={() => downloadNewsletterAsPDF(newsletter)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>

                          {newsletter.status === 'DRAFT' && (
                            <button
                              onClick={() => publishNewsletter(newsletter.id)}
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-emerald-700 bg-emerald-50 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <CheckCircle className="w-3.5 h-3.5" />
                            </button>
                          )}

                          <button
                            onClick={() => editNewsletter(newsletter)}
                            className="inline-flex items-center justify-center px-2.5 py-2 text-xs text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => deleteNewsletter(newsletter.id)}
                            className="inline-flex items-center justify-center px-2.5 py-2 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Paginación */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-8">
                  <button
                    onClick={() => currentPage > 1 && fetchNewsletters(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Anterior
                  </button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                      <button
                        key={page}
                        onClick={() => fetchNewsletters(page)}
                        className={`w-10 h-10 text-sm font-medium rounded-lg transition-colors ${
                          currentPage === page
                            ? 'bg-slate-900 text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                  </div>

                  <button
                    onClick={() => currentPage < totalPages && fetchNewsletters(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </main>

      {/* Modal de creación/edición */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header del Modal */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingNewsletter ? 'Editar Newsletter' : 'Nueva Newsletter'}
                  </h2>
                  <p className="text-sm text-slate-500">Completa los campos para crear tu newsletter</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNewsletter(null);
                  resetForm();
                }}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido del Modal */}
            <div className="flex-1 overflow-y-auto p-6">
              <form onSubmit={handleSubmit} className="space-y-8">
                {/* Título y Plantilla */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Título <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.title}
                      onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all"
                      placeholder="Ej: Actualización del Mercado - Enero 2026"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      Plantilla
                    </label>
                    <select
                      value={formData.template}
                      onChange={(e) => setFormData(prev => ({ ...prev, template: e.target.value }))}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all appearance-none cursor-pointer"
                    >
                      {AVAILABLE_TEMPLATES.map(template => (
                        <option key={template.id} value={template.id}>
                          {template.name}
                        </option>
                      ))}
                    </select>
                    
                    {/* Preview de plantilla seleccionada */}
                    {(() => {
                      const selectedTemplate = AVAILABLE_TEMPLATES.find(t => t.id === formData.template);
                      return selectedTemplate ? (
                        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                          <div className="flex items-start gap-3">
                            <div 
                              className="w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0"
                              style={{ background: selectedTemplate.preview.headerGradient || selectedTemplate.preview.background }}
                            >
                              <Mail className="w-5 h-5" style={{ color: selectedTemplate.preview.headerGradient ? '#ffffff' : selectedTemplate.preview.textColor }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-sm font-semibold text-slate-900">{selectedTemplate.name}</h4>
                              <p className="text-xs text-slate-500 mt-0.5">{selectedTemplate.description}</p>
                            </div>
                          </div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>

                {/* Contenido */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Contenido <span className="text-red-500">*</span>
                  </label>
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
                    <ReactQuill
                      value={formData.content}
                      onChange={(content) => setFormData(prev => ({ ...prev, content }))}
                      theme="snow"
                      placeholder="Escribe el contenido de tu newsletter..."
                      style={{ minHeight: '250px' }}
                    />
                  </div>
                </div>

                {/* Información del Agente */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center">
                      <User className="w-5 h-5 text-slate-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Información del Agente</h3>
                      <p className="text-sm text-slate-500">Datos que aparecerán en la newsletter</p>
                    </div>
                  </div>
                  
                  {/* Foto del Agente */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-slate-700 mb-3">
                      Foto del Agente
                    </label>
                    <div className="flex items-center gap-4">
                      {agentPhotoPreview ? (
                        <div className="relative">
                          <img
                            src={agentPhotoPreview || "/placeholder.svg"}
                            alt="Preview"
                            className="w-20 h-20 rounded-full object-cover border-4 border-white shadow-md"
                          />
                          <button
                            type="button"
                            onClick={removeAgentPhoto}
                            className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600 transition-colors shadow-sm"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-slate-100 border-2 border-dashed border-slate-300 flex items-center justify-center">
                          <User className="w-8 h-8 text-slate-400" />
                        </div>
                      )}
                      <div>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleAgentPhotoSelect}
                          className="hidden"
                          id="agent-photo-upload"
                        />
                        <label
                          htmlFor="agent-photo-upload"
                          className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-white text-slate-700 rounded-lg hover:bg-slate-100 transition-colors border border-slate-200 text-sm font-medium"
                        >
                          <Upload className="w-4 h-4" />
                          {agentPhotoPreview ? 'Cambiar foto' : 'Subir foto'}
                        </label>
                        <p className="text-xs text-slate-500 mt-2">
                          Foto circular para tu perfil profesional
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Nombre Completo
                      </label>
                      <input
                        type="text"
                        value={formData.agentName}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentName: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm"
                        placeholder="Tu nombre"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Agencia / Empresa
                      </label>
                      <input
                        type="text"
                        value={formData.agency}
                        onChange={(e) => setFormData(prev => ({ ...prev, agency: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm"
                        placeholder="Nombre de tu agencia"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Email de Contacto
                      </label>
                      <input
                        type="email"
                        value={formData.agentEmail}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentEmail: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm"
                        placeholder="tu@email.com"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Teléfono
                      </label>
                      <input
                        type="tel"
                        value={formData.agentPhone}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentPhone: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm"
                        placeholder="+54 11 1234-5678"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Biografía / Descripción
                      </label>
                      <textarea
                        value={formData.agentBio}
                        onChange={(e) => setFormData(prev => ({ ...prev, agentBio: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all text-sm resize-none"
                        rows={3}
                        placeholder="Breve descripción profesional..."
                      />
                    </div>
                  </div>
                </div>

                {/* Selector de Noticias */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-100 flex items-center justify-center">
                        <Newspaper className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-slate-900">
                          Noticias
                          {selectedNews.length > 0 && (
                            <span className="ml-2 text-sm font-normal text-slate-500">
                              ({selectedNews.length} seleccionadas)
                            </span>
                          )}
                        </h3>
                        <p className="text-sm text-slate-500">Incluye noticias relevantes</p>
                      </div>
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={showInternationalNews}
                        onChange={(e) => setShowInternationalNews(e.target.checked)}
                        className="w-4 h-4 rounded border-slate-300 text-slate-900 focus:ring-slate-900"
                      />
                      Incluir internacionales
                    </label>
                  </div>
                  
                  {loadingNews ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                      {availableNews.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                          No hay noticias disponibles
                        </div>
                      ) : (
                        availableNews.map((news) => (
                          <div
                            key={news.id}
                            className={`p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors ${
                              selectedNews.includes(news.id) ? 'bg-blue-50' : ''
                            }`}
                            onClick={() => toggleNewsSelection(news.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                selectedNews.includes(news.id)
                                  ? 'bg-slate-900 border-slate-900'
                                  : 'border-slate-300'
                              }`}>
                                {selectedNews.includes(news.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-900 line-clamp-1">{news.title}</h4>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-1">{news.synopsis}</p>
                                <p className="text-xs text-slate-400 mt-1">
                                  {news.source} • {new Date(news.publishedAt).toLocaleDateString('es-AR')}
                                </p>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Selector de Propiedades */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                      <Home className="w-5 h-5 text-emerald-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">
                        Propiedades
                        {selectedProperties.length > 0 && (
                          <span className="ml-2 text-sm font-normal text-slate-500">
                            ({selectedProperties.length} seleccionadas)
                          </span>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500">Incluye propiedades destacadas</p>
                    </div>
                  </div>
                  
                  {loadingProperties ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
                    </div>
                  ) : (
                    <div className="max-h-48 overflow-y-auto border border-slate-200 rounded-lg bg-white">
                      {availableProperties.length === 0 ? (
                        <div className="p-4 text-center text-sm text-slate-500">
                          No hay propiedades disponibles
                        </div>
                      ) : (
                        availableProperties.map((property) => (
                          <div
                            key={property.id}
                            className={`p-3 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 cursor-pointer transition-colors ${
                              selectedProperties.includes(property.id) ? 'bg-emerald-50' : ''
                            }`}
                            onClick={() => togglePropertySelection(property.id)}
                          >
                            <div className="flex items-start gap-3">
                              <div className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                                selectedProperties.includes(property.id)
                                  ? 'bg-slate-900 border-slate-900'
                                  : 'border-slate-300'
                              }`}>
                                {selectedProperties.includes(property.id) && (
                                  <Check className="w-3 h-3 text-white" />
                                )}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="text-sm font-medium text-slate-900">{property.title}</h4>
                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1">
                                  <span className="inline-flex items-center gap-1">
                                    <MapPin className="w-3 h-3" />
                                    {property.propertyData.direccion || 'Sin dirección'}
                                  </span>
                                  <span className="inline-flex items-center gap-1">
                                    <Home className="w-3 h-3" />
                                    {property.propertyData.tipo}
                                  </span>
                                  <span className="font-semibold text-emerald-600">
                                    {property.propertyData.moneda} {property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}
                                  </span>
                                </div>
                              </div>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  )}
                </div>

                {/* Subida de imágenes */}
                <div className="bg-slate-50 rounded-xl p-6 border border-slate-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                      <ImageIcon className="w-5 h-5 text-amber-600" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-slate-900">Imágenes Adicionales</h3>
                      <p className="text-sm text-slate-500">Máximo 10 imágenes</p>
                    </div>
                  </div>
                  
                  <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center bg-white hover:border-slate-400 transition-colors">
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
                      <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mb-3">
                        <Upload className="w-6 h-6 text-slate-400" />
                      </div>
                      <span className="text-sm font-medium text-slate-700">
                        Clic para seleccionar o arrastra imágenes
                      </span>
                      <span className="text-xs text-slate-500 mt-1">
                        PNG, JPG hasta 10 archivos
                      </span>
                    </label>
                  </div>

                  {/* Preview de imágenes seleccionadas */}
                  {selectedImages.length > 0 && (
                    <div className="mt-4 grid grid-cols-4 gap-3">
                      {selectedImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(image) || "/placeholder.svg"}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 w-6 h-6 bg-slate-900 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Imágenes existentes si editando */}
                  {editingNewsletter && editingNewsletter.images.length > 0 && (
                    <div className="mt-4">
                      <p className="text-sm text-slate-600 mb-2 font-medium">Imágenes actuales:</p>
                      <div className="grid grid-cols-4 gap-3">
                        {editingNewsletter.images.map((url, index) => (
                          <img
                            key={index}
                            src={url || "/placeholder.svg"}
                            alt={`Current ${index + 1}`}
                            className="w-full h-20 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </form>
            </div>

            {/* Footer del Modal */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                type="button"
                onClick={() => {
                  setShowCreateModal(false);
                  setEditingNewsletter(null);
                  resetForm();
                }}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSubmit}
                disabled={creating}
                className="px-5 py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors inline-flex items-center gap-2"
              >
                {creating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {editingNewsletter ? 'Actualizando...' : 'Creando...'}
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    {editingNewsletter ? 'Actualizar' : 'Crear Newsletter'}
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de plantillas */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Palette className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">Galería de Plantillas</h2>
                  <p className="text-sm text-slate-500">Selecciona el diseño perfecto para tu newsletter</p>
                </div>
              </div>
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Contenido */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {AVAILABLE_TEMPLATES.map((template) => (
                  <div 
                    key={template.id} 
                    className="group bg-white rounded-xl border border-slate-200 overflow-hidden hover:border-slate-300 hover:shadow-lg transition-all"
                  >
                    {/* Preview */}
                    <div 
                      className="h-44 flex items-center justify-center relative"
                      style={{
                        background: template.preview.headerGradient || template.preview.background
                      }}
                    >
                      <div className="text-center relative z-10 transform group-hover:scale-105 transition-transform">
                        <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mx-auto mb-3 border-2 border-white/30">
                          <Mail className="w-7 h-7" style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }} />
                        </div>
                        <h3 
                          className="text-xl font-bold mb-1"
                          style={{ color: template.preview.headerGradient ? '#ffffff' : template.preview.textColor }}
                        >
                          {template.name}
                        </h3>
                        <div 
                          className="h-1 w-16 mx-auto rounded-full"
                          style={{ backgroundColor: template.preview.accentGold || template.preview.accentColor }}
                        />
                      </div>
                    </div>

                    {/* Info */}
                    <div className="p-5">
                      <p className="text-sm text-slate-600 mb-4 leading-relaxed">{template.description}</p>
                      
                      <div className="mb-5">
                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Características</h4>
                        <ul className="space-y-1.5">
                          {template.features.map((feature, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                              <Check className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                              <span>{feature}</span>
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
                        className="w-full py-2.5 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors inline-flex items-center justify-center gap-2"
                      >
                        Usar esta plantilla
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-center px-6 py-4 border-t border-slate-200 bg-slate-50">
              <button
                onClick={() => setShowTemplatesModal(false)}
                className="px-5 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Vista Previa */}
      {showPreviewModal && previewNewsletter && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-slate-900 line-clamp-1">{previewNewsletter.title}</h2>
                  <p className="text-sm text-slate-500">Vista previa de la newsletter</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => downloadNewsletterAsPDF(previewNewsletter)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Descargar PDF
                </button>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Newsletter Preview */}
            <div className="flex-1 overflow-y-auto p-6">
              <div 
                className="rounded-xl overflow-hidden"
                style={{
                  background: (() => {
                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                    return template ? template.preview.background : '#f9fafb';
                  })()
                }}
              >
                {/* Header */}
                <div 
                  className="p-8 text-center"
                  style={{
                    background: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.headerGradient || template?.preview.headerBg || 'transparent';
                    })(),
                    borderBottom: (() => {
                      const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                      return template?.preview.headerBorder || 'none';
                    })()
                  }}
                >
                  <h1 
                    className="text-3xl font-bold mb-2"
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.headerGradient ? '#ffffff' : template?.preview.textColor || '#111827';
                      })()
                    }}
                  >
                    {previewNewsletter.title}
                  </h1>
                  <p 
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.headerGradient ? 'rgba(255,255,255,0.8)' : template?.preview.accentColor || '#6b7280';
                      })()
                    }}
                  >
                    {new Date(previewNewsletter.createdAt).toLocaleDateString('es-AR', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                </div>

                {/* Content */}
                <div className="p-8">
                  <div
                    className="prose prose-slate max-w-none mb-8"
                    dangerouslySetInnerHTML={{ __html: previewNewsletter.content }}
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.textColor || '#1f2937';
                      })()
                    }}
                  />

                  {/* News Section */}
                  {previewNewsletter.news && previewNewsletter.news.length > 0 && (
                    <div className="mb-8">
                      <h3 
                        className="text-xl font-semibold mb-4 pb-2 border-b-2"
                        style={{
                          color: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.textColor || '#1f2937';
                          })(),
                          borderColor: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.accentGold || template?.preview.accentColor || '#e5e7eb';
                          })()
                        }}
                      >
                        Últimas Noticias
                      </h3>
                      <div className="space-y-4">
                        {previewNewsletter.news.map((newsId: string) => {
                          const news = availableNews.find(n => n.id === newsId);
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return news ? (
                            <div 
                              key={news.id} 
                              className="p-4 rounded-xl"
                              style={{
                                backgroundColor: template?.preview.cardBg || '#ffffff',
                                border: template?.preview.cardBorder || '1px solid #e5e7eb',
                                boxShadow: template?.preview.cardShadow || 'none'
                              }}
                            >
                              <h4 
                                className="font-semibold mb-2"
                                style={{ color: template?.preview.textColor || '#1f2937' }}
                              >
                                {news.title}
                              </h4>
                              <p 
                                className="text-sm mb-2"
                                style={{ color: template?.preview.textColor || '#374151' }}
                              >
                                {news.synopsis}
                              </p>
                              <p 
                                className="text-xs"
                                style={{ color: template?.preview.accentColor || '#9ca3af' }}
                              >
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
                      <h3 
                        className="text-xl font-semibold mb-4 pb-2 border-b-2"
                        style={{
                          color: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.textColor || '#1f2937';
                          })(),
                          borderColor: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.accentGold || template?.preview.accentColor || '#e5e7eb';
                          })()
                        }}
                      >
                        Propiedades Destacadas
                      </h3>
                      <div className="grid gap-4 md:grid-cols-2">
                        {previewNewsletter.properties.map((propertyId: string) => {
                          const property = availableProperties.find(p => p.id === propertyId);
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return property ? (
                            <div 
                              key={property.id} 
                              className="rounded-xl overflow-hidden"
                              style={{
                                backgroundColor: template?.preview.cardBg || '#ffffff',
                                border: template?.preview.cardBorder || '1px solid #e5e7eb',
                                boxShadow: template?.preview.cardShadow || 'none'
                              }}
                            >
                              {property.generatedImages.length > 0 && (
                                <img
                                  src={property.generatedImages[0] || "/placeholder.svg"}
                                  alt={property.title}
                                  className="w-full h-32 object-cover"
                                />
                              )}
                              <div className="p-4">
                                <h4 
                                  className="font-semibold mb-2"
                                  style={{ color: template?.preview.textColor || '#1f2937' }}
                                >
                                  {property.title}
                                </h4>
                                <div className="space-y-1 text-sm">
                                  <p 
                                    className="flex items-center gap-1"
                                    style={{ color: template?.preview.accentColor || '#6b7280' }}
                                  >
                                    <MapPin className="w-4 h-4" />
                                    {property.propertyData.direccion || 'Sin dirección'}
                                  </p>
                                  <p 
                                    className="flex items-center gap-1"
                                    style={{ color: template?.preview.accentColor || '#6b7280' }}
                                  >
                                    <Home className="w-4 h-4" />
                                    {property.propertyData.tipo}
                                  </p>
                                  <p 
                                    className="font-semibold text-lg"
                                    style={{ color: template?.preview.textColor || '#059669' }}
                                  >
                                    {property.propertyData.moneda} {property.propertyData.precio ? parseInt(property.propertyData.precio).toLocaleString('es-AR') : 'N/A'}
                                  </p>
                                </div>
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
                      <h3 
                        className="text-xl font-semibold mb-4 pb-2 border-b-2"
                        style={{
                          color: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.textColor || '#1f2937';
                          })(),
                          borderColor: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.accentGold || template?.preview.accentColor || '#e5e7eb';
                          })()
                        }}
                      >
                        Imágenes
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {previewNewsletter.images.map((url, index) => (
                          <img
                            key={index}
                            src={url || "/placeholder.svg"}
                            alt={`Imagen ${index + 1}`}
                            className="w-full h-40 object-cover rounded-xl"
                          />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Agent Info */}
                  {previewNewsletter.agentInfo && (
                    <div 
                      className="rounded-xl p-6"
                      style={{
                        backgroundColor: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.cardBg || '#ffffff';
                        })(),
                        border: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.cardBorder || '1px solid #e5e7eb';
                        })(),
                        boxShadow: (() => {
                          const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                          return template?.preview.cardShadow || 'none';
                        })()
                      }}
                    >
                      <h3 
                        className="text-xl font-semibold mb-4"
                        style={{
                          color: (() => {
                            const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                            return template?.preview.textColor || '#1f2937';
                          })()
                        }}
                      >
                        Información del Agente
                      </h3>
                      <div className="flex items-start gap-4">
                        {previewNewsletter.agentInfo.photo && (
                          <img
                            src={previewNewsletter.agentInfo.photo || "/placeholder.svg"}
                            alt={previewNewsletter.agentInfo.name}
                            className="w-20 h-20 rounded-full object-cover"
                            style={{
                              border: `3px solid ${(() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.accentColor || '#3b82f6';
                              })()}`
                            }}
                          />
                        )}
                        <div className="flex-1">
                          <h4 
                            className="font-semibold text-lg"
                            style={{
                              color: (() => {
                                const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                return template?.preview.textColor || '#1f2937';
                              })()
                            }}
                          >
                            {previewNewsletter.agentInfo.name}
                          </h4>
                          {previewNewsletter.agentInfo.agency && (
                            <p 
                              className="mb-2"
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.accentColor || '#6b7280';
                                })()
                              }}
                            >
                              {previewNewsletter.agentInfo.agency}
                            </p>
                          )}
                          {previewNewsletter.agentInfo.bio && (
                            <p 
                              className="text-sm mb-3"
                              style={{
                                color: (() => {
                                  const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                  return template?.preview.textColor || '#374151';
                                })()
                              }}
                            >
                              {previewNewsletter.agentInfo.bio}
                            </p>
                          )}
                          <div className="flex flex-wrap gap-4 text-sm">
                            {previewNewsletter.agentInfo.email && (
                              <span 
                                className="inline-flex items-center gap-1"
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}
                              >
                                <Mail className="w-4 h-4" />
                                {previewNewsletter.agentInfo.email}
                              </span>
                            )}
                            {previewNewsletter.agentInfo.phone && (
                              <span 
                                className="inline-flex items-center gap-1"
                                style={{
                                  color: (() => {
                                    const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                                    return template?.preview.accentColor || '#6b7280';
                                  })()
                                }}
                              >
                                <Phone className="w-4 h-4" />
                                {previewNewsletter.agentInfo.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Footer */}
                  <div 
                    className="text-center text-sm pt-6 mt-8 border-t"
                    style={{
                      color: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.accentColor || '#9ca3af';
                      })(),
                      borderColor: (() => {
                        const template = AVAILABLE_TEMPLATES.find(t => t.id === previewNewsletter.template);
                        return template?.preview.accentColor || '#e5e7eb';
                      })()
                    }}
                  >
                    <p>Newsletter creada con RIALTOR</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
