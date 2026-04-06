import type { Metadata } from 'next'
import './globals.css'
import { LanguageProvider } from '@/components/Language/LanguageProvider'

export const metadata: Metadata = {
  title: 'City-V | AI Smart City Platform',
  description: 'City-V — Yapay Zeka Destekli Akıllı Şehir Yönetim Platformu',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr">
      <body className="bg-city-bg text-slate-200 app-aurora">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  )
}
