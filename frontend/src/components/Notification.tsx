'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, AlertCircle, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface NotificationProps {
    type: 'success' | 'error' | 'info'
    message: string
    isVisible: boolean
    onClose: () => void
    duration?: number
}

export default function Notification({
    type,
    message,
    isVisible,
    onClose,
    duration = 3000
}: NotificationProps) {
    const [progress, setProgress] = useState(100)

    useEffect(() => {
        if (!isVisible) return

        const interval = setInterval(() => {
            setProgress(prev => {
                if (prev <= 0) {
                    onClose()
                    return 0
                }
                return prev - (100 / duration) * 50
            })
        }, 50)

        return () => clearInterval(interval)
    }, [isVisible, duration, onClose])

    const icons = {
        success: CheckCircle,
        error: AlertCircle,
        info: AlertCircle
    }

    const colors = {
        success: {
            bg: 'bg-green-50',
            border: 'border-green-200',
            text: 'text-green-800',
            icon: 'text-green-500',
            progress: 'bg-green-500'
        },
        error: {
            bg: 'bg-red-50',
            border: 'border-red-200',
            text: 'text-red-800',
            icon: 'text-red-500',
            progress: 'bg-red-500'
        },
        info: {
            bg: 'bg-blue-50',
            border: 'border-blue-200',
            text: 'text-blue-800',
            icon: 'text-blue-500',
            progress: 'bg-blue-500'
        }
    }

    const Icon = icons[type]
    const colorScheme = colors[type]

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{ opacity: 0, y: -50, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -50, scale: 0.9 }}
                    className="fixed top-4 right-4 z-50 w-80"
                >
                    <div className={`relative overflow-hidden rounded-lg border shadow-lg ${colorScheme.bg} ${colorScheme.border}`}>
                        <div className="p-4">
                            <div className="flex items-start">
                                <div className="flex-shrink-0">
                                    <Icon className={`h-5 w-5 ${colorScheme.icon}`} />
                                </div>
                                <div className="ml-3 w-0 flex-1">
                                    <p className={`text-sm font-medium ${colorScheme.text}`}>
                                        {message}
                                    </p>
                                </div>
                                <div className="ml-4 flex flex-shrink-0">
                                    <button
                                        onClick={onClose}
                                        className={`inline-flex rounded-md p-1.5 transition-colors hover:bg-black/10 ${colorScheme.text}`}
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Progress bar */}
                        <div className="absolute bottom-0 left-0 h-1 bg-black/10 w-full">
                            <motion.div
                                className={`h-full ${colorScheme.progress}`}
                                initial={{ width: '100%' }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.05, ease: 'linear' }}
                            />
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
