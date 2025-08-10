'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'
import { usePermission } from '../../hooks/usePermission'
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
  Clock
} from 'lucide-react'

interface PropertyData {
  tipo: string;
  precio: string;
  moneda: string;
  direccion: string;
  ambientes?: string;
  superficie?: string;
  contacto: string;
  email?: string;
  descripcion?: string;
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
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [propertyData, setPropertyData] = useState<PropertyData>({
    tipo: '',
    precio: '',
    moneda: 'USD',
    direccion: '',
    ambientes: '',
    superficie: '',
    contacto: '',
    email: '',
    descripcion: ''
  });
  const [creating, setCreating] = useState(false);
  const [selectedPlaque, setSelectedPlaque] = useState<PropertyPlaque | null>(null);

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

  // Polling para actualizaciones en tiempo real
  useEffect(() => {
    const interval = setInterval(() => {
      if (plaques.some(p => ['PROCESSING', 'GENERATING'].includes(p.status))) {
        fetchPlaques();
      }
    }, 5000); // Cada 5 segundos

    return () => clearInterval(interval);
  }, [plaques]);

  const fetchPlaques = async () => {
    try {
      const res = await fetch('/api/placas', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const data = await res.json();
      if (res.ok) {
        setPlaques(data.plaques || []);
      }
    } catch (error) {
      console.error('Error cargando placas:', error);
    } finally {
      setLoadingPlaques(false);
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
    
    if (selectedImages.length === 0) {
      alert('Selecciona al menos una imagen');
      return;
    }

    if (!propertyData.precio || !propertyData.direccion || !propertyData.contacto) {
      alert('Completa los campos obligatorios (precio, dirección, contacto)');
      return;
    }

    setCreating(true);

    try {
      const formData = new FormData();
      formData.append('title', `Placa - ${propertyData.direccion}`);
      formData.append('description', propertyData.descripcion || '');
      formData.append('propertyData', JSON.stringify(propertyData));
      
      selectedImages.forEach(image => {
        formData.append('images', image);
      });

      const res = await fetch('/api/placas', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
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
          superficie: '',
          contacto: '',
          email: '',
          descripcion: ''
        });
        fetchPlaques();
        alert('Placa creada exitosamente. El procesamiento iniciará en breve.');
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
    if (!confirm('¿Estás seguro de eliminar esta placa?')) return;

    try {
      const res = await fetch(`/api/placas/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (res.ok) {
        fetchPlaques();
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
        return <XCircle className="w-5 h-5 text-red-500" />;
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Generador de Placas
              </h1>
              <p className="mt-2 text-gray-600">
                Crea placas profesionales para tus propiedades con IA
              </p>
            </div>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              <Plus className="w-5 h-5" />
              Nueva Placa
            </button>
          </div>
        </div>

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
              className="bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Crear Primera Placa
            </button>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {plaques.map((plaque) => (
              <div key={plaque.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                {/* Preview de imagen */}
                <div className="h-48 bg-gray-200 relative">
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
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  
                  {/* Status overlay */}
                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1 bg-white px-2 py-1 rounded-full text-sm">
                      {getStatusIcon(plaque.status)}
                      {getStatusText(plaque.status)}
                    </div>
                  </div>
                </div>

                {/* Información */}
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 mb-2 truncate">
                    {plaque.title}
                  </h3>
                  
                  <div className="space-y-1 text-sm text-gray-600 mb-3">
                    <div className="flex items-center gap-1">
                      <DollarSign className="w-4 h-4" />
                      {plaque.propertyData.moneda} {parseInt(plaque.propertyData.precio).toLocaleString('es-AR')}
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {plaque.propertyData.direccion}
                    </div>
                    {plaque.propertyData.ambientes && (
                      <div className="flex items-center gap-1">
                        <Home className="w-4 h-4" />
                        {plaque.propertyData.ambientes} ambientes
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedPlaque(plaque)}
                      className="flex-1 flex items-center justify-center gap-1 bg-gray-100 text-gray-700 px-3 py-2 rounded text-sm hover:bg-gray-200 transition-colors"
                    >
                      <Eye className="w-4 h-4" />
                      Ver
                    </button>
                    
                    {plaque.status === 'COMPLETED' && plaque.generatedImages.length > 0 && (
                      <a
                        href={plaque.generatedImages[0]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1 bg-blue-100 text-blue-700 px-3 py-2 rounded text-sm hover:bg-blue-200 transition-colors"
                      >
                        <Download className="w-4 h-4" />
                      </a>
                    )}
                    
                    <button
                      onClick={() => deletePlaque(plaque.id)}
                      className="flex items-center justify-center gap-1 bg-red-100 text-red-700 px-3 py-2 rounded text-sm hover:bg-red-200 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
                              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                        Superficie (m²)
                      </label>
                      <input
                        type="text"
                        value={propertyData.superficie}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, superficie: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: 120"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono de contacto *
                      </label>
                      <input
                        type="text"
                        required
                        value={propertyData.contacto}
                        onChange={(e) => setPropertyData(prev => ({ ...prev, contacto: e.target.value }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                        placeholder="Ej: +54 11 1234-5678"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección *
                    </label>
                    <input
                      type="text"
                      required
                      value={propertyData.direccion}
                      onChange={(e) => setPropertyData(prev => ({ ...prev, direccion: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                      placeholder="Ej: Av. Libertador 1234, Palermo, CABA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
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
                      className="flex-1 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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

                {/* Imágenes */}
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
                    {selectedPlaque.propertyData.superficie && (
                      <div>
                        <span className="font-medium">Superficie:</span> {selectedPlaque.propertyData.superficie} m²
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
