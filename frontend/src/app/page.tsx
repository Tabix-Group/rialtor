"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "./auth/authContext"

// SVG icon components
const BookOpen = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
    />
  </svg>
)

const User2 = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
    />
  </svg>
)

const Calculator = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="4" y="2" width="16" height="20" rx="2" strokeWidth={1.5} />
    <line x1="8" y1="6" x2="16" y2="6" strokeWidth={1.5} />
    <circle cx="8" cy="10" r="1" fill="currentColor" />
    <circle cx="12" cy="10" r="1" fill="currentColor" />
    <circle cx="16" cy="10" r="1" fill="currentColor" />
    <circle cx="8" cy="14" r="1" fill="currentColor" />
    <circle cx="12" cy="14" r="1" fill="currentColor" />
    <circle cx="16" cy="14" r="1" fill="currentColor" />
    <circle cx="8" cy="18" r="1" fill="currentColor" />
    <line x1="12" y1="18" x2="16" y2="18" strokeWidth={1.5} />
  </svg>
)

const FileText = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
    />
  </svg>
)

const BadgeDollarSign = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
)

const ShieldCheck = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const Shield = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M20.618 5.984A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
    />
  </svg>
)

const ArrowRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
)

const ArrowUpRight = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 17L17 7M17 7H7M17 7v10" />
  </svg>
)

const TrendingUp = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
)

const UserPlus = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7zM20 4v6m3-3h-6"
    />
  </svg>
)

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={1.5} />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={1.5} />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={1.5} />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={1.5} />
  </svg>
)

const Mail = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
    />
  </svg>
)

const Play = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24">
    <path d="M8 5v14l11-7z" />
  </svg>
)

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

export default function Home() {
  const features = [
    {
      name: "Centro de Noticias",
      description: "Actualización diaria automática de fuentes especializadas del sector inmobiliario.",
      icon: BookOpen,
      href: "https://www.rialtor.app/news",
      requiresAuth: false,
      size: "normal" as const,
    },
    {
      name: "Indicadores de Mercado",
      description: "Datos en tiempo real del mercado inmobiliario y cotizaciones actualizadas automáticamente.",
      icon: TrendingUp,
      href: "/indicadores",
      requiresAuth: false,
      isSpecial: true,
      size: "large" as const,
    },
    {
      name: "Proyecciones y Tasaciones",
      description: "Modelos de proyección y tasación para el mercado argentino.",
      icon: TrendingUp,
      href: "/proyecciones",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Consultor Inmobiliario IA",
      description: "Tu asesor 24/7 especializado en Argentina: negocia mejor, tasá propiedades con precisión.",
      icon: User2,
      href: "https://www.rialtor.app/chat",
      requiresAuth: true,
      size: "large" as const,
    },
    {
      name: "Calculadoras Profesionales",
      description: "Ajustes de alquiler por IPC, gastos de escritura, impuestos provinciales.",
      icon: Calculator,
      href: "https://www.rialtor.app/calculadoras",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Documentos Inteligentes",
      description: "Generá contratos, reservas y boletos adaptados a la legislación argentina.",
      icon: FileText,
      href: "https://www.rialtor.app/documents",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Créditos Hipotecarios",
      description: "Accedé a todas las opciones de financiación vigentes.",
      icon: BadgeDollarSign,
      href: "https://www.rialtor.app/hipotecarios",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Generador de Placas",
      description: "Creá placas profesionales con IA que venden más.",
      icon: ShieldCheck,
      href: "https://www.rialtor.app/placas",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Prospectos",
      description: "Gestioná leads y oportunidades: seguí prospectos, segmentá por interés.",
      icon: UserPlus,
      href: "/prospectos",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Newsletter Marketing",
      description: "Creá newsletters profesionales para promocionar tus propiedades.",
      icon: Mail,
      href: "/newsletter",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Seguro de Caución",
      description: "Compará y simulá seguros de caución para alquileres.",
      icon: Shield,
      href: "https://www.rialtor.app/creditos",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Mis Finanzas",
      description: "Gestioná tu negocio inmobiliario: seguí ingresos, gastos, comisiones.",
      icon: BadgeDollarSign,
      href: "/finanzas",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Calendario Profesional",
      description: "Organizá tus citas, visitas y eventos inmobiliarios.",
      icon: Calendar,
      href: "/calendario",
      requiresAuth: true,
      size: "normal" as const,
    },
    {
      name: "Resumidor Inteligente",
      description: "Resume documentos extensos al instante con IA.",
      icon: FileText,
      href: "/documents/summary",
      requiresAuth: true,
      size: "normal" as const,
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

  const [, setRecentArticles] = useState<Article[]>([])
  const { user } = useAuth()

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch("/api/articles?status=PUBLISHED&limit=3")
        const data = await res.json()
        setRecentArticles(data.articles || [])
      } catch {
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

  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  }

  const stats = [
    { value: "500+", label: "Agentes activos" },
    { value: "98%", label: "Tiempo ahorrado" },
    { value: "24/7", label: "Soporte IA" },
    { value: "3x", label: "Más conversiones" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#0f0627] via-[#1a0e3f] to-[#09090b] text-white">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-purple-500/10 bg-[#0f0627]/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-8">
              <Link href="/" className="text-xl font-bold tracking-tight">
                RIALTOR
              </Link>
              <div className="hidden md:flex items-center gap-6">
                <Link href="#features" className="text-sm text-purple-300/70 hover:text-white transition-colors">
                  Herramientas
                </Link>
                <Link href="#pricing" className="text-sm text-purple-300/70 hover:text-white transition-colors">
                  Precios
                </Link>
                <button
                  onClick={handleScrollToDemo}
                  className="text-sm text-purple-300/70 hover:text-white transition-colors"
                >
                  Demo
                </button>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/auth/login"
                className="text-sm text-purple-300/70 hover:text-white transition-colors px-4 py-2"
              >
                Iniciar sesión
              </Link>
              <Link
                href="/auth/register"
                className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-zinc-200 transition-colors"
              >
                Comenzar gratis
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Split Layout */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(139,92,246,0.25),rgba(255,255,255,0))]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-violet-500/15 via-purple-500/15 to-indigo-500/15 rounded-full blur-3xl opacity-60" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            {/* Left - Content */}
            <motion.div
              initial="hidden"
              animate="visible"
              variants={staggerContainer}
              className="space-y-8"
            >
              <motion.div variants={fadeInUp}>
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-xs font-medium text-purple-300">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                  Potenciado por IA
                </span>
              </motion.div>

              <motion.h1
                variants={fadeInUp}
                className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.1]"
              >
                La plataforma definitiva para{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-200 via-purple-300 to-violet-400">
                  agentes inmobiliarios
                </span>
              </motion.h1>

              <motion.p
                variants={fadeInUp}
                className="text-lg lg:text-xl text-purple-200/70 max-w-xl leading-relaxed"
              >
                Cerrá más operaciones con IA, herramientas especializadas y datos en tiempo real del mercado argentino.
              </motion.p>

              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all duration-200"
                >
                  Comenzar gratis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <button
                  onClick={handleScrollToDemo}
                  className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-white/5 border border-white/10 font-medium rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
                    <Play className="w-3 h-3 ml-0.5" />
                  </div>
                  Ver demo
                </button>
              </motion.div>

              {/* Trust indicators */}
              <motion.div variants={fadeInUp} className="pt-8 border-t border-white/5">
                <p className="text-xs text-purple-300/50 mb-4 uppercase tracking-wider">Empresas que confían en nosotros</p>
                <div className="flex items-center gap-8 opacity-50">
                  {["CBRE", "RE/MAX", "Century21", "Coldwell"].map((brand) => (
                    <span key={brand} className="text-sm font-semibold tracking-wider text-purple-300/40">
                      {brand}
                    </span>
                  ))}
                </div>
              </motion.div>
            </motion.div>

            {/* Right - Stats Grid */}
            <motion.div
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="grid grid-cols-2 gap-4">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                    className="relative group"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative p-6 lg:p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-colors">
                      <div className="text-3xl lg:text-4xl font-bold tracking-tight mb-1">
                        {stat.value}
                      </div>
                      <div className="text-sm text-purple-200/60">{stat.label}</div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section - Bento Grid */}
      <section id="features" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_50%,rgba(139,92,246,0.08),rgba(255,255,255,0))]" />
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-2xl mb-16 lg:mb-20"
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-purple-300/60 mb-3 uppercase tracking-wider">
              Herramientas
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            >
              Todo lo que necesitás para vender más
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-purple-200/60">
              Herramientas profesionales para el mercado inmobiliario argentino en una sola plataforma.
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
          >
            {features.map((feature) => {
              const isLarge = feature.size === "large"
              const isAccessible = !feature.requiresAuth || user

              return (
                <motion.div
                  key={feature.name}
                  variants={fadeInUp}
                  className={isLarge ? "md:col-span-2 lg:col-span-1" : ""}
                >
                  {isAccessible ? (
                    <a href={feature.href} className="group block h-full">
                      <div
                        className={`relative h-full p-6 lg:p-8 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 hover:bg-white/[0.04] transition-all duration-300 overflow-hidden ${
                          isLarge ? "min-h-[200px]" : ""
                        }`}
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                        <div className="relative w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5 group-hover:bg-white/10 transition-colors">
                          <feature.icon className="w-5 h-5 text-purple-300/60 group-hover:text-white transition-colors" />
                        </div>

                        <div className="relative space-y-2">
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold group-hover:text-white transition-colors">
                              {feature.name}
                            </h3>
                            <ArrowUpRight className="w-4 h-4 text-purple-400/40 opacity-0 group-hover:opacity-100 group-hover:text-purple-300 transition-all" />
                          </div>
                          <p className="text-sm text-purple-200/50 leading-relaxed group-hover:text-purple-200/70 transition-colors">
                            {feature.description}
                          </p>
                        </div>

                        {feature.isSpecial && (
                          <div className="absolute top-6 right-6 flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
                            <span className="text-[10px] font-medium text-violet-400">LIVE</span>
                          </div>
                        )}
                      </div>
                    </a>
                  ) : (
                    <div className="relative h-full p-6 lg:p-8 bg-white/[0.01] border border-white/5 rounded-2xl opacity-50">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center mb-5">
                        <feature.icon className="w-5 h-5 text-purple-400/40" />
                      </div>

                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold text-purple-300/50">{feature.name}</h3>
                        <p className="text-sm text-purple-200/40 leading-relaxed">{feature.description}</p>
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 text-[10px] font-medium text-purple-300/50 mt-3">
                          Requiere registro
                        </span>
                      </div>
                    </div>
                  )}
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.03] to-transparent" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="text-center mb-12 lg:mb-16"
          >
            <motion.p variants={fadeInUp} className="text-sm font-medium text-purple-300/60 mb-3 uppercase tracking-wider">
              Demo
            </motion.p>
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4"
            >
              Descubrí cómo funciona
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg text-purple-200/60 max-w-2xl mx-auto">
              2 minutos para entender cómo RIALTOR transforma tu trabajo diario
            </motion.p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative group"
          >
            <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-white/10 bg-zinc-900">
              <video
                src="/docs/Videos/demo2.mp4"
                title="Demo RIALTOR"
                controls
                className="w-full h-full object-cover"
                preload="metadata"
              >
                Tu navegador no soporta el elemento de video.
              </video>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 lg:py-32 relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_100%,rgba(139,92,246,0.08),rgba(255,255,255,0))]" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-20">
              <p className="text-sm font-medium text-purple-300/60 mb-3 uppercase tracking-wider">Precios</p>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Planes simples y transparentes
              </h2>
              <p className="text-lg text-purple-200/60 max-w-2xl mx-auto">
                Elegí el plan perfecto para potenciar tu negocio inmobiliario
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-4xl mx-auto">
              {/* Monthly Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <div className="relative h-full p-8 lg:p-10 bg-white/[0.02] border border-white/5 rounded-2xl hover:border-white/10 transition-all duration-300">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Mensual</h3>
                      <div className="flex items-baseline gap-1">
                        <span className="text-5xl font-bold tracking-tight">$25</span>
                        <span className="text-zinc-500">USD/mes</span>
                      </div>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Consultor Inmobiliario IA 24/7",
                        "Calculadoras Profesionales",
                        "Generación de Documentos",
                        "Créditos Hipotecarios",
                        "Generador de Placas con IA",
                        "Gestión Financiera",
                        "Calendario Profesional",
                        "Resumidor Inteligente",
                        "Base de Conocimiento",
                        "Panel de Administración",
                        "Almacenamiento en la Nube",
                        "Soporte Técnico",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-zinc-400" />
                          </div>
                          <span className="text-sm text-zinc-400">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-white/5 border border-white/10 text-white font-semibold rounded-full hover:bg-white/10 transition-all duration-200"
                    >
                      Comenzar ahora
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Annual Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <div className="absolute -inset-px bg-gradient-to-b from-violet-500/20 via-purple-500/20 to-indigo-500/20 rounded-2xl" />
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-violet-500 text-white px-4 py-1 rounded-full text-xs font-semibold z-10">
                  Más popular
                </div>
                <div className="relative h-full p-8 lg:p-10 bg-purple-950 border border-purple-500/20 rounded-2xl">
                  <div className="space-y-8">
                    <div className="space-y-2">
                      <h3 className="text-xl font-semibold">Anual</h3>
                      <div className="flex items-baseline gap-2 flex-wrap">
                        <span className="text-lg text-purple-400/50 line-through">$300</span>
                        <span className="text-5xl font-bold tracking-tight">$240</span>
                        <span className="text-purple-300/60">USD/año</span>
                      </div>
                      <span className="inline-flex items-center px-3 py-1 rounded-full bg-violet-500/20 border border-violet-500/30 text-violet-300 text-xs font-semibold">
                        Ahorrás 20%
                      </span>
                    </div>

                    <div className="space-y-3">
                      {[
                        "Consultor Inmobiliario IA 24/7",
                        "Calculadoras Profesionales",
                        "Generación de Documentos",
                        "Créditos Hipotecarios",
                        "Generador de Placas con IA",
                        "Gestión Financiera",
                        "Calendario Profesional",
                        "Resumidor Inteligente",
                        "Base de Conocimiento",
                        "Panel de Administración",
                        "Almacenamiento en la Nube",
                        "Soporte Prioritario",
                        "2 meses gratis incluidos",
                        "Actualizaciones anticipadas",
                      ].map((item, idx) => (
                        <div key={item} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                              idx >= 12 ? "bg-emerald-500/20" : "bg-white/5"
                            }`}
                          >
                            <Check className={`w-3 h-3 ${idx >= 12 ? "text-violet-400" : "text-purple-300/60"}`} />
                          </div>
                          <span
                            className={`text-sm ${idx >= 12 ? "text-white font-medium" : "text-purple-200/70"}`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-violet-500 text-white font-semibold rounded-full hover:bg-violet-600 transition-all duration-200"
                    >
                      Elegir plan anual
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="text-center mt-8">
              <p className="text-sm text-purple-300/50">Sin permanencia · Cancelá cuando quieras</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 lg:py-32 relative">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-violet-500/20 via-purple-500/20 to-indigo-500/20 rounded-3xl blur-xl" />
            <div className="relative p-12 lg:p-16 bg-white/[0.02] border border-white/5 rounded-3xl">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight mb-4">
                Listo para transformar tu negocio?
              </h2>
              <p className="text-lg text-purple-200/60 max-w-xl mx-auto mb-8">
                Únite a más de 500 agentes inmobiliarios que ya usan RIALTOR.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/auth/register"
                  className="group inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-black font-semibold rounded-full hover:bg-zinc-200 transition-all duration-200"
                >
                  Comenzar gratis
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
                <Link
                  href="/contacto"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/5 border border-white/10 font-medium rounded-full hover:bg-white/10 transition-all duration-200"
                >
                  Contactar ventas
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-gradient-to-b from-[#1a0e3f] to-[#09090b]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 mb-12">
            <div className="md:col-span-1 space-y-4">
              <span className="text-xl font-bold">RIALTOR</span>
              <p className="text-sm text-purple-200/50 leading-relaxed">
                La plataforma definitiva para agentes inmobiliarios en Argentina.
              </p>
            </div>

            <div className="md:col-span-2">
              <h3 className="font-semibold mb-4 text-sm">Herramientas</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-sm">
                {[
                  { name: "Centro de Noticias", href: "/news", requiresAuth: false },
                  { name: "Consultor IA", href: "/chat", requiresAuth: true },
                  { name: "Proyecciones", href: "/proyecciones", requiresAuth: true },
                  { name: "Calculadoras", href: "/calculadoras", requiresAuth: true },
                  { name: "Documentos", href: "/documents", requiresAuth: true },
                  { name: "Créditos Hipotecarios", href: "/hipotecarios", requiresAuth: true },
                  { name: "Generador de Placas", href: "/placas", requiresAuth: true },
                  { name: "Seguro de Caución", href: "/creditos", requiresAuth: true },
                  { name: "Mis Finanzas", href: "/finanzas", requiresAuth: true },
                  { name: "Mis Prospectos", href: "/prospectos", requiresAuth: true },
                  { name: "Calendario", href: "/calendario", requiresAuth: true },
                  { name: "Resumidor", href: "/documents/summary", requiresAuth: true },
                ].map((tool) =>
                  tool.requiresAuth && !user ? (
                    <li key={tool.name} className="text-purple-400/40">
                      {tool.name}
                    </li>
                  ) : (
                    <li key={tool.name}>
                      <Link href={tool.href} className="text-purple-300/70 hover:text-white transition-colors">
                        {tool.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Soporte</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/centro-ayuda" className="text-purple-300/70 hover:text-white transition-colors">
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link href="/contacto" className="text-purple-300/70 hover:text-white transition-colors">
                    Contacto
                  </Link>
                </li>
                <li>
                  <a href="mailto:rialtor@rialtor.app" className="text-purple-300/70 hover:text-white transition-colors">
                    rialtor@rialtor.app
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold mb-4 text-sm">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link href="/terminos" className="text-purple-300/70 hover:text-white transition-colors">
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link href="/politica-privacidad" className="text-purple-300/70 hover:text-white transition-colors">
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/5 pt-8 text-center">
            <p className="text-sm text-purple-300/40">© 2025 RIALTOR · Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
