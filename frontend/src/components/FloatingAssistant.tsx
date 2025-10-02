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
    Zap,
    Mic,
    MicOff,
    Volume2,
    VolumeX
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
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
    const [audioResponse, setAudioResponse] = useState<string | null>(null)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && !isMinimized) {
            setTimeout(() => inputRef.current?.focus(), 100)
        }
    }, [isOpen, isMinimized, inputRef])

    // Debug: Log state changes
    useEffect(() => {
        console.log('FloatingAssistant state:', { isOpen, isMinimized })
    }, [isOpen, isMinimized])

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return

        const message = inputValue
        setInputValue('')
        await sendMessage(message, undefined, true) // Solicitar respuesta de audio
    }

    // Función para manejar grabación de audio
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            })

            // Verificar compatibilidad del MediaRecorder
            let mimeType = 'audio/webm;codecs=opus'
            if (!MediaRecorder.isTypeSupported(mimeType)) {
                mimeType = 'audio/webm'
                if (!MediaRecorder.isTypeSupported(mimeType)) {
                    mimeType = 'audio/mp4'
                    if (!MediaRecorder.isTypeSupported(mimeType)) {
                        mimeType = '' // Usar el formato por defecto
                    }
                }
            }

            console.log('Usando MIME type:', mimeType)

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
                console.log('Audio chunk recibido, tamaño:', event.data.size)
                if (event.data.size > 0) {
                    setAudioChunks(prev => [...prev, event.data])
                }
            }

            recorder.onstop = async () => {
                console.log('Grabación detenida')
                if (recordingInterval) {
                    clearInterval(recordingInterval)
                    setRecordingInterval(null)
                }
                stream.getTracks().forEach(track => track.stop())
            }

            setMediaRecorder(recorder)
            // Grabar en chunks más pequeños para mejor compatibilidad
            recorder.start(1000) // Chunk cada segundo
            console.log('Grabación iniciada')
        } catch (error) {
            console.error('Error accessing microphone:', error)
            alert('No se pudo acceder al micrófono. Verifica los permisos y que tengas un micrófono conectado.')
        }
    }

    const stopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop()
            console.log('Deteniendo grabación...')
        }
        setIsRecording(false)
        if (recordingInterval) {
            clearInterval(recordingInterval)
            setRecordingInterval(null)
        }
    }

    // Efecto para procesar audio cuando termina la grabación
    useEffect(() => {
        if (!isRecording && audioChunks.length > 0) {
            console.log('Grabación terminada, procesando', audioChunks.length, 'chunks')
            // Agregar un pequeño delay para asegurar que todos los chunks se han recibido
            setTimeout(() => {
                sendAudioMessage()
            }, 500)
        }
    }, [isRecording, audioChunks])

    const sendAudioMessage = async () => {
        try {
            if (audioChunks.length === 0) return

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })

            // Verificar que el blob tenga un tamaño mínimo
            if (audioBlob.size < 1000) {
                alert('La grabación es muy corta. Intenta grabar por más tiempo.')
                return
            }

            console.log('Enviando audio, tamaño del blob:', audioBlob.size)

            // Convertir blob a base64
            const reader = new FileReader()
            reader.onloadend = async () => {
                try {
                    const base64 = reader.result as string
                    const base64Data = base64.split(',')[1] // Remover el prefijo data:audio/webm;base64,

                    if (!base64Data || base64Data.length < 100) {
                        alert('Error al procesar el audio. Intenta nuevamente.')
                        return
                    }

                    console.log('Audio convertido a base64, longitud:', base64Data.length)
                    await sendMessage('', base64Data, true) // Enviar audio con solicitud de respuesta de audio
                    setAudioChunks([]) // Limpiar chunks después de enviar
                } catch (error) {
                    console.error('Error enviando mensaje de audio:', error)
                    alert('Error al enviar el mensaje de voz. Intenta nuevamente.')
                }
            }
            reader.onerror = () => {
                console.error('Error leyendo el archivo de audio')
                alert('Error al procesar el audio. Intenta nuevamente.')
            }
            reader.readAsDataURL(audioBlob)
        } catch (error) {
            console.error('Error sending audio:', error)
            alert('Error al procesar el audio. Intenta nuevamente.')
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

    // Agregar formato de tiempo para la duración de grabación
    const formatRecordingTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
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
                    className="group relative bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white p-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 ease-out"
                >
                    <div className="relative">
                        <Brain className="w-6 h-6" />
                        {/* Pulse animation */}
                        <div className="absolute -inset-1 bg-blue-400 rounded-full animate-ping opacity-20"></div>
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
        <>
            {/* Overlay for mobile only */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9998] bg-black/20 md:hidden"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    console.log('Overlay clicked');
                    toggleAssistant();
                }}
            />

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
                style={{ width: '380px', maxHeight: 'calc(100vh - 80px)' }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4 text-white">
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
                                <p className="text-xs text-blue-100">Asistente Inmobiliario IA</p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-1">
                            <button
                                onClick={clearChat}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                title="Limpiar chat"
                            >
                                <RefreshCw className="w-4 h-4" />
                            </button>
                            <button
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    console.log('Close button clicked');
                                    toggleAssistant();
                                }}
                                className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
                                title="Cerrar"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Minimize/Maximize Button - Always visible */}
                <div className="flex justify-end p-2 bg-gradient-to-r from-blue-500 to-indigo-600 border-t border-blue-400/30">
                    <button
                        onClick={toggleMinimize}
                        className="p-1.5 hover:bg-white/20 rounded-full transition-colors text-white"
                        title={isMinimized ? "Expandir chat" : "Minimizar chat"}
                    >
                        {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
                    </button>
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
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/30 to-white max-h-[350px] scrollbar-thin" style={{ scrollBehavior: 'smooth' }}>
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
                                                    : 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white'
                                                    }`}
                                            >
                                                {message.isUser ? <User className="w-4 h-4" /> : <Brain className="w-4 h-4" />}
                                            </motion.div>

                                            {/* Message bubble */}
                                            <motion.div
                                                whileHover={{ scale: 1.02 }}
                                                className={`px-4 py-3 rounded-2xl group ${message.isUser
                                                    ? 'bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-br-md'
                                                    : 'bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md'
                                                    }`}
                                            >
                                                <p className="text-sm leading-relaxed whitespace-pre-wrap">
                                                    {message.content}
                                                </p>

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
                                            <div className="w-7 h-7 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                                                <Brain className="w-4 h-4 text-white" />
                                            </div>
                                            <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
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

                            {/* Quick suggestions */}
                            <div className="px-4 py-2 bg-gray-50/50 border-t border-gray-100">
                                <div className="flex flex-wrap gap-2">
                                    {[
                                        { icon: '💰', text: 'Calcular honorarios', action: 'Necesito calcular los honorarios para una operación inmobiliaria' },
                                        { icon: '📋', text: 'Calculadora de gastos inmobiliarios', action: 'Quiero conocer los gastos de escrituración' },
                                        { icon: '🏠', text: 'Tasación', action: 'Necesito una tasación express de una propiedad' },
                                        { icon: '⚡', text: 'Consulta rápida', action: 'Tengo una consulta sobre' }
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

                            {/* Input area */}
                            <div className="p-3 bg-white border-t border-gray-100">
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
                                            className="w-full px-4 py-2.5 pr-12 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed text-sm placeholder-gray-400"
                                        />
                                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                                            <span className="text-xs">↵</span>
                                        </div>
                                    </div>

                                    {/* Botón del micrófono */}
                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={isRecording ? stopRecording : startRecording}
                                        disabled={isLoading}
                                        className={`p-2.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${isRecording
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

                                    <motion.button
                                        whileHover={{ scale: 1.05 }}
                                        whileTap={{ scale: 0.95 }}
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading || isRecording}
                                        className="p-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed text-white rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl"
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
        </>
    )
}
