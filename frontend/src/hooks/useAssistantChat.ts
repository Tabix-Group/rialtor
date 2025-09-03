'use client'

import { useState, useCallback, useRef, useEffect } from 'react'
import { useAuth } from '../app/auth/authContext'
import { useNotificationContext } from '../contexts/NotificationContext'

interface Message {
    id: string
    content: string
    isUser: boolean
    timestamp: string
    audioBase64?: string
}

interface UseAssistantChatReturn {
    messages: Message[]
    isLoading: boolean
    sessionId: string | null
    sendMessage: (message: string, audioBase64?: string, requestAudioResponse?: boolean) => Promise<void>
    clearChat: () => void
    inputRef: React.RefObject<HTMLInputElement>
    messagesEndRef: React.RefObject<HTMLDivElement>
    sendFeedback: (messageId: string, type: 'positive' | 'negative') => Promise<void>
}

export function useAssistantChat(): UseAssistantChatReturn {
    const { user } = useAuth()
    // Usar try-catch para el context de notificaciones
    let showSuccess: (message: string) => void = () => { };
    let showError: (message: string) => void = () => { };

    try {
        const notifications = useNotificationContext();
        showSuccess = notifications.showSuccess;
        showError = notifications.showError;
    } catch (error) {
        console.warn('[ASSISTANT] NotificationContext not available:', error);
    }
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            content: '¡Hola! Soy RIALTOR, tu asistente de IA especializado en el sector inmobiliario argentino. ¿En qué puedo ayudarte hoy?',
            isUser: false,
            timestamp: new Date().toISOString()
        }
    ])
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId, setSessionId] = useState<string | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Auto scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, isLoading])

    const sendMessage = useCallback(async (content: string, audioBase64?: string, requestAudioResponse?: boolean) => {
        if ((!content.trim() && !audioBase64) || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            content: content.trim() || (audioBase64 ? '[Mensaje de voz]' : ''),
            isUser: true,
            timestamp: new Date().toISOString()
        }

        setMessages(prev => [...prev, userMessage])
        setIsLoading(true)

        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            console.log('[ASSISTANT] Sending message:', { content: content.trim(), sessionId, hasAudio: !!audioBase64 })

            const requestBody: any = {
                message: content.trim(),
                sessionId
            }

            if (audioBase64) {
                requestBody.audioBase64 = audioBase64
                requestBody.audioFilename = 'audio.webm'
            }

            if (requestAudioResponse) {
                requestBody.requestAudioResponse = true
            }

            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(requestBody)
            })

            console.log('[ASSISTANT] Response status:', response.status)

            if (response.ok) {
                const data = await response.json()
                console.log('[ASSISTANT] Response data:', data)

                // Update sessionId if this is a new session
                if (data.sessionId && !sessionId) {
                    setSessionId(data.sessionId)
                }

                const botMessage: Message = {
                    id: (Date.now() + 1).toString(),
                    content: data.assistantMessage?.content || data.message || 'Lo siento, no pude procesar tu consulta.',
                    isUser: false,
                    timestamp: new Date().toISOString(),
                    audioBase64: data.assistantMessage?.audioBase64 || data.audioBase64
                }
                setMessages(prev => [...prev, botMessage])
            } else {
                const errorData = await response.json()
                console.error('[ASSISTANT] Error response:', errorData)

                // Mostrar error específico del servidor
                const errorMsg = errorData.message || errorData.error || 'Error al enviar mensaje'
                showError(`${errorMsg}`)

                // Solo agregar mensaje de error si no es un error 400 (validación)
                if (response.status !== 400) {
                    const errorMessage: Message = {
                        id: (Date.now() + 1).toString(),
                        content: 'Lo siento, ocurrió un error. Por favor intenta nuevamente.',
                        isUser: false,
                        timestamp: new Date().toISOString()
                    }
                    setMessages(prev => [...prev, errorMessage])
                }

                throw new Error(errorMsg)
            }
        } catch (error) {
            console.error('Error sending message:', error)
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: 'Lo siento, ocurrió un error. Por favor intenta nuevamente.',
                isUser: false,
                timestamp: new Date().toISOString()
            }
            setMessages(prev => [...prev, errorMessage])
        } finally {
            setIsLoading(false)
        }
    }, [isLoading, sessionId])

    const clearChat = useCallback(() => {
        setMessages([{
            id: '1',
            content: '¡Hola! Soy RIALTOR, tu asistente de IA especializado en el sector inmobiliario argentino. ¿En qué puedo ayudarte hoy?',
            isUser: false,
            timestamp: new Date().toISOString()
        }])
        setSessionId(null)
    }, [])

    const sendFeedback = useCallback(async (messageId: string, type: 'positive' | 'negative') => {
        try {
            const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null
            await fetch('/api/chat/feedback', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify({
                    messageId,
                    feedbackType: type,
                    sessionId
                })
            })

            showSuccess(type === 'positive' ? '¡Gracias por tu feedback positivo!' : 'Gracias por ayudarnos a mejorar')
        } catch (error) {
            console.error('Error sending feedback:', error)
            showError('Error al enviar feedback')
        }
    }, [sessionId, showSuccess, showError])

    return {
        messages,
        isLoading,
        sessionId,
        sendMessage,
        clearChat,
        inputRef,
        messagesEndRef,
        sendFeedback
    }
}
