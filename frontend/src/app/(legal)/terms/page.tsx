'use client'

import Link from 'next/link'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'

export default function TermsPage() {
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
          {tx('Kullanim Kosullari', 'Terms of Use')}
        </h1>
        <p className="text-slate-400 mb-8">
          {tx(
            'Bu kosullar, City-V platformunun kullanimina iliskin hak ve yukumlulukleri duzenler.',
            'These terms define rights and obligations regarding the use of the City-V platform.'
          )}
        </p>

        <section className="space-y-6 text-slate-300 leading-7">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('1. Hizmet Kapsami', '1. Scope of Service')}</h2>
            <p>{tx('City-V; sehir yonetimi, analiz ve operasyonel karar destek amacli bir yazilim platformudur.', 'City-V is a software platform for city management, analytics and operational decision support.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('2. Hesap Guvenligi', '2. Account Security')}</h2>
            <p>{tx('Kullanicilar kendi hesap bilgilerinin gizliliginden sorumludur ve yetkisiz kullanimlari derhal bildirmelidir.', 'Users are responsible for protecting account credentials and must report unauthorized usage immediately.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('3. Kabul Edilebilir Kullanim', '3. Acceptable Use')}</h2>
            <p>{tx('Platform; hukuka aykiri, zarar verici veya sistem butunlugunu bozan faaliyetler icin kullanilamaz.', 'The platform may not be used for unlawful, harmful or integrity-breaking activities.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('4. Degisiklik Hakki', '4. Right to Modify')}</h2>
            <p>{tx('Hizmet kapsaminda, guvenlik ve operasyon gereksinimleri dogrultusunda degisiklik yapma hakki saklidir.', 'We reserve the right to modify the service scope based on security and operational requirements.')}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
