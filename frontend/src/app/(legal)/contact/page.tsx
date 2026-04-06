'use client'

import Link from 'next/link'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'

export default function ContactPage() {
  const { tx } = useLanguage()

  return (
    <main className="min-h-screen bg-city-bg text-slate-200 px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between gap-4 mb-8">
          <Link href="/" className="text-city-cyan hover:text-cyan-300 transition-colors">
            {tx('Ana sayfaya don', 'Back to home')}
          </Link>
          <LanguageSwitch />
        </div>

        <h1 className="text-3xl font-black text-white mb-3">
          {tx('Iletisim', 'Contact')}
        </h1>
        <p className="text-slate-400 mb-8">
          {tx('Destek, is birligi ve teknik iletisim talepleriniz icin asagidaki kanallari kullanabilirsiniz.', 'For support, business and technical requests, use the channels below.')}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-city-card/60 border border-city-border rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">{tx('Sirket', 'Company')}</p>
            <p className="text-white font-semibold">SCE INNOVATION LTD. STI.</p>
          </div>
          <div className="bg-city-card/60 border border-city-border rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">{tx('E-Posta', 'Email')}</p>
            <a href="mailto:sce@scegrup.com" className="text-city-cyan hover:text-cyan-300 transition-colors">sce@scegrup.com</a>
          </div>
          <div className="bg-city-card/60 border border-city-border rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">{tx('Telefon', 'Phone')}</p>
            <a href="tel:+908508881889" className="text-white hover:text-city-cyan transition-colors">+90 0850 888 1 889</a>
          </div>
          <div className="bg-city-card/60 border border-city-border rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">WhatsApp</p>
            <a href="https://wa.me/905433929230" target="_blank" rel="noopener noreferrer" className="text-green-400 hover:text-green-300 transition-colors">+90 543 392 92 30</a>
          </div>
          <div className="md:col-span-2 bg-city-card/60 border border-city-border rounded-2xl p-5">
            <p className="text-slate-400 text-sm mb-1">{tx('Adres', 'Address')}</p>
            <p className="text-white">Cetin Emec Bulvari 25/3, Cankaya / Ankara</p>
          </div>
        </div>
      </div>
    </main>
  )
}
