'use client'
import { useState, useEffect } from 'react'
import { Bell, RefreshCw, Menu } from 'lucide-react'
import { cityWS } from '@/lib/websocket'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'
import { api } from '@/lib/api'

interface HeaderProps {
  onMenuClick?: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { lang, tx } = useLanguage()
  const [connected, setConnected] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<string>('')
  const [alerts, setAlerts] = useState(0)
  const [tenantName, setTenantName] = useState('City-V Global')

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      setConnected(true)
      setLastUpdate(new Date().toLocaleTimeString(lang === 'tr' ? 'tr-TR' : 'en-US'))
      const aq = data?.stats?.air?.alerts || 0
      const tr = data?.stats?.traffic?.critical_sensors || 0
      setAlerts(aq + tr)
    })
    return unsub
  }, [lang])

  useEffect(() => {
    const host = window.location.hostname
    api.admin.resolveTenant(host)
      .then((tenant: any) => {
        if (tenant?.tenant_name) setTenantName(tenant.tenant_name)
      })
      .catch(() => {})
  }, [])

  const initials = tenantName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('') || 'CV'

  return (
    <header className="h-14 bg-city-card border-b border-city-border flex items-center justify-between px-4 md:px-6 flex-shrink-0">
      <div className="flex items-center gap-3">
        {/* Hamburger - only on mobile */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg hover:bg-white/5 transition-colors text-slate-400"
          aria-label="Open menu"
        >
          <Menu size={20} />
        </button>
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${connected ? 'bg-city-green animate-pulse' : 'bg-slate-600'}`} />
          <span className="text-xs text-slate-400 hidden sm:inline">
            {connected ? tx('Canlı Veri Aktif', 'Live Data Active') : tx('Bağlanıyor...', 'Connecting...')}
          </span>
        </div>
        {lastUpdate && (
          <span className="text-xs text-slate-600 items-center gap-1 hidden md:flex">
            <RefreshCw size={11} />
            {tx('Son güncelleme', 'Last update')}: {lastUpdate}
          </span>
        )}
      </div>

      <div className="flex items-center gap-4">
        <LanguageSwitch compact />
        <div className="text-xs text-slate-500 font-mono">
          {new Date().toLocaleDateString(lang === 'tr' ? 'tr-TR' : 'en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
        <button className="relative p-2 rounded-lg hover:bg-white/5 transition-colors">
          <Bell size={18} className="text-slate-400" />
          {alerts > 0 && (
            <span className="absolute top-1 right-1 w-4 h-4 bg-city-red rounded-full flex items-center justify-center text-[10px] text-white font-bold">
              {alerts > 9 ? '9+' : alerts}
            </span>
          )}
        </button>
        <div className="text-right hidden sm:block">
          <p className="text-[10px] uppercase tracking-wider text-slate-500">{tx('Aktif Tenant', 'Active Tenant')}</p>
          <p className="text-xs text-slate-300 max-w-[220px] truncate">{tenantName}</p>
        </div>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-city-cyan to-city-purple flex items-center justify-center text-xs font-bold text-white" title={tenantName}>
          {initials}
        </div>
      </div>
    </header>
  )
}
