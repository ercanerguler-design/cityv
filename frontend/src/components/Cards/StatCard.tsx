import clsx from 'clsx'
import { LucideIcon } from 'lucide-react'
import { useLanguage } from '@/components/Language/LanguageProvider'

interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: LucideIcon
  iconColor?: string
  trend?: 'up' | 'down' | 'neutral'
  trendValue?: string
  alert?: boolean
  className?: string
}

export default function StatCard({
  title, value, subtitle, icon: Icon, iconColor = 'text-city-cyan',
  trend, trendValue, alert, className
}: StatCardProps) {
  const { tx } = useLanguage()

  return (
    <div className={clsx(
      'city-card flex flex-col gap-3 transition-all hover:border-city-cyan/30',
      alert && 'border-city-red/40 glow-red',
      className
    )}>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">{title}</p>
          <p className={clsx('text-2xl font-bold mt-1', alert ? 'text-city-red' : 'text-white')}>
            {value}
          </p>
          {subtitle && <p className="text-xs text-slate-500 mt-1">{subtitle}</p>}
        </div>
        <div className={clsx(
          'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
          alert ? 'bg-red-900/30' : 'bg-city-cyan/10'
        )}>
          <Icon size={20} className={clsx(alert ? 'text-city-red' : iconColor)} />
        </div>
      </div>
      {trendValue && (
        <div className="flex items-center gap-1.5">
          <span className={clsx('text-xs font-medium',
            trend === 'up'   ? 'text-city-red' :
            trend === 'down' ? 'text-city-green' : 'text-slate-500'
          )}>
            {trend === 'up' ? '▲' : trend === 'down' ? '▼' : '—'} {trendValue}
          </span>
        </div>
      )}
      {alert && (
        <div className="flex items-center gap-2 pt-1 border-t border-red-900/30">
          <span className="w-1.5 h-1.5 rounded-full bg-city-red animate-pulse" />
          <span className="text-xs text-red-400">{tx('Dikkat gerekiyor', 'Attention required')}</span>
        </div>
      )}
    </div>
  )
}
