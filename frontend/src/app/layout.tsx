import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from './auth/authContext';
import { AssistantProvider } from '../contexts/AssistantContext';
import { NotificationProvider } from '../contexts/NotificationContext';
import LayoutWithNav from './LayoutWithNav';
import ConditionalFloatingAssistant from '../components/ConditionalFloatingAssistant';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RIALTOR - Revolución InmobiliarIA',
  description: 'Solución integral de recursos, archivos y herramientas para profesionales inmobiliarios',
  icons: {
    icon: [
      { url: '/images/favicon2.png', sizes: 'any' },
      { url: '/images/favicon-96x96.png', sizes: '96x96' }
    ],
    shortcut: '/images/favicon.ico',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
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
              </div>
            </AssistantProvider>
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
