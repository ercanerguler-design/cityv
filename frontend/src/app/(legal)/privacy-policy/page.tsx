'use client'

import Link from 'next/link'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'

export default function PrivacyPolicyPage() {
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
          {tx('Gizlilik Politikasi', 'Privacy Policy')}
        </h1>
        <p className="text-slate-400 mb-8">
          {tx(
            'Bu politika, City-V platformunda toplanan verilerin nasil islendigi, saklandigi ve korundugunu aciklar.',
            'This policy explains how data collected in the City-V platform is processed, stored and protected.'
          )}
        </p>

        <section className="space-y-6 text-slate-300 leading-7">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('1. Toplanan Veriler', '1. Collected Data')}</h2>
            <p>{tx('Platform; sistem metrikleri, operasyonel kayitlar, kullanici hesap bilgileri ve modul bazli analiz verileri toplayabilir.', 'The platform may collect system metrics, operational logs, user account information and module-based analytics data.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('2. Veri Isleme Amaci', '2. Purpose of Processing')}</h2>
            <p>{tx('Toplanan veriler hizmet surekliligi, guvenlik, performans iyilestirme ve yasal yukumluluklerin yerine getirilmesi amaciyla islenir.', 'Collected data is processed for service continuity, security, performance improvement and legal compliance.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('3. Saklama ve Guvenlik', '3. Retention and Security')}</h2>
            <p>{tx('Veriler yetkisiz erisime karsi teknik ve idari tedbirlerle korunur; sadece gerekli sure boyunca saklanir.', 'Data is protected against unauthorized access with technical and administrative controls and retained only as long as necessary.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('4. Iletisim', '4. Contact')}</h2>
            <p>{tx('Gizlilik ile ilgili sorulariniz icin sce@scegrup.com adresine ulasabilirsiniz.', 'For privacy-related questions, contact sce@scegrup.com.')}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
