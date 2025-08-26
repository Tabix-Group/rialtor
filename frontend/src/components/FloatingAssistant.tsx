'use client'

import { useState, useEffect } from 'react'
import {
    MessageCircle,
    Send,
    X,
    Brain,
    User,
    Minimize2,
    Maximize2,
    Sparkles,
    RefreshCw,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAssistant } from '../contexts/AssistantContext'
import { useAssistantChat } from '../hooks/useAssistantChat'
import MessageActions from './MessageActions'

export default function FloatingAssistant() {
    const { isOpen, toggleAssistant, isMinimized, toggleMinimize } = useAssistant()
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

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, isMinimized, inputRef])

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

    const handleQuickSuggestion = (text: string) => {
        setInputValue(text)
        inputRef.current?.focus()
    }

    const testMessage = async () => {
        console.log('[TEST] Testing with simple message...');
        await sendMessage('Hola, soy una prueba');
    }

    // Floating button
    if (!isOpen) {
        return (
            <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="fixed bottom-6 right-6 z-[9999]"
            >
                <button
                    onClick={toggleAssistant}
                    className="group relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
                >
                    <div className="relative">
                        <Brain className="w-6 h-6" />
                        {/* Pulse animation */}
                        <div className="absolute -inset-1 bg-red-400 rounded-full animate-ping opacity-20"></div>
                        {/* Sparkles effect */}
                        <Sparkles className="absolute -top-1 -right-1 w-3 h-3 text-yellow-300 animate-pulse" />
                    </div>

                    {/* Tooltip */}
                    <div className="absolute bottom-full right-0 mb-2 px-3 py-1 bg-gray-900 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                        Consulta con RIALTOR
                        <div className="absolute top-full right-3 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </div>
                </button>
            </motion.div>
        )
    }

    // Chat window
    return (
        <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{
                scale: 1,
                opacity: 1,
                y: 0,
                height: isMinimized ? 'auto' : '600px'
            }}
            exit={{ scale: 0.8, opacity: 0, y: 20 }}
            className="fixed bottom-6 right-6 z-[9999] bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden"
            style={{ width: '380px' }}
        >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 text-white">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <div className="relative">
                            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                                <Brain className="w-5 h-5" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse"></div>
                        </div>
                        <div>
                            <h3 className="font-semibold">RIALTOR</h3>
                            <p className="text-xs text-red-100">Asistente Inmobiliario IA</p>
                        </div>
                    </div>

                    <div className="flex items-center space-x-1">
                        <button
                            onClick={testMessage}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-xs"
                            title="Test"
                        >
                            🧪
                        </button>
                        <button
                            onClick={toggleMinimize}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title={isMinimized ? "Expandir" : "Minimizar"}
                        >
                            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                        </button>
                        <button
                            onClick={clearChat}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title="Limpiar chat"
                        >
                            <RefreshCw className="w-4 h-4" />
                        </button>
                        <button
                            onClick={toggleAssistant}
                            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                            title="Cerrar"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Chat content */}
            <AnimatePresence>
                {!isMinimized && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="flex flex-col h-96"
                    >
                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white">
                            {messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ delay: index * 0.1 }}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                >
                                    <div className={`flex items-end space-x-2 max-w-[85%] ${message.isUser ? 'flex-row-reverse space-x-reverse' : 'flex-row'
                                        }`}>
                                        {/* Avatar */}
                                        <motion.div
                                            whileHover={{ scale: 1.1 }}
                                            className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${message.isUser
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white'
                                                : 'bg-gradient-to-r from-red-500 to-red-600 text-white'
                                                }`}
                                        >
                                            {message.isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                                        </motion.div>

                                        {/* Message bubble */}
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className={`px-4 py-3 rounded-2xl group ${message.isUser
                                                ? 'bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-br-md'
                                                : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                                }`}
                                        >
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                {message.content}
                                            </p>
                                            <p className={`text-xs mt-1 ${message.isUser ? 'text-blue-100' : 'text-gray-500'
                                                }`}>
                                                {new Date(message.timestamp).toLocaleTimeString([], {
                                                    hour: '2-digit',
                                                    minute: '2-digit'
                                                })}
                                            </p>

                                            {/* Message Actions */}
                                            <MessageActions
                                                content={message.content}
                                                isUser={message.isUser}
                                                messageId={message.id}
                                                onFeedback={sendFeedback}
                                            />
                                        </motion.div>
                                    </div>
                                </motion.div>
                            ))}

                            {/* Loading indicator */}
                            {isLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="flex justify-start"
                                >
                                    <div className="flex items-end space-x-2">
                                        <div className="w-7 h-7 bg-gradient-to-r from-red-500 to-red-600 rounded-full flex items-center justify-center">
                                            <Brain className="w-4 h-4 text-white" />
                                        </div>
                                        <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                            <div className="flex space-x-1">
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce"></div>
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                                <div className="w-2 h-2 bg-red-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>

                        {/* Quick suggestions */}
                        <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                            <div className="flex flex-wrap gap-2">
                                {[
                                    { icon: '💰', text: 'Calcular honorarios', action: 'Necesito calcular los honorarios para una operación inmobiliaria' },
                                    { icon: '📋', text: 'Gastos escritura', action: 'Quiero conocer los gastos de escrituración' },
                                    { icon: '🏠', text: 'Tasación', action: 'Necesito una tasación express de una propiedad' },
                                    { icon: '⚡', text: 'Consulta rápida', action: 'Tengo una consulta sobre' }
                                ].map((suggestion, index) => (
                                    <motion.button
                                        key={index}
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={() => handleQuickSuggestion(suggestion.action)}
                                        className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 rounded-full transition-all duration-200"
                                    >
                                        <span>{suggestion.icon}</span>
                                        <span>{suggestion.text}</span>
                                    </motion.button>
                                ))}
                            </div>
                        </div>

                        {/* Input area */}
                        <div className="p-4 bg-white border-t border-gray-100">
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
                                        className="w-full px-4 py-3 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder-gray-400"
                                    />
                                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        <span className="text-xs">↵</span>
                                    </div>
                                </div>
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={handleSendMessage}
                                    disabled={!inputValue.trim() || isLoading}
                                    className="p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
                                >
                                    {isLoading ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Send className="w-4 h-4" />
                                    )}
                                </motion.button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    )
}
