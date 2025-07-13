'use client'

import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string // ISO string
}

import { useAuth } from '../auth/authContext'
import { useRouter } from 'next/navigation'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: 'Hola! Soy tu asistente de RE/MAX. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, loading } = useAuth();
  const router = useRouter();

  // Proteger ruta: si no está logueado, redirigir a login
  if (!loading && !user && typeof window !== 'undefined') {
    router.replace('/auth/login');
    return null;
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: inputValue,
      isUser: true,
      timestamp: new Date().toISOString()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ message: inputValue })
      })

      if (response.ok) {
        const data = await response.json()
        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: data.assistantMessage?.content || data.message || 'Sin respuesta del asistente.',
          isUser: false,
          timestamp: new Date().toISOString()
        }
        setMessages(prev => [...prev, botMessage])
      } else {
        throw new Error('Error al enviar mensaje')
      }
    } catch (error) {
      // Respuesta simulada para desarrollo
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: 'Gracias por tu mensaje. Esta es una respuesta simulada. En producción, aquí funcionará la integración con OpenAI.',
        isUser: false,
        timestamp: new Date().toISOString()
      }
      setMessages(prev => [...prev, botMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-blue-50 py-12">
      <div className="max-w-3xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="bg-white/90 rounded-3xl shadow-2xl border border-gray-100 h-[650px] flex flex-col backdrop-blur-md">
          {/* Header */}
          <div className="bg-gradient-to-r from-red-600 to-red-400 text-white p-6 rounded-t-3xl shadow flex flex-col gap-1">
            <h1 className="text-2xl font-extrabold flex items-center gap-3">
              <Bot className="w-7 h-7" />
              Asistente RE/MAX
            </h1>
            <p className="text-red-100 text-base">
              Pregúntame sobre propiedades, procesos o cualquier duda de RE/MAX
            </p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 bg-white/60 rounded-b-3xl">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-5 py-3 rounded-2xl shadow-sm ${
                    message.isUser
                      ? 'bg-gradient-to-r from-red-500 to-red-700 text-white'
                      : 'bg-gray-100 text-gray-800 border border-gray-200'
                  }`}
                >
                  <div className="flex items-start gap-2">
                    {!message.isUser && <Bot className="w-5 h-5 mt-1 text-red-500" />}
                    <div className="flex-1">
                      <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                      <p className={`text-xs mt-1 ${
                        message.isUser ? 'text-red-200' : 'text-gray-500'
                      }`}>
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </p>
                    </div>
                    {message.isUser && <User className="w-5 h-5 mt-1 text-blue-500" />}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-gray-800 px-5 py-3 rounded-2xl border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Bot className="w-5 h-5 text-red-500" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-6 bg-white/80 rounded-b-3xl">
            <div className="flex gap-3">
              <textarea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Escribe tu mensaje..."
                className="flex-1 resize-none border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-transparent text-base shadow-sm bg-white"
                rows={1}
                disabled={isLoading}
              />
              <button
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="px-5 py-3 bg-gradient-to-r from-red-500 to-red-700 text-white rounded-xl shadow-lg hover:from-red-600 hover:to-red-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                title="Enviar"
              >
                <Send className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
