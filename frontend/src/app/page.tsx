'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { 
  BookOpenIcon, 
  ChatBubbleLeftRightIcon, 
  DocumentTextIcon, 
  CalculatorIcon,
  UserGroupIcon,
  ChartBarIcon,
  CogIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline'

import { useAuth } from './auth/authContext'

export default function Home() {
  // Features protegidas
  const features = [
    {
      name: 'Artículos',
      description: 'Accede a artículos, guías y documentación del sector inmobiliario argentino',
      icon: BookOpenIcon,
      href: '/knowledge',
      color: 'bg-blue-500',
      protected: true
    },
    {
      name: 'Agente IA',
      description: 'Consulta con nuestro bot inteligente sobre regulaciones y procesos',
      icon: ChatBubbleLeftRightIcon,
      href: '/chat',
      color: 'bg-green-500',
      protected: true
    },
    {
      name: 'Generador de Documentos',
      description: 'Crea contratos, formularios y documentos legales personalizados',
      icon: DocumentTextIcon,
      href: '/documents',
      color: 'bg-purple-500',
      protected: true
    },
    {
      name: 'Calculadora Argentina',
      description: 'Calcula comisiones, impuestos, sellos y tasas provinciales',
      icon: CalculatorIcon,
      href: '/calculator',
      color: 'bg-orange-500',
      protected: true
    },
    {
      name: 'Gestión de Usuarios',
      description: 'Administra usuarios, roles y permisos del sistema',
      icon: UserGroupIcon,
      href: '/admin/users',
      color: 'bg-red-500',
      protected: true
    },
    {
      name: 'Reportes y Métricas',
      description: 'Visualiza estadísticas de uso y rendimiento de la plataforma',
      icon: ChartBarIcon,
      href: '/admin/reports',
      color: 'bg-indigo-500',
      protected: true
    }
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

  
  // Si el usuario NO está logueado, solo mostrar el hero y los botones de login/register
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        {/* Hero Section Mejorada */}
        <section className="bg-gradient-to-r from-remax-blue to-remax-blue-light">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
            <div className="flex flex-col items-center justify-center text-center">
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
                Base de Conocimiento
              </h1>
              <span className="block text-3xl md:text-5xl font-bold text-remax-red mb-4 tracking-tight drop-shadow-lg">
                RE/MAX Argentina
              </span>
              <p className="text-lg md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
                Un espacio exclusivo para profesionales inmobiliarios.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-8 justify-center">
                <Link href="/auth/login" className="px-8 py-3 rounded-lg bg-remax-red text-white font-semibold text-lg shadow hover:bg-red-700 transition-colors">Iniciar Sesión</Link>
                <Link href="/auth/register" className="px-8 py-3 rounded-lg bg-white text-remax-blue font-semibold text-lg shadow hover:bg-blue-100 transition-colors border border-remax-blue">Registrarse</Link>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Si el usuario está logueado, mostrar la home completa
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Hero Section Mejorada */}
      <section className="bg-gradient-to-r from-remax-blue to-remax-blue-light">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-28">
          <div className="flex flex-col items-center justify-center text-center">
            <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white mb-4 drop-shadow-lg">
              Base de Conocimiento
            </h1>
            <span className="block text-3xl md:text-5xl font-bold text-remax-red mb-4 tracking-tight drop-shadow-lg">
              RE/MAX Argentina
            </span>
            <p className="text-lg md:text-2xl text-blue-100 mb-10 max-w-2xl mx-auto font-light">
              Un espacio exclusivo para profesionales inmobiliarios.             </p>
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
            {features.filter(f => !f.protected || user).map((feature) => (
              <Link key={feature.name} href={feature.href} className="group">
                <div className="flex items-center p-4 bg-gray-50 rounded-xl shadow-sm hover:shadow-md border border-gray-100 transition-all">
                  <div className={`w-12 h-12 rounded-lg ${feature.color} flex items-center justify-center group-hover:scale-110 transition-transform mr-4`}>
                    <feature.icon className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 group-hover:text-remax-blue transition-colors">
                      {feature.name}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Últimos Artículos */}
      <section className="py-12 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Últimos Artículos</h2>
            <p className="text-gray-600">Lo más reciente en conocimiento inmobiliario</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {recentArticles.length === 0 ? (
              <div className="col-span-3 text-center text-gray-400">No hay artículos recientes.</div>
            ) : (
              recentArticles.map((article) => (
                <Link key={article.id} href={`/knowledge/article/${article.id}`} className="block bg-gray-50 rounded-xl shadow hover:shadow-lg transition p-6 border border-gray-100 group">
                  <h3 className="text-lg font-bold text-remax-blue group-hover:underline mb-2">{article.title}</h3>
                  <p className="text-gray-600 text-sm mb-2 line-clamp-3">{article.summary || article.content?.slice(0, 120) + '...'}</p>
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500">{article.category?.name || 'Sin categoría'}</span>
                    <span className="text-xs text-gray-400">{new Date(article.createdAt).toLocaleDateString('es-AR')}</span>
                  </div>
                </Link>
              ))
            )}
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
                <div className="bg-remax-blue w-12 h-12 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-2xl">R</span>
                </div>
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
