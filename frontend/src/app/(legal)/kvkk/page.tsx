'use client'

import Link from 'next/link'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'

export default function KvkkPage() {
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

        <h1 className="text-3xl font-black text-white mb-3">KVKK</h1>
        <p className="text-slate-400 mb-8">
          {tx(
            '6698 sayili Kisisel Verilerin Korunmasi Kanunu kapsaminda aydinlatma metni ve veri sahibi haklari bu sayfada sunulur.',
            'This page provides personal data notice and data subject rights under Turkish Personal Data Protection Law No. 6698.'
          )}
        </p>

        <section className="space-y-6 text-slate-300 leading-7">
          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('1. Veri Sorumlusu', '1. Data Controller')}</h2>
            <p>{tx('Veri sorumlusu: SCE INNOVATION LTD. STI.', 'Data Controller: SCE INNOVATION LTD. STI.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('2. Isleme Sebepleri', '2. Legal Basis')}</h2>
            <p>{tx('Kisisel veriler; sozlesme, mesru menfaat, hukuki yukumluluk ve acik riza dayanaklariyla islenebilir.', 'Personal data may be processed based on contract, legitimate interest, legal obligation and explicit consent.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('3. Veri Sahibi Haklari', '3. Data Subject Rights')}</h2>
            <p>{tx('Ilgili kisiler; bilgi talep etme, duzeltme, silme, islemeye itiraz etme gibi haklara sahiptir.', 'Data subjects have rights such as requesting information, correction, deletion and objection to processing.')}</p>
          </div>

          <div>
            <h2 className="text-xl font-bold text-white mb-2">{tx('4. Basvuru Yolu', '4. Request Channel')}</h2>
            <p>{tx('KVKK basvurulari icin sce@scegrup.com adresine e-posta gonderebilirsiniz.', 'For KVKK requests, you may email sce@scegrup.com.')}</p>
          </div>
        </section>
      </div>
    </main>
  )
}
