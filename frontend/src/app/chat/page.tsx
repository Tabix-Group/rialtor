'use client'

import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Send,
    MessageCircle,
    Mic,
    MicOff,
    Volume2,
    VolumeX,
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
    const [isRecording, setIsRecording] = useState(false)
    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
    const [audioChunks, setAudioChunks] = useState<Blob[]>([])
    const [recordingDuration, setRecordingDuration] = useState(0)
    const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)
    const [isPlayingAudio, setIsPlayingAudio] = useState(false)

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

                                        {/* Audio controls para respuestas del asistente */}
                                        {!message.isUser && message.audioBase64 && (
                                            <div className="mt-3 flex items-center space-x-2">
                                                <motion.button
                                                    whileHover={{ scale: 1.05 }}
                                                    whileTap={{ scale: 0.95 }}
                                                    onClick={() => playAudioResponse(message.audioBase64!)}
                                                    disabled={isPlayingAudio}
                                                    className="flex items-center space-x-2 px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {isPlayingAudio ? (
                                                        <VolumeX className="w-4 h-4" />
                                                    ) : (
                                                        <Volume2 className="w-4 h-4" />
                                                    )}
                                                    <span className="text-sm">
                                                        {isPlayingAudio ? 'Reproduciendo...' : 'Escuchar respuesta'}
                                                    </span>
                                                </motion.button>
                                            </div>
                                        )}

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

                    {/* Quick Suggestions */}
                    <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-200">
                        <div className="flex flex-wrap gap-3">
                            {[
                                {
                                    icon: <Calculator className="w-4 h-4" />,
                                    text: 'Calcular honorarios',
                                    action: 'Necesito calcular los honorarios para una venta de $100.000 USD con comisión del 4% en CABA',
                                    color: 'from-blue-500 to-blue-600'
                                },
                                {
                                    icon: <FileText className="w-4 h-4" />,
                                    text: 'Gastos escrituración',
                                    action: 'Quiero saber los gastos de escrituración para una propiedad de $150.000 USD en Buenos Aires',
                                    color: 'from-purple-500 to-purple-600'
                                },
                                {
                                    icon: <Home className="w-4 h-4" />,
                                    text: 'Gastos inmobiliarios',
                                    action: 'Necesito calcular todos los gastos de una operación inmobiliaria de $200.000 USD en CABA',
                                    color: 'from-green-500 to-green-600'
                                },
                                {
                                    icon: <Building className="w-4 h-4" />,
                                    text: 'Créditos hipotecarios',
                                    action: 'Quiero calcular las cuotas de un crédito hipotecario UVA por $150.000 USD a 20 años',
                                    color: 'from-orange-500 to-orange-600'
                                }
                            ].map((suggestion, index) => (
                                <motion.button
                                    key={index}
                                    whileHover={{ scale: 1.02, y: -1 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => handleQuickSuggestion(suggestion.action)}
                                    className="flex items-center space-x-2 px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 hover:border-gray-300 text-gray-700 hover:text-gray-900 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                                >
                                    <div className={`w-6 h-6 bg-gradient-to-r ${suggestion.color} rounded-lg flex items-center justify-center text-white`}>
                                        {suggestion.icon}
                                    </div>
                                    <span className="text-sm font-medium">{suggestion.text}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="p-6 bg-white border-t border-gray-200">
                        {/* Indicador de grabación */}
                        {isRecording && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-center space-x-3"
                            >
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                                <span className="text-blue-700 font-medium text-sm">
                                    Grabando... {formatRecordingTime(recordingDuration)}
                                </span>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                                <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                            </motion.div>
                        )}

                        <div className="flex items-end space-x-4">
                            <div className="flex-1 relative">
                                <textarea
                                    ref={inputRef as any}
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyPress={handleKeyPress}
                                    placeholder={isRecording ? "Mantén presionado el micrófono y habla..." : "Escribe tu consulta inmobiliaria..."}
                                    disabled={isLoading || isRecording}
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

                            {/* Botón del micrófono */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={isLoading}
                                className={`p-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl ${
                                    isRecording
                                        ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-600'
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                            >
                                {isRecording ? (
                                    <MicOff className="w-5 h-5" />
                                ) : (
                                    <Mic className="w-5 h-5" />
                                )}
                            </motion.button>

                            {/* Botón de enviar */}
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={handleSendMessage}
                                disabled={!inputValue.trim() || isLoading || isRecording}
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
