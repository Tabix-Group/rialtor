'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { usePermission } from '../../hooks/usePermission'
import { authenticatedFetch } from '@/utils/api'
import {
  Upload,
  Image as ImageIcon,
  Trash2,
  Download,
  Eye,
  Loader2,
  Plus,
  Home,
  DollarSign,
  MapPin,
  Phone,
  Mail,
  CheckCircle,
  XCircle,
  Clock,
  Square,
  Bath,
  Bed,
  Car,
  ChevronLeft,
  ChevronRight,
  Star,
  Layout,
  Maximize,
  User,
  Check
} from 'lucide-react'

interface PropertyData {
  tipo: string;
  precio: string;
  moneda: string;
  direccion?: string;
  ambientes?: string;
  dormitorios?: string;
  banos?: string;
  cocheras?: string;
  m2_totales?: string;
  m2_cubiertos?: string;
  antiguedad?: string;
  contacto: string;
  email?: string;
  corredores: string; // nombre y matrícula de los corredores (obligatorio)
  descripcion?: string;
  agentImage?: string; // Nuevo: imagen del agente para modelo premium
  agentName?: string; // Nuevo: nombre del agente
  agency?: string; // Nuevo: agencia
  agentContact?: string; // Nuevo: contacto del agente
  url?: string; // URL personalizada para la placa
  sidebarColor?: string; // Color para Modelo 4
  brand?: string; // Marca para placas
}

interface PropertyPlaque {
  id: string;
  title: string;
  description?: string;
  propertyData: PropertyData;
  originalImages: string[];
  generatedImages: string[];
  status: 'PROCESSING' | 'GENERATING' | 'COMPLETED' | 'ERROR';
  modelType?: 'standard' | 'premium' | 'vip' | 'model4' | 'model5';
  createdAt: string;
  updatedAt: string;
}

const PLAQUE_MODEL_SUMMARY: { 
  key: 'standard' | 'premium' | 'vip' | 'model4' | 'model5'; 
  title: string; 
  description: string; 
  features: string[];
  relevantFields: string[];
}[] = [
  {
    key: 'standard',
    title: 'Modelo 1 (Esencial y Limpio)',
    description: 'Placa automática con diseño limpio y datos esenciales para publicar en minutos.',
    features: ['Diseño minimalista', 'Fácil lectura', 'Generación instantánea'],
    relevantFields: ['tipo', 'precio', 'moneda', 'direccion', 'ambientes', 'dormitorios', 'm2_totales', 'brand', 'corredores']
  },
  {
    key: 'premium',
    title: 'Modelo 2 (Profesional con Agente)',
    description: 'Incluye zócalo personalizado del agente, branding y mayor presencia de contacto.',
    features: ['Branding personal', 'Foto del agente', 'Más datos de contacto'],
    relevantFields: ['tipo', 'precio', 'moneda', 'direccion', 'ambientes', 'dormitorios', 'm2_totales', 'brand', 'corredores', 'agentName', 'agentImage', 'agentContact', 'email']
  },
  {
    key: 'vip',
    title: 'Modelo 3 (Exclusivo Editorial VIP)',
    description: 'Template exclusivo con composición de tres fotos, QR dinámico y estética editorial.',
    features: ['Composición triple', 'Estética premium', 'QR Dinámico'],
    relevantFields: ['tipo', 'precio', 'moneda', 'direccion', 'ambientes', 'dormitorios', 'banos', 'cocheras', 'm2_totales', 'm2_cubiertos', 'url', 'corredores']
  },
  {
    key: 'model4',
    title: 'Modelo 4 (Moderno Barra Lateral)',
    description: 'Diseño moderno con barra lateral traslúcida, iconos blancos y estética minimalista.',
    features: ['Barra lateral elegante', 'Tipografía moderna', 'Iconografía blanca'],
    relevantFields: ['tipo', 'precio', 'moneda', 'direccion', 'ambientes', 'dormitorios', 'banos', 'm2_totales', 'brand', 'sidebarColor', 'corredores']
  },
  {
    key: 'model5',
    title: 'Modelo 5 (Impacto Visual Enmarcado)',
    description: 'Diseño con marco perimetral y cajas de información centradas para alto impacto visual.',
    features: ['Marco envolvente', 'Cajas flotantes', 'Enfoque visual'],
    relevantFields: ['tipo', 'precio', 'moneda', 'direccion', 'ambientes', 'dormitorios', 'm2_totales', 'brand', 'corredores']
  }
];

export default function PlacasPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const hasPermission = usePermission('use_placas');

  // Estados
  const [plaques, setPlaques] = useState<PropertyPlaque[]>([]);
  const [loadingPlaques, setLoadingPlaques] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPlaques, setTotalPlaques] = useState(0);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    tipo: '',
    precio: '',
    moneda: 'USD',
    direccion: '',
    ambientes: '',
    dormitorios: '',
    banos: '',
    cocheras: '',
    m2_totales: '',
    m2_cubiertos: '',
    antiguedad: '',
    contacto: '',
    corredores: '',
    email: '',
    descripcion: '',
    agentImage: '',
    agentName: '',
    agency: '',
    agentContact: '',
    url: 'www.rialtor.app',
    sidebarColor: 'rgba(84, 74, 63, 0.7)',
    brand: 'EMPRESA'
  });
  const [modelType, setModelType] = useState<'standard' | 'premium' | 'vip' | 'model4' | 'model5'>('standard');
  const [creating, setCreating] = useState(false);
  const [selectedPlaque, setSelectedPlaque] = useState<PropertyPlaque | null>(null);
  const [agentImageFile, setAgentImageFile] = useState<File | null>(null);
  const [interiorImageFile, setInteriorImageFile] = useState<File | null>(null);
  const [exteriorImageFile, setExteriorImageFile] = useState<File | null>(null);

  // Helper para visibilidad de campos
  const isFieldVisible = (field: string) => {
    const currentModel = PLAQUE_MODEL_SUMMARY.find(m => m.key === modelType);
    return currentModel?.relevantFields.includes(field);
  };

  // Proteger ruta
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (!hasPermission) {
        // Si estÃ¡ logueado pero no tiene permiso, ir al dashboard
        router.replace('/dashboard');
      }
    }
  }, [user, loading, hasPermission, router]);

  // Cargar placas
  useEffect(() => {
    if (user && hasPermission) {
      fetchPlaques();
    }
  }, [user, hasPermission]);

  // Funciones de paginaciÃ³n
  const handlePageChange = (page: number) => {
    fetchPlaques(page);
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      handlePageChange(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      handlePageChange(currentPage + 1);
    }
  };

  // Polling para actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (plaques.some(p => ['PROCESSING', 'GENERATING'].includes(p.status))) {
        fetchPlaques();
      }
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, [plaques]);

  const fetchPlaques = async (page = 1, limit = 10) => {
    try {
      const res = await authenticatedFetch(`/api/placas?page=${page}&limit=${limit}`);
      const data = await res.json();
      if (res.ok) {
        setPlaques(data.plaques || []);
        setTotalPages(data.pagination?.pages || 1);
        setTotalPlaques(data.pagination?.total || 0);
        setCurrentPage(page);
      }
    } catch (error) {
      console.error('Error cargando placas:', error);
    } finally {
      setLoadingPlaques(false);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedImages(files.slice(0, 10)); // MÃ¡ximo 10 imÃ¡genes
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAgentImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAgentImageFile(file);
    }
  };

  const removeAgentImage = () => {
    setAgentImageFile(null);
  };

  const handleInteriorImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setInteriorImageFile(file);
    }
  };

  const handleExteriorImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setExteriorImageFile(file);
    }
  };

  const removeInteriorImage = () => {
    setInteriorImageFile(null);
  };

  const removeExteriorImage = () => {
    setExteriorImageFile(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validaciones específicas según el modelo
    if (modelType === 'vip') {
      if (!interiorImageFile || !exteriorImageFile) {
        alert('Para el modelo VIP debes seleccionar imagen interior y exterior');
        return;
      }
    } else {
      if (selectedImages.length === 0) {
        alert('Selecciona al menos una imagen');
        return;
      }
    }

    if (!propertyData.precio || !propertyData.corredores) {
      alert('Completa los campos obligatorios (precio, corredores)');
      return;
    }

    // Validación opcional para imagen del agente en premium (solo mostrar warning)
    if (modelType === 'premium' && !agentImageFile) {
      const confirmWithoutImage = confirm('Para el modelo premium se recomienda agregar la imagen del agente. ¿Desea continuar sin ella?');
      if (!confirmWithoutImage) return;
    }

    setCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', `Placa - ${propertyData.direccion || 'Nueva placa'}`);
      formData.append('description', propertyData.descripcion || '');
      formData.append('propertyData', JSON.stringify(propertyData));
      formData.append('modelType', modelType);

      // Para modelo VIP, agregar imágenes específicas
      if (modelType === 'vip') {
        if (interiorImageFile) {
          formData.append('interiorImage', interiorImageFile);
        }
        if (exteriorImageFile) {
          formData.append('exteriorImage', exteriorImageFile);
        }
        if (agentImageFile) {
          formData.append('agentImage', agentImageFile);
        }
      } else {
        // Para modelos standard y premium, agregar imágenes normales
        selectedImages.forEach(image => {
          formData.append('images', image);
        });

        // Agregar imagen del agente si existe (para premium)
        if (agentImageFile) {
          formData.append('agentImage', agentImageFile);
        }
      }

      const res = await authenticatedFetch('/api/placas', {
        method: 'POST',
        body: formData
      });

      const data = await res.json();

      if (res.ok) {
        setShowCreateModal(false);
        setSelectedImages([]);
        setPropertyData({
          tipo: '',
          precio: '',
          moneda: 'USD',
          direccion: '',
          ambientes: '',
          dormitorios: '',
          banos: '',
          cocheras: '',
          m2_totales: '',
          m2_cubiertos: '',
          antiguedad: '',
          contacto: '',
          corredores: '',
          email: '',
          descripcion: '',
          agentImage: '',
          agentName: '',
          agency: '',
          agentContact: '',
          sidebarColor: 'rgba(84, 74, 63, 0.7)',
          brand: 'EMPRESA'
        });
        setModelType('standard');
        setAgentImageFile(null);
        setInteriorImageFile(null);
        setExteriorImageFile(null);
        fetchPlaques(currentPage);
        alert('Placa creada exitosamente. El procesamiento iniciarÃ¡ en breve.');
      } else {
        alert(data.message || 'Error creando la placa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error creando la placa');
    } finally {
      setCreating(false);
    }
  };

  const deletePlaque = async (id: string) => {
    if (!confirm('Â¿EstÃ¡s seguro de eliminar esta placa?')) return;

    try {
      const res = await authenticatedFetch(`/api/placas/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        fetchPlaques(currentPage);
        alert('Placa eliminada exitosamente');
      } else {
        alert('Error eliminando la placa');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error eliminando la placa');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'ERROR':
        return <XCircle className="w-5 h-5 text-orange-500" />;
      case 'PROCESSING':
      case 'GENERATING':
        return <Clock className="w-5 h-5 text-yellow-500 animate-pulse" />;
      default:
        return <Clock className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completado';
      case 'ERROR':
        return 'Error';
      case 'PROCESSING':
        return 'Procesando...';
      case 'GENERATING':
        return 'Generando placas...';
      default:
        return 'Desconocido';
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
                <ImageIcon className="w-3 h-3 sm:w-4 sm:h-4 text-pink-400" />
                <span className="text-xs sm:text-sm font-semibold text-white">Generador IA</span>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                Mis <span className="bg-gradient-to-r from-pink-400 to-rose-400 bg-clip-text text-transparent">Placas</span>
              </h1>

              <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-6 sm:mb-8 max-w-2xl leading-relaxed">
                Crea placas profesionales para tus propiedades con IA. Diseños automáticos y personalizables.
              </p>

              <button
                onClick={() => setShowCreateModal(true)}
                className="group inline-flex items-center gap-2 sm:gap-3 bg-white text-slate-900 px-6 sm:px-8 py-3 sm:py-4 rounded-2xl hover:shadow-2xl hover:shadow-white/20 transition-all duration-300 hover:-translate-y-1 font-semibold text-sm sm:text-base"
              >
                <Plus className="w-4 h-4 sm:w-5 sm:h-5 group-hover:rotate-90 transition-transform duration-300" />
                Nueva Placa
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Lista de placas */}
        {loadingPlaques ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin" />
          </div>
        ) : plaques.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No hay placas creadas
            </h3>
            <p className="text-gray-600 mb-6">
              Comienza creando tu primera placa para propiedades
            </p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Crear Primera Placa
            </button>
          </div>
        ) : (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {plaques.map((plaque) => (
                <div key={plaque.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                  {/* Preview de imagen */}
                  <div className="h-32 bg-gray-200 relative">
                    {plaque.generatedImages.length > 0 ? (
                      <img
                        src={plaque.generatedImages[0]}
                        alt={plaque.title}
                        className="w-full h-full object-cover"
                      />
                    ) : plaque.originalImages.length > 0 ? (
                      <img
                        src={plaque.originalImages[0]}
                        alt={plaque.title}
                        className="w-full h-full object-cover opacity-50"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      </div>
                    )}

                    {/* Status overlay */}
                    <div className="absolute top-2 right-2">
                      <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs">
                        {getStatusIcon(plaque.status)}
                        <span className="hidden sm:inline">{getStatusText(plaque.status)}</span>
                      </div>
                    </div>
                  </div>

                  {/* InformaciÃ³n */}
                  <div className="p-3">
                    <div className="flex items-center justify-between mb-2 gap-2">
                      <h3 className="font-semibold text-gray-900 text-sm truncate flex-1">
                        {plaque.title}
                      </h3>
                      {plaque.modelType && (
                        <span className="text-[9px] px-1.5 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded font-bold uppercase tracking-tighter shrink-0">
                          {PLAQUE_MODEL_SUMMARY.find(m => m.key === plaque.modelType)?.title.split(' (')[0] || plaque.modelType}
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 text-xs text-gray-600 mb-3">
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-3 h-3 text-green-600" />
                        <span className="font-medium">{plaque.propertyData.moneda} {parseInt(plaque.propertyData.precio).toLocaleString('es-AR')}</span>
                      </div>
                      {plaque.propertyData.direccion && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-blue-600" />
                          <span className="truncate">{plaque.propertyData.direccion}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-1 text-xs">
                        <Home className="w-3 h-3 text-blue-600" />
                        <span>{plaque.propertyData.ambientes || 0} amb</span>
                        {plaque.propertyData.dormitorios && <span>• {plaque.propertyData.dormitorios} dorm</span>}
                        {plaque.propertyData.banos && <span>• {plaque.propertyData.banos} baños</span>}
                      </div>
                      {plaque.propertyData.m2_totales && (
                        <div className="flex items-center gap-1">
                          <Square className="w-3 h-3 text-purple-600" />
                          <span>{plaque.propertyData.m2_totales} m²</span>
                        </div>
                      )}
                    </div>

                    {/* Acciones */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setSelectedPlaque(plaque)}
                        className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Eye className="w-3 h-3" />
                        Ver
                      </button>

                      {plaque.status === 'COMPLETED' && plaque.generatedImages.length > 0 && (
                        <a
                          href={plaque.generatedImages[0]}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-2 py-1.5 rounded text-xs hover:bg-blue-200 transition-colors"
                        >
                          <Download className="w-3 h-3" />
                        </a>
                      )}

                      <button
                        onClick={() => deletePlaque(plaque.id)}
                        className="flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-2 py-1.5 rounded text-xs hover:bg-gray-200 transition-colors"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* PaginaciÃ³n */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <button
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                  Anterior
                </button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-2 text-sm font-medium rounded-md ${currentPage === page
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Siguiente
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}

            {/* Información de paginación */}
            <div className="text-center text-sm text-gray-500 mt-4">
              Mostrando {plaques.length} de {totalPlaques} placas
            </div>
          </>
        )}

        {/* Modal de creación */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-6">Nueva Placa de Propiedad</h2>

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* SUBIDA DE IMÁGENES (PASO 2) */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm mb-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <ImageIcon className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">2. Fotos de la Propiedad</h3>
                        <p className="text-sm text-slate-500">Carga las fotos que aparecerán en tu placa</p>
                      </div>
                    </div>

                    {modelType === 'vip' ? (
                      <div className="space-y-6">
                        <div className="p-4 bg-indigo-50 border border-indigo-100 rounded-xl text-xs text-indigo-700 leading-relaxed">
                          <strong>Importante:</strong> El modelo VIP requiere exactamente 3 fotos específicas: Interior, Exterior y opcionalmente el Agente.
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                          {/* Interior */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imagen Interior *</label>
                            <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
                              <input type="file" accept="image/*" onChange={handleInteriorImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                              {interiorImageFile ? (
                                <img src={URL.createObjectURL(interiorImageFile)} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <Home className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                  <span className="text-[10px] text-slate-400 mt-2">Subir Foto</span>
                                </>
                              )}
                              {interiorImageFile && (
                                <button type="button" onClick={removeInteriorImage} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg z-20"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          </div>
                          {/* Exterior */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Imagen Exterior *</label>
                            <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
                              <input type="file" accept="image/*" onChange={handleExteriorImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                              {exteriorImageFile ? (
                                <img src={URL.createObjectURL(exteriorImageFile)} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <ImageIcon className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                  <span className="text-[10px] text-slate-400 mt-2">Subir Foto</span>
                                </>
                              )}
                              {exteriorImageFile && (
                                <button type="button" onClick={removeExteriorImage} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg z-20"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          </div>
                          {/* Agente */}
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Foto Agente</label>
                            <div className="relative group overflow-hidden rounded-xl border-2 border-dashed border-slate-200 aspect-square flex flex-col items-center justify-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer">
                              <input type="file" accept="image/*" onChange={handleAgentImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                              {agentImageFile ? (
                                <img src={URL.createObjectURL(agentImageFile)} className="w-full h-full object-cover" />
                              ) : (
                                <>
                                  <User className="w-8 h-8 text-slate-300 group-hover:text-indigo-400 transition-colors" />
                                  <span className="text-[10px] text-slate-400 mt-2">Opcional</span>
                                </>
                              )}
                              {agentImageFile && (
                                <button type="button" onClick={removeAgentImage} className="absolute top-2 right-2 p-1 bg-red-500 text-white rounded-full shadow-lg z-20"><Trash2 className="w-4 h-4" /></button>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center bg-slate-50 hover:bg-white hover:border-indigo-400 transition-all cursor-pointer relative group">
                          <input type="file" multiple accept="image/*" onChange={handleImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                          <Upload className="w-10 h-10 text-slate-300 mx-auto mb-4 group-hover:text-indigo-500 group-hover:scale-110 transition-all" />
                          <p className="text-sm font-semibold text-slate-600">Haz clic o arrastra tus imágenes de propiedad</p>
                          <p className="text-xs text-slate-400 mt-1">Máximo 10 imágenes (JPG, PNG)</p>
                        </div>
                        {selectedImages.length > 0 && (
                          <div className="grid grid-cols-5 gap-3 mt-4">
                            {selectedImages.map((image, index) => (
                              <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-slate-200 group">
                                <img src={URL.createObjectURL(image)} className="w-full h-full object-cover" />
                                <button type="button" onClick={() => removeImage(index)} className="absolute top-1 right-1 p-1 bg-black/50 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-3 h-3" /></button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Selector de modelo visual (PASO 1) */}
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200 mb-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-200">
                        <Star className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">1. Selecciona el Diseño</h3>
                        <p className="text-sm text-slate-500">Cada modelo tiene una estética y campos diferentes</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {PLAQUE_MODEL_SUMMARY.map((model) => (
                        <div
                          key={model.key}
                          onClick={() => setModelType(model.key)}
                          className={`relative cursor-pointer rounded-xl border-2 p-4 transition-all duration-300 group ${
                            modelType === model.key
                              ? 'border-blue-500 bg-white shadow-xl ring-4 ring-blue-50 scale-[1.02]'
                              : 'border-slate-200 bg-slate-50/50 hover:border-slate-300 hover:bg-white hover:shadow-md'
                          }`}
                        >
                          <div className={`absolute top-3 right-3 rounded-full p-1.5 transition-all ${
                            modelType === model.key ? 'bg-blue-500 text-white' : 'bg-slate-200 text-transparent'
                          }`}>
                            <Check className="w-3 h-3" />
                          </div>
                          
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                              modelType === model.key 
                                ? 'bg-blue-600 border-blue-400 text-white shadow-lg shadow-blue-100' 
                                : 'bg-white border-slate-100 text-slate-400 group-hover:text-slate-500'
                            }`}>
                              {model.key === 'standard' && <Home className="w-6 h-6" />}
                              {model.key === 'premium' && <User className="w-6 h-6" />}
                              {model.key === 'vip' && <Star className="w-6 h-6" />}
                              {model.key === 'model4' && <Layout className="w-6 h-6" />}
                              {model.key === 'model5' && <Maximize className="w-6 h-6" />}
                            </div>

                            <div className="flex-1 min-w-0 pr-6">
                              <h4 className={`text-sm font-bold transition-colors ${
                                modelType === model.key ? 'text-blue-600' : 'text-slate-900'
                              }`}>
                                {model.title}
                              </h4>
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {model.features.slice(0, 2).map((feature, idx) => (
                                  <span key={idx} className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                                    modelType === model.key ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'
                                  }`}>
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Sección de imágenes para modelo VIP */}
                  {modelType === 'vip' && (
                    <div className="space-y-4 border-2 border-purple-200 rounded-lg p-4 bg-purple-50">
                      <h3 className="text-lg font-semibold text-purple-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5" />
                        Imágenes para Placa VIP
                      </h3>
                      <p className="text-sm text-purple-700">
                        El modelo VIP requiere 3 imágenes específicas que se compondrán sobre el template personalizado
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Imagen Interior */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen Interior *
                          </label>
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleInteriorImageSelect}
                              className="hidden"
                              id="interior-image-upload"
                            />
                            <label
                              htmlFor="interior-image-upload"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Home className="w-8 h-8 text-purple-400 mb-2" />
                              <span className="text-xs text-gray-600">Interior</span>
                            </label>
                          </div>
                          {interiorImageFile && (
                            <div className="mt-2 relative inline-block">
                              <img
                                src={URL.createObjectURL(interiorImageFile)}
                                alt="Preview interior"
                                className="w-full h-24 object-cover rounded-lg border-2 border-purple-300"
                              />
                              <button
                                type="button"
                                onClick={removeInteriorImage}
                                className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1 hover:bg-purple-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Imagen Exterior */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen Exterior *
                          </label>
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleExteriorImageSelect}
                              className="hidden"
                              id="exterior-image-upload"
                            />
                            <label
                              htmlFor="exterior-image-upload"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <ImageIcon className="w-8 h-8 text-purple-400 mb-2" />
                              <span className="text-xs text-gray-600">Exterior</span>
                            </label>
                          </div>
                          {exteriorImageFile && (
                            <div className="mt-2 relative inline-block">
                              <img
                                src={URL.createObjectURL(exteriorImageFile)}
                                alt="Preview exterior"
                                className="w-full h-24 object-cover rounded-lg border-2 border-purple-300"
                              />
                              <button
                                type="button"
                                onClick={removeExteriorImage}
                                className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1 hover:bg-purple-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>

                        {/* Imagen Agente */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Imagen Agente
                          </label>
                          <div className="border-2 border-dashed border-purple-300 rounded-lg p-3 text-center">
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleAgentImageSelect}
                              className="hidden"
                              id="vip-agent-image-upload"
                            />
                            <label
                              htmlFor="vip-agent-image-upload"
                              className="cursor-pointer flex flex-col items-center"
                            >
                              <Upload className="w-8 h-8 text-purple-400 mb-2" />
                              <span className="text-xs text-gray-600">Agente</span>
                            </label>
                          </div>
                          {agentImageFile && (
                            <div className="mt-2 relative inline-block">
                              <img
                                src={URL.createObjectURL(agentImageFile)}
                                alt="Preview agente"
                                className="w-full h-24 object-cover rounded-lg border-2 border-purple-300"
                              />
                              <button
                                type="button"
                                onClick={removeAgentImage}
                                className="absolute -top-2 -right-2 bg-purple-500 text-white rounded-full p-1 hover:bg-purple-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Datos de la propiedad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Básico siempre visible */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tipo de Propiedad</label>
                    <select
                      value={propertyData.tipo}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, tipo: e.target.value }))}
                      className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Casa">Casa</option>
                      <option value="Departamento">Departamento</option>
                      <option value="Local Comercial">Local Comercial</option>
                      <option value="Oficina">Oficina</option>
                      <option value="Terreno">Terreno</option>
                      <option value="Galpón">Galpón</option>
                    </select>
                  </div>

                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-1 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Moneda</label>
                      <select
                        value={propertyData.moneda}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, moneda: e.target.value }))}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none text-center font-bold"
                      >
                        <option value="USD">U$D</option>
                        <option value="ARS">$ AR</option>
                        <option value="EUR">€ EUR</option>
                      </select>
                    </div>
                    <div className="col-span-2 space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Precio *</label>
                      <input
                        type="number"
                        required
                        value={propertyData.precio}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, precio: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-emerald-50 focus:border-emerald-500 transition-all outline-none font-bold"
                        placeholder="Ej: 350000"
                      />
                    </div>
                  </div>

                  {/* Detalles Condicionales */}
                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible('ambientes') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Ambientes</label>
                        <input type="text" value={propertyData.ambientes} onChange={(e) => setPropertyData(prev => ({ ...prev, ambientes: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 3" />
                      </div>
                    )}

                    {isFieldVisible('dormitorios') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Dormitorios</label>
                        <input type="text" value={propertyData.dormitorios} onChange={(e) => setPropertyData(prev => ({ ...prev, dormitorios: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 2" />
                      </div>
                    )}

                    {isFieldVisible('banos') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Baños</label>
                        <input type="text" value={propertyData.banos} onChange={(e) => setPropertyData(prev => ({ ...prev, banos: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 2" />
                      </div>
                    )}

                    {isFieldVisible('cocheras') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Cocheras</label>
                        <input type="text" value={propertyData.cocheras} onChange={(e) => setPropertyData(prev => ({ ...prev, cocheras: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 1" />
                      </div>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    {isFieldVisible('m2_totales') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Superficie Total (m²)</label>
                        <input type="text" value={propertyData.m2_totales} onChange={(e) => setPropertyData(prev => ({ ...prev, m2_totales: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 120" />
                      </div>
                    )}

                    {isFieldVisible('m2_cubiertos') && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Superficie Cubierta (m²)</label>
                        <input type="text" value={propertyData.m2_cubiertos} onChange={(e) => setPropertyData(prev => ({ ...prev, m2_cubiertos: e.target.value }))}
                          className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: 85" />
                      </div>
                    )}
                  </div>

                  {isFieldVisible('direccion') && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                        <MapPin className="w-3 h-3" /> Dirección / Ubicación
                      </label>
                      <input type="text" value={propertyData.direccion} onChange={(e) => setPropertyData(prev => ({ ...prev, direccion: e.target.value }))}
                        className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: Av. Libertador 1200, Belgrano, CABA" />
                    </div>
                  )}
                </div>

                  {/* IDENTIDAD Y CONTACTO (PASO 4) */}
                  <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-10 h-10 rounded-xl bg-orange-600 flex items-center justify-center shadow-lg shadow-orange-200">
                        <Phone className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900">4. Firma y Contacto</h3>
                        <p className="text-sm text-slate-500">Configura quién firma esta placa</p>
                      </div>
                    </div>

                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-5">
                        {isFieldVisible('brand') && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Marca / Franquicia</label>
                            <input type="text" value={propertyData.brand} onChange={(e) => setPropertyData(prev => ({ ...prev, brand: e.target.value }))}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: EMPRESA Premium" />
                          </div>
                        )}

                        {isFieldVisible('url') && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Web / URL Personalizada</label>
                            <input type="text" value={propertyData.url} onChange={(e) => setPropertyData(prev => ({ ...prev, url: e.target.value }))}
                              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="www.tuweb.com.ar" />
                          </div>
                        )}
                        
                        {isFieldVisible('sidebarColor') && (
                          <div className="space-y-1.5">
                            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Color Corporativo</label>
                            <div className="grid grid-cols-4 gap-2">
                              {[
                                { name: 'Recomendado', value: 'rgba(84, 74, 63, 0.7)' },
                                { name: 'Rosado Pastel', value: 'rgba(255, 182, 193, 0.7)' },
                                { name: 'Melocotón Suave', value: 'rgba(255, 218, 185, 0.7)' },
                                { name: 'Amarillo Pastel', value: 'rgba(255, 253, 208, 0.7)' },
                                { name: 'Verde Menta', value: 'rgba(198, 239, 206, 0.7)' },
                                { name: 'Celeste Pastel', value: 'rgba(176, 224, 230, 0.7)' },
                                { name: 'Azul Cielo', value: 'rgba(173, 216, 230, 0.7)' },
                                { name: 'Violeta Suave', value: 'rgba(221, 160, 221, 0.7)' },
                                { name: 'Magenta Pastel', value: 'rgba(255, 192, 203, 0.7)' },
                              ].map((color) => (
                                <button
                                  key={color.value}
                                  onClick={() => setPropertyData(prev => ({ ...prev, sidebarColor: color.value }))}
                                  className={`group relative h-12 rounded-lg border-2 transition-all ${
                                    propertyData.sidebarColor === color.value
                                      ? 'border-slate-400 shadow-md'
                                      : 'border-slate-200 hover:border-slate-300'
                                  }`}
                                  style={{ backgroundColor: color.value }}
                                  title={color.name}
                                >
                                  {propertyData.sidebarColor === color.value && (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                      <Check className="w-4 h-4 text-slate-600" />
                                    </div>
                                  )}
                                </button>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Info del Agente (Solo si el modelo lo requiere) */}
                      {(isFieldVisible('agentName') || isFieldVisible('agentImage')) && (
                        <div className="pt-6 border-t border-slate-100 flex flex-col md:flex-row gap-6">
                          {isFieldVisible('agentImage') && (
                            <div className="flex-shrink-0">
                               <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2 text-center">Foto Agente</label>
                               <div className="relative group w-32 h-32 mx-auto rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center bg-slate-50 overflow-hidden hover:border-orange-400 transition-all">
                                  <input type="file" accept="image/*" onChange={handleAgentImageSelect} className="absolute inset-0 opacity-0 cursor-pointer z-10" />
                                  {agentImageFile ? (
                                    <img src={URL.createObjectURL(agentImageFile)} className="w-full h-full object-cover" />
                                  ) : (
                                    <User className="w-10 h-10 text-slate-300 group-hover:text-orange-400" />
                                  )}
                                  {agentImageFile && <button type="button" onClick={removeAgentImage} className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 className="w-6 h-6 text-white" /></button>}
                               </div>
                            </div>
                          )}
                          <div className="flex-1 space-y-4">
                            {isFieldVisible('agentName') && (
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Nombre del Agente</label>
                                <input type="text" value={propertyData.agentName} onChange={(e) => setPropertyData(prev => ({ ...prev, agentName: e.target.value }))}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Tu nombre completo" />
                              </div>
                            )}
                            {isFieldVisible('agentContact') && (
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Contacto (Celular / Email)</label>
                                <input type="text" value={propertyData.agentContact} onChange={(e) => setPropertyData(prev => ({ ...prev, agentContact: e.target.value }))}
                                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl" placeholder="Ej: +54 9 11 1234-5678" />
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      <div className="space-y-1.5 pt-4 border-t border-slate-100">
                        <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Corredores Responsables (Legal) *</label>
                        <textarea required value={propertyData.corredores} onChange={(e) => setPropertyData(prev => ({ ...prev, corredores: e.target.value }))}
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-orange-50 outline-none text-sm leading-relaxed" rows={2} placeholder="Juan Perez CPI 5234 / Gabriel Fernandez CMCPSI 6543" />
                        <p className="text-[10px] text-slate-400 italic">Este texto aparecerá según normativa legal vigente.</p>
                      </div>
                    </div>
                  </div>

                  {/* ACCIONES FINALES */}
                  <div className="flex flex-col-reverse md:flex-row gap-4 pt-6">
                    <button type="button" onClick={() => setShowCreateModal(false)}
                      className="flex-1 px-6 py-3 border border-slate-200 text-slate-600 font-bold rounded-xl hover:bg-slate-50 transition-colors">
                      Cancelar
                    </button>
                    <button type="submit" disabled={creating}
                      className="flex-[2] bg-blue-600 text-white px-6 py-4 rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg hover:shadow-blue-200 disabled:opacity-50 flex items-center justify-center gap-3">
                      {creating ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          <span>Generando Placa...</span>
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5" />
                          <span>Generar Nueva Placa</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Modal de vista detallada */}
        {selectedPlaque && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold">{selectedPlaque.title}</h2>
                  <button
                    onClick={() => setSelectedPlaque(null)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    ✕
                  </button>
                </div>

                {/* Status */}
                <div className="mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    {getStatusIcon(selectedPlaque.status)}
                    <span className="font-medium">{getStatusText(selectedPlaque.status)}</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    Creado: {new Date(selectedPlaque.createdAt).toLocaleString('es-AR')}
                  </p>
                </div>

                {/* ImÃ¡genes */}
                <div className="space-y-6">
                  {selectedPlaque.generatedImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Placas Generadas</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {selectedPlaque.generatedImages.map((url, index) => (
                          <div key={index} className="relative">
                            <img
                              src={url}
                              alt={`Placa ${index + 1}`}
                              className="w-full h-auto rounded-lg shadow-md"
                            />
                            <a
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="absolute top-2 right-2 bg-white p-2 rounded-full shadow-md hover:bg-gray-50"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedPlaque.originalImages.length > 0 && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3">Imágenes Originales</h3>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {selectedPlaque.originalImages.map((url, index) => (
                          <img
                            key={index}
                            src={url}
                            alt={`Original ${index + 1}`}
                            className="w-full h-32 object-cover rounded-lg"
                          />
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Datos de la propiedad */}
                <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold">Datos de la Propiedad</h3>
                    {selectedPlaque.modelType && (
                      <span className="px-3 py-1 bg-blue-600 text-white rounded-full text-[10px] font-bold uppercase tracking-wider shadow-sm">
                        {PLAQUE_MODEL_SUMMARY.find(m => m.key === selectedPlaque.modelType)?.title.split(' (')[0] || selectedPlaque.modelType}
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Tipo:</span> {selectedPlaque.propertyData.tipo}
                    </div>
                    <div>
                      <span className="font-medium">Precio:</span> {selectedPlaque.propertyData.moneda} {parseInt(selectedPlaque.propertyData.precio).toLocaleString('es-AR')}
                    </div>
                    <div>
                      <span className="font-medium">Dirección:</span> {selectedPlaque.propertyData.direccion}
                    </div>
                    <div>
                      <span className="font-medium">Contacto:</span> {selectedPlaque.propertyData.contacto}
                    </div>
                    {selectedPlaque.propertyData.ambientes && (
                      <div>
                        <span className="font-medium">Ambientes:</span> {selectedPlaque.propertyData.ambientes}
                      </div>
                    )}
                    {selectedPlaque.propertyData.ambientes && (
                      <div>
                        <span className="font-medium">Ambientes:</span> {selectedPlaque.propertyData.ambientes}
                      </div>
                    )}
                    {selectedPlaque.propertyData.dormitorios && (
                      <div>
                        <span className="font-medium">Dormitorios:</span> {selectedPlaque.propertyData.dormitorios}
                      </div>
                    )}
                    {selectedPlaque.propertyData.banos && (
                      <div>
                        <span className="font-medium">BaÃ±os:</span> {selectedPlaque.propertyData.banos}
                      </div>
                    )}
                    {selectedPlaque.propertyData.cocheras && (
                      <div>
                        <span className="font-medium">Cocheras:</span> {selectedPlaque.propertyData.cocheras}
                      </div>
                    )}
                    {selectedPlaque.propertyData.m2_totales && (
                      <div>
                        <span className="font-medium">M2 Totales:</span> {selectedPlaque.propertyData.m2_totales} m²
                      </div>
                    )}
                    {selectedPlaque.propertyData.m2_cubiertos && (
                      <div>
                        <span className="font-medium">M2 Cubiertos:</span> {selectedPlaque.propertyData.m2_cubiertos} m²
                      </div>
                    )}
                    {selectedPlaque.propertyData.antiguedad && (
                      <div>
                        <span className="font-medium">Antigüedad:</span> {selectedPlaque.propertyData.antiguedad}
                      </div>
                    )}
                    {selectedPlaque.propertyData.email && (
                      <div>
                        <span className="font-medium">Email:</span> {selectedPlaque.propertyData.email}
                      </div>
                    )}
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

