'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, HelpCircle, Loader2, MessageSquare } from 'lucide-react' // Agregué MessageSquare para variedad visual
import { useHelpAssistantChat } from '../hooks/useHelpAssistantChat'
import MessageContent from './MessageContent'
import { useAuth } from '../app/auth/authContext'

export default function HelpAssistant() {
    const { user, loading } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const {
        messages,
        isLoading,
        sendMessage,
        clearChat, // Mantenido aunque no se usaba en UI visualmente antes, útil tenerlo
        inputRef,
        messagesEndRef
    } = useHelpAssistantChat()

    const [inputValue, setInputValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)

    // Solo mostrar si el usuario está autenticado
    if (loading || !user) return null

    const toggleOpen = () => setIsOpen(!isOpen)

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return
        const message = inputValue
        setInputValue('')
        await sendMessage(message)
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    // Tooltip automático
    useEffect(() => {
        if (!isOpen && messages.length <= 1) {
            const timeout = setTimeout(() => setShowTooltip(true), 5000)
            return () => clearTimeout(timeout)
        } else {
            setShowTooltip(false)
        }
    }, [isOpen, messages.length])

    return (
        <div className="fixed bottom-6 right-6 z-[60] flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: "bottom right" }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[380px] h-[550px] max-h-[80vh] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden ring-1 ring-black/5"
                    >
                        {/* Header Moderno */}
                        <div className="bg-gradient-to-r from-slate-900 to-slate-800 p-4 text-white flex items-center justify-between shadow-sm relative overflow-hidden">
                            {/* Decoración de fondo sutil */}
                            <div className="absolute top-0 right-0 w-20 h-20 bg-white/5 rounded-full -translate-y-10 translate-x-10 pointer-events-none" />
                            
                            <div className="flex items-center gap-3 relative z-10">
                                <div className="relative">
                                    <div className="bg-white/10 p-2 rounded-xl backdrop-blur-sm border border-white/10">
                                        <HelpCircle className="w-5 h-5 text-blue-300" />
                                    </div>
                                    <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-slate-800 rounded-full animate-pulse"></div>
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm tracking-wide">Soporte Rialtor</h3>
                                    <p className="text-[11px] text-slate-300 font-medium">En línea para ayudarte</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleOpen}
                                className="p-2 hover:bg-white/10 rounded-full transition-colors text-slate-300 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area con mejor estilo */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-5 bg-slate-50 scroll-smooth">
                            {/* Mensaje de bienvenida placeholder si no hay mensajes */}
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-50">
                                    <HelpCircle className="w-12 h-12 text-slate-300 mb-2" />
                                    <p className="text-sm text-slate-500">¿Tienes dudas sobre la plataforma? Escribe aquí.</p>
                                </div>
                            )}

                            {messages.map((msg) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={msg.id}
                                    className={`flex w-full ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] px-4 py-3 text-sm leading-relaxed shadow-sm relative group ${
                                            msg.isUser
                                                ? 'bg-blue-600 text-white rounded-2xl rounded-tr-sm'
                                                : 'bg-white text-slate-800 border border-slate-200 rounded-2xl rounded-tl-sm'
                                        }`}
                                    >
                                        <MessageContent content={msg.content} isUser={msg.isUser} />
                                        
                                        <div className={`text-[10px] mt-1.5 opacity-0 group-hover:opacity-60 transition-opacity absolute -bottom-5 ${
                                            msg.isUser ? 'right-0 text-slate-400' : 'left-0 text-slate-400'
                                        }`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                            <div ref={messagesEndRef} className="h-2" />
                        </div>

                        {/* Input Area Flotante */}
                        <div className="p-4 bg-white border-t border-slate-100">
                            <div className="relative flex items-center gap-2 bg-slate-100 rounded-xl p-1 border border-slate-200 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-400 transition-all shadow-inner">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta..."
                                    className="w-full pl-3 py-2.5 bg-transparent border-none text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none"
                                    disabled={isLoading}
                                />
                                <motion.button
                                    whileTap={{ scale: 0.9 }}
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className={`p-2 rounded-lg transition-all duration-200 ${
                                        !inputValue.trim() 
                                            ? 'text-slate-400 bg-transparent cursor-not-allowed' 
                                            : 'bg-blue-600 text-white shadow-md hover:bg-blue-700'
                                    }`}
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </motion.button>
                            </div>
                            <div className="flex justify-center mt-2">
                                <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                    Soporte técnico Rialtor
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Button con mejor diseño */}
            <motion.button
                layout
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className={`relative w-14 h-14 rounded-full shadow-2xl shadow-blue-900/20 flex items-center justify-center transition-all duration-300 z-50 overflow-hidden group ${
                    isOpen 
                        ? 'bg-slate-800 rotate-90' 
                        : 'bg-gradient-to-br from-blue-600 to-indigo-600 hover:brightness-110'
                }`}
            >
                {/* Brillo sutil en hover */}
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />

                <div className="relative z-10 text-white">
                    {isOpen ? (
                        <X className="w-6 h-6" />
                    ) : (
                        <HelpCircle className="w-7 h-7" />
                    )}
                </div>
                
                {/* Notification Badge animado (Pulse) */}
                {!isOpen && (
                    <div className="absolute top-3 right-3">
                        <span className="relative flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                        </span>
                    </div>
                )}
            </motion.button>

            {/* Tooltip Externo (Estilo Speech Bubble) */}
            <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.9 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.9 }}
                        className="absolute bottom-2 right-16 mr-2 z-50 origin-right"
                    >
                        <div className="bg-white text-slate-800 px-4 py-2.5 rounded-xl rounded-br-none shadow-xl border border-slate-100 whitespace-nowrap flex items-center gap-2">
                            <span className="text-sm font-medium">¿Ayuda con la app? 👋</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}