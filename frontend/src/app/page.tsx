'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  BookOpen,
  User2,
  Calculator,
  FileText,
  BadgeDollarSign,
  ShieldCheck,
  Shield
} from 'lucide-react';
import { useAuth } from './auth/authContext'

export default function Home() {
  // Features con hipervínculos activos para todos los usuarios
  const features = [
    {
      name: 'Informes y Novedades de Mercado',
      description: 'Accedé a análisis del mercado inmobiliario actual, evolución de precios y zonas calientes.',
      icon: BookOpen,
      href: '/news',
    },
    {
      name: 'Consultor Inmobiliario IA',
      description: 'Tu asesor personal 24/7 para consultas sobre captación, negociación, tasaciones y más.',
      icon: User2,
      href: '/chat',
    },
    {
      name: 'Calculadoras',
      description: 'Accedé a todas nuestras calculadoras: Gastos de escritura, Honorarios, Impuesto Ganancia y Seguro de Caución. Una vista centralizada para elegir la herramienta que necesitás.',
      icon: Calculator,
      href: '/calculadoras',
    },
    {
      name: 'Documentos Inteligentes',
      description: 'Generá modelos de reserva, autorización, boleto y contratos en segundos.',
      icon: FileText,
      href: '/documents',
    },
    {
      name: 'Créditos Hipotecarios',
      description: 'Conocé las opciones vigentes de financiación en bancos públicos y privados; tasas y requisitos.',
      icon: BadgeDollarSign,
      href: '/hipotecarios', // redirige a la calculadora de créditos hipotecarios
    },
    {
      name: 'Generador de Placas para Publicar',
      description: 'Crea placas profesionales para tus propiedades con IA. Sube fotos y obtén imágenes listas para publicar.',
      icon: ShieldCheck,
      href: '/placas',
    },
    {
      name: 'Calculadora de Seguro de Caución',
      description: 'Simulá y compará el costo de diferentes seguros de caución para alquileres. Descubrí cómo funciona, qué requisitos hay y cuál es la mejor opción para tu operación inmobiliaria.',
      icon: Shield,
      href: '/creditos',
    },
  ];

  type Article = {
    id: string;
    title: string;
    summary?: string;
    content?: string;
    category?: { name?: string };
    createdAt: string;
  };

  // Fix type for recentArticles
  const [recentArticles, setRecentArticles] = useState<Article[]>([]);

  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [searchResults, setSearchResults] = useState(null);
  // (Eliminado: declaración duplicada de recentArticles)
  const { user } = useAuth();

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const res = await fetch('/api/articles?status=PUBLISHED&limit=3');
        const data = await res.json();
        setRecentArticles(data.articles || []);
      } catch (e) {
        setRecentArticles([]);
      }
    };
    fetchRecent();
  }, []);


  // Función para scrollear al video demo
  const handleScrollToDemo = () => {
    const el = document.getElementById('demo-video');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  // Home pública y privada (misma vista, cambia links y header)
  return (
    <div className="min-h-screen bg-[#000410] flex flex-col">
      {/* Header usuario logueado */}


      {/* Hero Section */}
      <section className="w-full" style={{ backgroundColor: '#010413' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{ paddingTop: '3vw', paddingBottom: '3vw' }}>
          <img src="/images/logo10.jpeg" alt="Logo RE/MAX" className="w-[28rem] h-[28rem] md:w-[38rem] md:h-[38rem] object-contain" style={{ background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, margin: 0 }} />
          <div className="flex flex-col sm:flex-row gap-6 mt-8 justify-center">
            {/* Botón principal - CTA */}
            <button
              onClick={() => window.location.href = '/auth/register'}
              className="group relative px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-lg rounded-2xl shadow-xl shadow-blue-500/25 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/40 hover:-translate-y-1 hover:scale-105"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-400 to-indigo-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10">Quiero usarlo</span>
            </button>

            {/* Botón secundario - Demo */}
            <button
              onClick={handleScrollToDemo}
              className="group relative px-8 py-4 bg-white/90 backdrop-blur-sm text-slate-800 font-bold text-lg rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10 hover:-translate-y-1 hover:bg-white/95"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10">Ver demo</span>
            </button>

            {/* Botón terciario - Login */}
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="group relative px-8 py-4 bg-slate-50/90 backdrop-blur-sm text-slate-700 font-bold text-lg rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 transition-all duration-500 hover:shadow-2xl hover:shadow-slate-500/10 hover:-translate-y-1 hover:bg-slate-100/95"
            >
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-100/50 to-slate-200/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
              <span className="relative z-10">Ingresar</span>
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-16 bg-gradient-to-br from-slate-50 via-white to-slate-100 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-10 left-10 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-40 h-40 bg-gradient-to-br from-indigo-400/20 to-cyan-400/20 rounded-full blur-3xl"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-slate-300/10 to-slate-400/10 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 mb-4">
              <span className="text-sm font-medium text-blue-700">Herramientas Profesionales</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-slate-900 via-blue-900 to-slate-800 bg-clip-text text-transparent mb-4">
              ¿Qué puedes hacer con RIALTOR?
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Accede a las herramientas más avanzadas del mercado inmobiliario argentino
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const content = (
                <div className="group relative h-full">
                  {/* Main card */}
                  <div className="relative h-full p-6 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-lg shadow-slate-900/5 transition-all duration-500 group-hover:shadow-2xl group-hover:shadow-blue-500/10 group-hover:-translate-y-2 group-hover:bg-white/95">
                    {/* Decorative gradient border */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                    {/* Content */}
                    <div className="relative z-10">
                      {/* Icon container with gradient background */}
                      <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 mb-4 shadow-lg shadow-blue-500/25 group-hover:shadow-blue-500/40 transition-all duration-300 group-hover:scale-110">
                        <feature.icon className="h-6 w-6 text-white" strokeWidth={2} />
                      </div>

                      {/* Title with improved typography */}
                      <h3 className="text-lg font-bold text-slate-900 mb-2 leading-tight group-hover:text-blue-900 transition-colors duration-300">
                        {feature.name}
                      </h3>

                      {/* Description with better spacing */}
                      <p className="text-slate-600 text-sm leading-relaxed group-hover:text-slate-700 transition-colors duration-300">
                        {feature.description}
                      </p>

                      {/* Subtle bottom accent */}
                      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-b-2xl transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                    </div>

                    {/* Hover effect overlay */}
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
                  </div>

                  {/* Subtle shadow effect */}
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-slate-900/5 to-slate-800/5 transform translate-y-2 blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10"></div>
                </div>
              );

              // Use a normal anchor for external links so they open in a new tab,
              // and Next.js Link for internal navigation.
              const isExternal = (feature as any).external || /^https?:\/\//i.test(feature.href);
              if (isExternal) {
                return (
                  <a
                    key={feature.name}
                    href={feature.href}
                    className="block h-full cursor-pointer group"
                    title={`Ir a ${feature.name}`}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {content}
                  </a>
                );
              }

              return (
                <Link
                  key={feature.name}
                  href={feature.href}
                  className="block h-full cursor-pointer group"
                  title={`Ir a ${feature.name}`}
                  prefetch={false}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Demo Video Section */}
          <section id="demo-video" className="py-16 bg-gray-100">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Mirá cómo funciona</h2>
              <div className="aspect-w-16 aspect-h-9 w-full rounded-xl overflow-hidden shadow-lg mx-auto">
                <iframe
                  src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                  title="Demo RIALTOR"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-72 md:h-96"
                ></iframe>
              </div>
            </div>
          </section>

          {/* Footer Mejorado */}
          <footer className="text-white py-14 mt-auto" style={{ backgroundColor: '#000410' }}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
                {/* Brand/Descripción */}
                <div className="md:col-span-1 flex flex-col items-start mb-8 md:mb-0">
                  <div className="flex items-center space-x-3 mb-4">
                    <img src="/images/logo10.jpeg" alt="Logo Rialtor" className="w-20 h-20 object-contain m-0 p-0" style={{ background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, marginTop: 0, marginBottom: 0 }} />
                    <span className="text-2xl font-bold">RIALTOR</span>
                  </div>
                  <p className="text-gray-400 mb-4 max-w-xs text-sm">
                    Base de conocimiento y herramientas profesionales para agentes inmobiliarios argentinos.
                  </p>
                </div>

                {/* Noticias */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Noticias</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/news" className="text-gray-300 hover:text-white transition-colors">Artículos</Link></li>
                    <li><a href="https://www.rialtor.app/documents" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Documentos Legales</a></li>
                    <li><Link href="/calculadoras" className="text-gray-300 hover:text-white transition-colors">Calculadoras</Link></li>
                    <li><Link href="/chat" className="text-gray-300 hover:text-white transition-colors">Agente IA</Link></li>
                  </ul>
                </div>

                {/* Soporte */}
                <div>
                  <h3 className="text-lg font-semibold mb-4">Soporte</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/ayuda" className="text-gray-300 hover:text-white transition-colors">Centro de Ayuda</Link></li>
                    <li><Link href="/contacto" className="text-gray-300 hover:text-white transition-colors">Contacto</Link></li>
                    <li><Link href="/capacitacion" className="text-gray-300 hover:text-white transition-colors">Capacitación</Link></li>
                    <li><Link href="/documentacion" className="text-gray-300 hover:text-white transition-colors">Documentación</Link></li>
                  </ul>
                </div>

                {/* Legal / Social */}
                <div className="flex flex-col gap-4 items-start">
                  <h3 className="text-lg font-semibold mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="https://www.remax.com.ar/terminos" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Términos y Condiciones</a></li>
                    <li><a href="https://www.remax.com.ar/privacidad" target="_blank" rel="noopener noreferrer" className="text-gray-300 hover:text-white transition-colors">Política de Privacidad</a></li>
                  </ul>
                </div>
              </div>

            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}