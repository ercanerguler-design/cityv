'use client'
import { useState, useEffect } from 'react'
import { Car, Zap, Trash2, Shield, Wind, Users, Activity, AlertTriangle } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

export default function DashboardPage() {
  const { lang, tx } = useLanguage()
  const [summary, setSummary] = useState<any>(null)
  const [liveStats, setLiveStats] = useState<any>(null)
  const [mapMarkers, setMapMarkers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.dashboard.summary().then((d: any) => {
      setSummary(d)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update') {
        setLiveStats(data.stats)
        const markers: any[] = []
        // Traffic sensors
        data.traffic_sensors?.forEach((s: any) => {
          const color =
            s.congestion_level === 'CRITICAL' ? '#ef4444' :
            s.congestion_level === 'HIGH'     ? '#f59e0b' :
            s.congestion_level === 'MODERATE' ? '#eab308' : '#10b981'
          const congestionLabel =
            s.congestion_level === 'CRITICAL' ? tx('Kritik', 'Critical') :
            s.congestion_level === 'HIGH' ? tx('Yüksek', 'High') :
            s.congestion_level === 'MODERATE' ? tx('Orta', 'Moderate') : tx('Düşük', 'Low')

          markers.push({
            lat: s.lat, lng: s.lng,
            color,
            popup: `<b>${s.location_name}</b><br/>${tx('Yoğunluk', 'Congestion')}: ${congestionLabel}<br/>${tx('Hız', 'Speed')}: ${s.avg_speed} km/h`,
          })
        })
        // Air quality
        data.air_stations?.forEach((s: any) => {
          const color = s.aqi > 150 ? '#ef4444' : s.aqi > 100 ? '#f59e0b' : '#10b981'
          const aqiCategory = s.aqi_category === 'Good' ? tx('İyi', 'Good')
            : s.aqi_category === 'Moderate' ? tx('Orta', 'Moderate')
            : s.aqi_category === 'Unhealthy for Sensitive' ? tx('Hassas Gruplar için Sağlıksız', 'Unhealthy for Sensitive')
            : s.aqi_category === 'Unhealthy' ? tx('Sağlıksız', 'Unhealthy')
            : s.aqi_category === 'Very Unhealthy' ? tx('Çok Sağlıksız', 'Very Unhealthy')
            : s.aqi_category === 'Hazardous' ? tx('Tehlikeli', 'Hazardous')
            : s.aqi_category

          markers.push({
            lat: s.lat, lng: s.lng,
            color, radius: 6,
            popup: `<b>${s.district} ${tx('Hava', 'Air')}</b><br/>AQI: ${s.aqi}<br/>${aqiCategory}`,
          })
        })
        setMapMarkers(markers)
      }
    })
    return unsub
  }, [tx])

  const normalizeMojibake = (text: string) => {
    try {
      return decodeURIComponent(escape(text))
    } catch {
      return text
    }
  }

  const translateInsight = (raw: string) => {
    const msg = normalizeMojibake(raw)
    if (lang === 'tr') return msg

    if (msg.includes('Sabah yoğun saatleri')) return 'Morning peak hours; traffic trend is rising.'
    if (msg.includes('Akşam yoğun saatleri')) return 'Evening peak hours; traffic is at critical levels.'
    if (msg.includes('Gece saatleri')) return 'Night hours; traffic is low and flow is ideal.'
    if (msg.includes('Trafik sakin')) return 'Traffic is stable and calm.'
    if (msg.includes('Orta seviyede hava kirliliği')) return 'Moderate air pollution. Sensitive groups should be cautious.'
    if (msg.includes('Hava kalitesi iyi')) return 'Air quality is good. Suitable for outdoor activities.'

    const energyMatch = msg.match(/(\d+)\s*anomali tespit edildi.*(critical|warning|healthy)/i)
    if (energyMatch) {
      return `${energyMatch[1]} anomalies detected, grid status: ${energyMatch[2].toLowerCase()}.`
    }

    const safetyMatch = msg.match(/(\d+)\s*aktif olay,\s*(\d+)\s*kritik durum var\./i)
    if (safetyMatch) {
      return `${safetyMatch[1]} active incidents, ${safetyMatch[2]} critical cases.`
    }

    return msg
  }

  const translateHealthLabel = (label: string) => {
    const normalized = normalizeMojibake(label)
    if (lang === 'tr') return normalized
    if (normalized.toLowerCase() === 'iyi') return 'Good'
    if (normalized.toLowerCase() === 'orta') return 'Moderate'
    if (normalized.toLowerCase() === 'kritik') return 'Critical'
    return normalized
  }

  const stats = liveStats ?? summary?.kpis
  const health = summary?.overall_health

  return (
    <div className="space-y-6">
      {/* Page title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">City-V Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tx('Global Akıllı Şehir Kontrol Merkezi', 'Global Smart City Control Center')}</p>
        </div>
        {health && (
          <div className={`flex items-center gap-2 px-4 py-2 rounded-lg border text-sm font-medium
            ${health.color === 'green'  ? 'bg-green-900/20 border-green-700 text-green-400' :
              health.color === 'yellow' ? 'bg-yellow-900/20 border-yellow-700 text-yellow-400' :
              health.color === 'orange' ? 'bg-amber-900/20 border-amber-700 text-amber-400' :
                                          'bg-red-900/20 border-red-700 text-red-400'}`}>
            <Activity size={15} />
            {tx('Şehir Sağlığı', 'City Health')}: {translateHealthLabel(health.label)} ({health.score}/100)
          </div>
        )}
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <StatCard title={tx('Kritik Trafik', 'Critical Traffic')} value={stats?.traffic?.critical_sensors ?? stats?.traffic_critical_sensors ?? '—'}
          icon={Car} iconColor="text-amber-400"
          alert={(stats?.traffic?.critical_sensors ?? stats?.traffic_critical_sensors ?? 0) > 3}
          subtitle={tx('kritik sensör', 'critical sensors')} />
        <StatCard title={tx('Ort. Hız', 'Avg Speed')} value={stats?.traffic?.avg_speed ? `${stats.traffic.avg_speed} km/h` : '—'}
          icon={Car} iconColor="text-city-cyan" subtitle={tx('şehir geneli', 'citywide')} />
        <StatCard title={tx('Enerji Anomali', 'Energy Anomaly')} value={stats?.energy?.anomalies ?? stats?.energy_anomalies ?? '—'}
          icon={Zap} iconColor="text-yellow-400"
          alert={(stats?.energy?.anomalies ?? stats?.energy_anomalies ?? 0) > 0}
          subtitle={tx('trafo', 'substation')} />
        <StatCard title={tx('Atık Uyarısı', 'Waste Alert')} value={stats?.waste?.needs_collection ?? stats?.waste_collection_alerts ?? '—'}
          icon={Trash2} iconColor="text-green-400"
          alert={(stats?.waste?.needs_collection ?? stats?.waste_collection_alerts ?? 0) > 10}
          subtitle={tx('acil toplanacak', 'urgent pickup')} />
        <StatCard title={tx('Aktif Olay', 'Active Incidents')} value={stats?.active_incidents ?? '—'}
          icon={Shield} iconColor="text-red-400"
          alert={(stats?.active_incidents ?? 0) > 5}
          subtitle={tx('güvenlik olayı', 'safety incidents')} />
        <StatCard title={tx('Hava Uyarısı', 'Air Alert')} value={stats?.air?.alerts ?? stats?.air_quality_alerts ?? '—'}
          icon={Wind} iconColor="text-sky-400"
          alert={(stats?.air?.alerts ?? stats?.air_quality_alerts ?? 0) > 0}
          subtitle={`${tx('Ort. AQI', 'Avg AQI')}: ${stats?.air?.avg_aqi ?? '—'}`} />
      </div>

      {/* Map + AI Insights */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">{tx('Canlı Şehir Haritası', 'Live City Map')}</span>
          </div>
          <CityMap markers={mapMarkers} height="420px" />
        </div>

        <div className="space-y-4">
          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">{tx('AI Öngörüleri', 'AI Insights')}</p>
            <div className="space-y-3">
              {summary?.ai_insights ? Object.entries(summary.ai_insights).map(([key, msg]: any) => (
                <div key={key} className="flex gap-3 p-3 bg-white/3 rounded-lg border border-city-border/50">
                  <div className="w-1.5 h-1.5 rounded-full bg-city-cyan mt-1.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-slate-500 capitalize mb-0.5">{
                      key === 'traffic' ? tx('Trafik AI', 'Traffic AI') :
                      key === 'energy'  ? tx('Enerji AI', 'Energy AI') :
                      key === 'air'     ? tx('Hava Kalitesi', 'Air Quality') : tx('Güvenlik AI', 'Safety AI')
                    }</p>
                    <p className="text-xs text-slate-300 leading-relaxed">{translateInsight(String(msg))}</p>
                  </div>
                </div>
              )) : (
                <p className="text-sm text-slate-600 text-center py-4">{tx('Backend\'e bağlanılıyor...', 'Connecting to backend...')}</p>
              )}
            </div>
          </div>

          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">{tx('Sistem Durumu', 'System Status')}</p>
            <div className="space-y-2">
              {[
                tx('Trafik AI', 'Traffic AI'),
                tx('Enerji Şebekesi', 'Energy Grid'),
                tx('Atık Optimizasyonu', 'Waste Optimizer'),
                tx('Güvenlik İzleme', 'Safety Monitor'),
                tx('Hava Kalitesi', 'Air Quality'),
                tx('Vatandaş Portalı', 'Citizen Portal'),
                tx('Mekan Yoğunluğu', 'Venue Density'),
                tx('Tenant Admin', 'Tenant Admin'),
              ].map((s) => (
                <div key={s} className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">{s}</span>
                  <span className="flex items-center gap-1.5 text-city-green">
                    <span className="w-1.5 h-1.5 rounded-full bg-city-green" />
                    {tx('Aktif', 'Active')}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
