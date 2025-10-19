"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "./auth/authContext"

// SVG icon components
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

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM20 4v6m3-3h-6"
    />
  </svg>
)

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const Crown = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 16l-1-4 5.5 2 6-6 6 6 5.5-2L21 16H5zM19 20H5a1 1 0 01-1-1v-1a1 1 0 011-1h14a1 1 0 011 1v1a1 1 0 01-1 1z"
    />
  </svg>
)

const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
    />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
)

export default function Home() {
  const features = [
    {
      name: "Informes y Novedades de Mercado",
      description:
        "Datos precisos del mercado argentino: evolución de precios por zona, demanda real y tendencias que marcan la diferencia en tus ventas.",
      icon: BookOpen,
      href: "https://www.rialtor.app/news",
      gradient: "from-blue-500 to-cyan-500",
    },
    {
      name: "Consultor Inmobiliario IA",
      description:
        "Tu asesor 24/7 especializado en Argentina: negocia mejor, tasá propiedades con precisión y resolví dudas complejas al instante.",
      icon: User2,
      href: "https://www.rialtor.app/chat",
      gradient: "from-violet-500 to-purple-500",
    },
    {
      name: "Calculadoras Profesionales",
      description:
        "Calculadoras actualizadas con la legislación argentina: gastos de escritura, impuestos provinciales, comisiones y todo lo que necesitas para cerrar operaciones.",
      icon: Calculator,
      href: "https://www.rialtor.app/calculadoras",
      gradient: "from-emerald-500 to-teal-500",
    },
    {
      name: "Documentos Inteligentes",
      description:
        "Generá contratos, reservas y boletos adaptados a la legislación argentina. Ahorra horas de trabajo y evitá errores costosos.",
      icon: FileText,
      href: "https://www.rialtor.app/documents",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      name: "Créditos Hipotecarios",
      description:
        "Accedé a todas las opciones de financiación vigentes: tasas, requisitos y bancos. Ayudá a tus clientes a encontrar el crédito perfecto.",
      icon: BadgeDollarSign,
      href: "https://www.rialtor.app/hipotecarios",
      gradient: "from-green-500 to-emerald-500",
    },
    {
      name: "Generador de Placas",
      description:
        "Creá placas profesionales con IA que venden más. Subí fotos y obtené imágenes optimizadas para redes sociales y portales argentinos.",
      icon: ShieldCheck,
      href: "https://www.rialtor.app/placas",
      gradient: "from-indigo-500 to-blue-500",
    },
    {
      name: "Seguro de Caución",
      description:
        "Compará y simulá seguros de caución para alquileres. Encontrá la mejor opción para tus clientes y generá ingresos adicionales.",
      icon: Shield,
      href: "https://www.rialtor.app/creditos",
      gradient: "from-cyan-500 to-blue-500",
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
      setTimeout(() => {
        const video = el.querySelector("video") as HTMLVideoElement
        if (video) {
          video.play().catch((e) => {
            console.log("Video autoplay failed:", e)
          })
        }
      }, 1000)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-subtle">
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:24px_24px]"></div>

        {/* Gradient orbs */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/5 rounded-full blur-3xl"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 lg:pt-32 lg:pb-40">
          <div className="text-center space-y-8">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/50 border border-border/50 backdrop-blur-sm">
              <TrendingUp className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium text-muted-foreground">
                Potenciá tu negocio inmobiliario en Argentina
              </span>
            </div>

            {/* Main heading */}
            <div className="space-y-6">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold tracking-tight text-balance">
                <span className="text-gradient">
                  RIALTOR
                </span>
              </h1>
              <p className="text-2xl sm:text-3xl lg:text-4xl font-medium text-muted-foreground text-balance">
                La revolución inmobiliaria llegó
              </p>
            </div>

            {/* Description */}
            <p className="max-w-3xl mx-auto text-lg sm:text-xl text-muted-foreground leading-relaxed text-balance">
              Cerrá más operaciones con IA, herramientas especializadas y datos precisos del mercado argentino.
              <span className="text-foreground font-semibold"> Cientos de agentes ya confían en nosotros.</span>
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
              <button
                onClick={handleScrollToDemo}
                className="group inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105 border border-primary/20"
              >
                <Play className="w-5 h-5" />
                Ver Demo en 2 Minutos
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>

              <Link
                href="/auth/register"
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent text-accent-foreground font-semibold rounded-xl hover:bg-accent/90 transition-all duration-300 border border-accent/20 shadow-md hover:shadow-lg hover:scale-105"
              >
                <UserPlus className="w-5 h-5" />
                Registrarte Gratis
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 lg:py-32 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Todo lo que un martillero necesita para vender más
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-3xl mx-auto text-balance">
              Desde informes de mercado actualizados hasta contratos inteligentes: herramientas diseñadas
              específicamente para el mercado inmobiliario argentino y sus desafíos únicos.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => (
              <a
                key={feature.name}
                href={feature.href}
                className="group relative"
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
              >
                <div className="relative h-full p-8 bg-card border border-border rounded-2xl hover:border-primary/50 transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
                  {/* Gradient overlay on hover */}
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-300`}
                  ></div>

                  {/* Icon */}
                  <div
                    className={`relative w-14 h-14 rounded-xl bg-gradient-to-br ${feature.gradient} p-3 mb-6 shadow-lg group-hover:shadow-xl group-hover:scale-110 transition-all duration-300`}
                  >
                    <feature.icon className="w-full h-full text-white" />
                  </div>

                  {/* Content */}
                  <div className="relative space-y-3">
                    <h3 className="text-xl font-bold text-card-foreground group-hover:text-primary transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                  </div>

                  {/* Arrow indicator */}
                  <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="w-5 h-5 text-primary" />
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-24 lg:py-32 bg-background">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Descubrí cómo cerrar más operaciones en Argentina
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Vea en 2 minutos cómo RIALTOR transforma la forma de trabajar de los martilleros argentinos con
              herramientas que realmente marcan la diferencia en resultados.
            </p>
          </div>

          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-accent rounded-3xl blur-xl opacity-20 group-hover:opacity-30 transition-opacity"></div>
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl">
              <video
                src="/docs/Videos/RIALTOR.mp4"
                title="Demo RIALTOR"
                controls
                className="w-full h-full object-cover bg-muted"
                preload="metadata"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 lg:py-32 bg-gradient-subtle">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16 space-y-4">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance">
              Planes que se adaptan a tu negocio
            </h2>
            <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto text-balance">
              Elegí el plan perfecto para potenciar tu carrera inmobiliaria en Argentina
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Monthly Plan */}
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary/50 rounded-2xl blur opacity-0 group-hover:opacity-20 transition duration-300"></div>
              <div className="relative bg-card rounded-2xl p-8 border border-border hover:border-primary/50 hover:shadow-xl transition-all duration-300">
                <div className="text-center mb-8 space-y-2">
                  <h3 className="text-2xl font-bold">Plan Mensual</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-5xl font-bold">$25</span>
                    <span className="text-muted-foreground">USD/mes</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Facturación mensual</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "Todas las herramientas inmobiliarias",
                    "Calculadora de créditos hipotecarios",
                    "Generación de documentos legales",
                    "Sistema de placas automáticas",
                    "Tasas bancarias actualizadas",
                    "Soporte técnico incluido",
                  ].map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-3 h-3 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">{item}</span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/auth/register"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-primary text-primary-foreground font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  Comenzar ahora
                </Link>
              </div>
            </div>

            {/* Annual Plan */}
            <div className="relative group">
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-accent text-accent-foreground px-4 py-1 rounded-full text-sm font-medium flex items-center gap-1 z-10 shadow-lg border border-accent/20">
                <Crown className="w-4 h-4" />
                Más Popular
              </div>
              <div className="absolute -inset-1 bg-gradient-accent rounded-2xl blur opacity-20 group-hover:opacity-30 transition duration-300"></div>
              <div className="relative bg-card rounded-2xl p-8 border-2 border-accent hover:shadow-2xl transition-all duration-300">
                <div className="text-center mb-8 space-y-2">
                  <h3 className="text-2xl font-bold">Plan Anual</h3>
                  <div className="flex items-baseline justify-center gap-2">
                    <span className="text-lg text-muted-foreground line-through">$300</span>
                    <span className="text-5xl font-bold">$240</span>
                    <span className="text-muted-foreground">USD/año</span>
                  </div>
                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    Ahorrás 20% ($60 USD)
                  </div>
                  <p className="text-sm text-muted-foreground">Equivale a $20 USD/mes</p>
                </div>

                <div className="space-y-4 mb-8">
                  {[
                    "Todas las herramientas inmobiliarias",
                    "Calculadora de créditos hipotecarios",
                    "Generación de documentos legales",
                    "Sistema de placas automáticas",
                    "Tasas bancarias actualizadas",
                    "Soporte técnico prioritario",
                    "2 meses gratis incluidos",
                  ].map((item, idx) => (
                    <div key={item} className="flex items-start gap-3">
                      <div
                        className={`w-5 h-5 rounded-full ${idx === 6 ? "bg-accent/20" : "bg-primary/10"} flex items-center justify-center flex-shrink-0 mt-0.5`}
                      >
                        <Check className={`w-3 h-3 ${idx === 6 ? "text-accent" : "text-primary"}`} />
                      </div>
                      <span
                        className={`text-sm ${idx === 6 ? "text-foreground font-medium" : "text-muted-foreground"}`}
                      >
                        {item}
                      </span>
                    </div>
                  ))}
                </div>

                <Link
                  href="/auth/register"
                  className="w-full inline-flex items-center justify-center px-6 py-3 bg-gradient-accent text-accent-foreground font-semibold rounded-xl hover:opacity-90 transition-all shadow-lg border border-accent/20"
                >
                  Elegir plan anual
                </Link>
              </div>
            </div>
          </div>

          <div className="text-center mt-12">
            <p className="text-sm text-muted-foreground">
              Todos los precios están en dólares estadounidenses. Sin permanencia, cancelá cuando quieras.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <div className="flex items-center gap-3">
                <div className="relative w-10 h-10">
                  <div className="absolute inset-0 bg-gradient-primary rounded-lg blur opacity-50"></div>
                  <img
                    src="/images/logoblanco.png"
                    alt="Logo Rialtor"
                    className="relative w-full h-full object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-gradient">
                  RIALTOR
                </span>
              </div>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma definitiva para martilleros y agentes inmobiliarios en Argentina. Herramientas
                especializadas que entienden nuestro mercado único.
              </p>
            </div>

            {/* Herramientas */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Herramientas para Martilleros</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Mercado Inmobiliario Argentino", href: "/news" },
                  { name: "Contratos y Formularios", href: "/documents" },
                  { name: "Calculadoras Fiscales", href: "/calculadoras" },
                  { name: "Asistente IA 24/7", href: "/chat" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Soporte</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Centro de Ayuda", href: "/ayuda" },
                  { name: "Contacto", href: "/contacto" },
                  { name: "Capacitación", href: "/capacitacion" },
                  { name: "Documentación", href: "/documentacion" },
                ].map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-lg font-semibold mb-6">Legal</h3>
              <ul className="space-y-3 text-sm">
                {[
                  { name: "Términos y Condiciones", href: "https://www.remax.com.ar/terminos" },
                  { name: "Política de Privacidad", href: "https://www.remax.com.ar/privacidad" },
                ].map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center gap-2 group"
                    >
                      <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="border-t border-border mt-16 pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 RIALTOR. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
