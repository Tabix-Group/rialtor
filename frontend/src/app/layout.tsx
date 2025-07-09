import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from './auth/authContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RE/MAX Knowledge Platform',
  description: 'Plataforma de conocimiento y herramientas para agentes inmobiliarios',
};


// LayoutContent must be a client component to use hooks like useAuth
// Move Navigation into a client component, and only use AuthProvider here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
