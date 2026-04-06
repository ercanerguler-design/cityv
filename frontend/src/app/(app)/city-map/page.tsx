'use client'
import { useCallback, useEffect, useState, useMemo } from 'react'
import dynamic from 'next/dynamic'
import { MapPin, Building2, Coffee, Utensils, Navigation, Search, Users, Clock, TrendingUp, Filter } from 'lucide-react'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

interface Venue {
  venue_id: string
  name: string
  city: string
  district: string
  category: string
  subcategory: string
  lat: number
  lng: number
  capacity: number
  current_occupancy: number
  occupancy_pct: number
  occupancy_level: string
  wait_minutes: number
  trend: string
  is_peak: boolean
}

const CITIES = [
  { tr: 'Tümü', en: 'All', center: [39.5, 32.5] as [number, number], zoom: 6 },
  { tr: 'İstanbul', en: 'Istanbul', center: [41.0082, 28.9784] as [number, number], zoom: 11 },
  { tr: 'Ankara', en: 'Ankara', center: [39.9334, 32.8597] as [number, number], zoom: 12 },
  { tr: 'İzmir', en: 'Izmir', center: [38.4237, 27.1428] as [number, number], zoom: 12 },
  { tr: 'Antalya', en: 'Antalya', center: [36.8969, 30.7133] as [number, number], zoom: 12 },
  { tr: 'Bursa', en: 'Bursa', center: [40.1826, 29.0665] as [number, number], zoom: 12 },
]

const CATEGORIES = [
  { key: 'all', tr: 'Tümü', en: 'All', icon: Filter, color: 'text-slate-400' },
  { key: 'mall', tr: 'AVM', en: 'Mall', icon: Building2, color: 'text-cyan-400' },
  { key: 'cafe', tr: 'Kafe', en: 'Cafe', icon: Coffee, color: 'text-amber-400' },
  { key: 'restaurant', tr: 'Restoran', en: 'Restaurant', icon: Utensils, color: 'text-orange-400' },
  { key: 'street', tr: 'Cadde', en: 'Street', icon: Navigation, color: 'text-green-400' },
]

const LEVEL_CONFIG: Record<string, { color: string; bg: string; markerColor: string }> = {
  LOW:      { color: 'text-green-400',  bg: 'bg-green-500/15 border-green-500/30',   markerColor: '#22c55e' },
  MODERATE: { color: 'text-yellow-400', bg: 'bg-yellow-500/15 border-yellow-500/30', markerColor: '#eab308' },
  HIGH:     { color: 'text-orange-400', bg: 'bg-orange-500/15 border-orange-500/30', markerColor: '#f97316' },
  CRITICAL: { color: 'text-red-400',    bg: 'bg-red-500/15 border-red-500/30',       markerColor: '#ef4444' },
}

const CAT_ICON: Record<string, string> = {
  mall: '🏬', cafe: '☕', restaurant: '🍽️', street: '🛣️',
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

function normalizeCityName(city: string): string {
  const cleaned = city?.trim() || ''
  if (!cleaned) return cleaned
  const map: Record<string, string> = {
    'Ä°stanbul': 'İstanbul',
    'Ä°zmir': 'İzmir',
  }
  return map[cleaned] || cleaned
}

function OccupancyBar({ pct }: { pct: number }) {
  const color = pct >= 80 ? 'bg-red-500' : pct >= 60 ? 'bg-orange-400' : pct >= 40 ? 'bg-yellow-400' : 'bg-green-400'
  return (
    <div className="w-full h-1.5 bg-city-border rounded-full overflow-hidden">
      <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${Math.min(pct, 100)}%` }} />
    </div>
  )
}

export default function CityMapPage() {
  const { lang, tx } = useLanguage()
  const [venues, setVenues] = useState<Venue[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCity, setSelectedCity] = useState(0)
  const [recenterToken, setRecenterToken] = useState(0)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null)

  useEffect(() => {
    const safetyTimer = setTimeout(() => setLoading(false), 8000)
    const load = async () => {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 6000)
      try {
        const res = await fetch(`${API_BASE}/api/venues/live`, { cache: 'no-store', signal: controller.signal })
        if (!res.ok) throw new Error('venues-live-failed')
        const data = await res.json()
        const normalized = (data as Venue[]).map((v) => ({
          ...v,
          city: normalizeCityName(v.city),
        }))
        setVenues(normalized)
      } catch {
        setVenues([])
      } finally {
        clearTimeout(timeout)
        setLoading(false)
      }
    }
    load()
    const interval = setInterval(load, 10000)
    return () => {
      clearInterval(interval)
      clearTimeout(safetyTimer)
    }
  }, [])

  const filtered = useMemo(() => {
    return venues.filter((v) => {
      const cityMatch = selectedCity === 0 || v.city === CITIES[selectedCity].tr
      const catMatch = selectedCategory === 'all' || v.category === selectedCategory
      const searchMatch = !search || v.name.toLowerCase().includes(search.toLowerCase()) || v.district.toLowerCase().includes(search.toLowerCase())
      return cityMatch && catMatch && searchMatch
    })
  }, [venues, selectedCity, selectedCategory, search])

  const mapCenter = CITIES[selectedCity].center
  const mapZoom = CITIES[selectedCity].zoom

  const getLevelLabel = useCallback((level: string) => {
    if (level === 'CRITICAL') return tx('Kritik', 'Critical')
    if (level === 'HIGH') return tx('Yoğun', 'High')
    if (level === 'MODERATE') return tx('Normal', 'Moderate')
    return tx('Sakin', 'Low')
  }, [tx])

  const mapMarkers = useMemo(() =>
    filtered.map((v) => {
      const cfg = LEVEL_CONFIG[v.occupancy_level] ?? LEVEL_CONFIG.LOW
      return {
        lat: v.lat,
        lng: v.lng,
        label: v.name,
        color: cfg.markerColor,
        popup: `<b>${v.name}</b><br/>${v.city} · ${v.district}<br/>${tx('Doluluk', 'Occupancy')}: %${Math.round(v.occupancy_pct)}<br/>${tx('Durum', 'Status')}: ${getLevelLabel(v.occupancy_level)}`,
        radius: 10,
      }
    }), [filtered, tx, getLevelLabel])

  const stats = useMemo(() => ({
    total: filtered.length,
    critical: filtered.filter((v) => v.occupancy_level === 'CRITICAL').length,
    high: filtered.filter((v) => v.occupancy_level === 'HIGH').length,
    avgOcc: filtered.length ? Math.round(filtered.reduce((s, v) => s + v.occupancy_pct, 0) / filtered.length) : 0,
  }), [filtered])

  return (
    <div className="flex flex-col bg-city-bg text-slate-200 -m-6" style={{ height: 'calc(100vh - 3.5rem)' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-6 py-5 border-b border-city-border">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4 justify-between mb-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <MapPin size={22} className="text-indigo-400" />
              {tx('Şehir Haritası', 'City Map')}
            </h1>
            <p className="text-sm text-slate-500 mt-0.5">{tx('5 pilot şehir · mekan ve yoğunluk izleme', '5 pilot cities · venue and density monitoring')}</p>
          </div>
          {/* Stats strip */}
          <div className="flex gap-4">
            {[
              { label: tx('Mekan', 'Venues'), value: stats.total, color: 'text-indigo-400' },
              { label: tx('Yoğun', 'Dense'), value: stats.high, color: 'text-orange-400' },
              { label: tx('Kritik', 'Critical'), value: stats.critical, color: 'text-red-400' },
              { label: tx('Ort. Doluluk', 'Avg. Occupancy'), value: `%${stats.avgOcc}`, color: 'text-cyan-400' },
            ].map(({ label, value, color }) => (
              <div key={label} className="text-center">
                <p className={`text-xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-slate-600">{label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* City tabs */}
        <div className="flex flex-wrap gap-2 mb-3">
          {CITIES.map((c, i) => (
            <button key={c.tr} onClick={() => { setSelectedCity(i); setRecenterToken((v) => v + 1) }}
              className={`px-4 py-1.5 rounded-xl text-sm font-semibold transition-all border ${
                selectedCity === i
                  ? 'bg-indigo-500/20 border-indigo-500/40 text-indigo-300'
                  : 'border-city-border text-slate-500 hover:text-slate-300 hover:border-slate-600'
              }`}>
              {lang === 'tr' ? c.tr : c.en}
            </button>
          ))}
        </div>

        {/* Category filter + search */}
        <div className="flex flex-wrap gap-2 items-center">
          {CATEGORIES.map(({ key, tr, en, icon: Icon, color }) => (
            <button key={key} onClick={() => setSelectedCategory(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                selectedCategory === key
                  ? `${color} border-current bg-current/10`
                  : 'border-city-border text-slate-500 hover:text-slate-300'
              }`}>
              <Icon size={13} />
              {key === 'all' ? tx('Tümü', 'All') : tx(tr, en)}
            </button>
          ))}
          <div className="ml-auto flex items-center gap-2 bg-city-card border border-city-border rounded-lg px-3 py-1.5">
            <Search size={13} className="text-slate-500" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={tx('Mekan veya ilçe ara...', 'Search venue or district...')}
              className="bg-transparent text-xs text-slate-300 outline-none placeholder-slate-600 w-40"
            />
          </div>
        </div>
      </div>

      {/* Main content: map + list */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Map */}
        <div className="flex-1 relative min-w-0">
          <CityMap
            markers={mapMarkers}
            center={mapCenter}
            zoom={mapZoom}
            recenterToken={recenterToken}
            height="100%"
          />

          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-city-bg/40 backdrop-blur-[1px] z-[900]">
              <div className="text-center">
                <div className="w-10 h-10 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
                <p className="text-slate-400 text-sm">{tx('Harita yükleniyor…', 'Map is loading...')}</p>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="absolute bottom-4 left-4 z-[1000] bg-city-card/90 backdrop-blur border border-city-border rounded-xl px-4 py-3 flex flex-col gap-1.5">
            <p className="text-xs text-slate-500 font-semibold mb-1">{tx('Yoğunluk', 'Density')}</p>
            {Object.entries(LEVEL_CONFIG).map(([level, cfg]) => (
              <div key={level} className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: cfg.markerColor }} />
                <span className="text-xs text-slate-400">{getLevelLabel(level)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Venue list sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-city-border flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-city-border bg-city-card/50">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{filtered.length} {tx('Mekan Listelendi', 'Venues Listed')}</p>
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-city-border/50">
            {filtered.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-600 text-sm gap-2">
                <MapPin size={32} className="opacity-30" />
                <p>{tx('Sonuç bulunamadı', 'No results found')}</p>
              </div>
            ) : (
              filtered
                .sort((a, b) => b.occupancy_pct - a.occupancy_pct)
                .map((v) => {
                  const cfg = LEVEL_CONFIG[v.occupancy_level] ?? LEVEL_CONFIG.LOW
                  const isSelected = selectedVenue?.venue_id === v.venue_id
                  return (
                    <button
                      key={v.venue_id}
                      onClick={() => setSelectedVenue(isSelected ? null : v)}
                      className={`w-full text-left px-4 py-3 transition-colors hover:bg-white/5 ${isSelected ? 'bg-indigo-500/10 border-l-2 border-indigo-400' : ''}`}>
                      <div className="flex items-start gap-3">
                        <span className="text-lg flex-shrink-0 mt-0.5">{CAT_ICON[v.category] ?? '📍'}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-white truncate">{v.name}</p>
                          <p className="text-xs text-slate-500 truncate">{v.city} · {v.district}</p>
                          <div className="mt-2">
                            <div className="flex items-center justify-between mb-1">
                              <span className={`text-xs font-bold ${cfg.color}`}>{getLevelLabel(v.occupancy_level)}</span>
                              <span className="text-xs text-slate-500">%{Math.round(v.occupancy_pct)}</span>
                            </div>
                            <OccupancyBar pct={v.occupancy_pct} />
                          </div>
                          {isSelected && (
                            <div className="mt-3 grid grid-cols-3 gap-2">
                              {[
                                { icon: Users,     val: `${v.current_occupancy}`,   lbl: tx('Kişi', 'People') },
                                { icon: Clock,     val: `${v.wait_minutes}${lang === 'tr' ? 'dk' : 'm'}`, lbl: tx('Bekleme', 'Queue') },
                                { icon: TrendingUp, val: v.trend === 'increasing' ? '↑' : v.trend === 'decreasing' ? '↓' : '→', lbl: tx('Trend', 'Trend') },
                              ].map(({ icon: Ico, val, lbl }) => (
                                <div key={lbl} className="bg-city-bg/50 rounded-lg p-2 text-center">
                                  <Ico size={11} className="mx-auto text-slate-500 mb-1" />
                                  <p className="text-xs font-bold text-white">{val}</p>
                                  <p className="text-[10px] text-slate-600">{lbl}</p>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  )
                })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
