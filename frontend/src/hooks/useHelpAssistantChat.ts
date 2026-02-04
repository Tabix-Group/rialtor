'use client'

import { useState, useCallback, useRef, useEffect } from 'react'

interface Message {
    id: string
    content: string
    isUser: boolean
    timestamp: string
}

interface UseHelpAssistantChatReturn {
    messages: Message[]
    isLoading: boolean
    sendMessage: (content: string) => Promise<void>
    clearChat: () => void
    inputRef: React.RefObject<HTMLInputElement>
    messagesEndRef: React.RefObject<HTMLDivElement>
}

export function useHelpAssistantChat(): UseHelpAssistantChatReturn {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: '¡Hola! soy tu **Asistente de Ayuda**. 🙋‍♂️\n\nEstoy aquí para guiarte en el uso de la plataforma RIALTOR. ¿Tienes alguna duda sobre cómo usar las calculadoras, generar placas o navegar por el sistema?',
            isUser: false,
            timestamp: new Date().toISOString()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    const clearChat = useCallback(() => {
        setMessages([
            {
                id: '1',
                content: '¡Hola! soy tu **Asistente de Ayuda**. 🙋‍♂️\n\n¿En qué puedo orientarte hoy sobre el funcionamiento de RIALTOR?',
                isUser: false,
                timestamp: new Date().toISOString()
            }
        ])
    }, [])

    const sendMessage = useCallback(async (content: string) => {
        if (!content.trim() || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim(),
            isUser: true,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null

            // Preparar historial para contexto (últimos mensajes)
            const history = messages.slice(-5).map(m => ({
                role: m.isUser ? 'user' : 'assistant',
                content: m.content
            }))

            const response = await fetch('/api/chat/help', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': token ? `Bearer ${token}` : ''
                },
                body: JSON.stringify({ 
                    message: content.trim(),
                    history 
                })
            })

            if (!response.ok) {
                throw new Error('Error al conectar con el asistente de ayuda')
            }

            const data = await response.json()

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: data.content,
                isUser: false,
                timestamp: data.timestamp || new Date().toISOString()
            }

            setMessages(prev => [...prev, assistantMessage])
        } catch (error) {
            console.error('[HELP_ASSISTANT] Error:', error)
            setMessages(prev => [...prev, {
                id: (Date.now() + 1).toString(),
                content: 'Lo siento, hubo un problema al procesar tu consulta. Por favor, intenta de nuevo más tarde.',
                isUser: false,
                timestamp: new Date().toISOString()
            }])
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, messages])

    return {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        inputRef,
        messagesEndRef
    }
}
