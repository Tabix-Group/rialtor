"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "./auth/authContext"

// Simple SVG icon components to replace lucide-react
const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

const User2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const Calculator = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={2} />
    <line x1="8" y1="6" x2="16" y2="6" strokeWidth={2} />
    <line x1="8" y1="10" x2="8" y2="10" strokeWidth={2} />
    <line x1="12" y1="10" x2="12" y2="10" strokeWidth={2} />
    <line x1="16" y1="10" x2="16" y2="10" strokeWidth={2} />
    <line x1="8" y1="14" x2="8" y2="14" strokeWidth={2} />
    <line x1="12" y1="14" x2="12" y2="14" strokeWidth={2} />
    <line x1="16" y1="14" x2="16" y2="14" strokeWidth={2} />
    <line x1="8" y1="18" x2="8" y2="18" strokeWidth={2} />
    <line x1="12" y1="18" x2="16" y2="18" strokeWidth={2} />
  </svg>
)

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const BadgeDollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3l1.5 1.5L5 6l-1.5-1.5L5 3zM19 3l1.5 1.5L19 6l-1.5-1.5L19 3zM12 1l1.5 1.5L12 4l-1.5-1.5L12 1zM12 20l1.5 1.5L12 23l-1.5-1.5L12 20zM5 21l1.5-1.5L5 18l-1.5 1.5L5 21zM19 21l1.5-1.5L19 18l-1.5 1.5L19 21z"
    />
  </svg>
)

export default function Home() {
  // Features con hipervínculos activos para todos los usuarios
  const features = [
    {
      name: "Informes y Novedades de Mercado",
      description: "Datos precisos del mercado argentino: evolución de precios por zona, demanda real y tendencias que marcan la diferencia en tus ventas.",
      icon: BookOpen,
      href: "https://www.rialtor.app/news",
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
    },
    {
      name: "Consultor Inmobiliario IA",
      description: "Tu asesor 24/7 especializado en Argentina: negocia mejor, tasá propiedades con precisión y resolví dudas complejas al instante.",
      icon: User2,
      href: "https://www.rialtor.app/chat",
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
    },
    {
      name: "Calculadoras Profesionales",
      description: "Calculadoras actualizadas con la legislación argentina: gastos de escritura, impuestos provinciales, comisiones y todo lo que necesitas para cerrar operaciones.",
      icon: Calculator,
      href: "https://www.rialtor.app/calculadoras",
      color: "from-green-500 to-green-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
    },
    {
      name: "Documentos Inteligentes",
      description: "Generá contratos, reservas y boletos adaptados a la legislación argentina. Ahorra horas de trabajo y evitá errores costosos.",
      icon: FileText,
      href: "https://www.rialtor.app/documents",
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      name: "Créditos Hipotecarios",
      description: "Accedé a todas las opciones de financiación vigentes: tasas, requisitos y bancos. Ayudá a tus clientes a encontrar el crédito perfecto.",
      icon: BadgeDollarSign,
      href: "https://www.rialtor.app/hipotecarios",
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      name: "Generador de Placas",
      description: "Creá placas profesionales con IA que venden más. Subí fotos y obtené imágenes optimizadas para redes sociales y portales argentinos.",
      icon: ShieldCheck,
      href: "https://www.rialtor.app/placas",
      color: "from-indigo-500 to-indigo-600",
      bgColor: "bg-indigo-50",
      textColor: "text-indigo-600",
    },
    {
      name: "Seguro de Caución",
      description: "Compará y simulá seguros de caución para alquileres. Encontrá la mejor opción para tus clientes y generá ingresos adicionales.",
      icon: Shield,
      href: "https://www.rialtor.app/creditos",
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
    },
  ]

  type Article = {
    id: string
    title: string
    summary?: string
    content?: string
    category?: { name?: string }
    createdAt: string
  }

  const [recentArticles, setRecentArticles] = useState<Article[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [searching, setSearching] = useState(false)
  const [searchResults, setSearchResults] = useState(null)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/articles?status=PUBLISHED&limit=3")
        const data = await res.json()
        setRecentArticles(data.articles || [])
      } catch (e) {
        setRecentArticles([])
      }
    }
    fetchRecent()
  }, [])

  const handleScrollToDemo = () => {
    const el = document.getElementById("demo-video")
    if (el) {
      el.scrollIntoView({ behavior: "smooth" })
      // Wait for scroll to complete, then play video
      setTimeout(() => {
        const video = el.querySelector('video') as HTMLVideoElement
        if (video) {
          video.play().catch(e => {
            console.log('Video autoplay failed:', e)
          })
        }
      }, 1000) // Wait 1 second for scroll to complete
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 py-20 lg:py-32">
        {/* Simplified background pattern */}
        <div className="absolute inset-0 opacity-20">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.15) 1px, transparent 0)`,
              backgroundSize: "20px 20px",
            }}
          ></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-300 text-sm font-medium mb-8">
            <Sparkles className="w-4 h-4 mr-2" />
            🚀 Potenciá tu negocio inmobiliario en Argentina
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">RIALTOR</span>
            <br />
            <span className="text-2xl md:text-4xl lg:text-5xl text-slate-300 font-light">La revolución inmobiliaria llegó</span>
          </h1>

          <p className="text-xl md:text-2xl text-slate-300 mb-12 max-w-4xl mx-auto leading-relaxed">
            Cerrá más operaciones con IA inteligente, herramientas especializadas y datos precisos del mercado argentino.
            <span className="text-blue-300 font-semibold"> Cientos de agentes ya confian en nosotros.</span>
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={handleScrollToDemo}
              className="group inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Ver Demo en 2 Minutos
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>

            <Link
              href="/auth/register"
              className="inline-flex items-center px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-semibold rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300"
            >
              🚀 Empezar Gratis
            </Link>
          </div>
        </div>
      </section>

      {/* Main Features Section - Constellation */}
      <section className="w-full bg-gradient-to-br from-slate-50 via-white to-blue-50 py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
              Todo lo que un martillero necesita para vender más
            </h2>
            <p className="text-xl text-slate-600 max-w-4xl mx-auto">
              Desde informes de mercado actualizados hasta contratos inteligentes: herramientas diseñadas específicamente
              para el mercado inmobiliario argentino y sus desafíos únicos.
            </p>
          </div>

          {/* Constellation Layout - Hidden on mobile, shown on lg and up */}
          <div className="hidden lg:block relative w-full h-[900px] flex items-center justify-center overflow-visible">
            {/* Animated background circles */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-96 h-96 border border-blue-200/30 rounded-full animate-pulse"></div>
              <div
                className="absolute w-[500px] h-[500px] border border-purple-200/20 rounded-full animate-pulse"
                style={{ animationDelay: "1s" }}
              ></div>
              <div
                className="absolute w-[650px] h-[650px] border border-blue-100/20 rounded-full animate-pulse"
                style={{ animationDelay: "2s" }}
              ></div>
            </div>

            {/* Central Logo with enhanced styling */}
            <div className="absolute inset-0 flex items-center justify-center z-20">
              <div className="relative group">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
                <div className="relative bg-white rounded-full p-8 shadow-2xl border border-slate-200/50 backdrop-blur-sm">
                  <img
                    src="/images/logoblanco.png"
                    alt="Logo RIALTOR"
                    className="w-32 h-32 md:w-40 md:h-40 object-contain filter drop-shadow-lg"
                  />
                </div>
              </div>
            </div>

            {/* Enhanced Features around the logo */}
            {features.map((feature, idx) => {
              const angle = (360 / features.length) * idx - 90 // Start from top
              const radius = 350
              const x = Math.cos((angle * Math.PI) / 180) * radius
              const y = Math.sin((angle * Math.PI) / 180) * radius

              return (
                <div
                  key={feature.name}
                  className="absolute z-10"
                  style={{
                    left: "50%",
                    top: "50%",
                    transform: `translate(-50%, -50%) translate(${x}px, ${y}px)`,
                  }}
                >
                  {/* Connection line */}
                  <div
                    className="absolute w-px bg-gradient-to-r from-transparent via-slate-300 to-transparent opacity-30"
                    style={{
                      height: `${radius - 120}px`,
                      left: "50%",
                      top: "50%",
                      transform: `translate(-50%, -50%) rotate(${angle + 90}deg)`,
                      transformOrigin: "center bottom",
                    }}
                  ></div>

                  <div
                    className="group h-full relative"
                    onMouseEnter={() => setHoveredFeature(idx)}
                    onMouseLeave={() => setHoveredFeature(null)}
                  >
                    <a href={feature.href} target="_blank" rel="noopener noreferrer" className="block h-full">
                      <div className="relative h-full min-w-0 max-w-48 p-4 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl hover:shadow-2xl hover:border-slate-300 transition-all duration-500 flex flex-col items-center justify-center text-center transform hover:-translate-y-2 hover:scale-105">
                        {/* Gradient background on hover */}
                        <div
                          className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`}
                        ></div>

                        <div
                          className={`relative w-12 h-12 ${feature.bgColor} rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300`}
                        >
                          <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
                        </div>

                        <h3 className="relative text-xs font-bold text-slate-900 leading-tight whitespace-nowrap">{feature.name}</h3>

                        {/* Hover arrow */}
                        <div className="relative mt-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <ArrowRight className={`w-3 h-3 ${feature.textColor}`} />
                        </div>
                      </div>
                    </a>

                    {/* Tooltip outside the card */}
                    <div
                      className={`absolute z-[9999] bottom-full left-1/2 transform -translate-x-1/2 mb-3 px-3 py-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg transition-opacity duration-300 pointer-events-none whitespace-nowrap max-w-xs text-center ${hoveredFeature === idx ? 'opacity-100' : 'opacity-0'
                        }`}
                    >
                      {feature.description}
                      {/* Arrow pointing down */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-slate-900"></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Tablet Layout - Shown on md to lg */}
          <div className="hidden md:block lg:hidden">
            <div className="grid grid-cols-2 gap-8 max-w-4xl mx-auto">
              {features.map((feature, idx) => (
                <a
                  key={feature.name}
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                  title={`Ir a ${feature.name}`}
                >
                  <div className="group h-full">
                    <div className="relative h-full p-6 bg-white/80 backdrop-blur-sm border border-slate-200/50 rounded-2xl hover:shadow-xl hover:border-slate-300 transition-all duration-300 transform hover:-translate-y-1">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                      ></div>

                      <div
                        className={`relative w-14 h-14 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`h-7 w-7 ${feature.textColor}`} />
                      </div>

                      <h3 className="relative text-lg font-bold text-slate-900 mb-3">{feature.name}</h3>

                      <p className="relative text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>

          {/* Mobile Grid - Shown only on mobile */}
          <div className="md:hidden">
            <div className="grid grid-cols-1 gap-6">
              {features.map((feature, idx) => (
                <a
                  key={feature.name}
                  href={feature.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block h-full"
                  title={`Ir a ${feature.name}`}
                >
                  <div className="group h-full">
                    <div className="relative h-full p-6 bg-white/90 backdrop-blur-sm border border-slate-200/50 rounded-2xl hover:shadow-lg hover:border-slate-300 transition-all duration-300">
                      <div
                        className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                      ></div>

                      <div
                        className={`relative w-12 h-12 ${feature.bgColor} rounded-xl flex items-center justify-center mb-4`}
                      >
                        <feature.icon className={`h-6 w-6 ${feature.textColor}`} />
                      </div>

                      <h3 className="relative text-lg font-bold text-slate-900 mb-3">{feature.name}</h3>

                      <p className="relative text-slate-600 text-sm leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-24 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-6">Descubrí cómo cerrar más operaciones en Argentina</h2>
            <p className="text-xl text-slate-600 max-w-2xl mx-auto">
              Vea en 2 minutos cómo RIALTOR transforma la forma de trabajar de los martilleros argentinos con herramientas
              que realmente marcan la diferencia en resultados.
            </p>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-3xl blur-xl opacity-20"></div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden shadow-2xl border border-slate-200/50 backdrop-blur-sm">
              <video
                src="/docs/Videos/RIALTOR.mp4"
                title="Demo RIALTOR"
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700/50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30"></div>
                  <img src="/images/logoblanco.png" alt="Logo Rialtor" className="relative w-12 h-12 object-contain" />
                </div>
                <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                  RIALTOR
                </span>
              </div>
              <p className="text-slate-400 text-sm leading-relaxed max-w-xs">
                La plataforma definitiva para martilleros y agentes inmobiliarios en Argentina.
                Herramientas especializadas que entienden nuestro mercado único.
              </p>
            </div>

            {/* Herramientas */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Herramientas para Martilleros</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/news"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Mercado Inmobiliario Argentino
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documents"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contratos y Formularios
                  </Link>
                </li>
                <li>
                  <Link
                    href="/calculadoras"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Calculadoras Fiscales
                  </Link>
                </li>
                <li>
                  <Link
                    href="/chat"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Asistente IA 24/7
                  </Link>
                </li>
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Soporte</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/ayuda"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Contacto
                  </Link>
                </li>
                <li>
                  <Link
                    href="/capacitacion"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Capacitación
                  </Link>
                </li>
                <li>
                  <Link
                    href="/documentacion"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Documentación
                  </Link>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold text-white mb-6">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a
                    href="https://www.remax.com.ar/terminos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Términos y Condiciones
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.remax.com.ar/privacidad"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-slate-400 hover:text-blue-400 transition-colors duration-200 flex items-center group"
                  >
                    <ArrowRight className="w-3 h-3 mr-2 opacity-0 group-hover:opacity-100 transition-opacity" />
                    Política de Privacidad
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-slate-700/50 mt-16 pt-8 text-center">
            <p className="text-slate-500 text-sm">© 2025 RIALTOR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
