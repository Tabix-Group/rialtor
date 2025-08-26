'use client'

import { createContext, useContext, useState, ReactNode } from 'react'

interface AssistantContextType {
    isOpen: boolean
    isMinimized: boolean
    toggleAssistant: () => void
    openAssistant: () => void
    closeAssistant: () => void
    toggleMinimize: () => void
}

const AssistantContext = createContext<AssistantContextType | undefined>(undefined)

export function AssistantProvider({ children }: { children: ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    const [isMinimized, setIsMinimized] = useState(false)

    const toggleAssistant = () => {
        console.log('toggleAssistant called, current isOpen:', isOpen)
        setIsOpen(!isOpen)
        if (!isOpen) {
            setIsMinimized(false) // Reset minimize state when opening
        }
        console.log('toggleAssistant finished, new isOpen:', !isOpen)
    }

    const openAssistant = () => {
        setIsOpen(true)
        setIsMinimized(false)
    }

    const closeAssistant = () => {
        setIsOpen(false)
        setIsMinimized(false)
    }

    const toggleMinimize = () => {
        setIsMinimized(!isMinimized)
    }

    const value = {
        isOpen,
        isMinimized,
        toggleAssistant,
        openAssistant,
        closeAssistant,
        toggleMinimize
    }

    return (
        <AssistantContext.Provider value={value}>
            {children}
        </AssistantContext.Provider>
    )
}

export function useAssistant() {
    const context = useContext(AssistantContext)
    if (context === undefined) {
        throw new Error('useAssistant must be used within an AssistantProvider')
    }
    return context
}
