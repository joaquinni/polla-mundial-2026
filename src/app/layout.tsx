// src/app/layout.tsx
import type { Metadata } from 'next'
import { Bebas_Neue, Barlow, Barlow_Condensed } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const bebas = Bebas_Neue({
  subsets: ['latin'], weight: '400',
  variable: '--font-bebas', display: 'swap',
})
const barlow = Barlow({
  subsets: ['latin'], weight: ['300','400','500','600'],
  variable: '--font-barlow', display: 'swap',
})
const barlowCond = Barlow_Condensed({
  subsets: ['latin'], weight: ['300','400','600','700'],
  variable: '--font-barlow-cond', display: 'swap',
})

export const metadata: Metadata = {
  title: 'Polla Mundial 2026',
  description: 'Sistema de predicciones para el Mundial de Fútbol 2026',
  icons: { icon: '/favicon.ico' },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${bebas.variable} ${barlow.variable} ${barlowCond.variable}`}>
      <body className="bg-brand-dark text-white font-body antialiased">
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#1A1A28',
              color: '#F0EDE8',
              border: '1px solid #22223A',
              fontFamily: 'var(--font-barlow-cond)',
              letterSpacing: '0.05em',
            },
            success: { iconTheme: { primary: '#F5C518', secondary: '#0A0A0F' } },
          }}
        />
      </body>
    </html>
  )
}
