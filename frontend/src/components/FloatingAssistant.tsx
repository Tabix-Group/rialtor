'use client'

import React, { useState, useRef, useEffect, useContext } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Loader2, Sparkles } from 'lucide-react'
import { useAssistant } from '../contexts/AssistantContext'
import { useAssistantChat } from '../hooks/useAssistantChat'
import MessageContent from './MessageContent'

export default function FloatingAssistant() {
    const { isOpen, toggleAssistant } = useAssistant()
    const {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        markMessagesAsRead,
        inputRef,
        messagesEndRef,
        sendFeedback
    } = useAssistantChat()

    const [inputValue, setInputValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null)

    // Calcular mensajes no leídos (mensajes del asistente que no han sido "vistos")
    const unreadCount = messages.filter(msg => !msg.isUser && !msg.read).length

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            markMessagesAsRead() // Mark messages as read when chat opens
        }
    }, [isOpen, inputRef, markMessagesAsRead])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, messagesEndRef])

    // Tooltip automático - aparece después de 3 segundos si no hay interacción
    useEffect(() => {
        if (!isOpen && messages.length === 0) {
            const timeout = setTimeout(() => {
                setShowTooltip(true)
            }, 3000)
            setTooltipTimeout(timeout)

            return () => {
                clearTimeout(timeout)
                setTooltipTimeout(null)
            }
        } else {
            setShowTooltip(false)
            if (tooltipTimeout) {
                clearTimeout(tooltipTimeout)
                setTooltipTimeout(null)
            }
        }
    }, [isOpen, messages.length, tooltipTimeout])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        const message = inputValue
        setInputValue('')
        await sendMessage(message, undefined, true)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleQuickSuggestion = (text: string) => {
        setInputValue(text)
        inputRef.current?.focus()
    }

    // Floating button - Más protagonista y llamativo
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                        delay: 1 // Aparece después de que cargue la página
                    }}
                    className="relative"
                >
                    {/* Tooltip automático */}
                    <AnimatePresence>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.9 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.9 }}
                                className="absolute bottom-full right-0 mb-3 bg-gray-900 text-white px-4 py-2 rounded-lg text-sm whitespace-nowrap shadow-xl max-w-xs"
                            >
                                ¡Hola! Soy tu asistente inmobiliario 💬
                                <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Badge de mensajes no leídos */}
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold animate-pulse"
                            >
                                {unreadCount}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botón principal más protagonista */}
                    <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            toggleAssistant()
                            setShowTooltip(false) // Ocultar tooltip al abrir
                        }}
                        onMouseEnter={() => setShowTooltip(false)} // Ocultar tooltip al hacer hover
                        className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white rounded-full shadow-2xl drop-shadow-lg ring-2 ring-blue-400/20 flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                    >
                        {/* Efecto de sparkle animado */}
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute inset-0 rounded-full"
                        >
                            <Sparkles className="w-6 h-6 absolute top-1 right-1 text-white/60" />
                            <Sparkles className="w-4 h-4 absolute bottom-1 left-1 text-white/40" />
                        </motion.div>

                        <MessageCircle className="w-7 h-7 relative z-10 group-hover:scale-110 transition-transform" />
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    // Chat modal premium
    return (
        <>
            {/* Overlay */}
            <motion.div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleAssistant}
            />

            {/* Modal principal */}
            <motion.div
                className="fixed inset-0 z-50 flex items-end justify-end p-4 md:p-6"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleAssistant}
            >
                <motion.div
                    className="bg-white rounded-2xl shadow-2xl w-full max-w-md h-[600px] flex flex-col overflow-hidden"
                    initial={{ opacity: 0, y: 50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 50, scale: 0.9 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header minimalista */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-4 h-4 text-white" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 text-sm">RIALTOR Assistant</h3>
                                <p className="text-xs text-gray-500">Especialista inmobiliario</p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={clearChat}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                title="Limpiar chat"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            <button
                                onClick={toggleAssistant}
                                className="p-1.5 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-gray-600"
                                title="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Área de mensajes con scroll suave */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                        {messages.length === 0 ? (
                            <div className="text-center py-8">
                                <MessageCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-sm">¡Hola! Soy tu asistente especializado en bienes raíces. ¿En qué puedo ayudarte hoy?</p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <div
                                        className={`max-w-[80%] p-3 rounded-2xl ${
                                            message.isUser
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white'
                                                : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                        }`}
                                    >
                                        <MessageContent
                                            content={message.content}
                                            isUser={message.isUser}
                                            sources={message.sources}
                                            calculation={message.calculation}
                                        />

                                        <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <motion.div
                                className="flex justify-start"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <div className="bg-white border border-gray-200 p-3 rounded-2xl shadow-sm">
                                    <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input area premium */}
                    <div className="p-4 border-t border-gray-100 bg-white">

                        <div className="flex items-center space-x-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta inmobiliaria..."
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder-gray-400 transition-all"
                                />
                            </div>

                            {/* Botón de enviar */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}
