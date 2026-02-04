'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, HelpCircle, Loader2 } from 'lucide-react'
import { useHelpAssistantChat } from '../hooks/useHelpAssistantChat'
import MessageContent from './MessageContent'
import { useAuth } from '../app/auth/authContext'
import { usePathname } from 'next/navigation'

export default function HelpAssistant() {
    const { user } = useAuth()
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const {
        messages,
        isLoading,
        sendMessage,
        clearChat,
        inputRef,
        messagesEndRef
    } = useHelpAssistantChat()

    const [inputValue, setInputValue] = useState('')
    const [showTooltip, setShowTooltip] = useState(false)

    // Rutas donde NO se debe mostrar el asistente de ayuda
    const excludedRoutes = ['/', '/pricing', '/auth/login', '/auth/register'];
    const isExcludedRoute = excludedRoutes.includes(pathname || '');

    // Al usar dynamic(..., { ssr: false }), ya no necesitamos el check de mounted manual
    // Pero el check de user y ruta sigue siendo necesario
    if (!user || isExcludedRoute) return null

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
        <div className="fixed bottom-6 right-6 z-[60]">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[400px] h-[500px] bg-white rounded-2xl shadow-2xl border border-blue-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-blue-600 p-4 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-2">
                                <div className="bg-white/20 p-2 rounded-lg">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-sm">Centro de Ayuda RIALTOR</h3>
                                    <p className="text-[10px] text-blue-100 italic">Asistencia técnica en vivo</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleOpen}
                                className="p-1 hover:bg-white/10 rounded-full transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                                            msg.isUser
                                                ? 'bg-blue-600 text-white rounded-tr-none shadow-blue-200'
                                                : 'bg-white text-slate-700 border border-slate-200 rounded-tl-none shadow-sm'
                                        } shadow-md`}
                                    >
                                        <MessageContent content={msg.content} isUser={msg.isUser} />
                                        <div className={`text-[10px] mt-1 opacity-50 ${msg.isUser ? 'text-right' : 'text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-3 bg-white border-t border-slate-100">
                            <div className="relative flex items-center gap-2">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta de ayuda..."
                                    className="w-full pl-4 pr-12 py-3 bg-slate-100 border-none rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-1 p-2 text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Send className="w-5 h-5" />
                                    )}
                                </button>
                            </div>
                            <p className="text-[10px] text-center text-slate-400 mt-2">
                                Respondo dudas sobre el uso de Rialtor
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className={`relative w-14 h-14 rounded-full shadow-2xl flex items-center justify-center transition-colors ${
                    isOpen ? 'bg-slate-800 text-white' : 'bg-blue-600 text-white'
                }`}
            >
                {isOpen ? <X /> : <HelpCircle className="w-7 h-7" />}
                
                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                )}

                {/* Tooltip */}
                <AnimatePresence>
                    {showTooltip && !isOpen && (
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            className="absolute right-full mr-4 whitespace-nowrap bg-white text-slate-800 px-4 py-2 rounded-xl shadow-xl border border-blue-50"
                        >
                            <p className="text-sm font-medium">¿Necesitas ayuda con Rialtor? 👋</p>
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-blue-50" />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
