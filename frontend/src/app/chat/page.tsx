'use client''use client'



import React, { useState, useRef, useEffect } from 'react'import { useState, useRef, useEffect } from 'react'

import { motion, AnimatePresence } from 'framer-motion'import { Send, Bot, User } from 'lucide-react'

import {

    Send,interface Message {

    MessageCircle,  id: string

    Mic,  content: string

    MicOff,  isUser: boolean

    Volume2,  timestamp: string // ISO string

    VolumeX,}

    Loader2,

    RefreshCw,import { useAuth } from '../auth/authContext'

    Sparkles,

    Calculator,export default function ChatPage() {

    DollarSign,  const [messages, setMessages] = useState<Message[]>([

    FileText,    {

    TrendingUp      id: '1',

} from 'lucide-react'      content: '¡Hola! Soy tu asistente de Rialtor. ¿En qué puedo ayudarte hoy?',

import { useAssistantChat } from '../../hooks/useAssistantChat'      isUser: false,

import MessageContent from '../../components/MessageContent'      timestamp: new Date().toISOString()

    }

export default function ChatPage() {  ])

    const {  const [inputValue, setInputValue] = useState('')

        messages,  const [isLoading, setIsLoading] = useState(false)

        isLoading,  const { user } = useAuth();

        sendMessage,

        clearChat,  const handleSendMessage = async () => {

        inputRef,    if (!inputValue.trim()) return

        messagesEndRef,

        sendFeedback    const userMessage: Message = {

    } = useAssistantChat()      id: Date.now().toString(),

      content: inputValue,

    const [inputValue, setInputValue] = useState('')      isUser: true,

    const [isRecording, setIsRecording] = useState(false)      timestamp: new Date().toISOString()

    const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)    }

    const [audioChunks, setAudioChunks] = useState<Blob[]>([])

    const [recordingDuration, setRecordingDuration] = useState(0)    setMessages(prev => [...prev, userMessage])

    const [recordingInterval, setRecordingInterval] = useState<NodeJS.Timeout | null>(null)    setInputValue('')

    const [isPlayingAudio, setIsPlayingAudio] = useState(false)    setIsLoading(true)



    // Focus input when page loads    try {

    useEffect(() => {      const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;

        setTimeout(() => inputRef.current?.focus(), 100)      const response = await fetch('/api/chat', {

    }, [inputRef])        method: 'POST',

        headers: {

    // Scroll to bottom when new messages arrive          'Content-Type': 'application/json',

    useEffect(() => {          ...(token ? { 'Authorization': `Bearer ${token}` } : {})

        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })        },

    }, [messages, messagesEndRef])        body: JSON.stringify({ message: inputValue })

      })

    const handleSendMessage = async () => {

        if (!inputValue.trim() || isLoading) return      if (response.ok) {

        const data = await response.json()

        const message = inputValue        const botMessage: Message = {

        setInputValue('')          id: (Date.now() + 1).toString(),

        await sendMessage(message, undefined, true)          content: data.assistantMessage?.content || data.message || 'Sin respuesta del asistente.',

    }          isUser: false,

          timestamp: new Date().toISOString()

    const handleKeyPress = (e: React.KeyboardEvent) => {        }

        if (e.key === 'Enter' && !e.shiftKey) {        setMessages(prev => [...prev, botMessage])

            e.preventDefault()      } else {

            handleSendMessage()        throw new Error('Error al enviar mensaje')

        }      }

    }    } catch (error) {

      // Respuesta simulada para desarrollo

    const handleQuickSuggestion = (text: string) => {      const botMessage: Message = {

        setInputValue(text)        id: (Date.now() + 1).toString(),

        inputRef.current?.focus()        content: 'Gracias por tu mensaje. Esta es una respuesta simulada. En producción, aquí funcionará la integración con OpenAI.',

    }        isUser: false,

        timestamp: new Date().toISOString()

    // Audio recording functions      }

    const startRecording = async () => {      setMessages(prev => [...prev, botMessage])

        try {    } finally {

            const stream = await navigator.mediaDevices.getUserMedia({      setIsLoading(false)

                audio: {    }

                    echoCancellation: true,  }

                    noiseSuppression: true,

                    sampleRate: 44100  const handleKeyPress = (e: React.KeyboardEvent) => {

                }    if (e.key === 'Enter' && !e.shiftKey) {

            })      e.preventDefault()

      handleSendMessage()

            let mimeType = 'audio/webm;codecs=opus'    }

            if (!MediaRecorder.isTypeSupported(mimeType)) {  }

                mimeType = 'audio/webm'

                if (!MediaRecorder.isTypeSupported(mimeType)) {  // Scroll automático al último mensaje

                    mimeType = 'audio/mp4'  const messagesEndRef = useRef<HTMLDivElement>(null);

                    if (!MediaRecorder.isTypeSupported(mimeType)) {  useEffect(() => {

                        mimeType = ''    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });

                    }  }, [messages, isLoading]);

                }

            }  return (

    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 py-10 flex flex-col items-center">

            const recorder = new MediaRecorder(stream, {      <div className="w-full max-w-2xl flex flex-col flex-1 rounded-3xl shadow-2xl border border-gray-100 bg-white/90 backdrop-blur-md overflow-hidden">

                mimeType: mimeType || undefined        {/* Header */}

            })        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 text-white p-6 rounded-t-3xl shadow flex flex-col gap-1">

          <h1 className="text-2xl font-extrabold flex items-center gap-3">

            setAudioChunks([])            <Bot className="w-7 h-7" />

            setIsRecording(true)            Asistente Rialtor

            setRecordingDuration(0)          </h1>

          <p className="text-blue-100 text-base">

            const interval = setInterval(() => {            Pregúntame sobre propiedades, procesos o cualquier duda de Rialtor

                setRecordingDuration(prev => prev + 1)          </p>

            }, 1000)        </div>

            setRecordingInterval(interval)

        {/* Mensajes */}

            recorder.ondataavailable = (event) => {        <div className="flex-1 overflow-y-auto px-4 py-6 bg-white/60" style={{ minHeight: 400 }}>

                if (event.data.size > 0) {          {messages.map((message) => (

                    setAudioChunks(prev => [...prev, event.data])            <div

                }              key={message.id}

            }              className={`chat-message ${message.isUser ? 'user' : 'assistant'}`}

            >

            recorder.onstop = () => {              <div className={`chat-bubble ${message.isUser ? 'user' : 'assistant'} shadow-sm flex items-end gap-2`}>

                if (recordingInterval) {                {!message.isUser && <Bot className="w-5 h-5 text-blue-500 flex-shrink-0" />}

                    clearInterval(recordingInterval)                <div className="flex-1">

                    setRecordingInterval(null)                  <p className="whitespace-pre-wrap text-base leading-relaxed">{message.content}</p>

                }                  <span className={`block text-xs mt-1 ${message.isUser ? 'text-blue-200' : 'text-gray-500'}`}>

                stream.getTracks().forEach(track => track.stop())                    {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}

            }                  </span>

                </div>

            setMediaRecorder(recorder)                {message.isUser && <User className="w-5 h-5 text-blue-500 flex-shrink-0" />}

            recorder.start(1000)              </div>

        } catch (error) {            </div>

            console.error('Error accessing microphone:', error)          ))}

            alert('No se pudo acceder al micrófono. Verifica los permisos.')          {isLoading && (

        }            <div className="chat-message assistant">

    }              <div className="chat-bubble assistant flex items-center gap-2 shadow-sm">

                <Bot className="w-5 h-5 text-blue-500" />

    const stopRecording = () => {                <div className="flex space-x-1">

        if (mediaRecorder && mediaRecorder.state === 'recording') {                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>

            mediaRecorder.stop()                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>

        }                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>

        setIsRecording(false)                </div>

        if (recordingInterval) {              </div>

            clearInterval(recordingInterval)            </div>

            setRecordingInterval(null)          )}

        }          <div ref={messagesEndRef} />

    }        </div>



    useEffect(() => {        {/* Input moderno */}

        if (!isRecording && audioChunks.length > 0) {        <div className="border-t bg-white/80 px-4 py-4">

            setTimeout(() => sendAudioMessage(), 500)          <form

        }            className="flex gap-3 items-end"

    }, [isRecording, audioChunks])            onSubmit={e => { e.preventDefault(); handleSendMessage(); }}

            autoComplete="off"

    const sendAudioMessage = async () => {          >

        try {            <textarea

            if (audioChunks.length === 0) return              value={inputValue}

              onChange={(e) => setInputValue(e.target.value)}

            const audioBlob = new Blob(audioChunks, { type: 'audio/webm' })              onKeyPress={handleKeyPress}

            if (audioBlob.size < 1000) {              placeholder="Escribe tu mensaje..."

                alert('La grabación es muy corta.')              className="input resize-none min-h-[44px] max-h-32"

                return              rows={1}

            }              disabled={isLoading}

              style={{ flex: 1 }}

            const reader = new FileReader()            />

            reader.onloadend = async () => {            <button

                try {              type="submit"

                    const base64 = reader.result as string              disabled={isLoading || !inputValue.trim()}

                    const base64Data = base64.split(',')[1]              className="btn-primary rounded-full p-3 shadow-lg hover:scale-105 transition-transform disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center"

              title="Enviar"

                    if (!base64Data || base64Data.length < 100) {            >

                        alert('Error al procesar el audio.')              <Send className="w-6 h-6" />

                        return            </button>

                    }          </form>

        </div>

                    await sendMessage('', base64Data, true)      </div>

                    setAudioChunks([])    </div>

                } catch (error) {  )

                    console.error('Error enviando mensaje de audio:', error)}

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
                                    icon: <DollarSign className="w-4 h-4" />,
                                    text: 'Precio del dólar',
                                    action: '¿Cuál es el precio del dólar blue hoy en Argentina?',
                                    color: 'from-green-500 to-green-600'
                                },
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
                                    icon: <TrendingUp className="w-4 h-4" />,
                                    text: 'Tendencias mercado',
                                    action: '¿Cuáles son las tendencias actuales del mercado inmobiliario en Buenos Aires?',
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