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
  Clock,
  User,
  MapPin,
  Phone,
  Check,
  X,
  Briefcase,
  Layout
} from 'lucide-react'

// Importar ReactQuill dinámicamente
const ReactQuill = dynamic(() => import('react-quill'), { ssr: false })
import 'react-quill/dist/quill.snow.css'

// Importar librerías de PDF
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'

// --- CONFIGURACIÓN DE DISEÑO DE ALTO NIVEL ---

const AVAILABLE_TEMPLATES = [
  {
    id: 'minimalist_pro',
    name: 'Swiss Minimalist',
    description: 'Diseño limpio, editorial y con mucho aire. Ideal para lectura enfocada.',
    features: ['Tipografía Sans-Serif moderna', 'Espaciado amplio', 'Sin distracciones', 'Estilo Arquitectónico'],
    preview: {
      bgMain: '#ffffff',
      headerBg: '#ffffff',
      headerText: '#111827',
      bodyText: '#374151',
      accent: '#000000',
      fontHeader: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      fontBody: "'Helvetica Neue', Helvetica, Arial, sans-serif",
      cardBg: '#f9fafb',
      cardBorder: '1px solid #e5e7eb',
      cardRadius: '0px',
      alignment: 'left',
      headerStyle: 'simple'
    }
  },
  {
    id: 'luxury_gold',
    name: 'Luxury Estate',
    description: 'Elegancia clásica con toques dorados y tipografía serif. Exclusividad.',
    features: ['Tipografía Serif Premium', 'Acentos Dorados', 'Estilo Revista de Lujo', 'Presentación Formal'],
    preview: {
      bgMain: '#ffffff',
      headerBg: '#1c1c1c',
      headerText: '#ffffff',
      bodyText: '#2d2d2d',
      accent: '#D4AF37', // Gold
      fontHeader: "'Playfair Display', Georgia, serif",
      fontBody: "'Georgia', serif",
      cardBg: '#ffffff',
      cardBorder: '1px solid #e8e8e8',
      cardRadius: '4px',
      alignment: 'center',
      headerStyle: 'solid_dark'
    }
  },
  {
    id: 'modern_blue',
    name: 'Corporate Tech',
    description: 'Diseño corporativo, confiable y moderno. Azul profesional.',
    features: ['Estructura Grid sólida', 'Azul Corporativo', 'Alta legibilidad', 'Estilo Ejecutivo'],
    preview: {
      bgMain: '#f8fafc',
      headerBg: 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)',
      headerText: '#ffffff',
      bodyText: '#334155',
      accent: '#2563eb',
      fontHeader: "'Inter', system-ui, sans-serif",
      fontBody: "'Inter', system-ui, sans-serif",
      cardBg: '#ffffff',
      cardBorder: 'none',
      cardShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      cardRadius: '12px',
      alignment: 'left',
      headerStyle: 'gradient'
    }
  },
  {
    id: 'warm_editorial',
    name: 'Warm Editorial',
    description: 'Tonos tierra, acogedor y cercano. Perfecto para conectar personalmente.',
    features: ['Paleta Cálida', 'Tipografía Humanista', 'Estilo Blog Premium', 'Suave a la vista'],
    preview: {
      bgMain: '#fafaf9',
      headerBg: '#fafaf9',
      headerText: '#44403c',
      bodyText: '#57534e',
      accent: '#ea580c',
      fontHeader: "'Georgia', serif",
      fontBody: "'Arial', sans-serif",
      cardBg: '#ffffff',
      cardBorder: '1px solid #e7e5e4',
      cardRadius: '8px',
      alignment: 'left',
      headerStyle: 'border_bottom'
    }
  }
];

// --- INTERFACES ---

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
  category?: { id: string; name: string; slug: string };
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
  const hasPermission = usePermission('use_placas');

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
    template: 'minimalist_pro',
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

  // Cargar datos al abrir modal
  useEffect(() => {
    if (showCreateModal) {
      fetchAvailableNews();
      fetchAvailableProperties();
    }
  }, [showCreateModal, showInternationalNews]);

  const fetchNewsletters = async (page = 1, limit = 8) => {
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
    setSelectedImages(files.slice(0, 10));
  };

  const handleAgentPhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAgentPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setAgentPhotoPreview(reader.result as string);
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
    setSelectedNews(prev => prev.includes(newsId) ? prev.filter(id => id !== newsId) : [...prev, newsId]);
  };

  const togglePropertySelection = (propertyId: string) => {
    setSelectedProperties(prev => prev.includes(propertyId) ? prev.filter(id => id !== propertyId) : [...prev, propertyId]);
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

      if (agentPhotoFile) {
        formDataToSend.append('agentPhoto', agentPhotoFile);
      }

      selectedImages.forEach(image => {
        formDataToSend.append('images', image);
      });

      const url = editingNewsletter ? `/api/newsletters/${editingNewsletter.id}` : '/api/newsletters';
      const method = editingNewsletter ? 'PUT' : 'POST';

      const res = await authenticatedFetch(url, { method, body: formDataToSend });
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
      template: 'minimalist_pro',
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
      }
    } catch (error) {
      console.error(error);
    }
  };

  const deleteNewsletter = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta newsletter?')) return;
    try {
      const res = await authenticatedFetch(`/api/newsletters/${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNewsletters(currentPage);
        alert('Newsletter eliminada');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const editNewsletter = (newsletter: Newsletter) => {
    setEditingNewsletter(newsletter);
    setFormData({
      title: newsletter.title,
      content: newsletter.content,
      template: newsletter.template || 'minimalist_pro',
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

  // --- GENERACIÓN DE PDF PROFESIONAL ---
  const downloadNewsletterAsPDF = async (newsletter: Newsletter) => {
    try {
      // 1. Obtener la configuración visual del template seleccionado
      const templateConfig = AVAILABLE_TEMPLATES.find(t => t.id === newsletter.template) || AVAILABLE_TEMPLATES[0];
      const styles = templateConfig.preview;

      // 2. Crear contenedor temporal con dimensiones A4 exactas
      const tempDiv = document.createElement('div');
      // Dimensiones A4 (210mm x 297mm) en pixels a aprox 96dpi para visualización
      tempDiv.style.width = '794px'; 
      tempDiv.style.margin = '0 auto';
      tempDiv.style.background = styles.bgMain;
      tempDiv.style.color = styles.bodyText;
      tempDiv.style.fontFamily = styles.fontBody;
      tempDiv.style.position = 'absolute';
      tempDiv.style.left = '-9999px';
      tempDiv.style.top = '0';
      
      // Estilos CSS inyectados para asegurar el renderizado
      const styleTag = document.createElement('style');
      styleTag.innerHTML = `
        .pdf-container { width: 100%; box-sizing: border-box; }
        .pdf-content img { max-width: 100%; height: auto; display: block; }
        .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
        .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; }
        .card { break-inside: avoid; page-break-inside: avoid; background: ${styles.cardBg}; border: ${styles.cardBorder}; border-radius: ${styles.cardRadius}; overflow: hidden; }
        .card-shadow { box-shadow: ${styles.cardShadow || 'none'}; }
        h1, h2, h3, h4 { font-family: ${styles.fontHeader}; margin-top: 0; }
        p { line-height: 1.6; margin-bottom: 12px; }
        .section-title { 
            font-size: 18px; 
            font-weight: bold; 
            border-bottom: 2px solid ${styles.accent}; 
            padding-bottom: 8px; 
            margin-top: 30px; 
            margin-bottom: 20px; 
            color: ${styles.headerStyle === 'solid_dark' ? '#000' : styles.accent};
            text-transform: uppercase;
            letter-spacing: 1px;
        }
      `;
      tempDiv.appendChild(styleTag);

      // 3. Construir el HTML interno (Layout Profesional)
      let headerHTML = '';
      if (styles.headerStyle === 'solid_dark') {
        headerHTML = `
          <div style="background-color: ${styles.headerBg}; color: ${styles.headerText}; padding: 60px 40px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; letter-spacing: 1px;">${newsletter.title}</h1>
            <p style="margin: 10px 0 0 0; opacity: 0.8; font-size: 14px;">${new Date(newsletter.createdAt).toLocaleDateString('es-AR', { dateStyle: 'long' })}</p>
          </div>
        `;
      } else if (styles.headerStyle === 'gradient') {
        headerHTML = `
          <div style="background: ${styles.headerBg}; color: ${styles.headerText}; padding: 50px 40px; text-align: left;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 800;">${newsletter.title}</h1>
            <div style="width: 60px; height: 4px; background: rgba(255,255,255,0.5); margin: 15px 0;"></div>
            <p style="margin: 0; font-size: 14px;">${new Date(newsletter.createdAt).toLocaleDateString('es-AR', { dateStyle: 'full' })}</p>
          </div>
        `;
      } else { // Simple / Minimalist
        headerHTML = `
          <div style="padding: 60px 40px 20px 40px; text-align: ${styles.alignment}; border-bottom: 1px solid #eee;">
            <p style="color: ${styles.accent}; font-weight: bold; font-size: 12px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 10px;">Newsletter</p>
            <h1 style="margin: 0; font-size: 42px; color: ${styles.headerText}; line-height: 1.1;">${newsletter.title}</h1>
            <p style="margin: 15px 0 0 0; color: #666; font-size: 14px;">${new Date(newsletter.createdAt).toLocaleDateString('es-AR', { dateStyle: 'long' })}</p>
          </div>
        `;
      }

      // Generar contenido de noticias
      const newsHTML = newsletter.news && newsletter.news.length > 0 ? `
        <div class="section-title">Actualidad & Mercado</div>
        <div style="display: flex; flex-direction: column; gap: 20px;">
            ${newsletter.news.map((nId: string) => {
                const n = availableNews.find(item => item.id === nId);
                if(!n) return '';
                return `
                <div class="card card-shadow" style="padding: 20px; display: flex; flex-direction: column;">
                    <h3 style="font-size: 16px; margin-bottom: 8px; color: ${styles.accent};">${n.title}</h3>
                    <p style="font-size: 13px; color: #555; flex-grow: 1;">${n.synopsis}</p>
                    <div style="font-size: 11px; color: #999; margin-top: 10px; border-top: 1px solid #eee; padding-top: 8px;">
                        ${n.source} • ${new Date(n.publishedAt).toLocaleDateString()}
                    </div>
                </div>`;
            }).join('')}
        </div>
      ` : '';

      // Generar contenido de propiedades (Grid)
      const propertiesHTML = newsletter.properties && newsletter.properties.length > 0 ? `
        <div class="section-title">Propiedades Destacadas</div>
        <div class="grid-2">
            ${newsletter.properties.map((pId: string) => {
                const p = availableProperties.find(item => item.id === pId);
                if(!p) return '';
                const imgUrl = p.generatedImages[0] || '';
                return `
                <div class="card card-shadow">
                    ${imgUrl ? `<div style="height: 160px; background-image: url('${imgUrl}'); background-size: cover; background-position: center;"></div>` : ''}
                    <div style="padding: 15px;">
                        <h4 style="margin-bottom: 5px; font-size: 15px;">${p.title}</h4>
                        <p style="font-size: 12px; color: #666; margin-bottom: 8px;">${p.propertyData.direccion || 'Consultar ubicación'}</p>
                        <p style="font-weight: bold; color: ${styles.accent}; margin: 0;">${p.propertyData.moneda} ${p.propertyData.precio}</p>
                    </div>
                </div>`;
            }).join('')}
        </div>
      ` : '';

      // Footer / Agente
      const agentHTML = newsletter.agentInfo ? `
        <div style="margin-top: 50px; padding: 30px; background-color: ${styles.cardBg}; border-top: 4px solid ${styles.accent}; display: flex; align-items: center; gap: 20px; page-break-inside: avoid;">
            ${newsletter.agentInfo.photo ? `<img src="${newsletter.agentInfo.photo}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; border: 2px solid ${styles.accent};">` : ''}
            <div>
                <h3 style="margin: 0; font-size: 20px;">${newsletter.agentInfo.name}</h3>
                <p style="margin: 2px 0 10px 0; color: ${styles.accent}; font-weight: bold;">${newsletter.agentInfo.agency || 'Agente Inmobiliario'}</p>
                <div style="font-size: 13px; color: #555;">
                    ${newsletter.agentInfo.email ? `<div>📧 ${newsletter.agentInfo.email}</div>` : ''}
                    ${newsletter.agentInfo.phone ? `<div>📱 ${newsletter.agentInfo.phone}</div>` : ''}
                </div>
            </div>
        </div>
      ` : '';

      // Ensamblar todo
      tempDiv.innerHTML = `
        <div class="pdf-container">
            ${headerHTML}
            <div style="padding: 40px;">
                <div class="pdf-content" style="font-size: 14px; margin-bottom: 30px;">
                    ${newsletter.content}
                </div>
                ${newsletter.images && newsletter.images.length > 0 ? `
                    <div class="grid-3" style="margin-bottom: 30px;">
                        ${newsletter.images.map(img => `<img src="${img}" style="border-radius: ${styles.cardRadius}; width: 100%; height: 150px; object-fit: cover;">`).join('')}
                    </div>
                ` : ''}
                ${newsHTML}
                ${propertiesHTML}
                ${agentHTML}
                <div style="text-align: center; margin-top: 40px; font-size: 10px; color: #ccc;">
                    Generado por Rialtor App
                </div>
            </div>
        </div>
      `;

      document.body.appendChild(tempDiv);

      // 4. Generar Canvas y PDF
      const canvas = await html2canvas(tempDiv, {
        scale: 2, // Calidad Retina
        useCORS: true,
        logging: false,
        backgroundColor: styles.bgMain
      });

      document.body.removeChild(tempDiv);

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 297;
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

      pdf.save(`newsletter-${newsletter.id}.pdf`);
      alert('PDF generado con éxito. Calidad profesional.');

    } catch (error) {
      console.error('Error PDF:', error);
      alert('Hubo un error generando el PDF.');
    }
  };

  if (loading || !hasPermission) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><Loader2 className="w-10 h-10 animate-spin text-blue-600" /></div>;
  }

  // --- RENDERIZADO DEL DASHBOARD ---

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header Dashboard */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Mail className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">Newsletters</h1>
                <p className="text-xs text-slate-500 hidden sm:block">Marketing y Comunicación</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setShowTemplatesModal(true)}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <Layout className="w-4 h-4" />
                Plantillas
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-sm hover:shadow transition-all"
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Nueva Newsletter</span>
                <span className="sm:hidden">Crear</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Estadísticas rápidas (Opcional visual) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full text-green-600"><CheckCircle className="w-6 h-6"/></div>
                <div><p className="text-sm text-slate-500">Publicadas</p><p className="text-2xl font-bold text-slate-800">{newsletters.filter(n => n.status === 'PUBLISHED').length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-yellow-100 rounded-full text-yellow-600"><Clock className="w-6 h-6"/></div>
                <div><p className="text-sm text-slate-500">Borradores</p><p className="text-2xl font-bold text-slate-800">{newsletters.filter(n => n.status === 'DRAFT').length}</p></div>
            </div>
            <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
                <div className="p-3 bg-purple-100 rounded-full text-purple-600"><Layout className="w-6 h-6"/></div>
                <div><p className="text-sm text-slate-500">Total</p><p className="text-2xl font-bold text-slate-800">{totalNewsletters}</p></div>
            </div>
        </div>

        {loadingNewsletters ? (
          <div className="flex justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-slate-400" /></div>
        ) : newsletters.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-slate-300">
            <Mail className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900">No hay newsletters aún</h3>
            <p className="text-slate-500 mb-6">Comienza creando contenido de valor para tus clientes.</p>
            <button onClick={() => setShowCreateModal(true)} className="text-blue-600 font-medium hover:underline">Crear primera newsletter</button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {newsletters.map((newsletter) => {
                const templateUsed = AVAILABLE_TEMPLATES.find(t => t.id === newsletter.template) || AVAILABLE_TEMPLATES[0];
                return (
                <div key={newsletter.id} className="group bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden flex flex-col h-full">
                    {/* Header visual de la card basado en el template */}
                    <div 
                        className="h-24 relative overflow-hidden" 
                        style={{ background: templateUsed.preview.headerBg.includes('gradient') ? templateUsed.preview.headerBg : templateUsed.preview.bgMain }}
                    >
                        <div className="absolute inset-0 bg-black/5"></div>
                        <div className="absolute top-3 right-3 flex gap-1">
                            <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${newsletter.status === 'PUBLISHED' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {newsletter.status === 'PUBLISHED' ? 'Publicada' : 'Borrador'}
                            </span>
                        </div>
                    </div>
                    
                    <div className="p-5 flex-1 flex flex-col">
                        <h3 className="font-bold text-slate-800 mb-2 line-clamp-2">{newsletter.title}</h3>
                        <p className="text-xs text-slate-500 mb-4">{new Date(newsletter.createdAt).toLocaleDateString()}</p>
                        
                        <div className="flex gap-2 mb-4 text-xs text-slate-600 mt-auto">
                           {newsletter.news && newsletter.news.length > 0 && <span className="flex items-center gap-1"><Newspaper className="w-3 h-3"/> {newsletter.news.length}</span>}
                           {newsletter.properties && newsletter.properties.length > 0 && <span className="flex items-center gap-1"><Home className="w-3 h-3"/> {newsletter.properties.length}</span>}
                        </div>

                        <div className="grid grid-cols-4 gap-2 pt-4 border-t border-slate-100">
                            <button onClick={() => openPreviewModal(newsletter)} className="flex justify-center items-center p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors" title="Vista Previa"><Eye className="w-4 h-4" /></button>
                            <button onClick={() => downloadNewsletterAsPDF(newsletter)} className="flex justify-center items-center p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-purple-50 hover:text-purple-600 transition-colors" title="Descargar PDF"><Download className="w-4 h-4" /></button>
                            <button onClick={() => editNewsletter(newsletter)} className="flex justify-center items-center p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-orange-50 hover:text-orange-600 transition-colors" title="Editar"><Edit className="w-4 h-4" /></button>
                            <button onClick={() => deleteNewsletter(newsletter.id)} className="flex justify-center items-center p-2 rounded-lg bg-slate-50 text-slate-600 hover:bg-red-50 hover:text-red-600 transition-colors" title="Eliminar"><Trash2 className="w-4 h-4" /></button>
                        </div>
                    </div>
                </div>
            )})}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-8">
            <button onClick={() => currentPage > 1 && fetchNewsletters(currentPage - 1)} disabled={currentPage === 1} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm">Anterior</button>
            <span className="px-4 py-2 text-sm text-slate-600">Página {currentPage} de {totalPages}</span>
            <button onClick={() => currentPage < totalPages && fetchNewsletters(currentPage + 1)} disabled={currentPage === totalPages} className="px-4 py-2 bg-white border rounded-lg disabled:opacity-50 text-sm">Siguiente</button>
            </div>
        )}
      </div>

      {/* MODAL DE CREACIÓN / EDICIÓN */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">{editingNewsletter ? 'Editar Newsletter' : 'Nueva Newsletter Profesional'}</h2>
              <button onClick={() => { setShowCreateModal(false); resetForm(); setEditingNewsletter(null); }} className="text-slate-400 hover:text-slate-600"><X className="w-5 h-5"/></button>
            </div>

            {/* Body Modal */}
            <div className="flex-1 overflow-y-auto p-6 lg:p-8">
              <form id="newsletter-form" onSubmit={handleSubmit} className="space-y-8">
                
                {/* 1. Selección de Estilo */}
                <section>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Layout className="w-4 h-4"/> 1. Estilo & Diseño</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {AVAILABLE_TEMPLATES.map(t => (
                            <div 
                                key={t.id}
                                onClick={() => setFormData(prev => ({...prev, template: t.id}))}
                                className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${formData.template === t.id ? 'border-blue-600 bg-blue-50 ring-2 ring-blue-100' : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'}`}
                            >
                                <div className="h-20 mb-3 rounded-lg overflow-hidden border border-slate-100" style={{ background: t.preview.headerBg.includes('gradient') ? t.preview.headerBg : t.preview.bgMain }}>
                                    <div className="h-full w-full flex items-center justify-center text-xs opacity-50" style={{ color: t.preview.headerText }}>Aa</div>
                                </div>
                                <h4 className="font-bold text-slate-900 text-sm">{t.name}</h4>
                                <p className="text-xs text-slate-500 mt-1 line-clamp-2">{t.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* 2. Contenido Principal */}
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-2"><FileText className="w-4 h-4"/> 2. Contenido Principal</h3>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Título Principal</label>
                        <input type="text" required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} className="w-full px-4 py-2 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none" placeholder="Ej: Resumen Inmobiliario Octubre 2025" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Cuerpo del Mensaje</label>
                        <div className="rounded-lg overflow-hidden border border-slate-300">
                            <ReactQuill theme="snow" value={formData.content} onChange={c => setFormData({...formData, content: c})} className="bg-white h-64 mb-10 sm:mb-0" />
                        </div>
                    </div>
                </section>

                {/* 3. Selección de Datos (Grid) */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Noticias */}
                    <section>
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2"><Newspaper className="w-4 h-4"/> Noticias ({selectedNews.length})</h3>
                            <label className="flex items-center gap-2 text-xs text-slate-600 cursor-pointer">
                                <input type="checkbox" checked={showInternationalNews} onChange={e => setShowInternationalNews(e.target.checked)} className="rounded text-blue-600"/> Internacionales
                            </label>
                        </div>
                        <div className="h-60 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-2">
                            {loadingNews ? <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto"/></div> : 
                                availableNews.map(n => (
                                    <div key={n.id} onClick={() => toggleNewsSelection(n.id)} className={`p-3 rounded-md cursor-pointer border transition-all ${selectedNews.includes(n.id) ? 'bg-white border-blue-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}>
                                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{n.title}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(n.publishedAt).toLocaleDateString()}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </section>

                    {/* Propiedades */}
                    <section>
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><Home className="w-4 h-4"/> Propiedades ({selectedProperties.length})</h3>
                        <div className="h-60 overflow-y-auto border border-slate-200 rounded-lg bg-slate-50 p-2 space-y-2">
                            {loadingProperties ? <div className="p-4 text-center"><Loader2 className="w-5 h-5 animate-spin mx-auto"/></div> : 
                                availableProperties.map(p => (
                                    <div key={p.id} onClick={() => togglePropertySelection(p.id)} className={`p-3 rounded-md cursor-pointer border transition-all ${selectedProperties.includes(p.id) ? 'bg-white border-blue-500 shadow-sm' : 'bg-transparent border-transparent hover:bg-white hover:border-slate-200'}`}>
                                        <div className="flex justify-between">
                                            <p className="text-sm font-medium text-slate-800 truncate">{p.title}</p>
                                            <p className="text-xs font-bold text-green-600">{p.propertyData.moneda} {p.propertyData.precio}</p>
                                        </div>
                                        <p className="text-xs text-slate-500 mt-1 truncate">{p.propertyData.direccion}</p>
                                    </div>
                                ))
                            }
                        </div>
                    </section>
                </div>

                {/* 4. Información Agente */}
                <section className="bg-slate-50 p-5 rounded-xl border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2"><User className="w-4 h-4"/> Firma del Agente</h3>
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="flex-shrink-0">
                            <label className="block text-xs font-medium text-slate-500 mb-2 text-center">Foto Perfil</label>
                            <div className="w-24 h-24 rounded-full bg-slate-200 border-2 border-dashed border-slate-300 flex items-center justify-center overflow-hidden relative group cursor-pointer">
                                {agentPhotoPreview ? <img src={agentPhotoPreview} className="w-full h-full object-cover"/> : <User className="w-8 h-8 text-slate-400"/>}
                                <input type="file" accept="image/*" onChange={handleAgentPhotoSelect} className="absolute inset-0 opacity-0 cursor-pointer"/>
                                <div className="absolute inset-0 bg-black/50 text-white text-xs flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">Cambiar</div>
                            </div>
                            {agentPhotoPreview && <button type="button" onClick={removeAgentPhoto} className="text-xs text-red-500 mt-2 w-full text-center hover:underline">Eliminar</button>}
                        </div>
                        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <input type="text" placeholder="Nombre Completo" value={formData.agentName} onChange={e => setFormData({...formData, agentName: e.target.value})} className="px-3 py-2 border rounded-lg text-sm"/>
                            <input type="text" placeholder="Agencia" value={formData.agency} onChange={e => setFormData({...formData, agency: e.target.value})} className="px-3 py-2 border rounded-lg text-sm"/>
                            <input type="email" placeholder="Email" value={formData.agentEmail} onChange={e => setFormData({...formData, agentEmail: e.target.value})} className="px-3 py-2 border rounded-lg text-sm"/>
                            <input type="tel" placeholder="Teléfono" value={formData.agentPhone} onChange={e => setFormData({...formData, agentPhone: e.target.value})} className="px-3 py-2 border rounded-lg text-sm"/>
                            <textarea placeholder="Breve Biografía" value={formData.agentBio} onChange={e => setFormData({...formData, agentBio: e.target.value})} className="px-3 py-2 border rounded-lg text-sm sm:col-span-2" rows={2}></textarea>
                        </div>
                    </div>
                </section>
                
                {/* 5. Imágenes Extra */}
                <section>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Imágenes Adicionales (Opcional)</label>
                    <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                        <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                        <ImageIcon className="w-8 h-8 text-slate-400 mx-auto mb-2"/>
                        <p className="text-sm text-slate-500">Arrastra imágenes aquí o haz click para seleccionar</p>
                    </div>
                    {selectedImages.length > 0 && (
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {selectedImages.map((img, idx) => (
                                <div key={idx} className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border border-slate-200">
                                    <img src={URL.createObjectURL(img)} className="w-full h-full object-cover"/>
                                    <button type="button" onClick={() => removeImage(idx)} className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 hover:bg-red-500"><X className="w-3 h-3"/></button>
                                </div>
                            ))}
                        </div>
                    )}
                </section>

              </form>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-3">
              <button type="button" onClick={() => { setShowCreateModal(false); resetForm(); }} className="px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 rounded-lg transition-colors">Cancelar</button>
              <button 
                type="submit" 
                form="newsletter-form" 
                disabled={creating}
                className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 shadow-lg shadow-blue-600/20 disabled:opacity-50 flex items-center gap-2"
              >
                {creating && <Loader2 className="w-4 h-4 animate-spin"/>}
                {editingNewsletter ? 'Guardar Cambios' : 'Generar Newsletter'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE TEMPLATES (Galería) */}
      {showTemplatesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-6xl max-h-[90vh] overflow-y-auto p-8 relative">
            <button onClick={() => setShowTemplatesModal(false)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600"><X className="w-6 h-6"/></button>
            <div className="text-center mb-10">
              <h2 className="text-3xl font-bold text-slate-900">Diseños Disponibles</h2>
              <p className="text-slate-500 mt-2">Selecciona la estética que mejor se adapte a tu marca personal.</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              {AVAILABLE_TEMPLATES.map(template => (
                <div key={template.id} className="group border border-slate-200 rounded-2xl overflow-hidden hover:shadow-2xl transition-all duration-300 flex flex-col">
                  {/* Preview Visual */}
                  <div className="h-48 relative flex items-center justify-center p-8" style={{ background: template.preview.headerBg.includes('gradient') ? template.preview.headerBg : template.preview.bgMain }}>
                    <div className="text-center z-10">
                        <h3 className="text-2xl font-bold mb-2" style={{ color: template.preview.headerText }}>{template.name}</h3>
                        <div className="h-1 w-12 mx-auto" style={{ background: template.preview.accent }}></div>
                    </div>
                    {/* Mockup lines */}
                    <div className="absolute bottom-4 left-4 right-4 h-16 bg-white/90 backdrop-blur rounded-lg p-3 space-y-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        <div className="h-2 w-3/4 bg-slate-200 rounded"></div>
                        <div className="h-2 w-1/2 bg-slate-200 rounded"></div>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col bg-white">
                    <p className="text-slate-600 mb-4">{template.description}</p>
                    <ul className="space-y-2 mb-6 flex-1">
                      {template.features.map((feat, i) => (
                        <li key={i} className="text-sm text-slate-500 flex items-center gap-2">
                          <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0"/> {feat}
                        </li>
                      ))}
                    </ul>
                    <button 
                      onClick={() => {
                        setFormData(prev => ({ ...prev, template: template.id }));
                        setShowTemplatesModal(false);
                        setShowCreateModal(true);
                      }}
                      className="w-full py-3 bg-slate-900 text-white font-medium rounded-xl hover:bg-slate-800 transition-colors"
                    >
                      Usar esta plantilla
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}