'use client'

import { createContext, useContext, ReactNode } from 'react'
import { useNotifications } from '../hooks/useNotifications'
import Notification from '../components/Notification'

interface NotificationContextType {
    showSuccess: (message: string) => void
    showError: (message: string) => void
    showInfo: (message: string) => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
    const { notifications, removeNotification, showSuccess, showError, showInfo } = useNotifications()

    const value = {
        showSuccess,
        showError,
        showInfo
    }

    return (
        <NotificationContext.Provider value={value}>
            {children}

            {/* Render notifications */}
            <div className="fixed top-4 right-4 z-50 space-y-2">
                {notifications.map((notification) => (
                    <Notification
                        key={notification.id}
                        type={notification.type}
                        message={notification.message}
                        isVisible={notification.isVisible}
                        onClose={() => removeNotification(notification.id)}
                    />
                ))}
            </div>
        </NotificationContext.Provider>
    )
}

export function useNotificationContext() {
    const context = useContext(NotificationContext)
    if (context === undefined) {
        throw new Error('useNotificationContext must be used within a NotificationProvider')
    }
    return context
}
