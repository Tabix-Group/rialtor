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
                <button
                  onClick={() => router.push(`/knowledge/article/${article?.id}/edit`)}
                  className="flex items-center gap-2 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
                >
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
