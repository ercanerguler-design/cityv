'use client'

import { Languages } from 'lucide-react'
import { useLanguage } from './LanguageProvider'

export default function LanguageSwitch({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useLanguage()

  return (
    <div className="flex items-center gap-1 rounded-lg border border-city-border bg-city-card/70 p-1">
      {!compact && <Languages size={14} className="text-slate-500 ml-1" />}
      <button
        onClick={() => setLang('tr')}
        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${lang === 'tr' ? 'bg-city-cyan/20 text-city-cyan' : 'text-slate-400 hover:text-slate-200'}`}>
        TR
      </button>
      <button
        onClick={() => setLang('en')}
        className={`px-2.5 py-1 text-xs rounded-md font-semibold transition-colors ${lang === 'en' ? 'bg-city-cyan/20 text-city-cyan' : 'text-slate-400 hover:text-slate-200'}`}>
        EN
      </button>
    </div>
  )
}
