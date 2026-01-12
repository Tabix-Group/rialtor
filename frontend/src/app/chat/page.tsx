'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    MessageCircle,
    Loader2,
    RefreshCw,
    Sparkles,
    Bot,
    User,
    ChevronRight
} from 'lucide-react'
import { useAssistantChat } from '../../hooks/useAssistantChat'
import MessageContent from '../../components/MessageContent'

export default function ChatPage() {
    const {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        inputRef,
        messagesEndRef,
        sendFeedback
    } = useAssistantChat()

    const [inputValue, setInputValue] = useState('')

    // Focus input when page loads
    useEffect(() => {
        setTimeout(() => inputRef.current?.focus(), 100)
    }, [inputRef])

    // Scroll to bottom when new messages arrive
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, messagesEndRef])

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

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            
            {/* ================================================================================= */}
            {/* CABECERA ORIGINAL (NO TOCAR) */}
            {/* ================================================================================= */}
            <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 pb-20">
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-900/20 to-slate-900/90"></div>

                <div className="relative max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 lg:py-16">
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 mb-4 sm:mb-6">
                                <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-blue-400" />
                                <span className="text-xs sm:text-sm font-semibold text-white">Asistente IA</span>
                            </div>

                            <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-white mb-3 sm:mb-4 tracking-tight">
                                RIALTOR <span className="bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">Assistant</span>
                            </h1>

                            <p className="text-base sm:text-lg lg:text-xl text-slate-300 mb-2 sm:mb-3 max-w-2xl leading-relaxed">
                                Tu especialista inmobiliario con inteligencia artificial avanzada.
                            </p>

                            <p className="text-xs sm:text-sm text-slate-400">
                                {new Date().toLocaleDateString('es-ES', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>

                        <button
                            onClick={clearChat}
                            className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white rounded-lg transition-colors border border-white/20 hover:shadow-lg active:scale-95 duration-200"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm hidden sm:inline font-medium">Nuevo chat</span>
                        </button>
                    </div>
                </div>
            </div>
            {/* ================================================================================= */}
            {/* FIN CABECERA */}
            {/* ================================================================================= */}

            {/* Main Chat Area - Elevado sobre el header */}
            <div className="max-w-[1200px] mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10 pb-8">
                <div className="bg-white rounded-2xl shadow-2xl shadow-slate-200/50 border border-slate-200 overflow-hidden flex flex-col h-[75vh]">
                    
                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8 bg-slate-50/50 scroll-smooth">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-center px-4 animate-in fade-in duration-700">
                                <div className="w-20 h-20 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-full flex items-center justify-center mb-6 shadow-sm ring-4 ring-white">
                                    <Bot className="w-10 h-10 text-blue-600" />
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-3">¡Hola! Soy Rialtor Assistant</h3>
                                <p className="text-slate-500 max-w-lg mx-auto mb-8 text-lg leading-relaxed">
                                    Estoy entrenado para ayudarte con cálculos inmobiliarios, redacción legal, análisis de mercado y más.
                                </p>
                                

                            </div>
                        ) : (
                            <>
                                {messages.map((message, index) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className={`flex w-full ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${message.isUser ? 'flex-row-reverse' : 'flex-row'}`}>
                                            
                                            {/* Avatar */}
                                            <div className="flex-shrink-0 mt-1">
                                                {message.isUser ? (
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-slate-200 flex items-center justify-center border-2 border-white shadow-sm">
                                                        <User className="w-5 h-5 text-slate-500" />
                                                    </div>
                                                ) : (
                                                    <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-white shadow-md shadow-blue-200">
                                                        <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                                                    </div>
                                                )}
                                            </div>

                                            {/* Bubble */}
                                            <div className="flex flex-col gap-1 min-w-0">
                                                <div className="flex items-center gap-2 mb-1">
                                                    <span className={`text-xs font-bold ${message.isUser ? 'text-slate-400 text-right w-full' : 'text-blue-600'}`}>
                                                        {message.isUser ? 'Tú' : 'Rialtor AI'}
                                                    </span>
                                                </div>

                                                <div
                                                    className={`p-4 sm:p-5 rounded-2xl shadow-sm text-sm sm:text-base leading-relaxed ${
                                                        message.isUser
                                                            ? 'bg-gradient-to-br from-slate-800 to-slate-900 text-white rounded-tr-none'
                                                            : 'bg-white border border-slate-100 text-slate-800 rounded-tl-none'
                                                    }`}
                                                >
                                                    <MessageContent
                                                        content={message.content}
                                                        isUser={message.isUser}
                                                        sources={message.sources}
                                                        calculation={message.calculation}
                                                    />
                                                </div>
                                                
                                                <span className={`text-[10px] text-slate-400 mt-1 ${message.isUser ? 'text-right' : 'text-left'}`}>
                                                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </>
                        )}

                        {/* Loading indicator */}
                        {isLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex justify-start w-full"
                            >
                                <div className="flex max-w-[85%] gap-4">
                                     <div className="flex-shrink-0 mt-1">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center border-2 border-white shadow-md">
                                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                                        </div>
                                    </div>
                                    <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-3">
                                        <span className="text-sm font-medium text-slate-500">Analizando...</span>
                                        <div className="flex space-x-1">
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></div>
                                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-4 sm:p-6 bg-white border-t border-slate-100">
                        {/* Quick Chips (Visible only if messages exist to save space) */}


                        <div className="relative flex items-end gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-200 focus-within:border-blue-400 focus-within:ring-4 focus-within:ring-blue-50 transition-all shadow-inner">
                            <textarea
                                ref={inputRef as any}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyPress}
                                placeholder="Escribe tu consulta inmobiliaria aquí..."
                                disabled={isLoading}
                                className="w-full px-4 py-3 bg-transparent border-none focus:ring-0 text-slate-700 text-sm sm:text-base placeholder-slate-400 resize-none min-h-[50px] max-h-32"
                                rows={1}
                                style={{ height: 'auto' }}
                                onInput={(e) => {
                                    const target = e.target as HTMLTextAreaElement;
                                    target.style.height = 'auto';
                                    target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                                }}
                            />

                            {/* Botón de enviar */}
                            <div className="pb-1 pr-1">
                                <button
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-3 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-300 text-white rounded-xl transition-all duration-200 shadow-md hover:shadow-lg disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center group"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5 group-hover:translate-x-0.5 transition-transform" />
                                    )}
                                </button>
                            </div>
                        </div>
                        <p className="text-center text-xs text-slate-400 mt-3">
                            La IA puede cometer errores. Verifica la información legal importante.
                        </p>
                    </div>
                </div>

                {/* Footer Brand */}
                <div className="text-center mt-6 flex items-center justify-center gap-2 opacity-60">
                     <div className="h-px w-8 bg-slate-300"></div>
                     <span className="text-xs font-medium text-slate-500 uppercase tracking-widest">Rialtor Engine v2.0</span>
                     <div className="h-px w-8 bg-slate-300"></div>
                </div>
            </div>
        </div>
    )
}