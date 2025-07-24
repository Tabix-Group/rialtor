'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon
} from '@heroicons/react/24/outline'
import { useAuth } from './auth/authContext'

export default function Home() {
  // Features públicas (si no está logueado, no tienen link)
  const features = [
    {
      name: 'Informes y Novedades de Mercado',
      description: 'Accedé a análisis del mercado inmobiliario actual, evolución de precios y zonas calientes.',
      icon: BookOpenIcon,
      href: '/knowledge',
    },
    {
      name: 'Consultor Inmobiliario IA',
      description: 'Tu asesor personal 24/7 para consultas sobre captación, negociación, tasaciones y más.',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
    },
    {
      name: 'Calculadora de Gastos',
      description: 'Calculá los costos totales de una operación: escritura, impuestos, sellos, comisiones, etc.',
      icon: CalculatorIcon,
      href: '/calculator',
    },
    {
      name: 'Documentos Inteligentes',
      description: 'Generá modelos de reserva, autorización, boleto y contratos en segundos.',
      icon: DocumentTextIcon,
      href: '/documents',
    },
    {
      name: 'Créditos Hipotecarios',
      description: 'Conocé las opciones vigentes de financiación en bancos públicos y privados; tasas y requisitos.',
      icon: CurrencyDollarIcon,
      href: '', // aún no creada
    },
    {
      name: 'Generador de Placas para Publicar',
      description: 'Compará opciones de seguros de caución, garantías y avales. Ideal para alquileres.',
      icon: ShieldCheckIcon,
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 md:py-28 flex flex-col items-center justify-center text-center">
          <img src="/images/logo.jfif" alt="Logo RE/MAX" className="w-72 h-72 md:w-[32rem] md:h-[32rem] mb-10 object-contain" style={{background: 'none', borderRadius: 0, boxShadow: 'none', padding: 0}} />
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
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              Herramientas y Recursos
            </h2>
            <p className="text-md text-gray-600 max-w-2xl mx-auto">
              Todo lo que necesitás, en un solo lugar.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, idx) => {
              const isActive = user && feature.href;
              const content = (
                <div className={`flex items-start p-5 bg-gray-50 rounded-xl shadow-sm border border-gray-100 transition-all h-full ${isActive ? 'hover:shadow-md cursor-pointer' : 'opacity-80'}`}>
                  <div className={`w-12 h-12 rounded-lg bg-remax-blue flex items-center justify-center mr-4`}>
                    <feature.icon className="h-7 w-7 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-1">
                      {feature.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              );
              return isActive ? (
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
      <footer className="bg-gray-900 text-white py-14 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-10 items-start">
            {/* Brand/Descripción */}
            <div className="md:col-span-1 flex flex-col items-start mb-8 md:mb-0">
              <div className="flex items-center space-x-3 mb-4">
                <img src="/images/logo.jfif" alt="Logo RE/MAX" className="w-12 h-12 rounded-lg object-contain bg-white" />
                <span className="text-2xl font-bold">RE/MAX Argentina</span>
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
          <div className="border-t border-gray-800 mt-10 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2025 RE/MAX Argentina. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
