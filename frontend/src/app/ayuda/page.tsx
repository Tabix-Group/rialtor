'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../auth/authContext'
import { 
  BookOpen, 
  Calculator, 
  FileText, 
  ImageIcon, 
  MessageCircle, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Newspaper,
  Download,
  Shield,
  Users,
  CreditCard,
  HelpCircle,
  Search,
  ChevronRight,
  Home,
  Settings,
  FileCheck,
  Workflow
} from 'lucide-react'

export default function AyudaPage() {
  const { user } = useAuth()
  const [activeSection, setActiveSection] = useState('primeros-pasos')
  const [searchQuery, setSearchQuery] = useState('')

  // Smooth scroll to section
  const scrollToSection = (sectionId: string) => {
    setActiveSection(sectionId)
    const element = document.getElementById(sectionId)
    if (element) {
      const offset = 100
      const elementPosition = element.getBoundingClientRect().top
      const offsetPosition = elementPosition + window.pageYOffset - offset
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  // Detect active section on scroll
  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('section[id]')
      let currentSection = activeSection

      sections.forEach((section) => {
        const sectionTop = section.getBoundingClientRect().top
        const sectionId = section.getAttribute('id')
        if (sectionTop <= 150 && sectionTop > -section.clientHeight + 150) {
          if (sectionId) currentSection = sectionId
        }
      })

      if (currentSection !== activeSection) {
        setActiveSection(currentSection)
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [activeSection])

  const sections = [
    {
      id: 'primeros-pasos',
      title: 'Primeros Pasos',
      icon: Home,
      subsections: [
        { id: 'registro', title: 'Registro y Login' },
        { id: 'perfil', title: 'Configuración de Perfil' },
        { id: 'navegacion', title: 'Navegación de la Plataforma' }
      ]
    },
    {
      id: 'asistente-ia',
      title: 'Asistente IA',
      icon: MessageCircle,
      subsections: [
        { id: 'ia-intro', title: 'Introducción al Asistente' },
        { id: 'ia-consultas', title: 'Tipos de Consultas' },
        { id: 'ia-mejores-practicas', title: 'Mejores Prácticas' }
      ]
    },
    {
      id: 'indicadores',
      title: 'Indicadores Económicos',
      icon: TrendingUp,
      subsections: [
        { id: 'indicadores-disponibles', title: 'Indicadores Disponibles' },
        { id: 'indicadores-uso', title: 'Cómo Usar Indicadores' }
      ]
    },
    {
      id: 'calendario',
      title: 'Calendario Profesional',
      icon: Calendar,
      subsections: [
        { id: 'calendario-crear', title: 'Crear Eventos' },
        { id: 'calendario-gestionar', title: 'Gestionar Agenda' },
        { id: 'calendario-sincronizar', title: 'Sincronización' }
      ]
    },
    {
      id: 'finanzas',
      title: 'Gestión Financiera',
      icon: DollarSign,
      subsections: [
        { id: 'finanzas-ingresos', title: 'Registrar Ingresos y Gastos' },
        { id: 'finanzas-reportes', title: 'Reportes y Análisis' },
        { id: 'finanzas-categorias', title: 'Categorías Personalizadas' }
      ]
    },
    {
      id: 'calculadoras',
      title: 'Calculadoras',
      icon: Calculator,
      subsections: [
        { id: 'calc-ajustes', title: 'Ajustes de Alquiler' },
        { id: 'calc-escritura', title: 'Gastos de Escrituración' },
        { id: 'calc-dias', title: 'Días Hábiles' },
        { id: 'calc-hipotecarios', title: 'Créditos Hipotecarios' },
        { id: 'calc-caucion', title: 'Seguros de Caución' }
      ]
    },
    {
      id: 'documentos',
      title: 'Documentos y Formularios',
      icon: FileText,
      subsections: [
        { id: 'doc-resumidor', title: 'Resumidor Inteligente' },
        { id: 'doc-formularios', title: 'Formularios Editables' },
        { id: 'doc-generacion', title: 'Generación de Contratos' }
      ]
    },
    {
      id: 'placas',
      title: 'Generador de Placas',
      icon: ImageIcon,
      subsections: [
        { id: 'placas-crear', title: 'Crear Placas' },
        { id: 'placas-personalizar', title: 'Personalización' },
        { id: 'placas-descargar', title: 'Exportar y Compartir' }
      ]
    },
    {
      id: 'noticias',
      title: 'Noticias del Sector',
      icon: Newspaper,
      subsections: [
        { id: 'noticias-ver', title: 'Ver Noticias' },
        { id: 'noticias-filtrar', title: 'Filtrar por Categoría' }
      ]
    },
    {
      id: 'descargas',
      title: 'Centro de Descargas',
      icon: Download,
      subsections: [
        { id: 'descargas-archivos', title: 'Archivos Disponibles' },
        { id: 'descargas-administrar', title: 'Gestionar Descargas' }
      ]
    },
    {
      id: 'admin',
      title: 'Panel de Administración',
      icon: Shield,
      subsections: [
        { id: 'admin-usuarios', title: 'Gestión de Usuarios' },
        { id: 'admin-roles', title: 'Roles y Permisos' },
        { id: 'admin-contenido', title: 'Gestión de Contenido' }
      ]
    },
    {
      id: 'soporte',
      title: 'Soporte y Contacto',
      icon: HelpCircle,
      subsections: [
        { id: 'soporte-problemas', title: 'Problemas Comunes' },
        { id: 'soporte-compatibilidad', title: 'Compatibilidad' },
        { id: 'soporte-contacto', title: 'Contactar Soporte' }
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
          <div className="flex items-center gap-3 mb-4">
            <HelpCircle className="w-10 h-10" />
            <h1 className="text-4xl font-extrabold tracking-tight">Centro de Ayuda</h1>
          </div>
          <p className="text-blue-100 text-lg max-w-3xl">
            Encuentra respuestas a tus preguntas y guías detalladas para aprovechar al máximo todas las herramientas de RIALTOR
          </p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="relative max-w-2xl">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar en la ayuda..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-8">
        <div className="flex gap-8">
          {/* Sidebar Navigation */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <div className="sticky top-24 space-y-1">
              <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-3">
                Contenidos
              </h2>
              {sections.map((section) => {
                const Icon = section.icon
                const isActive = activeSection === section.id || 
                  section.subsections.some(sub => sub.id === activeSection)
                
                return (
                  <div key={section.id}>
                    <button
                      onClick={() => scrollToSection(section.id)}
                      className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                        isActive
                          ? 'bg-blue-50 text-blue-700 font-medium'
                          : 'text-gray-700 hover:bg-gray-100'
                      }`}
                    >
                      <Icon className="w-4 h-4 flex-shrink-0" />
                      <span className="flex-1 text-left">{section.title}</span>
                    </button>
                    {isActive && section.subsections && (
                      <div className="ml-10 mt-1 space-y-1">
                        {section.subsections.map((subsection) => (
                          <button
                            key={subsection.id}
                            onClick={() => scrollToSection(subsection.id)}
                            className={`w-full text-left px-3 py-1.5 text-xs rounded transition-colors ${
                              activeSection === subsection.id
                                ? 'text-blue-700 font-medium bg-blue-50'
                                : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                            }`}
                          >
                            {subsection.title}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            <div className="prose prose-blue max-w-none">
              
              {/* Primeros Pasos */}
              <section id="primeros-pasos" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Home className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Primeros Pasos</h2>
                </div>

                <div id="registro" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Registro y Login</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      <strong>Crear una cuenta:</strong> Visita <code>/auth/register</code> y completa el formulario con tu nombre, email y contraseña. Recibirás un email de confirmación.
                    </p>
                    <p className="text-gray-700">
                      <strong>Iniciar sesión:</strong> Accede en <code>/auth/login</code> con tus credenciales. El sistema guardará tu sesión de forma segura.
                    </p>
                    <p className="text-gray-700">
                      <strong>Recuperar contraseña:</strong> Si olvidaste tu contraseña, usa la opción "¿Olvidaste tu contraseña?" en la página de login.
                    </p>
                  </div>
                </div>

                <div id="perfil" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Configuración de Perfil</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Desde tu <strong>Dashboard</strong>, puedes actualizar tu información personal, foto de perfil, y preferencias profesionales.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Foto de perfil y avatar personalizado</li>
                      <li>Información de contacto y matrícula profesional</li>
                      <li>Zona de trabajo y especialidades inmobiliarias</li>
                      <li>Preferencias de notificaciones</li>
                    </ul>
                  </div>
                </div>

                <div id="navegacion" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Navegación de la Plataforma</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      La plataforma cuenta con un <strong>menú lateral colapsable</strong> que te permite acceder rápidamente a todas las herramientas:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Mi Panel:</strong> Dashboard principal con acceso rápido</li>
                      <li><strong>Asistente IA:</strong> Consultor inmobiliario inteligente</li>
                      <li><strong>Indicadores:</strong> Datos económicos en tiempo real</li>
                      <li><strong>Calculadoras:</strong> Herramientas de cálculo profesional</li>
                      <li><strong>Documentos:</strong> Gestión y edición de formularios</li>
                      <li><strong>Placas:</strong> Generador de contenido visual</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Asistente IA */}
              <section id="asistente-ia" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <MessageCircle className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Asistente IA</h2>
                </div>

                <div id="ia-intro" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Introducción al Asistente</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      El <strong>Asistente IA de RIALTOR</strong> es un consultor inmobiliario inteligente que te ayuda con consultas sobre el mercado argentino, cálculos automáticos y búsqueda de información en tiempo real.
                    </p>
                    <p className="text-gray-700">
                      Está entrenado con conocimiento específico del sector inmobiliario argentino, incluyendo normativas, cálculos fiscales, tendencias de mercado y mejores prácticas profesionales.
                    </p>
                  </div>
                </div>

                <div id="ia-consultas" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Tipos de Consultas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">Puedes realizar diversos tipos de consultas:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Cálculos fiscales:</strong> "¿Cuánto es el ITI en CABA para una propiedad de $100,000 USD?"</li>
                      <li><strong>Normativas:</strong> "¿Cuáles son los requisitos para un contrato de alquiler?"</li>
                      <li><strong>Tendencias de mercado:</strong> "¿Cómo está el mercado inmobiliario en Buenos Aires?"</li>
                      <li><strong>Mejores prácticas:</strong> "¿Cómo negociar una comisión con un cliente?"</li>
                      <li><strong>Análisis de documentos:</strong> Sube contratos y obtén resúmenes automáticos</li>
                    </ul>
                  </div>
                </div>

                <div id="ia-mejores-practicas" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Mejores Prácticas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Sé específico en tus preguntas para obtener respuestas más precisas</li>
                      <li>Incluye detalles relevantes como ubicación, montos y fechas</li>
                      <li>Utiliza el historial de conversación para hacer seguimiento de consultas anteriores</li>
                      <li>Verifica siempre información legal o fiscal con un profesional</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Indicadores Económicos */}
              <section id="indicadores" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <TrendingUp className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Indicadores Económicos</h2>
                </div>

                <div id="indicadores-disponibles" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Indicadores Disponibles</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">Accede a indicadores económicos actualizados en tiempo real:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Dólar:</strong> Oficial, Blue, MEP, CCL, Tarjeta</li>
                      <li><strong>Inflación:</strong> IPC Nacional y por provincia</li>
                      <li><strong>Índices inmobiliarios:</strong> ICL, Precios m²</li>
                      <li><strong>Tasas de interés:</strong> Hipotecarios, Plazo Fijo</li>
                      <li><strong>UVA y UVI:</strong> Valores actualizados diariamente</li>
                    </ul>
                  </div>
                </div>

                <div id="indicadores-uso" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Cómo Usar Indicadores</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Navega a <code>/indicadores</code> para ver todos los indicadores disponibles. Puedes filtrar por categoría, ver históricos y exportar datos en formato Excel o CSV.
                    </p>
                  </div>
                </div>
              </section>

              {/* Calendario */}
              <section id="calendario" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Calendar className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Calendario Profesional</h2>
                </div>

                <div id="calendario-crear" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Crear Eventos</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Crea eventos haciendo clic en cualquier fecha del calendario. Puedes agregar:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Visitas a propiedades con ubicación y cliente</li>
                      <li>Reuniones con clientes o colegas</li>
                      <li>Recordatorios de tareas y seguimientos</li>
                      <li>Vencimientos de contratos y pagos</li>
                    </ul>
                  </div>
                </div>

                <div id="calendario-gestionar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Gestionar Agenda</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Administra tu agenda con vistas diarias, semanales y mensuales. Puedes editar, reprogramar o eliminar eventos fácilmente.
                    </p>
                  </div>
                </div>

                <div id="calendario-sincronizar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Sincronización</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Próximamente: Sincronización con Google Calendar, Outlook y otros servicios de calendario populares.
                    </p>
                  </div>
                </div>
              </section>

              {/* Gestión Financiera */}
              <section id="finanzas" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Gestión Financiera</h2>
                </div>

                <div id="finanzas-ingresos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Registrar Ingresos y Gastos</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Mantén un control preciso de tus finanzas registrando todas tus operaciones:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Comisiones de ventas y alquileres</li>
                      <li>Gastos operativos y administrativos</li>
                      <li>Inversiones en marketing y publicidad</li>
                      <li>Pagos de impuestos y servicios</li>
                    </ul>
                  </div>
                </div>

                <div id="finanzas-reportes" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Reportes y Análisis</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Genera reportes detallados para analizar tu rentabilidad, proyecciones y tendencias financieras. Exporta datos en formato Excel para contabilidad.
                    </p>
                  </div>
                </div>

                <div id="finanzas-prospectos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Mis Prospectos</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Registrá tus proyecciones y prospectos concretados. Podés agregar un monto estimado, comisión prevista y cuántos clientes fueron contactados. También verás indicadores clave (monto promedio, comisión promedio, clientes prospectados y tasa de conversión) para comparar tu desempeño frente a lo planificado.
                    </p>
                  </div>
                </div>

                <div id="finanzas-categorias" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Categorías Personalizadas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Crea categorías personalizadas para organizar tus transacciones según tu modelo de negocio y necesidades específicas.
                    </p>
                  </div>
                </div>
              </section>

              {/* Calculadoras */}
              <section id="calculadoras" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Calculator className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Calculadoras Profesionales</h2>
                </div>

                <div id="calc-ajustes" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Ajustes de Alquiler</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Calcula ajustes de alquileres según IPC, ICL o porcentajes pactados. Incluye simulador de ajustes anuales según la Ley de Alquileres.
                    </p>
                  </div>
                </div>

                <div id="calc-escritura" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Gastos de Escrituración</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Calcula todos los gastos de escrituración incluyendo: honorarios de escribano, sellos provinciales, IIBB, ITI (CABA), registro de la propiedad y gestoría.
                    </p>
                  </div>
                </div>

                <div id="calc-dias" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Días Hábiles</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Calcula días hábiles entre dos fechas, excluyendo fines de semana y feriados nacionales. Útil para vencimientos contractuales.
                    </p>
                  </div>
                </div>

                <div id="calc-hipotecarios" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Créditos Hipotecarios</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Simula créditos hipotecarios con diferentes tasas, plazos y sistemas de amortización (francés o alemán). Compara ofertas de diferentes bancos.
                    </p>
                  </div>
                </div>

                <div id="calc-caucion" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Seguros de Caución</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Cotiza seguros de caución para garantías de alquiler. Compara precios entre diferentes compañías aseguradoras.
                    </p>
                  </div>
                </div>
              </section>

              {/* Documentos y Formularios */}
              <section id="documentos" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Documentos y Formularios</h2>
                </div>

                <div id="doc-resumidor" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Resumidor Inteligente</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Sube contratos, escrituras o documentos extensos y obtén un resumen automático con los puntos clave, cláusulas importantes y datos relevantes extraídos por IA.
                    </p>
                  </div>
                </div>

                <div id="doc-formularios" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Formularios Editables</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Edita formularios predefinidos directamente en el navegador con un editor WYSIWYG profesional. Incluye plantillas de:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Contratos de alquiler</li>
                      <li>Boletos de compraventa</li>
                      <li>Reservas de propiedad</li>
                      <li>Autorizaciones de publicación</li>
                      <li>Formularios de inspección</li>
                    </ul>
                  </div>
                </div>

                <div id="doc-generacion" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Generación de Contratos</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Genera contratos completos completando un formulario simple. El sistema rellena automáticamente todos los campos y genera un PDF listo para imprimir y firmar.
                    </p>
                  </div>
                </div>
              </section>

              {/* Placas */}
              <section id="placas" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Generador de Placas</h2>
                </div>

                <div id="placas-crear" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Crear Placas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Sube fotos de propiedades y genera automáticamente placas profesionales para redes sociales y portales inmobiliarios. Soporta modelos estándar y VIP.
                    </p>
                  </div>
                </div>

                <div id="placas-personalizar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Personalización</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Personaliza tus placas con:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Logo y marca personal</li>
                      <li>Colores corporativos</li>
                      <li>Datos de la propiedad (precio, superficie, ambientes)</li>
                      <li>Información de contacto</li>
                      <li>QR code para más información</li>
                    </ul>
                  </div>
                </div>

                <div id="placas-descargar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Exportar y Compartir</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Descarga tus placas en alta resolución (PNG, JPG) optimizadas para Instagram, Facebook, WhatsApp y portales inmobiliarios.
                    </p>
                  </div>
                </div>
              </section>

              {/* Noticias */}
              <section id="noticias" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Newspaper className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Noticias del Sector</h2>
                </div>

                <div id="noticias-ver" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Ver Noticias</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Mantente informado con las últimas noticias del mercado inmobiliario argentino, actualizadas automáticamente desde múltiples fuentes confiables.
                    </p>
                  </div>
                </div>

                <div id="noticias-filtrar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Filtrar por Categoría</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Filtra noticias por categorías como: normativas, mercado, economía, tendencias, tecnología inmobiliaria, y más.
                    </p>
                  </div>
                </div>
              </section>

              {/* Descargas */}
              <section id="descargas" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Download className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Centro de Descargas</h2>
                </div>

                <div id="descargas-archivos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Archivos Disponibles</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Accede a una biblioteca de recursos descargables:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Plantillas de documentos y formularios</li>
                      <li>Guías y manuales profesionales</li>
                      <li>Normativas y legislación actualizada</li>
                      <li>Material de marketing y branding</li>
                    </ul>
                  </div>
                </div>

                <div id="descargas-administrar" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Gestionar Descargas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Los administradores pueden subir, organizar y gestionar archivos para que estén disponibles para todos los usuarios.
                    </p>
                  </div>
                </div>
              </section>

              {/* Panel de Administración */}
              {user?.roles?.some((r: any) => r.name === 'ADMIN') && (
                <section id="admin" className="mb-16 scroll-mt-24">
                  <div className="flex items-center gap-3 mb-6">
                    <Shield className="w-8 h-8 text-blue-600" />
                    <h2 className="text-3xl font-bold text-gray-900 m-0">Panel de Administración</h2>
                  </div>

                  <div id="admin-usuarios" className="mb-8 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Gestión de Usuarios</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <p className="text-gray-700">
                        Administra usuarios, activa/desactiva cuentas, verifica estados de suscripción y gestiona accesos a funcionalidades premium.
                      </p>
                    </div>
                  </div>

                  <div id="admin-roles" className="mb-8 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Roles y Permisos</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <p className="text-gray-700">
                        Configura roles personalizados y asigna permisos granulares para controlar el acceso a diferentes secciones y funcionalidades de la plataforma.
                      </p>
                    </div>
                  </div>

                  <div id="admin-contenido" className="mb-8 scroll-mt-24">
                    <h3 className="text-xl font-semibold mb-3">Gestión de Contenido</h3>
                    <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                      <p className="text-gray-700">
                        Administra noticias, artículos, categorías, archivos descargables y todos los contenidos de la plataforma desde un panel centralizado.
                      </p>
                    </div>
                  </div>
                </section>
              )}

              {/* Soporte */}
              <section id="soporte" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <HelpCircle className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Soporte y Contacto</h2>
                </div>

                <div id="soporte-problemas" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Problemas Comunes</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">No puedo iniciar sesión</p>
                      <p className="text-gray-700 text-sm">Verifica tu email y contraseña. Si olvidaste tu contraseña, usa la opción de recuperación. Asegúrate de que tu cuenta esté activada.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Los cálculos no se muestran correctamente</p>
                      <p className="text-gray-700 text-sm">Limpia el caché de tu navegador y recarga la página. Asegúrate de estar usando una versión actualizada del navegador.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 mb-2">Error al generar documentos</p>
                      <p className="text-gray-700 text-sm">Verifica que todos los campos requeridos estén completos. Si el problema persiste, contacta soporte.</p>
                    </div>
                  </div>
                </div>

                <div id="soporte-compatibilidad" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Compatibilidad</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700"><strong>Navegadores soportados:</strong></p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li>Google Chrome 90 o superior (recomendado)</li>
                      <li>Mozilla Firefox 88 o superior</li>
                      <li>Safari 14 o superior</li>
                      <li>Microsoft Edge 90 o superior</li>
                    </ul>
                    <p className="text-gray-700 mt-4">
                      <strong>Dispositivos:</strong> Compatible con escritorio, tablets y smartphones. Algunas funcionalidades avanzadas funcionan mejor en escritorio.
                    </p>
                  </div>
                </div>

                <div id="soporte-contacto" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Contactar Soporte</h3>
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6 space-y-4">
                    <p className="text-gray-800 font-medium">
                      ¿Necesitas ayuda adicional? Nuestro equipo de soporte está aquí para asistirte.
                    </p>
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <MessageCircle className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Email</p>
                          <a href="mailto:rialtor@rialtor.app" className="text-blue-600 hover:underline">
                            rialtor@rialtor.app
                          </a>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 text-gray-700">
                        <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                          <Settings className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold">Horario de atención</p>
                          <p className="text-sm">Lunes a Viernes, 9:00 - 18:00 hs (GMT-3)</p>
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-4">
                      Tiempo promedio de respuesta: 24 horas hábiles. Para usuarios Premium: atención prioritaria en menos de 12 horas.
                    </p>
                  </div>
                </div>
              </section>

            </div>
          </main>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12 text-center">
          <h3 className="text-2xl font-bold mb-4">¿Listo para empezar?</h3>
          <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
            Aprovecha todas las herramientas profesionales que RIALTOR tiene para ofrecerte
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-blue-50 transition-colors shadow-lg"
          >
            Ir al Dashboard
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </div>
    </div>
  )
}
