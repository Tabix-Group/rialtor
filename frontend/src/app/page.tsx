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

const Mail = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
      d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
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
      name: "Proyecciones y Tasaciones",
      description:
        "Modelos de proyección y tasación para el mercado argentino: simulá escenarios, proyectá ingresos y evaluá viabilidad financiera.",
      icon: TrendingUp,
      href: "/proyecciones",
      requiresAuth: true,
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
      name: "Prospectos",
      description:
        "Gestioná leads y oportunidades: seguí prospectos, segmentá por interés, programá seguimientos y convertí más clientes.",
      icon: UserPlus,
      href: "/prospectos",
      requiresAuth: true,
    },
    {
      name: "Newsletter Marketing",
      description:
        "Creá newsletters profesionales para promocionar tus propiedades. Incluye noticias, imágenes y contenido personalizado para tus clientes.",
      icon: Mail,
      href: "/newsletter",
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
    visible: { opacity: 1, y: 0 },
  }

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b border-border/40">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"></div>

        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-0 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-full blur-3xl"
        />
        <motion.div
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.2, 0.4, 0.2],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute bottom-0 left-1/4 w-96 h-96 bg-gradient-to-tr from-purple-500/20 to-pink-500/20 rounded-full blur-3xl"
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808008_1px,transparent_1px),linear-gradient(to_bottom,#80808008_1px,transparent_1px)] bg-[size:64px_64px]"></div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-20 sm:pt-24 sm:pb-28 lg:pt-32 lg:pb-36">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto text-center space-y-12 lg:space-y-16"
          >
            {/* Badge */}
            <motion.div
              variants={fadeInUp}
              whileHover={{ scale: 1.02 }}
              className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-border/60 backdrop-blur-sm hover:border-blue-500/30 transition-all duration-300 shadow-lg shadow-blue-500/5"
            >
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
              <span className="text-sm font-medium bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Potenciá tu negocio inmobiliario en Argentina
              </span>
            </motion.div>

            {/* Main heading */}
            <motion.div variants={fadeInUp} className="space-y-10 lg:space-y-12">
              <div className="flex justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                  className="relative"
                >
                  <motion.img
                    animate={{
                      y: [0, -8, 0],
                    }}
                    transition={{
                      y: {
                        duration: 4,
                        repeat: Number.POSITIVE_INFINITY,
                        ease: "easeInOut",
                      },
                    }}
                    whileHover={{
                      scale: 1.05,
                      transition: { duration: 0.2 },
                    }}
                    src="/images/l2.png"
                    alt="RIALTOR"
                    className="h-20 sm:h-28 lg:h-36 w-auto relative z-10"
                  />
                  <motion.div
                    animate={{
                      opacity: [0.2, 0.4, 0.2],
                      scale: [1, 1.1, 1],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "easeInOut",
                    }}
                    className="absolute inset-0 bg-gradient-to-r from-blue-500/30 via-purple-500/30 to-pink-500/30 rounded-full blur-3xl -z-10"
                  />
                </motion.div>
              </div>
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-bold text-foreground text-balance leading-[1.1] tracking-tight"
              >
                La plataforma definitiva para{" "}
                <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                  agentes inmobiliarios
                </span>
              </motion.h1>
            </motion.div>

            {/* Description */}
            <motion.p
              variants={fadeInUp}
              className="max-w-3xl mx-auto text-lg sm:text-xl lg:text-2xl text-muted-foreground leading-relaxed text-balance"
            >
              Cerrá más operaciones con IA, herramientas especializadas y datos en tiempo real del mercado argentino.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={fadeInUp}
              className="flex flex-col sm:flex-row gap-3 lg:gap-4 justify-center items-center pt-4"
            >
              <motion.div whileHover={{ scale: 1.05, y: -2 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/register"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-base font-semibold rounded-full hover:shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 min-w-[200px] relative overflow-hidden group"
                >
                  <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative z-10">Comenzar gratis</span>
                  <ArrowRight className="w-4 h-4 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                </Link>
              </motion.div>

              <motion.button
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleScrollToDemo}
                className="group inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-card/50 backdrop-blur-sm border border-border/60 text-foreground text-base font-semibold rounded-full hover:bg-muted/50 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10 transition-all duration-300 min-w-[200px]"
              >
                <Play className="w-4 h-4 group-hover:scale-110 transition-transform duration-300" />
                Ver demo
              </motion.button>

              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Link
                  href="/auth/login"
                  className="inline-flex items-center justify-center gap-2.5 px-8 py-4 text-foreground text-base font-medium rounded-full hover:bg-muted/50 transition-all duration-200 min-w-[200px]"
                >
                  Iniciar sesión
                </Link>
              </motion.div>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col items-center gap-3 pt-4">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <motion.svg
                    key={i}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.8 + i * 0.1, type: "spring", stiffness: 200 }}
                    className="w-4 h-4 fill-yellow-500 text-yellow-500"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </motion.svg>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Más de 500 agentes confían en RIALTOR</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-purple-500/[0.02] to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          {/* Section Header */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            className="max-w-3xl mx-auto text-center mb-20 lg:mb-24 space-y-4"
          >
            <motion.h2
              variants={fadeInUp}
              className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight tracking-tight"
            >
              Herramientas profesionales para{" "}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                vender más
              </span>
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-lg lg:text-xl text-muted-foreground text-pretty">
              Todo lo que necesitas para el mercado inmobiliario argentino en una sola plataforma
            </motion.p>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6"
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

              return !feature.requiresAuth || user ? (
                <motion.div key={feature.name} variants={fadeInUp}>
                  <a href={feature.href} className="group relative block h-full">
                    <motion.div
                      whileHover={{ y: -4 }}
                      className="relative h-full p-6 lg:p-7 bg-gradient-to-br from-card to-card/50 border border-border rounded-2xl hover:border-purple-500/30 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/10 overflow-hidden backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.03] via-purple-500/[0.03] to-pink-500/[0.03] opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                      <motion.div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100"
                        initial={{ x: "-100%" }}
                        whileHover={{
                          x: "100%",
                          transition: { duration: 0.6, ease: "easeInOut" },
                        }}
                      >
                        <div className="h-full w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent skew-x-12" />
                      </motion.div>

                      {/* Icon */}
                      <div className="relative w-11 h-11 rounded-xl bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 flex items-center justify-center mb-5 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 shadow-lg shadow-purple-500/5">
                        <feature.icon className="w-5 h-5 text-purple-600" />
                      </div>

                      {/* Content */}
                      <div className="relative space-y-2.5">
                        <h3 className="text-lg font-semibold text-foreground text-balance leading-snug group-hover:text-purple-600 transition-colors duration-300">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                          {feature.description}
                        </p>
                      </div>

                      {/* Arrow indicator */}
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-1">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <ArrowRight className="w-4 h-4 text-purple-600" />
                        </div>
                      </div>
                    </motion.div>
                  </a>
                </motion.div>
              ) : (
                <motion.div key={feature.name} variants={fadeInUp}>
                  <div className="group relative h-full">
                    <div className="relative h-full p-6 lg:p-7 bg-card/30 border border-border/50 rounded-2xl opacity-60 backdrop-blur-sm">
                      {/* Icon */}
                      <div className="w-11 h-11 rounded-xl bg-muted/30 flex items-center justify-center mb-5">
                        <feature.icon className="w-5 h-5 text-foreground/60" />
                      </div>

                      {/* Content */}
                      <div className="space-y-2.5">
                        <h3 className="text-lg font-semibold text-foreground text-balance leading-snug">
                          {feature.name}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed text-pretty">
                          {feature.description}
                        </p>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-muted/50 text-xs font-medium text-muted-foreground mt-3">
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
      <section
        id="demo-video"
        className="py-24 sm:py-32 lg:py-40 bg-gradient-to-b from-muted/30 via-muted/50 to-muted/30 border-y border-border/40 relative overflow-hidden"
      >
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.1, 0.2, 0.1],
          }}
          transition={{
            duration: 10,
            repeat: Number.POSITIVE_INFINITY,
            ease: "easeInOut",
          }}
          className="absolute top-1/4 right-0 w-96 h-96 bg-gradient-to-bl from-blue-500/20 to-purple-500/20 rounded-full blur-3xl"
        />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-12 lg:mb-16 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight tracking-tight">
                Descubrí cómo funciona
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
                2 minutos para entender cómo RIALTOR transforma tu trabajo diario
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-pink-500/20 rounded-2xl blur opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-border shadow-2xl group-hover:border-purple-500/30 transition-all duration-300 bg-muted">
                <video
                  src="/docs/Videos/demo.mp4"
                  title="Demo RIALTOR"
                  controls
                  className="w-full h-full object-cover"
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
      <section className="py-24 sm:py-32 lg:py-40 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-500/[0.02] to-transparent"></div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
          >
            <motion.div variants={fadeInUp} className="text-center mb-16 lg:mb-20 space-y-4">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-balance leading-tight tracking-tight">
                Planes{" "}
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  simples y transparentes
                </span>
              </h2>
              <p className="text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto text-pretty">
                Elegí el plan perfecto para potenciar tu negocio inmobiliario
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8 max-w-5xl mx-auto">
              {/* Monthly Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-8 lg:p-10 border border-border hover:border-purple-500/30 hover:shadow-xl hover:shadow-purple-500/10 transition-all duration-300 h-full backdrop-blur-sm"
                >
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Mensual</h3>
                      <div className="flex items-baseline gap-2">
                        <span className="text-5xl font-bold tracking-tight">$25</span>
                        <span className="text-muted-foreground">USD/mes</span>
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
                          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                            <Check className="w-3 h-3 text-foreground" />
                          </div>
                          <span className="text-sm text-muted-foreground leading-relaxed">{item}</span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-card border-2 border-foreground/20 text-foreground text-base font-semibold rounded-full hover:bg-muted/50 hover:border-foreground/30 transition-all duration-200"
                    >
                      Comenzar ahora
                    </Link>
                  </div>
                </motion.div>
              </motion.div>

              {/* Annual Plan */}
              <motion.div variants={fadeInUp} className="relative group">
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white px-4 py-1.5 rounded-full text-sm font-semibold z-10 shadow-lg shadow-purple-500/20">
                  Más popular
                </div>
                <div className="absolute -inset-px bg-gradient-to-b from-purple-500/20 via-blue-500/20 to-pink-500/20 rounded-2xl"></div>
                <motion.div
                  whileHover={{ y: -4 }}
                  className="relative bg-gradient-to-br from-card to-card/50 rounded-2xl p-8 lg:p-10 border-2 border-purple-500/30 hover:border-purple-500/50 hover:shadow-2xl hover:shadow-purple-500/20 transition-all duration-300 h-full backdrop-blur-sm"
                >
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <h3 className="text-2xl font-bold">Anual</h3>
                      <div className="flex items-baseline gap-3 flex-wrap">
                        <span className="text-xl text-muted-foreground line-through">$300</span>
                        <span className="text-5xl font-bold tracking-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          $240
                        </span>
                        <span className="text-muted-foreground">USD/año</span>
                      </div>
                      <div className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 border border-purple-500/20 text-purple-600 text-sm font-semibold shadow-sm">
                        Ahorrás 20% · $60 USD
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
                        "Soporte Prioritario",
                        "2 meses gratis incluidos",
                        "Actualizaciones anticipadas",
                      ].map((item, idx) => (
                        <div key={item} className="flex items-start gap-3">
                          <div
                            className={`w-5 h-5 rounded-full ${
                              idx >= 12 ? "bg-foreground/10" : "bg-muted"
                            } flex items-center justify-center flex-shrink-0 mt-0.5`}
                          >
                            <Check className={`w-3 h-3 ${idx >= 12 ? "text-foreground" : "text-foreground"}`} />
                          </div>
                          <span
                            className={`text-sm leading-relaxed ${
                              idx >= 12 ? "text-foreground font-medium" : "text-muted-foreground"
                            }`}
                          >
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/auth/register"
                      className="w-full inline-flex items-center justify-center px-6 py-3.5 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white text-base font-semibold rounded-full hover:shadow-2xl hover:shadow-purple-500/30 transition-all duration-300 relative overflow-hidden group"
                    >
                      <motion.div className="absolute inset-0 bg-gradient-to-r from-blue-700 via-purple-700 to-pink-700 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <span className="relative z-10">Elegir plan anual</span>
                    </Link>
                  </div>
                </motion.div>
              </motion.div>
            </div>

            <motion.div variants={fadeInUp} className="text-center mt-8">
              <p className="text-sm text-muted-foreground">Sin permanencia · Cancelá cuando quieras</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 bg-gradient-to-b from-card to-muted/30 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/[0.02] via-purple-500/[0.02] to-transparent"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 relative">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 lg:gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1 space-y-4">
              <span className="text-xl font-bold text-foreground">RIALTOR</span>
              <p className="text-sm text-muted-foreground leading-relaxed">
                La plataforma definitiva para agentes inmobiliarios en Argentina.
              </p>
            </div>

            {/* Herramientas */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-foreground mb-4 text-sm">Herramientas</h3>
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
                    <li key={tool.name} className="text-muted-foreground/50">
                      {tool.name}
                    </li>
                  ) : (
                    <li key={tool.name}>
                      <Link
                        href={tool.href}
                        className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                      >
                        {tool.name}
                      </Link>
                    </li>
                  ),
                )}
              </ul>
            </div>

            {/* Soporte */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm">Soporte</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/centro-ayuda"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Centro de Ayuda
                  </Link>
                </li>
                <li>
                  <Link
                    href="/contacto"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Contacto
                  </Link>
                </li>
                <li>
                  <a
                    href="mailto:rialtor@rialtor.app"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    rialtor@rialtor.app
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-foreground mb-4 text-sm">Legal</h3>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <Link
                    href="/terminos"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Términos y Condiciones
                  </Link>
                </li>
                <li>
                  <Link
                    href="/politica-privacidad"
                    className="text-muted-foreground hover:text-foreground transition-colors duration-200"
                  >
                    Política de Privacidad
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-border pt-8 text-center">
            <p className="text-sm text-muted-foreground">© 2025 RIALTOR · Todos los derechos reservados</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
