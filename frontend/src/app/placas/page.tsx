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
  ChevronRight
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
}

interface PropertyPlaque {
  id: string;
  title: string;
  description?: string;
  propertyData: PropertyData;
  originalImages: string[];
  generatedImages: string[];
  status: 'PROCESSING' | 'GENERATING' | 'COMPLETED' | 'ERROR';
  createdAt: string;
  updatedAt: string;
}

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
    agentContact: ''
  });
  const [modelType, setModelType] = useState<'standard' | 'premium'>('standard');
  const [creating, setCreating] = useState(false);
  const [selectedPlaque, setSelectedPlaque] = useState<PropertyPlaque | null>(null);
  const [agentImageFile, setAgentImageFile] = useState<File | null>(null);

  // Proteger ruta
  useEffect(() => {
    if (!loading && (!user || !hasPermission)) {
      router.replace('/auth/login');
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedImages.length === 0) {
      alert('Selecciona al menos una imagen');
      return;
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
      formData.append('title', `Placa - ${propertyData.direccion}`);
      formData.append('description', propertyData.descripcion || '');
      formData.append('propertyData', JSON.stringify(propertyData));
      formData.append('modelType', modelType);

      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      // Agregar imagen del agente si existe
      if (agentImageFile) {
        formData.append('agentImage', agentImageFile);
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
          agentContact: ''
        });
        setModelType('standard');
        setAgentImageFile(null);
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
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm truncate">
                      {plaque.title}
                    </h3>

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
                  {/* Subida de imágenes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Imágenes de la propiedad *
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

                    {/* Preview de imÃ¡genes seleccionadas */}
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
                  </div>

                  {/* Selector de modelo */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Modelo de placa
                    </label>
                    <select
                      value={modelType}
                      onChange={(e) => setModelType(e.target.value as 'standard' | 'premium')}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="standard">Estándar</option>
                      <option value="premium">Premium (con zócalo del agente)</option>
                    </select>
                  </div>

                  {/* Datos de la propiedad */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de propiedad
                      </label>
                      <select
                        value={propertyData.tipo}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, tipo: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Moneda
                      </label>
                      <select
                        value={propertyData.moneda}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, moneda: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      >
                        <option value="USD">USD</option>
                        <option value="ARS">ARS</option>
                        <option value="EUR">EUR</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Precio *
                      </label>
                      <input
                        type="number"
                        required
                        value={propertyData.precio}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, precio: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        placeholder="Ej: 350000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ambientes
                      </label>
                      <input
                        type="text"
                        value={propertyData.ambientes}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, ambientes: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 3"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dormitorios
                      </label>
                      <input
                        type="text"
                        value={propertyData.dormitorios}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, dormitorios: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Baños
                      </label>
                      <input
                        type="text"
                        value={propertyData.banos}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, banos: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 2"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cocheras
                      </label>
                      <input
                        type="text"
                        value={propertyData.cocheras}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, cocheras: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 1"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        M2 Totales
                      </label>
                      <input
                        type="text"
                        value={propertyData.m2_totales}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, m2_totales: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        M2 Cubiertos
                      </label>
                      <input
                        type="text"
                        value={propertyData.m2_cubiertos}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, m2_cubiertos: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 85"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Clock className="w-4 h-4 inline mr-1" />
                        Antigüedad
                      </label>
                      <input
                        type="text"
                        value={propertyData.antiguedad}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, antiguedad: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 5 años"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Dirección
                      </label>
                      <input
                        type="text"
                        value={propertyData.direccion}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, direccion: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: Av. Libertador 1234, Palermo, CABA"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Mail className="w-4 h-4 inline mr-1" />
                        Email de contacto
                      </label>
                      <input
                        type="email"
                        value={propertyData.email}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, email: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="agente@remax.com.ar"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Corredores (nombre y matrícula) *
                    </label>
                    <textarea
                      required
                      value={propertyData.corredores}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, corredores: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={2}
                      placeholder="Ej: Hernán Martin Carbone CPI 5493 / Gabriel Carlos Monrabal CMCPSI 6341"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Descripción adicional
                    </label>
                    <textarea
                      value={propertyData.descripcion}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, descripcion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      rows={3}
                      placeholder="Información adicional sobre la propiedad..."
                    />
                  </div>

                  {/* Campos del agente (solo para premium) */}
                  {modelType === 'premium' && (
                    <div className="space-y-4 border-t pt-4">
                      <h3 className="text-lg font-semibold text-gray-900">Información del Agente</h3>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Imagen del agente
                        </label>
                        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                          <input
                            type="file"
                            accept="image/*"
                            onChange={handleAgentImageSelect}
                            className="hidden"
                            id="agent-image-upload"
                          />
                          <label
                            htmlFor="agent-image-upload"
                            className="cursor-pointer flex flex-col items-center"
                          >
                            <Upload className="w-8 h-8 text-gray-400 mb-2" />
                            <span className="text-sm text-gray-600">
                              Haz clic para seleccionar imagen del agente
                            </span>
                            <span className="text-xs text-gray-500 mt-1">
                              JPG, PNG, máximo 5MB
                            </span>
                          </label>
                        </div>

                        {/* Preview de imagen del agente */}
                        {agentImageFile && (
                          <div className="mt-3 relative inline-block">
                            <img
                              src={URL.createObjectURL(agentImageFile)}
                              alt="Preview agente"
                              className="w-20 h-20 object-cover rounded-lg border"
                            />
                            <button
                              type="button"
                              onClick={removeAgentImage}
                              className="absolute -top-2 -right-2 bg-gray-500 text-white rounded-full p-1 hover:bg-gray-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre del agente
                          </label>
                          <input
                            type="text"
                            value={propertyData.agentName}
                            onChange={(e) => setPropertyData(prev => ({ ...prev, agentName: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: Juan Pérez"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Agencia
                          </label>
                          <input
                            type="text"
                            value={propertyData.agency}
                            onChange={(e) => setPropertyData(prev => ({ ...prev, agency: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: RE/MAX Premium"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contacto del agente
                          </label>
                          <input
                            type="text"
                            value={propertyData.agentContact}
                            onChange={(e) => setPropertyData(prev => ({ ...prev, agentContact: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            placeholder="Ej: +54 11 1234-5678 | juan@remax.com"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Botones */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowCreateModal(false)}
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
                          Procesando...
                        </>
                      ) : (
                        'Crear Placa'
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
                  <h3 className="text-lg font-semibold mb-3">Datos de la Propiedad</h3>
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
    </div>
  );
}

