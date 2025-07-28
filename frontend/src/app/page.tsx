'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpen,
  User2,
  Calculator,
  FileText,
  BadgeDollarSign,
  ShieldCheck
} from 'lucide-react';
import { useAuth } from './auth/authContext'

export default function Home() {
  // Features públicas (si no está logueado, no tienen link)
  const features = [
    {
      name: 'Informes y Novedades de Mercado',
      description: 'Accedé a análisis del mercado inmobiliario actual, evolución de precios y zonas calientes.',
      icon: BookOpen,
      href: '/knowledge',
    },
    {
      name: 'Consultor Inmobiliario IA',
      description: 'Tu asesor personal 24/7 para consultas sobre captación, negociación, tasaciones y más.',
      icon: User2,
      href: '/chat',
    },
    {
      name: 'Calculadora de Gastos',
      description: 'Calculá los costos totales de una operación: escritura, impuestos, sellos, comisiones, etc.',
      icon: Calculator,
      href: '/calculator',
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
      href: '/creditos', // redirige siempre a la vista creditos
    },
    {
      name: 'Generador de Placas para Publicar',
      description: 'Compará opciones de seguros de caución, garantías y avales. Ideal para alquileres.',
      icon: ShieldCheck,
      href: '', // aún no creada
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
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header usuario logueado */}


      {/* Hero Section */}
      <section className="w-full" style={{ backgroundColor: '#010413' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center" style={{paddingTop: '3vw', paddingBottom: '3vw'}}>
          <img src="/images/logo.jfif" alt="Logo RE/MAX" className="w-[28rem] h-[28rem] md:w-[38rem] md:h-[38rem] object-contain" style={{background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, margin: 0}} />
          <div className="flex flex-col sm:flex-row gap-4 mt-4 justify-center">
            <button onClick={() => window.location.href = '/auth/register'} className="px-8 py-3 rounded-lg bg-remax-red text-white font-semibold text-lg shadow hover:bg-red-700 transition-colors">Quiero usarlo</button>
            <button onClick={handleScrollToDemo} className="px-8 py-3 rounded-lg bg-white text-remax-blue font-semibold text-lg shadow hover:bg-blue-100 transition-colors border border-remax-blue">Ver demo</button>
            <button onClick={() => window.location.href = '/auth/login'} className="px-8 py-3 rounded-lg bg-gray-200 text-remax-blue font-semibold text-lg shadow hover:bg-gray-300 transition-colors border border-remax-blue">Ingresar</button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-10 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">
              ¿Qué puedes hacer con RIALTOR?
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              // La card de Créditos Hipotecarios siempre tiene link activo
              const isCreditos = feature.name === 'Créditos Hipotecarios';
              const isActive = (user && feature.href) || isCreditos;
              const content = (
                <div
                  className="flex flex-col h-full p-6 rounded-xl border border-orange-500 bg-white shadow-sm transition-all duration-300 group hover:shadow-2xl hover:-translate-y-2 hover:scale-[1.04] hover:bg-orange-50 hover:border-orange-400 hover:ring-2 hover:ring-orange-200/60"
                  style={{ boxShadow: '0 2px 8px 0 rgba(0,0,0,0.06)' }}
                >
                  <div className="flex items-center mb-4">
                    <feature.icon className="h-10 w-10 text-orange-500 mr-3 transition-colors duration-300 group-hover:text-orange-600" strokeWidth={2.2} />
                    <h3 className="text-lg font-bold text-gray-900 group-hover:text-orange-700 transition-colors duration-300">{feature.name}</h3>
                  </div>
                  <p className="text-gray-700 text-sm font-light group-hover:text-orange-900 transition-colors duration-300">
                    {feature.description}
                  </p>
                </div>
              );
              return isActive && feature.href ? (
                <Link key={feature.name} href={feature.href} className="block h-full">{content}</Link>
              ) : (
                <div key={feature.name} className="h-full">{content}</div>
              );
            })}
          </div>
        </div>
      </section>

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
      <footer className="text-white py-14 mt-auto" style={{ backgroundColor: '#010413' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
            {/* Brand/Descripción */}
            <div className="md:col-span-1 flex flex-col items-start mb-8 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/images/logo.jfif" alt="Logo Rialtor" className="w-20 h-20 object-contain m-0 p-0" style={{background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0, marginTop: 0, marginBottom: 0}} />
                <span className="text-2xl font-bold">RIALTOR</span>
              </div>
              <p className="text-gray-400 mb-4 max-w-xs text-sm">
                Base de conocimiento y herramientas profesionales para agentes inmobiliarios argentinos.
              </p>
            </div>

            {/* Recursos */}
            <div>
              <h3 className="text-lg font-semibold mb-4">Recursos</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/knowledge" className="text-gray-300 hover:text-white transition-colors">Artículos</Link></li>
                <li><Link href="/documents" className="text-gray-300 hover:text-white transition-colors">Documentos Legales</Link></li>
                <li><Link href="/calculator" className="text-gray-300 hover:text-white transition-colors">Calculadora Argentina</Link></li>
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
  );
}
