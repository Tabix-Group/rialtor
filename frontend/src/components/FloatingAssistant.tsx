'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Loader2, Bot, ChevronDown } from 'lucide-react' // Agregué Bot y ChevronDown
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
    } = useAssistantChat()

    const [inputValue, setInputValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)
    const [tooltipTimeout, setTooltipTimeout] = useState<NodeJS.Timeout | null>(null)
    const [isHovered, setIsHovered] = useState(false) // Nuevo estado para micro-interacción

    // Calcular mensajes no leídos
    const unreadCount = messages.filter(msg => !msg.isUser && !msg.read).length

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
            markMessagesAsRead()
        }
    }, [isOpen, inputRef, markMessagesAsRead])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, messagesEndRef])

    // Tooltip automático
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

    // --- Renderizado del Botón Flotante (Burbuja Mejorada) ---
    if (!isOpen) {
        return (
            <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.5 }}
                    className="relative"
                >
                    {/* Tooltip mejorado (Estilo globo de chat) */}
                    <AnimatePresence>
                        {showTooltip && (
                            <motion.div
                                initial={{ opacity: 0, x: 20, scale: 0.9 }}
                                animate={{ opacity: 1, x: 0, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                className="absolute bottom-full right-0 mb-4 mr-2 origin-bottom-right"
                            >
                                <div className="bg-white text-gray-800 px-4 py-3 rounded-2xl rounded-tr-sm shadow-xl border border-gray-100 max-w-[250px]">
                                    <p className="text-sm font-medium leading-tight">
                                        👋 ¡Hola! ¿Buscas alguna propiedad en particular?
                                    </p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Badge de mensajes no leídos (Rediseñado) */}
                    <AnimatePresence>
                        {unreadCount > 0 && (
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                                className="absolute -top-1 -right-1 z-20"
                            >
                                <span className="relative flex h-6 w-6">
                                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                  <span className="relative inline-flex rounded-full h-6 w-6 bg-red-500 border-2 border-white text-white text-[10px] items-center justify-center font-bold shadow-sm">
                                    {unreadCount}
                                  </span>
                                </span>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Botón principal */}
                    <motion.button
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => {
                            toggleAssistant()
                            setShowTooltip(false)
                        }}
                        onMouseEnter={() => {
                            setShowTooltip(false)
                            setIsHovered(true)
                        }}
                        onMouseLeave={() => setIsHovered(false)}
                        className="group relative flex items-center justify-center w-16 h-16 rounded-full shadow-2xl shadow-blue-900/20 focus:outline-none"
                    >
                        {/* Fondo con gradiente animado sutil */}
                        <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-blue-500 to-indigo-500 transition-all duration-300 group-hover:brightness-110" />
                        
                        {/* Anillo de pulso sutil (reemplaza a los sparkles giratorios) */}
                        <div className="absolute -inset-0.5 bg-gradient-to-tr from-blue-400 to-indigo-400 rounded-full blur opacity-30 group-hover:opacity-60 transition duration-500 animate-pulse" />

                        {/* Icono con transición */}
                        <div className="relative z-10 text-white transition-transform duration-300">
                            {isHovered ? (
                                <MessageCircle className="w-8 h-8 fill-current opacity-90" />
                            ) : (
                                <Bot className="w-8 h-8" strokeWidth={1.5} />
                            )}
                        </div>
                    </motion.button>
                </motion.div>
            </div>
        )
    }

    // --- Renderizado del Modal (Chat) ---
    return (
        <>
            <motion.div
                className="fixed inset-0 z-40 bg-black/20 backdrop-blur-[2px] md:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={toggleAssistant}
            />

            <motion.div
                className="fixed inset-0 z-50 flex items-end justify-end p-0 md:p-6 sm:items-end sm:justify-end"
                initial={{ opacity: 0, pointerEvents: "none" }}
                animate={{ opacity: 1, pointerEvents: "auto" }}
                exit={{ opacity: 0, pointerEvents: "none" }}
            >
                <motion.div
                    className="flex flex-col w-full h-[100dvh] md:h-[650px] md:max-w-[400px] bg-white md:rounded-2xl shadow-2xl overflow-hidden border-t md:border border-gray-100"
                    initial={{ y: 20, opacity: 0, scale: 0.95 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-white">
                        <div className="flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-50 rounded-full flex items-center justify-center border border-blue-50">
                                    <Bot className="w-6 h-6 text-blue-600" />
                                </div>
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="flex flex-col">
                                <h3 className="font-bold text-gray-800 text-sm leading-tight">Asistente Inmobiliario</h3>
                                <p className="text-xs text-blue-500 font-medium flex items-center gap-1">
                                    <span className="w-1 h-1 rounded-full bg-blue-500 animate-pulse"/>
                                    En línea ahora
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <button
                                onClick={clearChat}
                                className="p-2 hover:bg-gray-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors text-xs font-medium"
                                title="Limpiar conversación"
                            >
                                Limpiar
                            </button>
                            <button
                                onClick={toggleAssistant}
                                className="p-2 hover:bg-gray-50 text-gray-400 hover:text-gray-700 rounded-lg transition-colors"
                            >
                                <ChevronDown className="w-5 h-5 md:hidden" />
                                <X className="w-5 h-5 hidden md:block" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Area */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-gray-50 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center p-8 text-center space-y-4 opacity-60">
                                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-2">
                                    <Bot className="w-8 h-8 text-blue-600" />
                                </div>
                                <div>
                                    <p className="font-semibold text-gray-700">¡Hola!</p>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Soy tu especialista inmobiliario virtual. Pregúntame sobre propiedades, precios o zonas.
                                    </p>
                                </div>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <div
                                        className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed shadow-sm ${
                                            message.isUser
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-white border border-gray-100 text-gray-800 rounded-tl-sm'
                                        }`}
                                    >
                                        <MessageContent
                                            content={message.content}
                                            isUser={message.isUser}
                                            sources={message.sources}
                                            calculation={message.calculation}
                                        />
                                        <p className={`text-[10px] mt-1.5 text-right opacity-70 ${
                                            message.isUser ? 'text-blue-100' : 'text-gray-400'
                                        }`}>
                                            {new Date(message.timestamp).toLocaleTimeString([], {
                                                hour: '2-digit',
                                                minute: '2-digit'
                                            })}
                                        </p>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {isLoading && (
                            <motion.div className="flex justify-start" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                                <div className="bg-white border border-gray-100 px-4 py-3 rounded-2xl rounded-tl-sm shadow-sm flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </motion.div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 bg-white border-t border-gray-100">
                        <div className="flex items-center gap-2 bg-gray-50 p-1.5 rounded-xl border border-gray-200 focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all">
                            <input
                                ref={inputRef}
                                type="text"
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Escribe tu consulta aquí..."
                                disabled={isLoading}
                                className="flex-1 bg-transparent px-3 py-2 text-sm text-gray-800 focus:outline-none placeholder-gray-400 disabled:opacity-50"
                            />
                            <button
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-lg transition-all duration-200 shadow-sm"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Send className="w-4 h-4" />
                                )}
                            </button>
                        </div>
                        <div className="text-center mt-2">
                             <span className="text-[10px] text-gray-400">Impulsado por AI Rialtor</span>
                        </div>
                    </div>
                </motion.div>
            </motion.div>
        </>
    )
}