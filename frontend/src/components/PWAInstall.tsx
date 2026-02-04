"use client"

import { useEffect, useState } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

export default function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showInstallButton, setShowInstallButton] = useState(false)
  const [showIOSBanner, setShowIOSBanner] = useState(false)

  // Función para detectar si es iOS
  const isIOS = () => {
    if (typeof window === 'undefined') return false
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    return /iPad|iPhone|iPod/.test(userAgent) && !(window as any).MSStream
  }

  // Función para detectar si es Android
  const isAndroid = () => {
    if (typeof window === 'undefined') return false
    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
    return /android/i.test(userAgent)
  }

  // Función para verificar si ya se mostró el banner en esta sesión
  const hasShownInstallBanner = () => {
    if (typeof window === 'undefined') return false
    const shown = localStorage.getItem('pwa-install-banner-shown')
    const today = new Date().toDateString()
    return shown === today
  }

  // Función para marcar que se mostró el banner
  const markInstallBannerAsShown = () => {
    if (typeof window === 'undefined') return
    const today = new Date().toDateString()
    localStorage.setItem('pwa-install-banner-shown', today)
  }

  useEffect(() => {
    // Registrar service worker primero
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          // Forzar actualización si hay una nueva versión
          registration.update()
        })
        .catch((error) => {
          console.error('❌ Service Worker registration failed:', error)
        })
    }

    // Verificar si ya está instalada la PWA
    if (window.matchMedia('(display-mode: standalone)').matches) {
      return
    }

    // Si ya se mostró hoy, no mostrar de nuevo
    if (hasShownInstallBanner()) {
      return
    }

    // Para iOS, mostrar banner de instrucciones
    if (isIOS() && !window.matchMedia('(display-mode: standalone)').matches) {
      setShowIOSBanner(true)
      markInstallBannerAsShown()
      return
    }

    // Escuchar el evento beforeinstallprompt (solo para Android/Chrome)
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      // Prevenir que Chrome muestre automáticamente el prompt
      e.preventDefault()
      // Guardar el evento para que se pueda activar más tarde
      setDeferredPrompt(e)
      // Mostrar el botón de instalación solo en Android
      if (isAndroid()) {
        setShowInstallButton(true)
        markInstallBannerAsShown()
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Detectar si se instaló la app
    window.addEventListener('appinstalled', () => {
      setShowInstallButton(false)
      setDeferredPrompt(null)
    })

    // Limpiar event listeners
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // Mostrar el prompt de instalación
    deferredPrompt.prompt()

    // Esperar la respuesta del usuario
    const { outcome } = await deferredPrompt.userChoice

    // Ya no necesitamos el prompt deferred
    setDeferredPrompt(null)
    setShowInstallButton(false)
  }

  // No mostrar nada si no es móvil o ya está instalado
  if ((!isIOS() && !isAndroid()) || (!showInstallButton && !showIOSBanner) || (!deferredPrompt && !showIOSBanner)) return null

  // Banner para iOS
  if (showIOSBanner) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-6 sm:right-6 sm:max-w-sm sm:mx-auto md:left-auto md:right-6 md:max-w-xs lg:max-w-sm">
        <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5 backdrop-blur-sm">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
                <img 
                  src="/images/android-chrome-512x512.png" 
                  alt="Rialtor Logo" 
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">Instalar en iOS</h3>
              <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
                Toca el botón compartir y selecciona "Agregar a pantalla de inicio"
              </p>
            </div>
            <div className="flex-shrink-0">
              <button
                onClick={() => setShowIOSBanner(false)}
                className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
          <div className="mt-4 sm:mt-5 flex gap-2 sm:gap-3">
            <button
              onClick={() => setShowIOSBanner(false)}
              className="flex-1 bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
            >
              Entendido
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Banner para Android
  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 sm:left-6 sm:right-6 sm:max-w-sm sm:mx-auto md:left-auto md:right-6 md:max-w-xs lg:max-w-sm">
      <div className="bg-white rounded-xl shadow-2xl border border-gray-200 p-4 sm:p-5 backdrop-blur-sm">
        <div className="flex items-start gap-3 sm:gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white rounded-xl flex items-center justify-center shadow-sm overflow-hidden border border-gray-100">
              <img 
                src="/images/android-chrome-512x512.png" 
                alt="Rialtor Logo" 
                className="w-full h-full object-contain"
              />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm sm:text-base font-bold text-gray-900 leading-tight">Instalar RIALTOR</h3>
            <p className="text-xs sm:text-sm text-gray-600 mt-1 leading-relaxed">
              Agregá la app a tu pantalla de inicio para acceder más rápido
            </p>
          </div>
          <div className="flex-shrink-0">
            <button
              onClick={() => setShowInstallButton(false)}
              className="text-gray-400 hover:text-gray-600 p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
        <div className="mt-4 sm:mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3">
          <button
            onClick={handleInstallClick}
            className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-4 py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold hover:from-green-700 hover:to-emerald-700 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95"
          >
            Instalar App
          </button>
          <button
            onClick={() => setShowInstallButton(false)}
            className="px-4 py-2.5 sm:py-3 text-gray-600 text-sm sm:text-base font-medium hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Después
          </button>
        </div>
      </div>
    </div>
  )
}