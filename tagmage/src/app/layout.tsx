import './globals.css';
import { Inter } from 'next/font/google';
import { Analytics } from "@vercel/analytics/react"
import { Toaster } from 'react-hot-toast';
import { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Tag Mage - Automação de Tracking para Gestores de Tráfego',
  description: 'Configure tracking Web e Server-Side no GTM em minutos, não em horas. A solução completa para gestores de tráfego e agências.',
  keywords: 'tracking, analytics, gtm, google tag manager, server-side, ga4, meta pixel, tiktok pixel',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={inter.variable} suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-white text-gray-900 antialiased`} suppressHydrationWarning>
        {children}
        <Analytics />
        <Toaster 
          position="bottom-right"
          toastOptions={{
            duration: 5000,
          }}
        />
      </body>
    </html>
  );
}
