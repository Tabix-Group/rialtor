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
      description: 'Accedé a nuestra calculadora de Gastos de Escritura. Calculá impuestos, aranceles notariales y costos asociados a la firma de escritura en Argentina por provincia.',
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header usuario logueado */}


      {/* Hero Section */}
      <section className="w-full bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center text-center">
          <img src="/images/logoblanco.png" alt="Logo RE/MAX" className="w-64 h-64 md:w-80 md:h-80 object-contain mb-8" />
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Herramientas Profesionales para Agentes Inmobiliarios
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-12">
            Base de conocimiento y herramientas avanzadas para el mercado inmobiliario argentino
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {/* Botón principal - CTA */}
            <button
              onClick={() => window.location.href = '/auth/register'}
              className="px-8 py-4 bg-blue-600 text-white font-semibold text-lg rounded-lg hover:bg-blue-700 transition-colors"
            >
              Quiero usarlo
            </button>

            {/* Botón secundario - Demo */}
            <button
              onClick={handleScrollToDemo}
              className="px-8 py-4 bg-white border border-gray-300 text-gray-700 font-semibold text-lg rounded-lg hover:bg-gray-50 transition-colors"
            >
              Ver demo
            </button>

            {/* Botón terciario - Login */}
            <button
              onClick={() => window.location.href = '/auth/login'}
              className="px-8 py-4 bg-gray-50 border border-gray-200 text-gray-600 font-semibold text-lg rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ingresar
            </button>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              ¿Qué puedes hacer con RIALTOR?
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Accede a las herramientas más avanzadas del mercado inmobiliario argentino
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const content = (
                <div className="group h-full">
                  <div className="h-full p-6 bg-white border border-gray-200 rounded-xl hover:shadow-lg hover:border-blue-300 transition-all duration-300">
                    <div className="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                      <feature.icon className="h-6 w-6 text-blue-600" />
                    </div>

                    <h3 className="text-lg font-semibold text-gray-900 mb-3">
                      {feature.name}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
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
                    className="block h-full"
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
                  className="block h-full"
                  title={`Ir a ${feature.name}`}
                  prefetch={false}
                >
                  {content}
                </Link>
              );
            })}
          </div>

          {/* Demo Video Section */}
          <section id="demo-video" className="py-20 bg-white">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">Mirá cómo funciona</h2>
              <div className="aspect-w-16 aspect-h-9 w-full rounded-xl overflow-hidden shadow-lg mx-auto">
                <iframe
                  src="https://www.youtube.com/embed/djV11Xbc914"
                  title="Demo RIALTOR"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-72 md:h-96"
                ></iframe>
              </div>
            </div>
          </section>

          {/* Footer Mejorado */}
          <footer className="bg-gray-50 border-t border-gray-200 py-16 mt-auto">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                {/* Brand/Descripción */}
                <div className="md:col-span-1">
                  <div className="flex items-center space-x-3 mb-4">
                    <img src="/images/logoblanco.png" alt="Logo Rialtor" className="w-16 h-16 object-contain" />
                    <span className="text-xl font-bold text-gray-900">RIALTOR</span>
                  </div>
                  <p className="text-gray-600 text-sm max-w-xs">
                    Base de conocimiento y herramientas profesionales para agentes inmobiliarios argentinos.
                  </p>
                </div>

                {/* Noticias */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Noticias</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/news" className="text-gray-600 hover:text-blue-600 transition-colors">Artículos</Link></li>
                    <li><a href="https://www.rialtor.app/documents" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">Documentos Legales</a></li>
                    <li><Link href="/calculadoras" className="text-gray-600 hover:text-blue-600 transition-colors">Calculadoras</Link></li>
                    <li><Link href="/chat" className="text-gray-600 hover:text-blue-600 transition-colors">Agente IA</Link></li>
                  </ul>
                </div>

                {/* Soporte */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Soporte</h3>
                  <ul className="space-y-2 text-sm">
                    <li><Link href="/ayuda" className="text-gray-600 hover:text-blue-600 transition-colors">Centro de Ayuda</Link></li>
                    <li><Link href="/contacto" className="text-gray-600 hover:text-blue-600 transition-colors">Contacto</Link></li>
                    <li><Link href="/capacitacion" className="text-gray-600 hover:text-blue-600 transition-colors">Capacitación</Link></li>
                    <li><Link href="/documentacion" className="text-gray-600 hover:text-blue-600 transition-colors">Documentación</Link></li>
                  </ul>
                </div>

                {/* Legal / Social */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Legal</h3>
                  <ul className="space-y-2 text-sm">
                    <li><a href="https://www.remax.com.ar/terminos" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">Términos y Condiciones</a></li>
                    <li><a href="https://www.remax.com.ar/privacidad" target="_blank" rel="noopener noreferrer" className="text-gray-600 hover:text-blue-600 transition-colors">Política de Privacidad</a></li>
                  </ul>
                </div>
              </div>

              <div className="border-t border-gray-200 mt-12 pt-8 text-center">
                <p className="text-gray-500 text-sm">
                  © 2025 RIALTOR. Todos los derechos reservados.
                </p>
              </div>
            </div>
          </footer>
        </div>
      </section>
    </div>
  );
}