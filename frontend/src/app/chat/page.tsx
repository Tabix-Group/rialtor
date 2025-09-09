'use client'

import { useState, useRef, useEffect } from 'react'
import { Send, Bot, User } from 'lucide-react'

interface Message {
  id: string
  content: string
  isUser: boolean
  timestamp: string // ISO string
}

import { useAuth } from '../auth/authContext'

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      content: '¡Hola! Soy tu asistente de Rialtor. ¿En qué puedo ayudarte hoy?',
      isUser: false,
      timestamp: new Date().toISOString()
    }
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user } = useAuth();

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

  // Scroll automático al último mensaje
  const messagesEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 flex flex-col items-center">
      <div className="w-full max-w-2xl flex flex-col flex-1 rounded-3xl shadow-2xl border border-gray-100 bg-white/90 backdrop-blur-md overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-3xl shadow flex flex-col gap-1">
          <h1 className="text-2xl font-extrabold flex items-center gap-3">
            <Bot className="w-7 h-7" />
            Asistente Rialtor
          </h1>
          <p className="text-blue-100 text-base">
            Pregúntame sobre propiedades, procesos o cualquier duda de Rialtor
          </p>
        </div>

        {/* Mensajes */}
        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white/60" style={{ minHeight: 400 }}>
          {messages.map((message) => (
            <div
              key={message.id}
              className={`chat-message ${message.isUser ? 'user' : 'assistant'}`}
            >
              <div className={`chat-bubble ${message.isUser ? 'user' : 'assistant'} shadow-sm flex items-end gap-2`}>
                {!message.isUser && <Bot className="w-5 h-5 text-blue-500 flex-shrink-0" />}
                <div className="flex-1">
                  <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>
                  <span className={`block text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>
                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                {message.isUser && <User className="w-5 h-5 text-blue-500 flex-shrink-0" />}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="chat-message assistant">
              <div className="chat-bubble assistant flex items-center gap-2 shadow-sm">
                <Bot className="w-5 h-5 text-blue-500" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input moderno */}
        <div className="border-t bg-white/80 px-4 py-4">
          <form
            className="flex gap-3 items-end"
            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}
            autoComplete="off"
          >
            <textarea
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Escribe tu mensaje..."
              className="input resize-none min-h-[44px] max-h-32"
              rows={1}
              disabled={isLoading}
              style={{ flex: 1 }}
            />
            <button
              type="submit"
              disabled={isLoading || !inputValue.trim()}
              className="btn-primary rounded-full p-3 shadow-lg hover:scale-105 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"
              title="Enviar"
            >
              <Send className="w-6 h-6" />
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
