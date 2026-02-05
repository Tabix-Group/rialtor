'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, HelpCircle, Loader2 } from 'lucide-react'
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
    }, [isOpen, messages.length]);

    return (
        <div className="fixed bottom-6 right-6 z-[60] font-sans">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.95, transformOrigin: 'bottom right' }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                        className="absolute bottom-20 right-0 w-[350px] sm:w-[380px] h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 text-white flex items-center justify-between shadow-md">
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm">
                                    <HelpCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="font-semibold text-base">Centro de Ayuda</h3>
                                    <p className="text-xs text-blue-100 opacity-90">Asistencia para Rialtor</p>
                                </div>
                            </div>
                            <button 
                                onClick={toggleOpen}
                                className="p-1.5 hover:bg-white/10 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-white/50"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Messages Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
                            {messages.length === 0 && (
                                <div className="flex flex-col items-center justify-center h-full text-gray-400 space-y-2">
                                    <HelpCircle className="w-10 h-10 opacity-50" />
                                    <p className="text-sm text-center">¿En qué puedo ayudarte hoy?</p>
                                </div>
                            )}
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex ${msg.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div
                                        className={`max-w-[85%] p-3 rounded-2xl text-sm shadow-sm ${
                                            msg.isUser
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-white text-gray-800 border border-gray-100 rounded-tl-sm'
                                        }`}
                                    >
                                        <MessageContent content={msg.content} isUser={msg.isUser} />
                                        <div className={`text-[10px] mt-1.5 opacity-70 ${msg.isUser ? 'text-blue-100 text-right' : 'text-gray-500 text-left'}`}>
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </div>
                                    </div>
                                </div>
                            ))}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <div className="relative flex items-center">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta..."
                                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                                    disabled={isLoading}
                                />
                                <button
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg disabled:opacity-50 disabled:hover:bg-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                >
                                    {isLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Bubble Button */}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleOpen}
                className={`relative w-14 h-14 rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 ${
                    isOpen ? 'bg-gray-800 text-white' : 'bg-gradient-to-br from-blue-600 to-indigo-600 text-white'
                }`}
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close-icon"
                            initial={{ opacity: 0, rotate: -90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: 90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <X className="w-6 h-6" />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="help-icon"
                            initial={{ opacity: 0, rotate: 90 }}
                            animate={{ opacity: 1, rotate: 0 }}
                            exit={{ opacity: 0, rotate: -90 }}
                            transition={{ duration: 0.2 }}
                        >
                            <HelpCircle className="w-7 h-7" />
                        </motion.div>
                    )}
                </AnimatePresence>
                
                {/* Notification Badge */}
                {!isOpen && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
                )}
            </AnimatePresence>
            
             {/* Tooltip */}
             <AnimatePresence>
                {showTooltip && !isOpen && (
                    <motion.div
                        initial={{ opacity: 0, x: 10, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 10, scale: 0.95 }}
                        className="absolute bottom-1 right-16 mr-2 z-50"
                    >
                        <div className="bg-white text-gray-800 px-4 py-2.5 rounded-xl shadow-xl border border-gray-100 whitespace-nowrap flex items-center gap-2">
                            <span className="text-sm font-medium">¿Ayuda con la app? 👋</span>
                            {/* Arrow */}
                            <div className="absolute right-[-6px] top-1/2 -translate-y-1/2 w-3 h-3 bg-white rotate-45 border-r border-t border-gray-100" />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}