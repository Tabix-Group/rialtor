'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    MessageCircle,
    Loader2,
    RefreshCw,
    Sparkles,
    Calculator,
    FileText,
    Home,
    Building
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
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-0 z-10">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg">
                                <MessageCircle className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">RIALTOR Assistant</h1>
                                <p className="text-gray-600 text-sm">Especialista inmobiliario con IA avanzada</p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                        >
                            <RefreshCw className="w-4 h-4" />
                            <span className="text-sm">Nuevo chat</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Chat Area */}
            <div className="max-w-4xl mx-auto px-4 py-8">
                <div className="bg-white/90 backdrop-blur-md rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                    {/* Messages Container */}
                    <div className="h-[600px] overflow-y-auto p-6 space-y-6 bg-gradient-to-b from-gray-50/50 to-white">
                        {messages.length === 0 ? (
                            <div className="text-center py-12">
                                <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                                    <MessageCircle className="w-8 h-8 text-white" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Bienvenido a RIALTOR!</h3>
                                <p className="text-gray-600 max-w-md mx-auto">
                                    Soy tu asistente especializado en el sector inmobiliario argentino.
                                    ¿En qué puedo ayudarte hoy?
                                </p>
                            </div>
                        ) : (
                            messages.map((message, index) => (
                                <motion.div
                                    key={message.id}
                                    className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                >
                                    <div
                                        className={`max-w-[80%] p-4 rounded-2xl ${
                                            message.isUser
                                                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg'
                                                : 'bg-white border border-gray-200 text-gray-900 shadow-sm'
                                        }`}
                                    >
                                        <MessageContent
                                            content={message.content}
                                            isUser={message.isUser}
                                            sources={message.sources}
                                            calculation={message.calculation}
                                        />

                                        <p className={`text-xs mt-2 ${message.isUser ? 'text-blue-100' : 'text-gray-500'}`}>
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
                                <div className="bg-white border border-gray-200 p-4 rounded-2xl shadow-sm">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 animate-spin text-white" />
                                        </div>
                                        <div className="flex space-x-1">
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                                            <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-gray-200">

                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef as any}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder="Escribe tu consulta inmobiliaria..."
                                    disabled={isLoading}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder-gray-400 transition-all resize-none min-h-[44px] max-h-32"
                                    rows={1}
                                    style={{ height: 'auto', minHeight: '44px' }}
                                    onInput={(e) => {
                                        const target = e.target as HTMLTextAreaElement;
                                        target.style.height = 'auto';
                                        target.style.height = Math.min(target.scrollHeight, 128) + 'px';
                                    }}
                                />
                            </div>

                            {/* Botón de enviar */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading}
                                className="p-3 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 disabled:from-gray-300 disabled:to-gray-400 text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed flex items-center justify-center"
                            >
                                {isLoading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <Send className="w-5 h-5" />
                                )}
                            </motion.button>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="text-center mt-8">
                    <div className="flex items-center justify-center space-x-2 text-gray-500 text-sm">
                        <Sparkles className="w-4 h-4" />
                        <span>Potenciado por IA avanzada • Especializado en bienes raíces argentinos</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
