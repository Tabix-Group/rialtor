import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import '../styles/globals.css';
import { AuthProvider } from './auth/authContext';
import LayoutWithNav from './LayoutWithNav';
import Footer from '../components/Footer';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'RE/MAX Plataforma Integral',
  description: 'Solución integral de recursos, archivos y herramientas para profesionales inmobiliarios',
};


// LayoutContent must be a client component to use hooks like useAuth
// Move Navigation into a client component, and only use AuthProvider here

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <head>
        <link rel="icon" href="/favicon2.png" type="image/png" />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <LayoutWithNav>
            {children}
          </LayoutWithNav>
        </AuthProvider>
        <Footer />
      </body>
    </html>
  );
}
