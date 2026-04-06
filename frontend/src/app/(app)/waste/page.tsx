'use client'
import { useState, useEffect } from 'react'
import { Trash2, AlertTriangle, Route, CheckCircle, Sparkles } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityBarChart from '@/components/Charts/BarChart'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

export default function WastePage() {
  const { tx } = useLanguage()
  const [containers, setContainers] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [routes, setRoutes] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [optimizing, setOptimizing] = useState(false)

  useEffect(() => {
    Promise.all([api.waste.summary(), api.waste.live(), api.waste.ai()]).then(([s, live, ai]) => {
      setSummary(s)
      setContainers(Array.isArray(live) ? live : (live?.containers ?? []))
      setAiAnalysis(ai)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update' && data.waste_containers) {
        setContainers(data.waste_containers)
      }
    })
    return unsub
  }, [])

  const handleOptimize = async () => {
    setOptimizing(true)
    try {
      const result = await api.waste.optimizeRoutes()
      setRoutes(result)
    } catch {}
    setOptimizing(false)
  }

  const markers = containers.map((c) => ({
    lat: c.lat, lng: c.lng,
    color: c.fill_pct >= 90 ? '#ef4444' : c.fill_pct >= 70 ? '#f59e0b' : '#10b981',
    radius: 7,
    popup: `<b>${c.container_id}</b><br/>İlçe: ${c.district}<br/>Doluluk: ${c.fill_pct?.toFixed(0)}%<br/>Tür: ${c.container_type}<br/>${c.needs_collection ? '<span style="color:#ef4444">⚠ Toplanmalı</span>' : '<span style="color:#10b981">✓ Normal</span>'}`,
  }))

  const districtFill = containers.reduce((acc: Record<string, number[]>, c) => {
    if (!acc[c.district]) acc[c.district] = []
    acc[c.district].push(c.fill_pct ?? 0)
    return acc
  }, {})
  const fillChart = Object.entries(districtFill).map(([name, vals]) => ({
    name: name.substring(0, 7),
    value: Math.round(vals.reduce((a, v) => a + v, 0) / vals.length),
  }))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">{tx('Akıllı Atık Yönetimi', 'Smart Waste Management')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">{tx('Konteyner izleme ve rota optimizasyonu', 'Container monitoring and route optimization')}</p>
        </div>
        <button
          onClick={handleOptimize}
          disabled={optimizing}
          className="flex items-center gap-2 px-4 py-2 bg-city-cyan/10 hover:bg-city-cyan/20 border border-city-cyan/30 rounded-lg text-city-cyan text-sm font-medium transition-colors disabled:opacity-50"
        >
          <Route size={15} />
          {optimizing ? tx('Optimize ediliyor...', 'Optimizing...') : tx('Rotayı Optimize Et', 'Optimize Route')}
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={tx('Toplam Konteyner', 'Total Containers')} value={containers.length || summary?.total_containers || '—'}
          icon={Trash2} iconColor="text-green-400" subtitle={tx('aktif', 'active')} />
        <StatCard title={tx('Acil Toplanacak', 'Needs Urgent Pickup')} value={containers.filter((c) => c.fill_pct >= 90).length || summary?.needs_collection || 0}
          icon={AlertTriangle} iconColor="text-red-400"
          alert={(containers.filter((c) => c.fill_pct >= 90).length) > 5}
          subtitle={tx('%90+ dolu', '90%+ full')} />
        <StatCard title={tx('Ort. Doluluk', 'Avg. Fill')} value={
          containers.length
            ? `${Math.round(containers.reduce((a, c) => a + (c.fill_pct ?? 0), 0) / containers.length)}%`
            : '—'
        } icon={CheckCircle} iconColor="text-city-cyan" subtitle={tx('genel ortalama', 'overall average')} />
        <StatCard title={tx('Optimize Rota', 'Optimized Route')} value={routes ? `${routes.total_routes ?? 0}` : '—'}
          icon={Route} iconColor="text-amber-400" subtitle={tx('araç rotası', 'vehicle route')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">{tx('Konteyner Haritası', 'Container Map')}</span>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/> {tx('Normal', 'Normal')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> {tx('Uyarı', 'Warning')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> {tx('Kritik', 'Critical')}</span>
            </span>
          </div>
          <CityMap markers={markers} height="380px" />
        </div>

        <div className="space-y-4">
          {routes ? (
            <div className="city-card">
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Optimize Rotalar</p>
              <div className="space-y-3">
                {routes.routes?.slice(0, 3).map((r: any, i: number) => (
                  <div key={i} className={`p-3 rounded border text-xs ${r.priority === 'urgent' ? 'border-red-700/40 bg-red-900/10' : 'border-city-border bg-white/3'}`}>
                    <div className="flex items-center justify-between mb-1">
                      <span className={`font-medium ${r.priority === 'urgent' ? 'text-red-400' : 'text-amber-400'}`}>
                        Araç {i + 1} — {r.priority === 'urgent' ? 'ACİL' : 'NORMAL'}
                      </span>
                      <span className="text-slate-500">{r.stops?.length ?? 0} durak</span>
                    </div>
                    <p className="text-slate-400">Mesafe: {r.estimated_distance_km?.toFixed(1)} km</p>
                    <p className="text-slate-500 mt-0.5">{r.stops?.slice(0, 3).join(', ')}{r.stops?.length > 3 ? '...' : ''}</p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="city-card flex flex-col items-center justify-center py-10 text-center">
              <Route size={32} className="text-slate-600 mb-3" />
              <p className="text-sm text-slate-500">{tx('Rota verisi yok', 'No route data yet')}</p>
              <p className="text-xs text-slate-600 mt-1">{tx('Optimizasyon butonuna tıklayın', 'Click optimize button')}</p>
            </div>
          )}

          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">{tx('Kritik Konteynerler', 'Critical Containers')}</p>
            <div className="space-y-1.5 max-h-40 overflow-y-auto">
              {containers.filter((c) => c.fill_pct >= 85).slice(0, 8).map((c, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-white/3">
                  <span className="text-slate-400">{c.district}</span>
                  <span className={`font-medium ${c.fill_pct >= 90 ? 'text-red-400' : 'text-amber-400'}`}>{c.fill_pct?.toFixed(0)}%</span>
                </div>
              ))}
              {containers.filter((c) => c.fill_pct >= 85).length === 0 && (
                <p className="text-xs text-green-500 text-center py-2">{tx('✓ Tüm konteynerler normal', '✓ All containers are normal')}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {fillChart.length > 0 && (
        <div className="city-card">
          <p className="text-sm font-medium text-slate-300 mb-4">{tx('İlçe Bazlı Ortalama Doluluk (%)', 'District Average Fill (%)')}</p>
          <CityBarChart data={fillChart} color="#10b981" height={200} />
        </div>
      )}

      {aiAnalysis && (
        <div className="city-card">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={16} className="text-green-400" />
            <p className="text-sm font-medium text-slate-300">{tx('AI Atık Analizi', 'AI Waste Analysis')}</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            <div className="rounded-lg border border-city-border p-3 bg-white/3">
              <p className="text-xs text-slate-500">{tx('Kritik Konteyner', 'Critical Containers')}</p>
              <p className="text-xl font-bold text-red-400">{aiAnalysis.critical_count ?? 0}</p>
            </div>
            <div className="rounded-lg border border-city-border p-3 bg-white/3">
              <p className="text-xs text-slate-500">{tx('Yüksek Doluluk', 'High Fill')}</p>
              <p className="text-xl font-bold text-amber-400">{aiAnalysis.high_count ?? 0}</p>
            </div>
            <div className="rounded-lg border border-city-border p-3 bg-white/3">
              <p className="text-xs text-slate-500">{tx('Ortalama Doluluk', 'Average Fill')}</p>
              <p className="text-xl font-bold text-city-cyan">%{Math.round(aiAnalysis.avg_fill_pct ?? 0)}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">{tx('İçgörüler', 'Insights')}</p>
              <div className="space-y-1.5">
                {(aiAnalysis.insights ?? []).slice(0, 4).map((insight: string, i: number) => (
                  <div key={i} className="text-xs text-slate-300 bg-white/3 rounded p-2">• {insight}</div>
                ))}
              </div>
            </div>
            <div>
              <p className="text-xs text-slate-500 uppercase tracking-wider mb-2 font-medium">{tx('Önerilen Toplama Noktaları', 'Recommended Pickup Points')}</p>
              <div className="space-y-1.5 max-h-36 overflow-y-auto">
                {(aiAnalysis.route_recommendations ?? []).slice(0, 6).map((r: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs bg-white/3 rounded p-2">
                    <span className="text-slate-300">{r.district} · {r.container_id}</span>
                    <span className={r.priority === 'critical' ? 'text-red-400' : 'text-amber-400'}>%{Math.round(r.fill_pct ?? 0)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
