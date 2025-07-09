'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../auth/authContext';
import { FiArrowLeft, FiEdit, FiTrash2, FiEye, FiClock, FiCalendar, FiUser, FiTag } from 'react-icons/fi';
import ReactMarkdown from 'react-markdown';
import rehypeHighlight from 'rehype-highlight';
import 'highlight.js/styles/github.css';

interface Article {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  slug: string;
  author: {
    id: string;
    name: string;
    email: string;
    avatar?: string;
  };
  category: {
    id: string;
    name: string;
    slug: string;
    color: string;
  };
  createdAt: string;
  updatedAt: string;
  views: number;
  readTime: number;
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
  featured: boolean;
}

export default function ArticlePage() {
  const [article, setArticle] = useState<Article | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (id) {
      fetchArticle();
    }
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await fetch(`/api/articles/${id}`);
      if (response.ok) {
        const data = await response.json();
        setArticle(data.article);
      } else {
        setError('Artículo no encontrado');
      }
    } catch (error) {
      console.error('Error fetching article:', error);
      setError('Error al cargar el artículo');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!article || !confirm('¿Estás seguro de que quieres eliminar este artículo?')) return;

    try {
      const response = await fetch(`/api/articles/${article.id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        router.push('/knowledge');
      }
    } catch (error) {
      console.error('Error deleting article:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            {error || 'Artículo no encontrado'}
          </h1>
          <button
            onClick={() => router.push('/knowledge')}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Volver a la base de conocimiento
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <button
              onClick={() => router.push('/knowledge')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <FiArrowLeft size={20} />
              Volver a la base de conocimiento
            </button>

            {user?.role === 'ADMIN' && (
              <div className="flex items-center gap-3">
                <button className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200">
                  <FiEdit size={16} />
                  Editar
                </button>
                <button 
                  onClick={handleDelete}
                  className="flex items-center gap-2 px-4 py-2 text-red-700 bg-red-100 rounded-lg hover:bg-red-200"
                >
                  <FiTrash2 size={16} />
                  Eliminar
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Article Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <article className="bg-white rounded-lg shadow-sm overflow-hidden">
          {/* Article Header */}
          <div className="p-8 border-b border-gray-200">
            <div className="flex items-center gap-4 mb-6">
              <div 
                className="w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-xl"
                style={{ backgroundColor: article.category.color }}
              >
                <FiTag size={24} />
              </div>
              <div>
                <span className="inline-block px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full mb-2">
                  {article.category.name}
                </span>
                <div className="flex items-center gap-6 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <FiUser size={14} />
                    {article.author.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiCalendar size={14} />
                    {new Date(article.createdAt).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <FiEye size={14} />
                    {article.views} vistas
                  </span>
                  <span className="flex items-center gap-1">
                    <FiClock size={14} />
                    {article.readTime} min de lectura
                  </span>
                </div>
              </div>
            </div>

            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>

            {article.excerpt && (
              <p className="text-xl text-gray-600 leading-relaxed">
                {article.excerpt}
              </p>
            )}
          </div>

          {/* Article Body */}
          <div className="p-8">
            <div className="prose max-w-none prose-lg prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-blue-600 prose-strong:text-gray-900">
              <ReactMarkdown
                rehypePlugins={[rehypeHighlight]}
                components={{
                  h1: ({ children }) => (
                    <h1 className="text-3xl font-bold text-gray-900 mt-8 mb-4 first:mt-0">
                      {children}
                    </h1>
                  ),
                  h2: ({ children }) => (
                    <h2 className="text-2xl font-semibold text-gray-900 mt-6 mb-3">
                      {children}
                    </h2>
                  ),
                  h3: ({ children }) => (
                    <h3 className="text-xl font-semibold text-gray-900 mt-5 mb-2">
                      {children}
                    </h3>
                  ),
                  p: ({ children }) => (
                    <p className="text-gray-700 leading-relaxed mb-4">
                      {children}
                    </p>
                  ),
                  ul: ({ children }) => (
                    <ul className="list-disc list-inside space-y-1 mb-4 text-gray-700">
                      {children}
                    </ul>
                  ),
                  ol: ({ children }) => (
                    <ol className="list-decimal list-inside space-y-1 mb-4 text-gray-700">
                      {children}
                    </ol>
                  ),
                  blockquote: ({ children }) => (
                    <blockquote className="border-l-4 border-blue-500 pl-4 py-2 my-4 bg-blue-50 text-gray-700 italic">
                      {children}
                    </blockquote>
                  ),
                  code: ({ inline, children }) => {
                    if (inline) {
                      return (
                        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono text-gray-800">
                          {children}
                        </code>
                      );
                    }
                    return (
                      <code className="block bg-gray-900 text-gray-100 p-4 rounded-lg overflow-x-auto">
                        {children}
                      </code>
                    );
                  },
                  a: ({ href, children }) => (
                    <a 
                      href={href}
                      className="text-blue-600 hover:text-blue-800 underline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {children}
                    </a>
                  )
                }}
              >
                {article.content}
              </ReactMarkdown>
            </div>
          </div>

          {/* Article Footer */}
          <div className="px-8 py-4 bg-gray-50 border-t border-gray-200">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-500">
                Última actualización: {new Date(article.updatedAt).toLocaleDateString('es-ES', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </div>
              
              {article.featured && (
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
                  ⭐ Artículo destacado
                </span>
              )}
            </div>
          </div>
        </article>

        {/* Related Articles or Navigation */}
        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/knowledge')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FiArrowLeft size={16} />
            Volver a la base de conocimiento
          </button>
        </div>
      </div>
    </div>
  );
}
  excerpt: string
  category: string
  author: string
  publishedAt: Date
  readingTime: string
  tags: string[]
  views: number
  likes: number
  comments: number
}

export default function ArticlePage({ params }: { params: { id: string } }) {
  const [article, setArticle] = useState<Article | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLiked, setIsLiked] = useState(false)

  useEffect(() => {
    const fetchArticle = async () => {
      try {
        // TODO: Fetch from real API
        // const response = await fetch(`/api/articles/${params.id}`)
        // const data = await response.json()
        
        // Simulación de datos
        const mockArticle: Article = {
          id: params.id,
          title: 'Guía Completa para Nuevos Agentes RE/MAX',
          content: `
            <h2>Bienvenido a RE/MAX</h2>
            <p>Como nuevo agente de RE/MAX, es importante que conozcas los fundamentos de nuestra organización y los recursos disponibles para tu éxito.</p>
            
            <h3>1. Introducción a RE/MAX</h3>
            <p>RE/MAX es una red global de profesionales inmobiliarios que se caracteriza por:</p>
            <ul>
              <li>Excelencia en el servicio al cliente</li>
              <li>Tecnología de vanguardia</li>
              <li>Formación continua</li>
              <li>Apoyo integral a los agentes</li>
            </ul>
            
            <h3>2. Primeros Pasos</h3>
            <p>Para comenzar tu carrera como agente RE/MAX, debes:</p>
            <ol>
              <li>Completar el proceso de onboarding</li>
              <li>Familiarizarte con nuestros sistemas</li>
              <li>Establecer tus objetivos profesionales</li>
              <li>Conectar con tu manager y equipo</li>
            </ol>
            
            <h3>3. Herramientas Disponibles</h3>
            <p>Como agente RE/MAX, tendrás acceso a:</p>
            <ul>
              <li>Plataforma de gestión de clientes (CRM)</li>
              <li>Herramientas de marketing digital</li>
              <li>Base de datos de propiedades</li>
              <li>Calculadoras de financiamiento</li>
              <li>Material promocional</li>
            </ul>
            
            <h3>4. Consejos para el Éxito</h3>
            <p>Algunos consejos clave para destacar como agente:</p>
            <ul>
              <li>Mantén una comunicación constante con tus clientes</li>
              <li>Especialízate en tu área geográfica</li>
              <li>Utiliza las redes sociales efectivamente</li>
              <li>Participa en eventos de networking</li>
              <li>Mantente actualizado con las tendencias del mercado</li>
            </ul>
            
            <h3>5. Recursos Adicionales</h3>
            <p>Para profundizar en tu formación, consulta:</p>
            <ul>
              <li>Centro de Formación Online</li>
              <li>Webinars semanales</li>
              <li>Material de apoyo en la intranet</li>
              <li>Mentorías con agentes senior</li>
            </ul>
          `,
          excerpt: 'Todo lo que necesitas saber para comenzar tu exitosa carrera como agente RE/MAX.',
          category: 'Guías',
          author: 'Equipo RE/MAX',
          publishedAt: new Date('2024-01-15'),
          readingTime: '8 min',
          tags: ['nuevo-agente', 'onboarding', 'recursos', 'primeros-pasos'],
          views: 1250,
          likes: 89,
          comments: 12
        }
        
        setArticle(mockArticle)
      } catch (error) {
        console.error('Error fetching article:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchArticle()
  }, [params.id])

  const handleLike = () => {
    setIsLiked(!isLiked)
    // TODO: Send like to API
  }

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: article?.title,
          text: article?.excerpt,
          url: window.location.href,
        })
      } catch (error) {
        console.log('Error sharing:', error)
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href)
      alert('Enlace copiado al portapapeles')
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando artículo...</p>
        </div>
      </div>
    )
  }

  if (!article) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Artículo no encontrado</h1>
          <p className="text-gray-600 mb-4">El artículo que buscas no existe o ha sido eliminado.</p>
          <Link href="/knowledge" className="text-red-600 hover:text-red-700">
            Volver al centro de conocimiento
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Navigation */}
        <div className="mb-6">
          <Link href="/knowledge" className="flex items-center text-red-600 hover:text-red-700">
            <ArrowLeft className="w-5 h-5 mr-2" />
            Volver al centro de conocimiento
          </Link>
        </div>

        {/* Article Header */}
        <article className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8 border-b">
            <div className="mb-4">
              <span className="bg-red-100 text-red-800 text-sm font-medium px-3 py-1 rounded-full">
                {article.category}
              </span>
            </div>
            
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              {article.title}
            </h1>
            
            <p className="text-xl text-gray-600 mb-6">
              {article.excerpt}
            </p>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500 space-x-6">
                <div className="flex items-center">
                  <User className="w-4 h-4 mr-1" />
                  {article.author}
                </div>
                <div className="flex items-center">
                  <Clock className="w-4 h-4 mr-1" />
                  {article.readingTime} de lectura
                </div>
                <div>
                  {article.publishedAt.toLocaleDateString('es-AR')}
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <button
                  onClick={handleLike}
                  className={`flex items-center space-x-1 px-3 py-1 rounded-full transition-colors ${
                    isLiked ? 'bg-red-100 text-red-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <ThumbsUp className="w-4 h-4" />
                  <span>{article.likes + (isLiked ? 1 : 0)}</span>
                </button>
                
                <button
                  onClick={handleShare}
                  className="flex items-center space-x-1 px-3 py-1 rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
                >
                  <Share2 className="w-4 h-4" />
                  <span>Compartir</span>
                </button>
              </div>
            </div>
          </div>

          {/* Article Content */}
          <div className="p-8">
            <div 
              className="prose max-w-none"
              dangerouslySetInnerHTML={{ __html: article.content }}
            />
          </div>

          {/* Article Footer */}
          <div className="p-8 border-t bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Tag className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-600">Etiquetas:</span>
                <div className="flex flex-wrap gap-2">
                  {article.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="bg-gray-200 text-gray-700 text-xs px-2 py-1 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <div className="flex items-center">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  {article.comments} comentarios
                </div>
                <div>
                  {article.views} vistas
                </div>
              </div>
            </div>
          </div>
        </article>

        {/* Related Articles */}
        <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Artículos relacionados
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">
                Herramientas Esenciales para Agentes
              </h4>
              <p className="text-sm text-gray-600">
                Descubre las herramientas que todo agente RE/MAX debe conocer...
              </p>
            </div>
            <div className="border rounded-lg p-4 hover:bg-gray-50">
              <h4 className="font-medium text-gray-900 mb-2">
                Estrategias de Marketing Digital
              </h4>
              <p className="text-sm text-gray-600">
                Aprende a promocionar tus propiedades en línea...
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
