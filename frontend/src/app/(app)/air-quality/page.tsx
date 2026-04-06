'use client'
import { useState, useEffect } from 'react'
import { Wind, AlertTriangle, TrendingUp, Thermometer } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityLineChart from '@/components/Charts/LineChart'
import CityBarChart from '@/components/Charts/BarChart'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

const AQI_COLOR = (aqi: number) =>
  aqi > 200 ? '#7c3aed' : aqi > 150 ? '#ef4444' : aqi > 100 ? '#f59e0b' : aqi > 50 ? '#eab308' : '#10b981'

export default function AirQualityPage() {
  const { tx } = useLanguage()
  const [stations, setStations] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.airQuality.summary(),
      api.airQuality.aiAnalysis(),
      api.airQuality.history(12),
      api.airQuality.live(),
    ]).then(([s, ai, h, live]) => {
      setSummary(s)
      setAiAnalysis(ai)
      setStations(live?.stations ?? live ?? [])
      const formatted = (h || []).map((r: any, i: number) => ({
        time: `T-${h.length - i}`,
        'AQI': r.avg_aqi?.toFixed(0),
        'PM2.5': r.avg_pm25?.toFixed(1),
      }))
      setHistory(formatted)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update' && data.air_stations) {
        setStations(data.air_stations)
      }
    })
    return unsub
  }, [])

  const markers = stations.map((s) => ({
    lat: s.lat, lng: s.lng,
    color: AQI_COLOR(s.aqi ?? 0),
    radius: 9,
    popup: `<b>${s.district}</b><br/>AQI: <b>${s.aqi}</b> — ${s.aqi_category}<br/>PM2.5: ${s.pm25?.toFixed(1)}<br/>PM10: ${s.pm10?.toFixed(1)}<br/>NO2: ${s.no2?.toFixed(1)}`,
  }))

  const aqiChart = stations.map((s) => ({
    name: s.district?.substring(0, 7),
    value: Math.round(s.aqi ?? 0),
    color: AQI_COLOR(s.aqi ?? 0),
  }))

  const alertCount = stations.filter((s) => s.alert_active || s.aqi > 100).length

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{tx('Hava Kalitesi İzleme', 'Air Quality Monitoring')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tx('AQI sensörleri ve kirlilik analizi', 'AQI sensors and pollution analysis')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="İstasyon Sayısı" value={stations.length || summary?.total_stations || '—'}
          icon={Wind} iconColor="text-sky-400" subtitle="aktif sensör" />
        <StatCard title="Hava Uyarısı" value={alertCount}
          icon={AlertTriangle} iconColor="text-red-400"
          alert={alertCount > 0} subtitle="AQI > 100" />
        <StatCard title="Ort. AQI" value={
          stations.length
            ? Math.round(stations.reduce((a, s) => a + (s.aqi ?? 0), 0) / stations.length)
            : summary?.avg_aqi ?? '—'
        } icon={TrendingUp} iconColor="text-city-cyan" subtitle="şehir geneli" />
        <StatCard title="Maks. PM2.5" value={
          stations.length
            ? `${Math.max(...stations.map((s) => s.pm25 ?? 0)).toFixed(1)} µg/m³`
            : '—'
        } icon={Thermometer} iconColor="text-amber-400" subtitle="en yüksek değer" />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">AQI Haritası</span>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/> İyi</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> Orta</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/> Hassas</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> Kötü</span>
            </span>
          </div>
          <CityMap markers={markers} height="380px" />
        </div>

        <div className="space-y-4">
          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">Sağlık Uyarıları</p>
            {aiAnalysis?.health_messages?.length ? (
              <div className="space-y-2">
                {aiAnalysis.health_messages.slice(0, 5).map((msg: string, i: number) => (
                  <div key={i} className="flex gap-2 p-2 bg-sky-900/10 border border-sky-800/30 rounded text-xs text-sky-300">
                    <Wind size={12} className="flex-shrink-0 mt-0.5" />
                    <span>{msg}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-green-500 text-center py-3">✓ Sağlık uyarısı yok</p>
            )}
          </div>

          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">İlçe Durum Listesi</p>
            <div className="space-y-1.5 max-h-48 overflow-y-auto">
              {[...stations].sort((a, b) => (b.aqi ?? 0) - (a.aqi ?? 0)).slice(0, 10).map((s, i) => (
                <div key={i} className="flex items-center justify-between text-xs p-1.5 rounded bg-white/3">
                  <span className="text-slate-400">{s.district}</span>
                  <span className="font-medium" style={{ color: AQI_COLOR(s.aqi ?? 0) }}>
                    AQI {Math.round(s.aqi ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {history.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">AQI & PM2.5 Geçmişi</p>
            <CityLineChart
              data={history}
              series={[
                { key: 'AQI', name: 'AQI', color: '#38bdf8' },
                { key: 'PM2.5', name: 'PM2.5', color: '#f59e0b' },
              ]}
              height={220}
            />
          </div>
        )}
        {aqiChart.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">İlçe Bazlı AQI</p>
            <CityBarChart data={aqiChart} height={220} />
          </div>
        )}
      </div>
    </div>
  )
}
