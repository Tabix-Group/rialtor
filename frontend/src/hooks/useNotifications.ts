'use client'

import { useState, useCallback } from 'react'

interface NotificationState {
    id: string
    type: 'success' | 'error' | 'info'
    message: string
    isVisible: boolean
}

export function useNotifications() {
    const [notifications, setNotifications] = useState<NotificationState[]>([])

    const showNotification = useCallback((type: 'success' | 'error' | 'info', message: string) => {
        const id = Date.now().toString()
        const notification: NotificationState = {
            id,
            type,
            message,
            isVisible: true
        }

        setNotifications(prev => [...prev, notification])

        // Auto remove after duration
        setTimeout(() => {
            removeNotification(id)
        }, 3000)

        return id
    }, [])

    const removeNotification = useCallback((id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id))
    }, [])

    const showSuccess = useCallback((message: string) => showNotification('success', message), [showNotification])
    const showError = useCallback((message: string) => showNotification('error', message), [showNotification])
    const showInfo = useCallback((message: string) => showNotification('info', message), [showNotification])

    return {
        notifications,
        showNotification,
        removeNotification,
        showSuccess,
        showError,
        showInfo
    }
}
