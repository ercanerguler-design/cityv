'use client'
import { useState, useEffect } from 'react'
import { Zap, AlertTriangle, TrendingUp, Battery } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityLineChart from '@/components/Charts/LineChart'
import CityBarChart from '@/components/Charts/BarChart'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

export default function EnergyPage() {
  const { tx } = useLanguage()
  const [substations, setSubstations] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.energy.summary(),
      api.energy.aiAnalysis(),
      api.energy.history(12),
    ]).then(([s, ai, h]) => {
      setSummary(s)
      setAiAnalysis(ai)
      const formatted = (h || []).map((r: any, i: number) => ({
        time: `T-${h.length - i}`,
        'Tüketim (MW)': r.avg_consumption?.toFixed(0),
        'Tahmin (MW)': r.avg_predicted?.toFixed(0),
      }))
      setHistory(formatted)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update' && data.energy_substations) {
        setSubstations(data.energy_substations)
      }
    })
    return unsub
  }, [])

  const markers = substations.map((s) => ({
    lat: s.lat, lng: s.lng,
    color: s.is_anomaly ? '#ef4444' : s.utilization_pct > 85 ? '#f59e0b' : '#00d4ff',
    radius: 8,
    popup: `<b>${s.district} Trafo</b><br/>Tüketim: ${s.current_consumption?.toFixed(1)} MW<br/>Kapasite: ${s.utilization_pct?.toFixed(0)}%<br/>${s.is_anomaly ? '<span style="color:#ef4444">⚠ ANOMALİ</span>' : '<span style="color:#10b981">✓ Normal</span>'}`,
  }))

  const utilizationChart = substations.map((s) => ({
    name: s.district?.substring(0, 7),
    value: Math.round(s.utilization_pct ?? 0),
    color: s.is_anomaly ? '#ef4444' : s.utilization_pct > 85 ? '#f59e0b' : '#00d4ff',
  }))

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{tx('Enerji Grid Yönetimi', 'Energy Grid Management')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tx('Akıllı şebeke izleme ve anomali tespiti', 'Smart grid monitoring and anomaly detection')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={tx('Toplam Substation', 'Total Substations')} value={substations.length || summary?.total_substations || '—'}
          icon={Zap} iconColor="text-yellow-400" subtitle={tx('aktif', 'active')} />
        <StatCard title={tx('Anomali', 'Anomaly')} value={summary?.anomaly_count ?? aiAnalysis?.anomaly_count ?? 0}
          icon={AlertTriangle} iconColor="text-red-400"
          alert={(summary?.anomaly_count ?? 0) > 0} subtitle={tx('anormal okuma', 'abnormal reading')} />
        <StatCard title={tx('Toplam Tüketim', 'Total Consumption')} value={summary?.total_consumption_mw ? `${summary.total_consumption_mw} MW` : '—'}
          icon={Battery} iconColor="text-green-400" subtitle={tx('anlık yük', 'current load')} />
        <StatCard title={tx('Yenilenebilir', 'Renewable')} value={summary?.avg_renewable_pct ? `${summary.avg_renewable_pct}%` : '—'}
          icon={TrendingUp} iconColor="text-city-cyan" subtitle={tx('yeşil enerji', 'green energy')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">Substation Haritası</span>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-city-cyan"/> Normal</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> Yüksek</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> Anomali</span>
            </span>
          </div>
          <CityMap markers={markers} height="380px" />
        </div>

        <div className="space-y-4">
          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">AI Optimizasyon</p>
            {aiAnalysis?.load_balance_suggestions?.length ? (
              <ul className="space-y-2">
                {aiAnalysis.load_balance_suggestions.slice(0, 5).map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300">
                    <span className="text-yellow-400 flex-shrink-0 mt-0.5">⚡</span>
                    <span>{r}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 text-center py-3">Analiz bekleniyor...</p>
            )}
          </div>

          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Anomali Listesi</p>
            {substations.filter((s) => s.is_anomaly).length ? (
              <div className="space-y-2">
                {substations.filter((s) => s.is_anomaly).map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-red-900/10 rounded border border-red-800/30 text-xs">
                    <span className="text-red-300">{s.district}</span>
                    <span className="text-red-400 font-medium">{s.utilization_pct?.toFixed(0)}%</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-500 text-center py-3">✓ Anomali yok</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {history.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">Tüketim Geçmişi</p>
            <CityLineChart
              data={history}
              series={[
                { key: 'Tüketim (MW)', name: 'Tüketim (MW)', color: '#eab308' },
                { key: 'Tahmin (MW)', name: 'Tahmin (MW)', color: '#00d4ff' },
              ]}
              height={220}
            />
          </div>
        )}
        {utilizationChart.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">İlçe Bazlı Kullanım (%)</p>
            <CityBarChart
              data={utilizationChart}
              height={220}
            />
          </div>
        )}
      </div>
    </div>
  )
}
