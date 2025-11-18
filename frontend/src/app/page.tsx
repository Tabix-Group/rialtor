"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useAuth } from "./auth/authContext"
import EconomicIndicatorsCard from "../components/EconomicIndicatorsCard"

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

const Calendar = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeWidth={2} />
    <line x1="16" y1="2" x2="16" y2="6" strokeWidth={2} />
    <line x1="8" y1="2" x2="8" y2="6" strokeWidth={2} />
    <line x1="3" y1="10" x2="21" y2="10" strokeWidth={2} />
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

const Check = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
)

const Sparkles = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z"
    />
  </svg>
)

export default function Home() {
  const features = [
    {
      name: "Centro de Noticias",
      description:
        "Actualización diaria automática de fuentes especializadas del sector inmobiliario: noticias internacionales, mercado nacional, tendencias, construcción, tecnología PropTech, análisis CABA, desarrollo, índices y costos.",
      icon: BookOpen,
      href: "https://www.rialtor.app/news",
      requiresAuth: false,
    },
    {
      name: "Indicadores de Mercado",
      description:
        "Datos en tiempo real del mercado inmobiliario y cotizaciones actualizadas automáticamente. Dólar, precios por m² y escrituraciones.",
      icon: TrendingUp,
      href: "/indicadores",
      requiresAuth: false,
      isSpecial: true,
    },
    {
      name: "Consultor Inmobiliario IA",
      description:
        "Tu asesor 24/7 especializado en Argentina: negocia mejor, tasá propiedades con precisión y resolví dudas complejas al instante.",
      icon: User2,
      href: "https://www.rialtor.app/chat",
      requiresAuth: true,
    },
    {
      name: "Calculadoras Profesionales",
      description:
        "Calculadoras actualizadas con la legislación argentina: ajustes de alquiler por IPC, gastos de escritura, impuestos provinciales, comisiones, días hábiles y todo lo que necesitas para cerrar operaciones.",
      icon: Calculator,
      href: "https://www.rialtor.app/calculadoras",
      requiresAuth: true,
    },
    {
      name: "Documentos Inteligentes",
      description:
        "Generá contratos, reservas y boletos adaptados a la legislación argentina. Ahorra horas de trabajo y evitá errores costosos.",
      icon: FileText,
      href: "https://www.rialtor.app/documents",
      requiresAuth: true,
    },
    {
      name: "Créditos Hipotecarios",
      description:
        "Accedé a todas las opciones de financiación vigentes: tasas, requisitos y bancos. Ayudá a tus clientes a encontrar el crédito perfecto.",
      icon: BadgeDollarSign,
      href: "https://www.rialtor.app/hipotecarios",
      requiresAuth: true,
    },
    {
      name: "Generador de Placas",
      description:
        "Creá placas profesionales con IA que venden más. Subí fotos y obtené imágenes optimizadas para redes sociales y portales argentinos.",
      icon: ShieldCheck,
      href: "https://www.rialtor.app/placas",
      requiresAuth: true,
    },
    {
      name: "Seguro de Caución",
      description:
        "Compará y simulá seguros de caución para alquileres. Encontrá la mejor opción para tus clientes y generá ingresos adicionales.",
      icon: Shield,
      href: "https://www.rialtor.app/creditos",
      requiresAuth: true,
    },
    {
      name: "Mis Finanzas",
      description:
        "Gestioná tu negocio inmobiliario: seguí ingresos, gastos, comisiones y mantené el control total de tus finanzas personales.",
      icon: BadgeDollarSign,
      href: "/finanzas",
      requiresAuth: true,
    },
    {
      name: "Calendario Profesional",
      description:
        "Organizá tus citas, visitas y eventos inmobiliarios. Nunca pierdas una oportunidad con nuestro calendario integrado.",
      icon: Calendar,
      href: "/calendario",
      requiresAuth: true,
    },
    {
      name: "Resumidor Inteligente",
      description:
        "Resume documentos extensos al instante con IA. Ahorra tiempo leyendo contratos, informes y documentos legales.",
      icon: FileText,
      href: "/documents/summary",
      requiresAuth: true,
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

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Enhanced gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/[0.08] via-primary/[0.03] to-background"></div>

        {/* Refined grid pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:48px_48px]"></div>

        {/* Subtle radial gradient overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-transparent to-transparent"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-24 sm:pt-28 sm:pb-32 lg:pt-36 lg:pb-44">
          <motion.div 
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-4xl mx-auto text-center space-y-10"
          >
            {/* Badge */}
            <motion.div 
              variants={fadeInUp}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-sm shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="text-sm font-medium bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Potenciá tu negocio inmobiliario en Argentina
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={fadeInUp} className="space-y-8">
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="relative"
                >
                  <motion.img
                    animate={{
                      y: [0, -8, 0],
                      rotate: [0, 1, -1, 0]
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      },
                      rotate: {
                        duration: 6,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }
                    }}
                    whileHover={{
                      scale: 1.05,
                      rotate: 0,
                      transition: { duration: 0.3 }
                    }}
                    src="/images/l.png"
                    alt="RIALTOR Logo"
                    className="h-20 sm:h-28 lg:h-36 w-auto drop-shadow-2xl filter brightness-110 contrast-105"
                  />
                  {/* Glow effect */}
                  <motion.div
                    animate={{
                      opacity: [0.3, 0.6, 0.3],
                      scale: [1, 1.05, 1]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: "easeInOut"
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-full blur-2xl -z-10"
                  />
                </motion.div>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.3 }}
                className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-light text-foreground/90 text-balance leading-tight tracking-tight"
              >
                La revolución inmobiliaria llegó
              </motion.h1>
            </motion.div>

            {/* Description */}
            <motion.p 
              variants={fadeInUp}
              className="max-w-2xl mx-auto text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed text-pretty"
            >
              Cerrá más operaciones con IA, herramientas especializadas y datos precisos del mercado argentino.
              <span className="block mt-2 text-foreground font-medium">Cientos de agentes ya confían en nosotros.</span>
            </motion.p>

            {/* CTA Buttons */}
            <motion.div 
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4"
            >
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScrollToDemo}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-all duration-300 shadow-xl hover:shadow-2xl"
              >
                <Play className="w-5 h-5 group-hover:scale-110 transition-transform" />
                Ver Demo en 2 Minutos
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </motion.button>

              <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center gap-3 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 shadow-lg hover:shadow-xl"
                >
                  <UserPlus className="w-5 h-5" />
                  Registrarte Gratis
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 sm:py-28 lg:py-36">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Section Header */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-16 lg:mb-20 space-y-5"
          >
            <motion.h2 
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-balance leading-tight tracking-tight"
            >
              Todo lo que necesitas para vender más
            </motion.h2>
            <motion.p 
              variants={fadeInUp}
              className="text-base sm:text-lg text-muted-foreground text-pretty"
            >
              Herramientas diseñadas específicamente para el mercado inmobiliario argentino
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {features.map((feature, index) => {
              // Renderizar el componente especial de indicadores
              if (feature.isSpecial && feature.name === "Indicadores de Mercado") {
                return (
                  <motion.div key={feature.name} variants={fadeInUp}>
                    <EconomicIndicatorsCard />
                  </motion.div>
                )
              }

              // Renderizar features normales
              return !feature.requiresAuth || user ? (
                <motion.div key={feature.name} variants={fadeInUp}>
                  <a href={feature.href} className="group relative block h-full">
                    <div className="relative h-full p-7 lg:p-8 bg-card border border-border rounded-2xl lg:rounded-3xl hover:border-primary/30 transition-all duration-500 hover:shadow-xl hover:-translate-y-1 overflow-hidden">
                      {/* Hover gradient effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/[0.02] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Icon */}
                      <div className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-foreground/[0.08] to-foreground/[0.04] flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-500 shadow-sm">
                        <feature.icon className="w-6 h-6 text-foreground" />
                      </div>

                      {/* Content */}
                      <div className="relative space-y-3">
                        <h3 className="text-lg lg:text-xl font-semibold text-balance leading-snug group-hover:text-primary transition-colors duration-300">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                          {feature.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                        <ArrowRight className="w-5 h-5 text-primary" />
                      </div>
                    </div>
                  </a>
                </motion.div>
              ) : (
                <motion.div key={feature.name} variants={fadeInUp}>
                  <div className="group relative h-full opacity-60 hover:opacity-70 transition-opacity duration-300">
                    <div className="relative h-full p-7 lg:p-8 bg-card border border-border rounded-2xl lg:rounded-3xl">
                      {/* Icon */}
                      <div className="w-12 h-12 rounded-xl bg-foreground/5 flex items-center justify-center mb-5">
                        <feature.icon className="w-6 h-6 text-foreground" />
                      </div>

                      {/* Content */}
                      <div className="space-y-3">
                        <h3 className="text-lg lg:text-xl font-semibold text-balance leading-snug">{feature.name}</h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">{feature.description}</p>
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted text-xs font-medium text-muted-foreground mt-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"></span>
                          Requiere registro
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        </div>
      </section>

      {/* Demo Video Section */}
      <section id="demo-video" className="py-20 sm:py-28 lg:py-36 bg-muted/30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16 space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-balance leading-tight tracking-tight">
                Descubrí cómo cerrar más operaciones
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Vea en 2 minutos cómo RIALTOR transforma la forma de trabajar de los martilleros argentinos
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative group">
              <div className="absolute -inset-6 bg-gradient-to-r from-primary/20 via-primary/10 to-primary/20 rounded-3xl blur-3xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"></div>
              <div className="relative aspect-video w-full rounded-2xl lg:rounded-3xl overflow-hidden border-2 border-border shadow-2xl group-hover:border-primary/30 transition-all duration-500">
                <video
                  src="/docs/Videos/demo.mp4"
                  title="Demo RIALTOR"
                  controls
                  className="w-full h-full object-cover bg-muted"
                  preload="metadata"
                >
                  Tu navegador no soporta el elemento de video.
                </video>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 sm:py-28 lg:py-36">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-20 space-y-5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-balance leading-tight tracking-tight">
                Planes que se adaptan a tu negocio
              </h2>
              <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                Elegí el plan perfecto para potenciar tu carrera inmobiliaria
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {/* Monthly Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <div className="relative bg-card rounded-2xl lg:rounded-3xl p-8 lg:p-10 border-2 border-border hover:border-foreground/20 hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h3 className="text-2xl lg:text-3xl font-bold">Plan Mensual</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl lg:text-6xl font-bold tracking-tight">$25</span>
                        <span className="text-muted-foreground font-medium">USD/mes</span>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Consultor Inmobiliario IA 24/7",
                        "Calculadoras Profesionales (Honorarios, ITI, Sellos, Ajustes de Alquiler)",
                        "Generación de Documentos Inteligentes",
                        "Créditos Hipotecarios y Tasas Actualizadas",
                        "Generador de Placas Profesionales con IA",
                        "Sistema de Gestión Financiera",
                        "Calendario Profesional Integrado",
                        "Resumidor Inteligente de Documentos",
                        "Base de Conocimiento Inmobiliario",
                        "Panel de Administración Completo",
                        "Almacenamiento Seguro en la Nube",
                        "Soporte Técnico Incluido",
                      ].map((item) => (
                        <div key={item} className="flex items-start gap-3">
                          <div className="w-5 h-5 rounded-full bg-foreground/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3.5 h-3.5 text-foreground" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-4 bg-foreground text-background font-semibold rounded-full hover:bg-foreground/90 transition-all duration-300 hover:scale-[1.02] shadow-lg"
                    >
                      Comenzar ahora
                    </Link>
                  </div>
                </div>
              </motion.div>

              {/* Annual Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <div className="absolute -top-5 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-primary to-primary/80 text-primary-foreground px-5 py-2 rounded-full text-sm font-semibold flex items-center gap-2 z-10 shadow-xl">
                  <Crown className="w-4 h-4" />
                  Más Popular
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-primary/30 via-primary/10 to-primary/20 rounded-2xl lg:rounded-3xl blur-xl opacity-60"></div>
                <div className="relative bg-card rounded-2xl lg:rounded-3xl p-8 lg:p-10 border-2 border-primary/50 hover:border-primary hover:shadow-2xl transition-all duration-500 h-full">
                  <div className="space-y-8">
                    <div className="space-y-3">
                      <h3 className="text-2xl lg:text-3xl font-bold">Plan Anual</h3>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xl text-muted-foreground line-through">$300</span>
                        <span className="text-5xl lg:text-6xl font-bold tracking-tight">$240</span>
                        <span className="text-muted-foreground font-medium">USD/año</span>
                      </div>
                      <div className="inline-flex items-center px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-semibold">
                        Ahorrás 20% ($60 USD)
                      </div>
                    </div>

                    <div className="space-y-4">
                      {[
                        "Consultor Inmobiliario IA 24/7",
                        "Calculadoras Profesionales (Honorarios, ITI, Sellos, Ajustes de Alquiler)",
                        "Generación de Documentos Inteligentes",
                        "Créditos Hipotecarios y Tasas Actualizadas",
                        "Generador de Placas Profesionales con IA",
                        "Sistema de Gestión Financiera",
                        "Calendario Profesional Integrado",
                        "Resumidor Inteligente de Documentos",
                        "Base de Conocimiento Inmobiliario",
                        "Panel de Administración Completo",
                        "Almacenamiento Seguro en la Nube",
                        "Soporte Técnico Prioritario",
                        "2 Meses Gratis Incluidos",
                        "Actualizaciones Anticipadas",
                      ].map((item, idx) => (
                        <div key={item} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              idx >= 12 ? "bg-primary/20" : "bg-foreground/10"
                            } flex items-center justify-center flex-shrink-0 mt-0.5`}
                          >
                            <Check className={`w-3.5 h-3.5 ${idx >= 12 ? "text-primary" : "text-foreground"}`} />
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              idx >= 12 ? "text-foreground font-semibold" : "text-muted-foreground"
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-4 bg-primary text-primary-foreground font-semibold rounded-full hover:bg-primary/90 transition-all duration-300 hover:scale-[1.02] shadow-xl"
                    >
                      Elegir plan anual
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="text-center mt-10">
              <p className="text-sm text-muted-foreground">
                Todos los precios están en dólares estadounidenses. Sin permanencia, cancelá cuando quieras.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 mb-12 lg:mb-16">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <span className="text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text text-transparent">
                RIALTOR
              </span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma definitiva para martilleros y agentes inmobiliarios en Argentina.
              </p>
            </div>

            {/* Herramientas */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground mb-5">Herramientas</h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
                {[
                  { name: "Centro de Noticias", href: "/news", requiresAuth: false },
                  { name: "Consultor Inmobiliario IA", href: "/chat", requiresAuth: true },
                  { name: "Calculadoras Profesionales", href: "/calculadoras", requiresAuth: true },
                  { name: "Documentos Inteligentes", href: "/documents", requiresAuth: true },
                  { name: "Créditos Hipotecarios", href: "/hipotecarios", requiresAuth: true },
                  { name: "Generador de Placas", href: "/placas", requiresAuth: true },
                  { name: "Seguro de Caución", href: "/creditos", requiresAuth: true },
                  { name: "Mis Finanzas", href: "/finanzas", requiresAuth: true },
                  { name: "Calendario Profesional", href: "/calendario", requiresAuth: true },
                  { name: "Resumidor Inteligente", href: "/documents/summary", requiresAuth: true },
                ].map((tool) =>
                  tool.requiresAuth && !user ? (
                    <li key={tool.name} className="text-muted-foreground/60">
                      {tool.name}
                    </li>
                  ) : (
                    <li key={tool.name}>
                      <Link
                        href={tool.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  )
                )}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="font-semibold text-foreground mb-5">Soporte</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/centro-ayuda"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                  >
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:rialtor@rialtor.app"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                  >
                    rialtor@rialtor.app
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-5">Legal</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link
                    href="/terminos"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politica-privacidad"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200 inline-block hover:translate-x-0.5"
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">
              © 2025 RIALTOR. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}