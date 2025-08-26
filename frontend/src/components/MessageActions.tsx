'use client'

import { motion } from 'framer-motion'
import { Copy, ThumbsUp, ThumbsDown, ExternalLink } from 'lucide-react'
import { useState } from 'react'

interface MessageActionsProps {
    content: string
    isUser: boolean
    messageId: string
    onFeedback?: (messageId: string, type: 'positive' | 'negative') => void
}

export default function MessageActions({ content, isUser, messageId, onFeedback }: MessageActionsProps) {
    const [copied, setCopied] = useState(false)
    const [feedback, setFeedback] = useState<'positive' | 'negative' | null>(null)

    const handleCopy = async () => {
        try {
            await navigator.clipboard.writeText(content)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        } catch (err) {
            console.error('Failed to copy text:', err)
        }
    }

    const handleFeedback = (type: 'positive' | 'negative') => {
        setFeedback(type)
        onFeedback?.(messageId, type)
    }

    // Only show actions for assistant messages
    if (isUser) return null

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex items-center space-x-2 mt-2 opacity-0 group-hover:opacity-100 transition-opacity"
        >
            <button
                onClick={handleCopy}
                className="p-1 text-gray-400 hover:text-gray-600 rounded transition-colors"
                title="Copiar respuesta"
            >
                <Copy className="w-3 h-3" />
            </button>

            <button
                onClick={() => handleFeedback('positive')}
                className={`p-1 rounded transition-colors ${feedback === 'positive'
                        ? 'text-green-500'
                        : 'text-gray-400 hover:text-green-500'
                    }`}
                title="Respuesta útil"
            >
                <ThumbsUp className="w-3 h-3" />
            </button>

            <button
                onClick={() => handleFeedback('negative')}
                className={`p-1 rounded transition-colors ${feedback === 'negative'
                        ? 'text-red-500'
                        : 'text-gray-400 hover:text-red-500'
                    }`}
                title="Respuesta no útil"
            >
                <ThumbsDown className="w-3 h-3" />
            </button>

            {copied && (
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="text-xs text-green-500 font-medium"
                >
                    ¡Copiado!
                </motion.span>
            )}
        </motion.div>
    )
}
