import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import 'react-quill/dist/quill.snow.css';
import { AuthProvider } from './auth/authContext';
import { AssistantProvider } from '../contexts/AssistantContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import LayoutWithNav from './LayoutWithNav';
import ConditionalFloatingAssistant from '../components/ConditionalFloatingAssistant';
import PWAInstall from '../components/PWAInstall';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RIALTOR - Revolución InmobiliarIA',
  description: 'Solución integral de recursos, archivos y herramientas para profesionales inmobiliarios',
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/images/favicon2.png', sizes: 'any' },
      { url: '/images/favicon.ico', sizes: 'any' },
      { url: '/images/android-chrome-512x512.png', sizes: '512x512' }
    ],
    shortcut: '/images/favicon.ico',
    apple: [
      { url: '/images/android-chrome-512x512.png', sizes: '512x512' }
    ]
  },
  themeColor: '#059669',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'RIALTOR',
  },
  other: {
    'mobile-web-app-capable': 'yes'
  }
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#059669" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="RIALTOR" />
        <link rel="apple-touch-icon" sizes="512x512" href="/images/android-chrome-512x512.png" />
      </head>
      <body className={`${inter.className} bg-gray-50 text-gray-900 antialiased`}>
        <AuthProvider>
          <NotificationProvider>
            <AssistantProvider>
              <div className="flex flex-col min-h-screen">
                <LayoutWithNav>
                  <main className="flex-grow">{children}</main>
                </LayoutWithNav>
                <ConditionalFloatingAssistant />
                <PWAInstall />
              </div>
            </AssistantProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
