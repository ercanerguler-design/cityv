'use client'

import { createContext, useContext, useEffect, useMemo, useState } from 'react'

type Lang = 'tr' | 'en'

type LanguageContextType = {
  lang: Lang
  setLang: (lang: Lang) => void
  tx: (trText: string, enText: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('tr')

  useEffect(() => {
    const applyLang = (nextLang: Lang) => {
      setLang(nextLang)
      document.documentElement.lang = nextLang
    }

    const saved = (typeof window !== 'undefined' ? window.localStorage.getItem('cityv-lang') : null) as Lang | null
    if (saved === 'tr' || saved === 'en') {
      applyLang(saved)
      return
    }

    const resolveTenantLocale = async () => {
      try {
        const host = window.location.hostname
        const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
        const res = await fetch(`${base}/api/admin/resolve?host=${encodeURIComponent(host)}`, { cache: 'no-store' })
        if (res.ok) {
          const tenant = await res.json()
          const tenantLocale = String(tenant?.locale || '').toLowerCase()
          if (tenantLocale === 'tr' || tenantLocale === 'en') {
            applyLang(tenantLocale)
            return
          }
        }
      } catch {
      }

      const browserLang = typeof navigator !== 'undefined' ? navigator.language.toLowerCase() : 'tr'
      const initialLang: Lang = browserLang.startsWith('tr') ? 'tr' : 'en'
      applyLang(initialLang)
    }

    resolveTenantLocale()
  }, [])

  const value = useMemo<LanguageContextType>(() => ({
    lang,
    setLang: (nextLang: Lang) => {
      setLang(nextLang)
      if (typeof window !== 'undefined') {
        window.localStorage.setItem('cityv-lang', nextLang)
      }
      document.documentElement.lang = nextLang
    },
    tx: (trText: string, enText: string) => (lang === 'tr' ? trText : enText),
  }), [lang])

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const ctx = useContext(LanguageContext)
  if (!ctx) {
    throw new Error('useLanguage must be used inside LanguageProvider')
  }
  return ctx
}
