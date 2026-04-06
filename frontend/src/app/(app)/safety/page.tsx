'use client'
import { useState, useEffect } from 'react'
import { Shield, AlertTriangle, MapPin, Activity } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityBarChart from '@/components/Charts/BarChart'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

const PRIORITY_COLOR: Record<string, string> = {
  CRITICAL: 'text-red-400',
  HIGH:     'text-amber-400',
  MEDIUM:   'text-yellow-400',
  LOW:      'text-green-400',
}

export default function SafetyPage() {
  const { tx } = useLanguage()
  const [incidents, setIncidents] = useState<any[]>([])
  const [riskMap, setRiskMap] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)

  useEffect(() => {
    Promise.all([
      api.safety.incidents(20),
      api.safety.riskMap(),
      api.safety.summary(),
      api.safety.aiAnalysis(),
    ]).then(([inc, rm, s, ai]) => {
      setIncidents(inc?.incidents ?? inc ?? [])
      setRiskMap(rm?.zones ?? rm ?? [])
      setSummary(s)
      setAiAnalysis(ai)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update') {
        if (data.recent_incidents) setIncidents(data.recent_incidents)
        if (data.safety_zones) setRiskMap(data.safety_zones)
      }
    })
    return unsub
  }, [])

  const markers = riskMap.map((z: any) => ({
    lat: z.lat, lng: z.lng,
    color: z.risk_level === 'CRITICAL' ? '#ef4444' : z.risk_level === 'HIGH' ? '#f59e0b' : '#eab308',
    radius: 10,
    popup: `<b>${z.district}</b><br/>Risk: ${z.risk_level}<br/>Skor: ${z.risk_score?.toFixed(0)}`,
  }))

  const incidentMarkers = incidents.filter((inc) => inc.lat && inc.lng && inc.status === 'ACTIVE').map((inc) => ({
    lat: inc.lat, lng: inc.lng,
    color: '#ef4444',
    radius: 5,
    popup: `<b>${inc.incident_type}</b><br/>${inc.district}<br/>Öncelik: ${inc.priority}`,
  }))

  const typeChart = incidents.reduce((acc: Record<string, number>, inc) => {
    acc[inc.incident_type] = (acc[inc.incident_type] ?? 0) + 1
    return acc
  }, {})
  const typeData = Object.entries(typeChart).map(([name, count]) => ({
    name: name.substring(0, 8),
    value: count,
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{tx('Kent Güvenliği', 'Urban Safety')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tx('Olay takibi, risk haritası ve AI analizi', 'Incident tracking, risk map and AI analysis')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Olay" value={summary?.total_incidents ?? incidents.length}
          icon={Shield} iconColor="text-red-400" subtitle="son 24 saat" />
        <StatCard title="Aktif Olay" value={summary?.active_incidents ?? incidents.filter((i) => i.status === 'ACTIVE').length}
          icon={AlertTriangle} iconColor="text-amber-400"
          alert={(summary?.active_incidents ?? 0) > 0} subtitle="müdahale gerekli" />
        <StatCard title="Risk Bölgesi" value={riskMap.filter((z) => z.risk_level === 'HIGH' || z.risk_level === 'CRITICAL').length}
          icon={MapPin} iconColor="text-orange-400" subtitle="yüksek risk" />
        <StatCard title="Risk Skoru" value={
            aiAnalysis?.overall_city_risk
              ? ({ critical: 'KRİTİK', high: 'YÜKSEK', moderate: 'ORTA', low: 'DÜŞÜK' }[aiAnalysis.overall_city_risk as string] ?? aiAnalysis.overall_city_risk)
              : '—'
          }
          icon={Activity} iconColor="text-city-cyan" subtitle="AI analizi" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">Risk ve Olay Haritası</span>
          </div>
          <CityMap markers={[...markers, ...incidentMarkers]} height="380px" />
        </div>

        <div className="city-card flex flex-col">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Aktif Olaylar</p>
          <div className="flex-1 space-y-2 overflow-y-auto max-h-96">
            {incidents.filter((inc) => inc.status === 'ACTIVE').slice(0, 10).map((inc, i) => (
              <div key={i} className={`p-3 rounded border text-xs ${
                inc.priority === 'CRITICAL' ? 'border-red-700/40 bg-red-900/10' :
                inc.priority === 'HIGH'     ? 'border-amber-700/40 bg-amber-900/10' :
                                              'border-city-border bg-white/3'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-slate-300 font-medium">{inc.incident_type}</span>
                  <span className={PRIORITY_COLOR[inc.priority] ?? 'text-slate-400'}>{inc.priority}</span>
                </div>
                <p className="text-slate-500">{inc.district}</p>
                {inc.description && <p className="text-slate-600 mt-0.5 text-[11px] truncate">{inc.description}</p>}
              </div>
            ))}
            {incidents.filter((inc) => inc.status === 'ACTIVE').length === 0 && (
              <p className="text-xs text-green-500 text-center py-4">✓ Aktif olay yok</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {typeData.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">Olay Türü Dağılımı</p>
            <CityBarChart data={typeData} color="#f59e0b" height={200} />
          </div>
        )}
        <div className="city-card">
          <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">AI Müdahale Önerileri</p>
          {aiAnalysis?.dispatch_recommendations?.length ? (
            <ul className="space-y-2">
              {aiAnalysis.dispatch_recommendations.slice(0, 6).map((r: string, i: number) => (
                <li key={i} className="flex gap-2 text-xs text-slate-300">
                  <span className="text-red-400 flex-shrink-0 mt-0.5">!</span>
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-600 text-center py-4">Analiz bekleniyor...</p>
          )}
        </div>
      </div>
    </div>
  )
}
