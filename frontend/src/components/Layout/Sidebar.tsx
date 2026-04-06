'use client'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import clsx from 'clsx'
import { useLanguage } from '@/components/Language/LanguageProvider'
import {
  LayoutDashboard, Car, Zap, Trash2, Shield, Wind, Users, ChevronRight, MapPin, Map, Settings2
} from 'lucide-react'

const navItems = [
  { href: '/dashboard',   tr: 'Dashboard',       en: 'Dashboard',         icon: LayoutDashboard, color: 'text-city-cyan' },
  { href: '/traffic',     tr: 'Trafik AI',       en: 'Traffic AI',        icon: Car,             color: 'text-amber-400' },
  { href: '/energy',      tr: 'Enerji Şebeke',   en: 'Energy Grid',       icon: Zap,             color: 'text-yellow-400' },
  { href: '/waste',       tr: 'Atık Yönetimi',   en: 'Waste Management',  icon: Trash2,          color: 'text-green-400' },
  { href: '/safety',      tr: 'Güvenlik',        en: 'Safety',            icon: Shield,          color: 'text-red-400' },
  { href: '/air-quality', tr: 'Hava Kalitesi',   en: 'Air Quality',       icon: Wind,            color: 'text-sky-400' },
  { href: '/citizens',    tr: 'Vatandaş Portalı',en: 'Citizen Portal',    icon: Users,           color: 'text-purple-400' },
  { href: '/venues',      tr: 'Mekan Yoğunluğu', en: 'Venue Density',     icon: MapPin,          color: 'text-pink-400' },
  { href: '/city-map',    tr: 'Şehir Haritası',  en: 'City Map',          icon: Map,             color: 'text-indigo-400' },
  { href: '/admin',       tr: 'Tenant Admin',    en: 'Tenant Admin',      icon: Settings2,       color: 'text-fuchsia-400' },
]

export default function Sidebar() {
  const { tx } = useLanguage()
  const pathname = usePathname()

  return (
    <aside className="w-64 flex-shrink-0 bg-city-card border-r border-city-border flex flex-col">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-city-border">
        <div className="flex items-center gap-3">
          <Image src="/logo-cityv.svg" alt="City-V" width={36} height={36} className="rounded-lg" priority />
          <div>
            <p className="text-white font-bold tracking-wide text-base">City-V</p>
            <p className="text-xs text-slate-500">Smart City Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        <p className="text-xs text-slate-600 font-medium uppercase px-3 mb-3 tracking-wider">{tx('Modüller', 'Modules')}</p>
        {navItems.map(({ href, tr, en, icon: Icon, color }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={clsx(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group',
                active
                  ? 'bg-city-cyan/10 text-city-cyan border border-city-cyan/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
              )}
            >
              <Icon size={18} className={clsx(active ? 'text-city-cyan' : color, 'flex-shrink-0')} />
              <span className="flex-1">{tx(tr, en)}</span>
              {active && <ChevronRight size={14} className="text-city-cyan/60" />}
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="px-4 py-4 border-t border-city-border">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="live-dot" />
          <span>{tx('5 Şehir Aktif', '5 Cities Active')}</span>
        </div>
        <p className="text-xs text-slate-700 mt-1">v2.0.0 © 2026 City-V</p>
      </div>
    </aside>
  )
}
