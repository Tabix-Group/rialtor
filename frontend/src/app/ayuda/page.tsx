'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '../auth/authContext'
import { 
  Calculator, 
  FileText, 
  ImageIcon, 
  MessageCircle, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Newspaper,
  Download,
  HelpCircle,
  Search,
  ChevronRight,
  Home,
  Settings,
  Star,
  BarChart3
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
        { id: 'registro', title: 'Registro e Inicio' },
        { id: 'suscripcion', title: 'Suscripción VIP' },
        { id: 'panel', title: 'Panel de Control' },
        { id: 'pwa', title: 'App Móvil (PWA)' }
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
      id: 'calculadoras',
      title: 'Calculadoras',
      icon: Calculator,
      subsections: [
        { id: 'calc-listado', title: 'Suite de Calculadoras' },
        { id: 'calc-comisiones', title: 'Comisiones Inmobiliarias' },
        { id: 'calc-escritura', title: 'Gastos de Escrituración' },
        { id: 'calc-ajustes', title: 'Ajustes de Alquiler (ICL/CAC)' }
      ]
    },
    {
      id: 'documentos',
      title: 'Documentos y Formularios',
      icon: FileText,
      subsections: [
        { id: 'doc-intro', title: 'Gestión Documental' },
        { id: 'doc-formularios', title: 'Formularios Editables' },
        { id: 'doc-editor', title: 'Cómo usar el Editor' },
        { id: 'doc-resumidor', title: 'Resumidor Inteligente' }
      ]
    },
    {
      id: 'placas',
      title: 'Generador de Placas',
      icon: ImageIcon,
      subsections: [
        { id: 'placas-modelos', title: 'Modelos Disponibles' },
        { id: 'placas-crear', title: 'Paso a Paso' },
        { id: 'placas-personalizar', title: 'Personalización' }
      ]
    },
    {
      id: 'proyecciones-analisis',
      title: 'Proyecciones y Análisis',
      icon: BarChart3,
      subsections: [
        { id: 'proy-prospectos', title: 'Gestión de Prospectos' },
        { id: 'proy-funnel', title: 'Embudo de Ventas' },
        { id: 'proy-metricas', title: 'Proyección de Cierres' }
      ]
    },
    {
      id: 'finanzas',
      title: 'Gestión Financiera',
      icon: DollarSign,
      subsections: [
        { id: 'finanzas-ingresos', title: 'Ingresos y Gastos' },
        { id: 'finanzas-categorias', title: 'Conceptos Laborales y Personales' },
        { id: 'finanzas-graficos', title: 'Gráficos y Evolución' },
        { id: 'finanzas-reportes', title: 'Reportes Exportables' }
      ]
    },
    {
      id: 'noticias',
      title: 'Noticias del Sector',
      icon: Newspaper,
      subsections: [
        { id: 'noticias-ver', title: 'Feed de Novedades' }
      ]
    },
    {
      id: 'newsletter',
      title: 'Mis Newsletters',
      icon: Star,
      subsections: [
        { id: 'newsletter-gestion', title: 'Gestión de Campañas' }
      ]
    },
    {
      id: 'calendario',
      title: 'Calendario Profesional',
      icon: Calendar,
      subsections: [
        { id: 'calendario-crear', title: 'Crear Eventos' },
        { id: 'calendario-gestionar', title: 'Gestionar Agenda' }
      ]
    },
    {
      id: 'descargas',
      title: 'Centro de Descargas',
      icon: Download,
      subsections: [
        { id: 'descargas-archivos', title: 'Archivos Disponibles' }
      ]
    },
    {
      id: 'soporte',
      title: 'Soporte y Contacto',
      icon: HelpCircle,
      subsections: [
        { id: 'soporte-problemas', title: 'Problemas Comunes' },
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
                  <h3 className="text-xl font-semibold mb-3">Registro e Inicio</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      <strong>Crear una cuenta:</strong> Completa el formulario de registro con tu nombre, email, contraseña, teléfono y tu oficina o agencia local. No es necesario confirmar email para comenzar.
                    </p>
                    <p className="text-gray-700">
                      <strong>Acceso Directo:</strong> Una vez registrado, el sistema te mantendrá conectado. Puedes acceder desde cualquier dispositivo usando tu email y contraseña.
                    </p>
                  </div>
                </div>

                <div id="suscripcion" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Suscripción VIP</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Para acceder a las herramientas avanzadas (AI, Placas VIP, Indicadores Pro), Rialtor requiere una suscripción activa.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Selección de Plan:</strong> Al ingresar por primera vez, serás redirigido a la página de planes (Mensual o Anual).</li>
                      <li><strong>Pago Seguro:</strong> Utilizamos <strong>Stripe</strong> para procesar pagos de forma segura con tarjeta de crédito o débito.</li>
                      <li><strong>Activación Instantánea:</strong> Una vez completado el pago, todas las funciones VIP se habilitarán automáticamente.</li>
                    </ul>
                  </div>
                </div>

                <div id="panel" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Panel de Control (Dashboard)</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Tu Dashboard es el centro neurálgico donde encontrarás:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Indicadores Rápidos:</strong> Dólar, IPC, CAC y más, actualizados al momento.</li>
                      <li><strong>Embudo de Ventas:</strong> Visualiza tus prospectos y cierres proyectados.</li>
                      <li><strong>Calendario:</strong> Gestiona tus citas y eventos importantes.</li>
                      <li><strong>Documentos Recientes:</strong> Acceso rápido a tus últimas creaciones.</li>
                    </ul>
                  </div>
                </div>

                <div id="pwa" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">App Móvil (PWA)</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Puedes instalar Rialtor como una aplicación en tu teléfono sin necesidad de ir a la App Store o Play Store.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-3 bg-white rounded border border-gray-100">
                        <span className="font-bold text-blue-600">iOS (iPhone):</span>
                        <p className="text-sm">Toca el botón "Compartir" en Safari y selecciona <strong>"Agregar al inicio"</strong>.</p>
                      </div>
                      <div className="p-3 bg-white rounded border border-gray-100">
                        <span className="font-bold text-blue-600">Android:</span>
                        <p className="text-sm">Toca los tres puntos arriba a la derecha y selecciona <strong>"Instalar aplicación"</strong>.</p>
                      </div>
                    </div>
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
                      El <strong>Asistente IA de RIALTOR</strong> es un consultor inmobiliario inteligente especializado en el mercado argentino. Combina modelos avanzados de lenguaje con búsqueda en tiempo real.
                    </p>
                    <p className="text-gray-700">
                      A diferencia de un chat convencional, RIALTOR tiene acceso a:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Búsqueda Web en vivo:</strong> Cotizaciones del dólar, noticias y regulaciones al día.</li>
                      <li><strong>Herramientas de cálculo:</strong> Puede realizar desgloses de impuestos y comisiones automáticamente.</li>
                      <li><strong>Conocimiento Contextual:</strong> Entiende documentos y normativas específicas del sector.</li>
                    </ul>
                  </div>
                </div>

                <div id="ia-consultas" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Tipos de Consultas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">Puedes probar con estas consultas reales:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="border border-blue-100 bg-white p-4 rounded-lg">
                        <p className="font-semibold text-blue-700 mb-1">Mercado y Dólar</p>
                        <p className="text-sm italic">"¿A cuánto cerró el dólar blue hoy?"</p>
                      </div>
                      <div className="border border-blue-100 bg-white p-4 rounded-lg">
                        <p className="font-semibold text-blue-700 mb-1">Cálculos Propios</p>
                        <p className="text-sm italic">"Calculame honorarios para una venta de 150k USD en CABA con 4% de comisión"</p>
                      </div>
                      <div className="border border-blue-100 bg-white p-4 rounded-lg">
                        <p className="font-semibold text-blue-700 mb-1">Legales</p>
                        <p className="text-sm italic">"¿Cuáles son los requisitos de la nueva ley de alquileres para el ajuste?"</p>
                      </div>
                      <div className="border border-blue-100 bg-white p-4 rounded-lg">
                        <p className="font-semibold text-blue-700 mb-1">Análisis</p>
                        <p className="text-sm italic">"Analizá este contrato que voy a subir y decime las cláusulas de rescisión"</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="ia-mejores-practicas" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Mejores Prácticas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Acceso desde el menú:</strong> Rialtor es una SPA (Single Page Application), podés acceder al Asistente IA directamente desde el menú lateral izquierdo en cualquier momento.</li>
                      <li><strong>Contexto geográfico:</strong> Mencioná siempre si la consulta es para CABA, GBA o Interior, ya que los impuestos varían.</li>
                      <li><strong>Limpiar Chat:</strong> Si vas a cambiar radicalmente de tema, usá el botón "Limpiar Chat" para evitar confusiones con el contexto anterior.</li>
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
                    <p className="text-gray-700">Actualizados cada 5 minutos desde fuentes oficiales:</p>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>Dólar Blue</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>Dólar Oficial</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>Dólar MEP/CCL</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>ICL (Alquileres)</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>CAC (Cámara Const.)</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>IPC (Inflación)</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>UVA / UVI</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>Precio m² CABA</strong></div>
                      <div className="bg-white p-3 border rounded shadow-sm"><strong>Tasas Bancarias</strong></div>
                    </div>
                  </div>
                </div>

                <div id="indicadores-uso" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Cómo Usar Indicadores</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Entrá a la sección <code>/indicadores</code>. Encontrarás gráficos interactivos donde podés visualizar la evolución histórica y comparar valores. Ideal para mostrarle al cliente tendencias de mercado reales con bases de datos verificadas.
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

                <div id="calc-listado" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Suite de Calculadoras</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">RIALTOR incluye una suite completa de herramientas para el profesional inmobiliario:</p>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-gray-700 list-none p-0">
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Comisiones e Honorarios</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Gastos de Escrituración</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Impuesto a las Ganancias (IIGG)</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Ajustes de Alquiler (IPC/ICL)</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Calculadora CAC (Construcción)</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Créditos Hipotecarios UVA</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Seguros de Caución</li>
                      <li className="flex items-center gap-2 font-medium"><div className="w-2 h-2 bg-blue-500 rounded-full"></div> Días Hábiles Contractuales</li>
                    </ul>
                  </div>
                </div>

                <div id="calc-comisiones" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Paso a paso: Comisiones</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                      <li>Ingresá el monto de la operación y seleccioná la moneda.</li>
                      <li>Definí el porcentaje de comisión (ej: 4%).</li>
                      <li>Seleccioná tu condición fiscal (Monotributo/RI) y la provincia para el cálculo de IIBB.</li>
                      <li>Hacé clic en <strong>Calcular</strong> para ver el total neto a cobrar y los impuestos aplicados.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Documentos */}
              <section id="documentos" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <FileText className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Documentos y Formularios</h2>
                </div>

                <div id="doc-formularios" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Paso a paso: Editar Formularios</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">Editá tus contratos directamente en la nube:</p>
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                       <li>Andá a <code>/formularios</code>.</li>
                       <li>Elegí entre las carpetas: <strong>Alquiler</strong>, <strong>Boletos</strong> o <strong>Reservas</strong>.</li>
                       <li>Hacé clic en <strong>✏️ Abrir y Editar</strong> en el documento deseado.</li>
                       <li>Modificá el texto. Los cambios se guardan temporalmente en tu sesión.</li>
                       <li>Hacé clic en <strong>Descargar Documento Completado</strong> para obtener el .docx final.</li>
                    </ol>
                  </div>
                </div>

                <div id="doc-resumidor" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Resumidor Inteligente</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">Subí cualquier PDF o DOCX de carácter legal y pedile a la IA que te extraiga los vencimientos, montos y cláusulas críticas. Ahorrá tiempo valioso en la revisión de contratos complejos.</p>
                  </div>
                </div>
              </section>

              {/* Placas */}
              <section id="placas" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <ImageIcon className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Generador de Placas</h2>
                </div>

                <div id="placas-modelos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Modelos de Placas Disponibles</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700 mb-4">RIALTOR ofrece 5 diseños optimizados para diferentes objetivos:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="font-bold text-blue-800">1. STANDARD</p>
                        <p className="text-xs text-gray-600">Diseño esencial y limpio. Ideal para publicaciones rápidas con datos clave.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-blue-50 shadow-sm">
                        <p className="font-bold text-blue-800">2. PREMIUM</p>
                        <p className="text-xs text-gray-600">Enfoque profesional con foto del agente, branding y mayor visibilidad de contacto.</p>
                      </div>
                      <div className="p-4 border border-blue-200 rounded-lg bg-blue-100 shadow-sm">
                        <p className="font-bold text-blue-700 flex items-center gap-1">3. VIP <Star className="w-3 h-3 fill-blue-700"/></p>
                        <p className="text-xs text-gray-600">Estética editorial con composición de 3 fotos y QR dinámico para la ficha.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="font-bold text-gray-800">4. MODERNO</p>
                        <p className="text-xs text-gray-600">Barra lateral traslúcida y tipografía moderna para un look vanguardista.</p>
                      </div>
                      <div className="p-4 border rounded-lg bg-white shadow-sm">
                        <p className="font-bold text-gray-800">5. IMPACTO</p>
                        <p className="text-xs text-gray-600">Diseño enmarcado con cajas de información centradas para captar atención inmediata.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="placas-crear" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Cómo generar una placa</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <ol className="list-decimal list-inside text-gray-700 space-y-2">
                       <li>Subí las fotos de la propiedad a <code>/placas</code>.</li>
                       <li>Seleccioná uno de los <strong>5 modelos disponibles</strong> según tu necesidad.</li>
                       <li>Completá los datos (en el Modelo 4 podés incluso elegir el color de la barra).</li>
                       <li>Generá la previsualización y descargá el archivo final en alta resolución.</li>
                    </ol>
                  </div>
                </div>
              </section>

              {/* Proyecciones y Análisis */}
              <section id="proyecciones-analisis" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <BarChart3 className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Proyecciones y Análisis</h2>
                </div>

                <div id="proy-prospectos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Simulación Comercial</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      En la sección de <code>/prospectos</code> no cargás clientes individuales, sino que realizás <strong>proyecciones matemáticas</strong> de tu negocio.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                      <li><strong>Volumen de Prospección:</strong> Ingresá cuántos contactos nuevos (Fríos y Referidos) tenés en un período determinado.</li>
                      <li><strong>Nivel de Agente:</strong> Ajustá tu nivel (Junior a Top Producer). El sistema cambiará las tasas de conversión automáticamente basadas en estadísticas reales del mercado.</li>
                      <li><strong>Ticket y Comisión:</strong> Definí el precio promedio de las propiedades que manejás y tu porcentaje de honorarios para ver el potencial económico de tu pipeline.</li>
                    </ul>
                  </div>
                </div>

                <div id="proy-funnel" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Embudo de Conversión</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Visualizá gráficamente el recorrido de tus negocios desde el contacto inicial hasta el cierre efectivo:
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                       <li><strong>Etapas Clave:</strong> Tasaciones, Captaciones, Reservas y Cierres.</li>
                       <li><strong>Análisis Comparativo:</strong> Entendé por qué los referidos (Hot) convierten mucho mejor que los contactos de base fría (Cold).</li>
                       <li><strong>Metas Mensuales:</strong> Usá el funnel para saber cuántos contactos nuevos necesitás hoy para alcanzar tu objetivo de cierres a fin de mes.</li>
                    </ul>
                  </div>
                </div>
              </section>

              {/* Finanzas */}
              <section id="finanzas" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <DollarSign className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Gestión Financiera</h2>
                </div>

                <div id="finanzas-ingresos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Movimientos de Caja</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Rialtor te permite llevar una contabilidad bimonetaria (ARS/USD) diferenciando entre tu actividad profesional y tu vida personal.
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="p-4 bg-white rounded-lg border border-gray-100">
                        <p className="font-bold text-blue-700">Actividad Laboral</p>
                        <p className="text-sm text-gray-600">Comisiones de venta, alquiler, honorarios por tasaciones, inversión en publicidad y membresías.</p>
                      </div>
                      <div className="p-4 bg-white rounded-lg border border-gray-100">
                        <p className="font-bold text-green-700">Actividad Personal</p>
                        <p className="text-sm text-gray-600">Gastos de vivienda (Alquiler, Expensas, Servicios), educación, comida y ahorro personal.</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div id="finanzas-graficos" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Gráficos y Visualización</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">En la pestaña de <strong>Reportes</strong>, accedés a una vista analítica:</p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                       <li><strong>Distribución de Gastos:</strong> Gráfico de torta que muestra qué porcentaje de tus ingresos se va en cada concepto.</li>
                       <li><strong>Evolución Mensual:</strong> Gráfico de barras comparativo de Ingresos vs Egresos a lo largo del tiempo.</li>
                       <li><strong>Balance Neto:</strong> Cálculo en tiempo real de tu rentabilidad por moneda.</li>
                    </ul>
                  </div>
                </div>

                <div id="finanzas-reportes" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Reportes Exportables</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Podés descargar toda tu información contable en un archivo de <strong>Excel (.xlsx)</strong> con un solo clic. Ideal para entregar a tu contador o realizar análisis externos detallados.
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
                  <h3 className="text-xl font-semibold mb-3">Feed de Novedades</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      En <code>/news</code> tenés un feed actualizado con las últimas novedades de los portales inmobiliarios y económicos más importantes de Argentina.
                    </p>
                  </div>
                </div>
              </section>

              {/* Newsletter */}
              <section id="newsletter" className="mb-16 scroll-mt-24">
                <div className="flex items-center gap-3 mb-6">
                  <Star className="w-8 h-8 text-blue-600" />
                  <h2 className="text-3xl font-bold text-gray-900 m-0">Mis Newsletters</h2>
                </div>

                <div id="newsletter-gestion" className="mb-8 scroll-mt-24">
                  <h3 className="text-xl font-semibold mb-3">Gestión de Campañas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Creá campañas de email marketing para tus clientes directamente desde Rialtor.
                    </p>
                    <ul className="list-disc list-inside text-gray-700 space-y-2">
                       <li><strong>Plantillas:</strong> Elegí entre diseños profesionales de propiedades o newsletters informativas.</li>
                       <li><strong>Propiedades Destacadas:</strong> Arrastrá tus propiedades activas para incluirlas automáticamente en el correo.</li>
                       <li><strong>Seguimiento:</strong> Enviá a tus suscriptores y mantené el contacto recurrente con tu base.</li>
                    </ul>
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
                  <h3 className="text-xl font-semibold mb-3">Agenda de Visitas</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Sincronizá tus visitas y reuniones. Podés ver tus compromisos en formato semanal o mensual en <code>/calendario</code>.
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
                  <h3 className="text-xl font-semibold mb-3">Material Exclusivo</h3>
                  <div className="bg-gray-50 rounded-lg p-6 space-y-4">
                    <p className="text-gray-700">
                      Descargá guías, leyes actualizadas, y material de marketing listo para usar en tu inmobiliaria. 
                    </p>
                  </div>
                </div>
              </section>

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