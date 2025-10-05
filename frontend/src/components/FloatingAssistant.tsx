'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Send, MessageCircle, Loader2, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
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
        inputRef,
        messagesEndRef,
        sendFeedback
    } = useAssistantChat()

    const [inputValue, setInputValue] = useState('')
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, inputRef])

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

    // Audio recording functions
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            })

            let mimeType = 'audio/webm;codecs=opus'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm'
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/mp4'
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = ''
                    }
                }
            }

            const recorder = new MediaRecorder(stream, {
                mimeType: mimeType || undefined
            })

            setAudioChunks([])
            setIsRecording(true)
            setRecordingDuration(0)

            const interval = setInterval(() => {
                setRecordingDuration(prev => prev + 1)
            }, 1000)
            setRecordingInterval(interval)

            recorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    setAudioChunks(prev => [...prev, event.data])
                }
            }

            recorder.onstop = () => {
                if (recordingInterval) {
                    clearInterval(recordingInterval)
                    setRecordingInterval(null)
                }
                stream.getTracks().forEach(track => track.stop())
            }

            setMediaRecorder(recorder)
            recorder.start(1000)
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('No se pudo acceder al micrófono. Verifica los permisos.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
        }
        setIsRecording(false)
        if (recordingInterval) {
            clearInterval(recordingInterval)
            setRecordingInterval(null)
        }
    }

    useEffect(() => {
        if (!isRecording && audioChunks.length > 0) {
            setTimeout(() => sendAudioMessage(), 500)
        }
    }, [isRecording, audioChunks])

    const sendAudioMessage = async () => {
        try {
            if (audioChunks.length === 0) return

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })
            if (audioBlob.size < 1000) {
                alert('La grabación es muy corta.')
                return
            }

            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result as string
                    const base64Data = base64.split(',')[1]

                    if (!base64Data || base64Data.length < 100) {
                        alert('Error al procesar el audio.')
                        return
                    }

                    await sendMessage('', base64Data, true)
                    setAudioChunks([])
                } catch (error) {
                    console.error('Error enviando mensaje de audio:', error)
                    alert('Error al enviar el mensaje de voz.')
                }
            }
            reader.onerror = () => {
                alert('Error al procesar el audio.')
            }
            reader.readAsDataURL(audioBlob)
        } catch (error) {
            console.error('Error sending audio:', error)
            alert('Error al procesar el audio.')
        }
    }

    const playAudioResponse = (base64Audio: string) => {
        try {
            const audioData = `data:audio/mp3;base64,${base64Audio}`
            const audio = new Audio(audioData)

            setIsPlayingAudio(true)
            audio.onended = () => setIsPlayingAudio(false)
            audio.onerror = () => setIsPlayingAudio(false)

            audio.play()
        } catch (error) {
            console.error('Error playing audio:', error)
            setIsPlayingAudio(false)
        }
    }

    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }

    // Floating button - Minimalista y premium
    if (!isOpen) {
        return (
            <motion.button
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleAssistant}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
            >
                <MessageCircle className="w-6 h-6 text-white group-hover:scale-110 transition-transform" />
            </motion.button>
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

                                        {/* Audio controls para respuestas del asistente */}
                                        {!message.isUser && message.audioBase64 && (
                                            <div className="mt-2 flex items-center space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => playAudioResponse(message.audioBase64!)}
                                                    disabled={isPlayingAudio}
                                                    className="flex items-center space-x-1 px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {isPlayingAudio ? (
                                                        <VolumeX className="w-3 h-3" />
                                                    ) : (
                                                        <Volume2 className="w-3 h-3" />
                                                    )}
                                                    <span className="text-xs">
                                                        {isPlayingAudio ? 'Reproduciendo...' : 'Escuchar respuesta'}
                                                    </span>
                                                </motion.button>
                                            </div>
                                        )}

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

                    {/* Quick suggestions */}
                    <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                        <div className="flex flex-wrap gap-2">
                            {[
                                { icon: '💰', text: 'Precio del dólar', action: '¿Cuál es el precio del dólar blue hoy en Argentina?' },
                                { icon: '🧮', text: 'Calcular honorarios', action: 'Necesito calcular los honorarios para una venta de $100.000 USD con comisión del 4% en CABA' },
                                { icon: '📋', text: 'Gastos escrituración', action: 'Quiero saber los gastos de escrituración para una propiedad de $150.000 USD en Buenos Aires' },
                                { icon: '📈', text: 'Tendencias mercado', action: '¿Cuáles son las tendencias actuales del mercado inmobiliario en Buenos Aires?' }
                            ].map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleQuickSuggestion(suggestion.action)}
                                    className="flex items-center space-x-1 px-3 py-1.5 text-xs bg-white hover:bg-blue-50 border border-gray-200 hover:border-blue-200 text-gray-600 hover:text-blue-600 rounded-full transition-all duration-200"
                                >
                                    <span>{suggestion.icon}</span>
                                    <span>{suggestion.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Input area premium */}
                    <div className="p-4 border-t border-gray-100 bg-white">
                        {/* Indicador de grabación */}
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-2 p-2 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-center space-x-2"
                            >
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                                <span className="text-blue-600 text-sm font-medium">
                                    Grabando... {formatRecordingTime(recordingDuration)}
                                </span>
                                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                            </motion.div>
                        )}

                        <div className="flex items-center space-x-2">
                            <div className="flex-1 relative">
                                <input
                                    ref={inputRef}
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isRecording ? "Mantén presionado el micrófono y habla..." : "Escribe tu consulta inmobiliaria..."}
                                    disabled={isLoading || isRecording}
                                    className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder-gray-400 transition-all"
                                />
                            </div>

                            {/* Botón del micrófono */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isLoading}
                                className={`p-3 rounded-xl transition-all duration-200 ${
                                    isRecording
                                        ? 'bg-blue-500 hover:bg-blue-600 text-white animate-pulse'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isRecording ? (
                                    <MicOff className="w-4 h-4" />
                                ) : (
                                    <Mic className="w-4 h-4" />
                                )}
                            </motion.button>

                            {/* Botón de enviar */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading || isRecording}
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
