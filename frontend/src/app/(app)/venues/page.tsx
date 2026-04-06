'use client'
import { useState, useEffect } from 'react'
import { MapPin, ShoppingBag, Coffee, Utensils, Navigation2, TrendingUp, TrendingDown, Minus, Sparkles } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityBarChart from '@/components/Charts/BarChart'
import { api } from '@/lib/api'
import { cityWS } from '@/lib/websocket'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CATEGORY_LABELS: Record<string, { tr: string; en: string }> = {
  mall: { tr: 'AVM', en: 'Mall' },
  cafe: { tr: 'Kafe', en: 'Cafe' },
  restaurant: { tr: 'Restoran', en: 'Restaurant' },
  street: { tr: 'Cadde / Çarşı', en: 'Street / Bazaar' },
}

const CATEGORY_ICONS: Record<string, any> = {
  mall: ShoppingBag,
  cafe: Coffee,
  restaurant: Utensils,
  street: Navigation2,
}

const CATEGORY_COLORS: Record<string, string> = {
  mall: 'text-cyan-400',
  cafe: 'text-amber-400',
  restaurant: 'text-orange-400',
  street: 'text-pink-400',
}

const LEVEL_COLORS: Record<string, string> = {
  LOW: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  MODERATE: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  HIGH: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  PACKED: 'bg-red-500/20 text-red-400 border-red-500/30',
}

const LEVEL_LABELS: Record<string, { tr: string; en: string }> = {
  LOW: { tr: 'Sakin', en: 'Calm' },
  MODERATE: { tr: 'Orta', en: 'Moderate' },
  HIGH: { tr: 'Kalabalık', en: 'Crowded' },
  PACKED: { tr: 'Tıklım Tıklım', en: 'Packed' },
}

function TrendIcon({ trend }: { trend: string }) {
  if (trend === 'rising') return <TrendingUp size={13} className="text-red-400" />
  if (trend === 'falling') return <TrendingDown size={13} className="text-emerald-400" />
  return <Minus size={13} className="text-slate-500" />
}

export default function VenuesPage() {
  const { lang, tx } = useLanguage()
  const [venues, setVenues] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [heatmap, setHeatmap] = useState<any[]>([])
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [loading, setLoading] = useState(true)

  const fetchAll = () => {
    api.venues.live().then((d: any) => setVenues(Array.isArray(d) ? d : []))
    api.venues.summary().then(setSummary).catch(() => {})
    api.venues.heatmap().then((d: any) => setHeatmap(Array.isArray(d) ? d : [])).catch(() => {})
    setLoading(false)
  }

  useEffect(() => {
    fetchAll()
    const unsub = cityWS.subscribe((msg: any) => {
      if (msg?.type === 'live_update' && Array.isArray(msg.venues)) {
        setVenues(msg.venues)
      }
    })
    const interval = setInterval(() => {
      api.venues.summary().then(setSummary).catch(() => {})
      api.venues.heatmap().then((d: any) => setHeatmap(Array.isArray(d) ? d : [])).catch(() => {})
    }, 15000)
    return () => {
      unsub?.()
      clearInterval(interval)
    }
  }, [])

  const filtered = activeCategory === 'all'
    ? venues
    : venues.filter((v) => v.category === activeCategory)

  const byCategory = ['mall', 'cafe', 'restaurant', 'street'].map((cat) => {
    const catVenues = venues.filter((v) => v.category === cat)
    const avg = catVenues.length
      ? catVenues.reduce((s, v) => s + v.occupancy_pct, 0) / catVenues.length
      : 0
    const packed = catVenues.filter((v) => v.occupancy_level === 'PACKED').length
    return { cat, avg, packed, count: catVenues.length }
  })

  const totalVenues = venues.length
  const avgOccupancy = totalVenues
    ? Math.round(venues.reduce((s, v) => s + v.occupancy_pct, 0) / totalVenues)
    : 0
  const packedCount = venues.filter((v) => v.occupancy_level === 'PACKED').length
  const risingCount = venues.filter((v) => v.trend === 'rising').length

  const topBusy = [...venues]
    .sort((a, b) => b.occupancy_pct - a.occupancy_pct)
    .slice(0, 10)

  const translateAiText = (raw: string) => {
    if (lang === 'tr') return raw
    if (raw.includes('konteyner kritik seviyede')) return raw.replace('konteyner kritik seviyede', 'containers are at critical level')
    if (raw.includes('En yogun bolge')) return raw.replace('En yogun bolge', 'Most dense area')
    if (raw.includes('Durum kontrol altinda')) return 'Situation is under control.'
    if (raw.includes('Kritik toplama gerekli')) return 'Critical collection is required.'
    if (raw.includes('doluluk')) return raw.replace('doluluk', 'occupancy')
    return raw
  }

  const heatmapChart = heatmap.map((h) => ({
    name: h.district,
    value: h.avg_occupancy,
    color: h.avg_occupancy >= 70 ? '#f97316' : h.avg_occupancy >= 50 ? '#f59e0b' : '#22c55e',
  }))

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <MapPin size={24} className="text-pink-400" />
            {tx('Mekan Yoğunluğu', 'Venue Density')}
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            {tx('AVM, kafe, restoran ve caddelerin anlık doluluk durumu', 'Real-time occupancy of malls, cafes, restaurants and streets')}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="live-dot" />
          <span>{tx('Canlı veri', 'Live data')}</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={tx('Toplam Mekan', 'Total Venues')}
          value={totalVenues}
          icon={MapPin}
          iconColor="text-pink-400"
        />
        <StatCard
          title={tx('Ort. Doluluk', 'Avg Occupancy')}
          value={`%${avgOccupancy}`}
          icon={Navigation2}
          iconColor="text-cyan-400"
        />
        <StatCard
          title={tx('Tıklım Tıklım', 'Packed')}
          value={packedCount}
          icon={ShoppingBag}
          iconColor="text-red-400"
        />
        <StatCard
          title={tx('Doluluk Artıyor', 'Occupancy Rising')}
          value={risingCount}
          icon={TrendingUp}
          iconColor="text-amber-400"
        />
      </div>

      {/* Category Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {byCategory.map(({ cat, avg, packed, count }) => {
          const Icon = CATEGORY_ICONS[cat]
          const isActive = activeCategory === cat
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(isActive ? 'all' : cat)}
              className={`p-4 rounded-xl border text-left transition-all ${isActive
                  ? 'bg-pink-500/10 border-pink-500/40'
                  : 'bg-city-card border-city-border hover:border-slate-600'
                }`}
            >
              <div className="flex items-center gap-2 mb-3">
                <Icon size={18} className={CATEGORY_COLORS[cat]} />
                <span className="text-sm font-semibold text-white">{tx(CATEGORY_LABELS[cat].tr, CATEGORY_LABELS[cat].en)}</span>
              </div>
              <p className="text-2xl font-bold text-white">%{Math.round(avg)}</p>
              <p className="text-xs text-slate-500 mt-1">
                {count} {tx('mekan', 'venues')} · {packed} {tx('tıklım', 'packed')}
              </p>
            </button>
          )
        })}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Venue List */}
        <div className="lg:col-span-2 bg-city-card rounded-xl border border-city-border p-4">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-white">
              {activeCategory === 'all'
                ? tx('Tüm Mekanlar', 'All Venues')
                : tx(CATEGORY_LABELS[activeCategory].tr, CATEGORY_LABELS[activeCategory].en)}
            </h2>
            <span className="text-xs text-slate-500">{filtered.length} {tx('mekan', 'venues')}</span>
          </div>

          {loading ? (
            <div className="text-slate-500 text-sm text-center py-10">{tx('Yükleniyor...', 'Loading...')}</div>
          ) : (
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filtered
                .slice()
                .sort((a, b) => b.occupancy_pct - a.occupancy_pct)
                .map((v) => {
                  const Icon = CATEGORY_ICONS[v.category]
                  return (
                    <div key={v.venue_id} className="flex items-center gap-3 p-3 rounded-lg bg-city-bg hover:bg-white/5 transition-colors">
                      <Icon size={16} className={CATEGORY_COLORS[v.category]} />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{v.name}</p>
                        <p className="text-xs text-slate-500">{v.district} · {v.subcategory}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="flex items-center gap-1 justify-end mb-1">
                          <TrendIcon trend={v.trend} />
                          <span className="text-sm font-bold text-white">%{v.occupancy_pct}</span>
                        </div>
                        <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[v.occupancy_level]}`}>
                          {tx(LEVEL_LABELS[v.occupancy_level].tr, LEVEL_LABELS[v.occupancy_level].en)}
                        </span>
                      </div>
                      {v.wait_minutes > 0 && (
                        <div className="flex-shrink-0 text-right">
                          <span className="text-xs text-amber-400 font-medium">
                            ~{v.wait_minutes} {lang === 'tr' ? 'dk' : 'm'} {tx('bekle', 'wait')}
                          </span>
                        </div>
                      )}
                    </div>
                  )
                })}
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          {/* District Heatmap */}
          <div className="bg-city-card rounded-xl border border-city-border p-4">
            <h2 className="text-base font-semibold text-white mb-4">{tx('İlçe Bazında Doluluk', 'District Occupancy')}</h2>
            {heatmapChart.length > 0 ? (
              <CityBarChart
                data={heatmapChart}
                height={220}
                unit="%"
              />
            ) : (
              <div className="text-slate-500 text-xs text-center py-10">{tx('Veri yükleniyor...', 'Loading data...')}</div>
            )}
          </div>

          {/* AI Insights */}
          {summary?.insights && summary.insights.length > 0 && (
            <div className="bg-city-card rounded-xl border border-city-border p-4">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={15} className="text-pink-400" />
                <h2 className="text-base font-semibold text-white">{tx('AI Analiz', 'AI Analysis')}</h2>
              </div>
              <div className="space-y-2">
                {summary.insights.slice(0, 4).map((insight: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <span className="text-pink-400 mt-0.5 flex-shrink-0">•</span>
                    <p className="text-xs text-slate-300 leading-relaxed">{translateAiText(insight)}</p>
                  </div>
                ))}
              </div>
              {summary.recommendations && summary.recommendations.length > 0 && (
                <div className="mt-4 pt-4 border-t border-city-border">
                  <p className="text-xs font-semibold text-slate-400 mb-2">{tx('Öneriler', 'Recommendations')}</p>
                  {summary.recommendations.slice(0, 3).map((rec: string, i: number) => (
                    <div key={i} className="flex gap-2 mb-1">
                      <span className="text-amber-400 mt-0.5 flex-shrink-0">→</span>
                      <p className="text-xs text-slate-400 leading-relaxed">{translateAiText(rec)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Top 10 Busiest */}
      <div className="bg-city-card rounded-xl border border-city-border p-4">
        <h2 className="text-base font-semibold text-white mb-4">{tx('En Kalabalık 10 Mekan', 'Top 10 Busiest Venues')}</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-slate-500 border-b border-city-border">
                <th className="pb-2 text-left font-medium">#</th>
                <th className="pb-2 text-left font-medium">{tx('Mekan', 'Venue')}</th>
                <th className="pb-2 text-left font-medium">{tx('İlçe', 'District')}</th>
                <th className="pb-2 text-left font-medium">{tx('Kategori', 'Category')}</th>
                <th className="pb-2 text-right font-medium">{tx('Doluluk', 'Occupancy')}</th>
                <th className="pb-2 text-center font-medium">{tx('Durum', 'Status')}</th>
                <th className="pb-2 text-center font-medium">{tx('Trend', 'Trend')}</th>
                <th className="pb-2 text-right font-medium">{tx('Bekleme', 'Wait')}</th>
              </tr>
            </thead>
            <tbody>
              {topBusy.map((v, i) => (
                <tr key={v.venue_id} className="border-b border-city-border/50 hover:bg-white/5 transition-colors">
                  <td className="py-2.5 pr-3 text-slate-600 text-xs">{i + 1}</td>
                  <td className="py-2.5 pr-3">
                    <p className="text-white font-medium">{v.name}</p>
                    <p className="text-xs text-slate-500">{v.subcategory}</p>
                  </td>
                  <td className="py-2.5 pr-3 text-slate-400 text-xs">{v.district}</td>
                  <td className="py-2.5 pr-3">
                    <span className={`text-xs ${CATEGORY_COLORS[v.category]}`}>
                      {tx(CATEGORY_LABELS[v.category].tr, CATEGORY_LABELS[v.category].en)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-right font-bold text-white">%{v.occupancy_pct}</td>
                  <td className="py-2.5 pr-3 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${LEVEL_COLORS[v.occupancy_level]}`}>
                      {tx(LEVEL_LABELS[v.occupancy_level].tr, LEVEL_LABELS[v.occupancy_level].en)}
                    </span>
                  </td>
                  <td className="py-2.5 pr-3 text-center">
                    <div className="flex justify-center">
                      <TrendIcon trend={v.trend} />
                    </div>
                  </td>
                  <td className="py-2.5 text-right text-xs">
                    {v.wait_minutes > 0
                      ? <span className="text-amber-400">~{v.wait_minutes} {lang === 'tr' ? 'dk' : 'm'}</span>
                      : <span className="text-slate-600">—</span>
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
