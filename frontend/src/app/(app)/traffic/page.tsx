'use client'
import { useState, useEffect, useRef } from 'react'
import { Car, AlertTriangle, TrendingUp, Activity } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import CityLineChart from '@/components/Charts/LineChart'
import CityBarChart from '@/components/Charts/BarChart'
import dynamic from 'next/dynamic'
import { cityWS } from '@/lib/websocket'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CityMap = dynamic(() => import('@/components/Map/CityMap'), { ssr: false })

export default function TrafficPage() {
  const { lang, tx } = useLanguage()
  const [sensors, setSensors] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [aiAnalysis, setAiAnalysis] = useState<any>(null)
  const [history, setHistory] = useState<any[]>([])

  useEffect(() => {
    Promise.all([
      api.traffic.summary(),
      api.traffic.aiAnalysis(),
      api.traffic.history(12),
    ]).then(([s, ai, h]) => {
      setSummary(s)
      setAiAnalysis(ai)
      const formatted = (h || []).map((r: any, i: number) => ({
        time: `T-${h.length - i}`,
        vehicleCount: r.avg_vehicles,
        avgSpeed: r.avg_speed,
      }))
      setHistory(formatted)
    }).catch(() => {})
  }, [])

  useEffect(() => {
    const unsub = cityWS.subscribe((data: any) => {
      if (data.type === 'live_update') {
        const sensorList = data.traffic_sensors ?? []
        setSensors(sensorList)
        setSummary((prev: any) => ({
          ...prev,
          total_sensors: sensorList.length,
          critical_sensors: sensorList.filter((s: any) => s.congestion_level === 'CRITICAL').length,
          high_sensors: sensorList.filter((s: any) => s.congestion_level === 'HIGH').length,
          avg_speed: sensorList.length
            ? Math.round(sensorList.reduce((a: number, s: any) => a + s.avg_speed, 0) / sensorList.length)
            : 0,
        }))
      }
    })
    return unsub
  }, [])

  const congestionLabel = (level: string) => {
    if (level === 'CRITICAL') return tx('Kritik', 'Critical')
    if (level === 'HIGH') return tx('Yüksek', 'High')
    if (level === 'MODERATE') return tx('Orta', 'Moderate')
    return tx('Düşük', 'Low')
  }

  const markers = sensors.map((s) => ({
    lat: s.lat, lng: s.lng,
    color: s.congestion_level === 'CRITICAL' ? '#ef4444' :
           s.congestion_level === 'HIGH'     ? '#f59e0b' :
           s.congestion_level === 'MODERATE' ? '#eab308' : '#10b981',
    popup: `<b>${s.location_name ?? s.sensor_id}</b><br/>${tx('İlçe', 'District')}: ${s.district}<br/>${tx('Yoğunluk', 'Congestion')}: <b>${congestionLabel(s.congestion_level)}</b><br/>${tx('Hız', 'Speed')}: ${s.avg_speed} km/h<br/>${tx('Araç', 'Vehicles')}: ${s.vehicle_count}`,
  }))

  const districtData = sensors.reduce((acc: Record<string, number>, s: any) => {
    if (!acc[s.district]) acc[s.district] = 0
    acc[s.district] += s.vehicle_count
    return acc
  }, {})
  const districtChart = Object.entries(districtData).map(([name, count]) => ({
    name: name.substring(0, 7),
    value: count as number,
  }))

  const translateAiText = (raw: string) => {
    if (lang === 'tr') return raw
    if (raw.includes('Tüm koridorlarda yeşil dalga optimizasyonu aktifleştirin.')) {
      return 'Enable green-wave optimization across all corridors.'
    }
    if (raw.includes('Alternatif güzergahlar haritaya işaretlendi.')) {
      return 'Alternative routes have been marked on the map.'
    }
    if (raw.includes('Kritik kavşaklarda sinyal sürelerini %20 uzatın.')) {
      return 'Increase signal times by 20% at critical intersections.'
    }
    if (raw.includes('Normal sinyal programı aktif, müdahale gerekmiyor.')) {
      return 'Normal signal program is active, no intervention needed.'
    }
    return raw
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{tx('Trafik AI Yönetimi', 'Traffic AI Management')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tx('Gerçek zamanlı trafik sensörleri ve yapay zeka analizi', 'Real-time traffic sensors and AI analysis')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={tx('Toplam Sensör', 'Total Sensors')} value={summary?.total_sensors ?? sensors.length}
          icon={Car} iconColor="text-city-cyan" subtitle={tx('aktif', 'active')} />
        <StatCard title={tx('Kritik Nokta', 'Critical Points')} value={summary?.critical_sensors ?? 0}
          icon={AlertTriangle} iconColor="text-red-400"
          alert={(summary?.critical_sensors ?? 0) > 3} subtitle={tx('kritik yoğunluk', 'critical congestion')} />
        <StatCard title={tx('Ort. Hız', 'Avg Speed')} value={`${summary?.avg_speed ?? 0} km/h`}
          icon={TrendingUp} iconColor="text-green-400" subtitle={tx('şehir geneli', 'citywide')} />
        <StatCard title={tx('AI Skoru', 'AI Score')} value={aiAnalysis?.avg_congestion_score != null ? `${Math.round(aiAnalysis.avg_congestion_score * 100)}/100` : '—'}
          icon={Activity} iconColor="text-amber-400" subtitle={tx('yoğunluk skoru', 'congestion score')} />
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 city-card p-0 overflow-hidden">
          <div className="px-5 py-4 border-b border-city-border flex items-center gap-2">
            <span className="live-dot" />
            <span className="text-sm font-medium text-slate-300">{tx('Trafik Sensör Haritası', 'Traffic Sensor Map')}</span>
            <span className="ml-auto flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"/> {tx('Serbest', 'Free')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-yellow-500"/> {tx('Orta', 'Moderate')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"/> {tx('Yüksek', 'High')}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500"/> {tx('Kritik', 'Critical')}</span>
            </span>
          </div>
          <CityMap markers={markers} height="380px" />
        </div>

        <div className="space-y-4">
          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">{tx('AI Önerileri', 'AI Recommendations')}</p>
            {aiAnalysis?.signal_recommendations?.length ? (
              <ul className="space-y-2">
                {aiAnalysis.signal_recommendations.slice(0, 5).map((r: string, i: number) => (
                  <li key={i} className="flex gap-2 text-xs text-slate-300">
                    <span className="text-city-cyan flex-shrink-0 mt-0.5">→</span>
                    <span>{translateAiText(r)}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-slate-600 text-center py-3">{tx('Analiz bekleniyor...', 'Waiting for analysis...')}</p>
            )}
          </div>
          <div className="city-card">
            <p className="text-xs text-slate-500 uppercase tracking-wider mb-3 font-medium">{tx('Yoğunluk Sıcak Noktaları', 'Congestion Hotspots')}</p>
            {aiAnalysis?.hotspots?.length ? (
              <div className="space-y-2">
                {aiAnalysis.hotspots.slice(0, 4).map((h: any, i: number) => (
                  <div key={i} className="flex items-center justify-between text-xs p-2 bg-white/3 rounded border border-city-border/50">
                    <span className="text-slate-300">{h.location ?? h.district}</span>
                    <span className="font-semibold text-amber-400">{typeof h.score === 'number' ? h.score.toFixed(2) : h.score}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600 text-center py-3">{tx('Veri yok', 'No data')}</p>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {history.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">{tx('Hız Geçmişi', 'Speed History')}</p>
            <CityLineChart data={history} series={[{ key: 'avgSpeed', name: tx('Ort. Hız', 'Avg Speed'), color: '#00d4ff' }]} height={220} />
          </div>
        )}
        {districtChart.length > 0 && (
          <div className="city-card">
            <p className="text-sm font-medium text-slate-300 mb-4">{tx('İlçe Bazlı Araç Yoğunluğu', 'District Vehicle Density')}</p>
            <CityBarChart data={districtChart} color="#f59e0b" height={220} />
          </div>
        )}
      </div>
    </div>
  )
}
