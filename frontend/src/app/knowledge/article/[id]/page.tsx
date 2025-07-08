'use client'

import { useState, useEffect } from 'react'
import { ArrowLeft, Clock, User, Tag, Share2, BookOpen, ThumbsUp, MessageCircle } from 'lucide-react'
import Link from 'next/link'

interface Article {
  id: string
  title: string
  content: string
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
