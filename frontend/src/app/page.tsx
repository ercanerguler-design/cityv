'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import LanguageSwitch from '@/components/Language/LanguageSwitch'
import { useLanguage } from '@/components/Language/LanguageProvider'
import {
  Car, Zap, Trash2, Shield, Wind, Users, MapPin,
  ArrowRight, Activity, Globe, Cpu, ChevronRight,
  BarChart3, Wifi, Building2, TrendingUp, CheckCircle2,
  Database, Radio, Map, Settings2, MessageCircle
} from 'lucide-react'

const CITIES = [
  {
    name: 'İstanbul',
    tagline: '15.8M Nüfus',
    color: 'from-cyan-500 to-blue-600',
    border: 'border-cyan-500/30',
    glow: 'shadow-cyan-500/20',
    bg: 'bg-cyan-500/10',
    districts: 39,
    sensors: 351,
    lat: '41.0082° K',
    status: 'Aktif',
  },
  {
    name: 'Ankara',
    tagline: '5.7M Nüfus',
    color: 'from-red-500 to-orange-600',
    border: 'border-red-500/30',
    glow: 'shadow-red-500/20',
    bg: 'bg-red-500/10',
    districts: 25,
    sensors: 225,
    lat: '39.9334° K',
    status: 'Aktif',
  },
  {
    name: 'İzmir',
    tagline: '4.4M Nüfus',
    color: 'from-emerald-500 to-teal-600',
    border: 'border-emerald-500/30',
    glow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-500/10',
    districts: 30,
    sensors: 270,
    lat: '38.4237° K',
    status: 'Aktif',
  },
  {
    name: 'Antalya',
    tagline: '2.7M Nüfus',
    color: 'from-amber-500 to-yellow-600',
    border: 'border-amber-500/30',
    glow: 'shadow-amber-500/20',
    bg: 'bg-amber-500/10',
    districts: 20,
    sensors: 180,
    lat: '36.8969° K',
    status: 'Aktif',
  },
  {
    name: 'Bursa',
    tagline: '3.2M Nüfus',
    color: 'from-purple-500 to-violet-600',
    border: 'border-purple-500/30',
    glow: 'shadow-purple-500/20',
    bg: 'bg-purple-500/10',
    districts: 17,
    sensors: 153,
    lat: '40.1826° K',
    status: 'Aktif',
  },
]

const MODULES = [
  { href: '/traffic',     label: 'Trafik AI',         icon: Car,      color: 'text-amber-400',  border: 'border-amber-400/20',   glow: 'bg-amber-400/5',   desc: 'Gerçek zamanlı trafik yoğunluğu, sensör ağı ve yapay zeka tahminleri' },
  { href: '/energy',      label: 'Enerji Şebeke',      icon: Zap,      color: 'text-yellow-400', border: 'border-yellow-400/20',  glow: 'bg-yellow-400/5',  desc: 'Güç tüketimi takibi, anomali tespiti ve yenilenebilir enerji payı' },
  { href: '/waste',       label: 'Atık Yönetimi',      icon: Trash2,   color: 'text-green-400',  border: 'border-green-400/20',   glow: 'bg-green-400/5',   desc: 'Akıllı konteyner doluluk takibi ve AI rota optimizasyonu' },
  { href: '/safety',      label: 'Güvenlik',           icon: Shield,   color: 'text-red-400',    border: 'border-red-400/20',     glow: 'bg-red-400/5',     desc: 'Olay yönetimi, risk haritası ve acil müdahale koordinasyonu' },
  { href: '/air-quality', label: 'Hava Kalitesi',      icon: Wind,     color: 'text-sky-400',    border: 'border-sky-400/20',     glow: 'bg-sky-400/5',     desc: 'AQI izleme, PM2.5/PM10 ölçümleri ve kirlilik uyarı sistemi' },
  { href: '/citizens',    label: 'Vatandaş Portalı',   icon: Users,    color: 'text-purple-400', border: 'border-purple-400/20',  glow: 'bg-purple-400/5',  desc: 'Kentsel sorun bildirimleri ve vatandaş geri bildirim sistemi' },
  { href: '/venues',      label: 'Mekan Yoğunluğu',    icon: MapPin,   color: 'text-pink-400',   border: 'border-pink-400/20',    glow: 'bg-pink-400/5',    desc: 'AVM, kafe, restoran ve tarihi caddelerin anlık doluluk haritası' },
  { href: '/admin',       label: 'Tenant Admin',       icon: Settings2, color: 'text-indigo-400', border: 'border-indigo-400/20',  glow: 'bg-indigo-400/5',  desc: 'Belediye/ülke bazlı marka, dil, modül, veri kaynağı ve yetki yönetimi' },
]

const ROADMAP = [
  { phase: 'Faz 1', title: 'Pilot Kurulum', desc: '5 şehir merkezine 480 sensör konuşlandırması', done: true },
  { phase: 'Faz 2', title: 'Veri Entegrasyonu', desc: 'Belediye API bağlantıları ve açık veri alımı', done: true },
  { phase: 'Faz 3', title: 'AI Motor', desc: 'Makine öğrenmesi modelleri ve tahmin algoritmaları', done: true },
  { phase: 'Faz 4', title: 'Dashboard', desc: 'Gerçek zamanlı izleme platformu (mevcut ekran)', done: true },
  { phase: 'Faz 5', title: 'Mobil Uygulama', desc: 'Vatandaş & yönetici mobil uygulamaları', done: false },
  { phase: 'Faz 6', title: 'Global Ölçek', desc: 'Çok ülke / çok tenant mimarisi ile dünya çapında genişleme', done: false },
]

const MODULE_LABEL_EN: Record<string, string> = {
  'Trafik AI': 'Traffic AI',
  'Enerji Şebeke': 'Energy Grid',
  'Atık Yönetimi': 'Waste Management',
  'Güvenlik': 'Safety',
  'Hava Kalitesi': 'Air Quality',
  'Vatandaş Portalı': 'Citizen Portal',
  'Mekan Yoğunluğu': 'Venue Density',
  'Tenant Admin': 'Tenant Admin',
}

const MODULE_DESC_EN: Record<string, string> = {
  'Gerçek zamanlı trafik yoğunluğu, sensör ağı ve yapay zeka tahminleri': 'Real-time traffic density, sensor network and AI forecasts',
  'Güç tüketimi takibi, anomali tespiti ve yenilenebilir enerji payı': 'Power consumption tracking, anomaly detection and renewable share',
  'Akıllı konteyner doluluk takibi ve AI rota optimizasyonu': 'Smart container fill monitoring and AI route optimization',
  'Olay yönetimi, risk haritası ve acil müdahale koordinasyonu': 'Incident management, risk mapping and emergency response coordination',
  'AQI izleme, PM2.5/PM10 ölçümleri ve kirlilik uyarı sistemi': 'AQI monitoring, PM2.5/PM10 tracking and pollution alerting',
  'Kentsel sorun bildirimleri ve vatandaş geri bildirim sistemi': 'Urban issue reporting and citizen feedback workflow',
  'AVM, kafe, restoran ve tarihi caddelerin anlık doluluk haritası': 'Live occupancy map for malls, cafes, restaurants and major streets',
  'Belediye/ülke bazlı marka, dil, modül, veri kaynağı ve yetki yönetimi': 'Municipality/country-specific branding, locale, modules, data source and access governance',
}

const DATA_TITLE_EN: Record<string, string> = {
  'IoT Sensör Ağı': 'IoT Sensor Network',
  'Açık Veri API': 'Open Data APIs',
  '3. Taraf API': '3rd Party APIs',
  'Belediye Entegrasyonu': 'Municipal Integrations',
  'Cihaz Mimarisi': 'Device Architecture',
  'AI & Analitik': 'AI & Analytics',
}

const DATA_ITEM_EN: Record<string, string> = {
  'LoRaWAN & NB-IoT sensörler': 'LoRaWAN & NB-IoT sensors',
  'Hava kalitesi, trafik, atık': 'Air quality, traffic, waste',
  '5–10 yıl pil ömrü': '5-10 year battery life',
  'IP67 su geçirmez gövde': 'IP67 weatherproof enclosure',
  'İBB Açık Veri Portalı': 'IMM Open Data Portal',
  'data.gov.tr (Devlet)': 'data.gov.tr (Government)',
  'TÜİK istatistik API': 'TurkStat statistics APIs',
  'EPDK enerji verileri': 'EPDK energy datasets',
  'Google Maps Trafik API': 'Google Maps Traffic APIs',
  'OpenWeatherMap / MGM': 'OpenWeatherMap / National Met Office',
  'HERE Gerçek Zamanlı Trafik': 'HERE Real-Time Traffic',
  'IQAir Hava Kalitesi': 'IQAir Air Quality',
  'SCADA sistem bağlantısı': 'SCADA system connection',
  'Kamera AI görüntü analizi': 'Camera AI video analytics',
  'Akıllı park sensörleri': 'Smart parking sensors',
  'Su şebekesi sensörleri': 'Water network sensors',
  'Raspberry Pi 4 edge node': 'Raspberry Pi 4 edge node',
  'LoRa Gateway (EU868)': 'LoRa Gateway (EU868)',
  'MQTT → FastAPI bridge': 'MQTT to FastAPI bridge',
  'OTA güncelleme desteği': 'OTA update support',
  'Scikit-learn tahmin modelleri': 'Scikit-learn prediction models',
  'Anomali tespit (Z-score)': 'Anomaly detection (Z-score)',
  'Trafik tahmin LSTM': 'Traffic forecasting LSTM',
  'Rota optimizasyonu CP-SAT': 'Route optimization CP-SAT',
}

const ROADMAP_TEXT_EN: Record<string, string> = {
  'Faz 1': 'Phase 1',
  'Faz 2': 'Phase 2',
  'Faz 3': 'Phase 3',
  'Faz 4': 'Phase 4',
  'Faz 5': 'Phase 5',
  'Faz 6': 'Phase 6',
  'Pilot Kurulum': 'Pilot Deployment',
  'Veri Entegrasyonu': 'Data Integration',
  'AI Motor': 'AI Engine',
  'Mobil Uygulama': 'Mobile App',
  'Global Ölçek': 'Global Scale',
  '5 şehir merkezine 480 sensör konuşlandırması': 'Deploying 480 sensors to 5 city centers',
  'Belediye API bağlantıları ve açık veri alımı': 'Municipal API connectors and open-data ingestion',
  'Makine öğrenmesi modelleri ve tahmin algoritmaları': 'Machine learning models and forecasting algorithms',
  'Gerçek zamanlı izleme platformu (mevcut ekran)': 'Real-time monitoring platform (current stage)',
  'Vatandaş & yönetici mobil uygulamaları': 'Citizen and operator mobile applications',
  'Çok ülke / çok tenant mimarisi ile dünya çapında genişleme': 'Worldwide rollout with multi-country / multi-tenant architecture',
}

const TECH_SUB_EN: Record<string, string> = {
  'Frontend': 'Frontend',
  'Backend API': 'Backend API',
  'AI & Simülasyon': 'AI & Simulation',
  'Gerçek Zamanlı': 'Real-Time',
  'UI Stili': 'UI Styling',
  'Veri Görsel.': 'Data Visualization',
  'Veritabanı ORM': 'Database ORM',
  'Tip Güvenliği': 'Type Safety',
}

export default function LandingPage() {
  const { tx } = useLanguage()
  const [activeCity, setActiveCity] = useState(0)
  const city = CITIES[activeCity]

  return (
    <div className="min-h-screen bg-city-bg text-slate-200 flex flex-col overflow-x-hidden">

      {/* ─── NAV ─────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 border-b border-city-border bg-city-bg/80 backdrop-blur-xl px-6 lg:px-10 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Image src="/logo-cityv.svg" alt="City-V" width={36} height={36} className="rounded-xl shadow-lg shadow-city-cyan/30" priority />
          <div>
            <span className="text-white font-black text-lg tracking-tight">City-V</span>
            <span className="hidden sm:inline text-slate-500 text-xs ml-2 font-medium">{tx('Akıllı Şehir Platformu', 'Smart City Platform')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSwitch />
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border border-green-500/30 bg-green-500/10 text-green-400 text-xs font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
            {tx('5 Şehir Aktif', '5 Cities Active')}
          </div>
          <Link href="/dashboard"
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-city-cyan to-city-purple text-white font-bold text-sm hover:opacity-90 transition-all hover:scale-105 shadow-lg shadow-city-cyan/20">
            {tx('Platforma Gir', 'Enter Platform')} <ArrowRight size={15} />
          </Link>
        </div>
      </nav>

      {/* ─── HERO ────────────────────────────────────────────────────── */}
      <section className="relative flex flex-col items-center text-center px-6 pt-20 pb-16 overflow-hidden">
        {/* Background glows */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[900px] h-[500px] bg-city-cyan/6 rounded-full blur-[120px]" />
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-city-purple/5 rounded-full blur-[80px]" />
          <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-blue-500/4 rounded-full blur-[60px]" />
        </div>

        {/* Grid overlay */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
          style={{ backgroundImage: 'linear-gradient(#00d4ff 1px,transparent 1px),linear-gradient(90deg,#00d4ff 1px,transparent 1px)', backgroundSize: '60px 60px' }} />

        <div className="relative z-10 max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-city-cyan/30 bg-city-cyan/5 text-city-cyan text-xs font-semibold mb-8 shadow-lg shadow-city-cyan/10">
            <Radio size={13} className="animate-pulse" />
            {tx('Çok Şehirli Akıllı Kent Platformu • Pilot: 5 Metropol • Global-Ready', 'Multi-City Smart Urban Platform • Pilot: 5 Metropolises • Global-Ready')}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white mb-7 leading-[1.05] tracking-tight">
            {tx('Şehirleri ', 'Manage Cities with ')}<span className="bg-gradient-to-r from-city-cyan to-city-purple bg-clip-text text-transparent">{tx('Zekâyla', 'Intelligence')}</span><br />
            {tx('Yönet, Geleceği', 'Shape the Future')}<br />
            <span className="bg-gradient-to-r from-city-purple to-pink-500 bg-clip-text text-transparent">{tx('Birlikte', 'Together')}</span> {tx('İnşa Et', 'Build It')}
          </h1>

          <p className="text-slate-400 text-lg max-w-2xl mx-auto mb-10 leading-relaxed">
            {tx('City-V; İstanbul, Ankara, İzmir, Antalya ve Bursa\'da', 'City-V monitors Istanbul, Ankara, Izmir, Antalya and Bursa')}<br className="hidden sm:block" />
            {tx('trafik, enerji, atık, güvenlik ve çevreyi tek platformdan izler.', 'across traffic, energy, waste, safety and environment from one platform.')}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/dashboard"
              className="group flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl bg-gradient-to-r from-city-cyan to-cyan-400 text-city-bg font-black text-base hover:opacity-95 transition-all hover:scale-105 shadow-xl shadow-city-cyan/25">
              {tx('Canlı Dashboard', 'Live Dashboard')}
              <ArrowRight size={18} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            <a href="http://localhost:8000/docs" target="_blank" rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 px-7 py-3.5 rounded-xl border border-city-border bg-city-card/50 text-slate-300 font-semibold text-base hover:border-slate-500 hover:text-white transition-all">
              <Database size={16} />
              {tx('API Dokümantasyonu', 'API Documentation')}
            </a>
          </div>

          {/* Mega stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {[
              { value: '5',     tr: 'Pilot Şehir',     en: 'Pilot City',      icon: Building2,  color: 'text-city-cyan' },
              { value: '960+',  tr: 'IoT Sensör',      en: 'IoT Sensors',     icon: Radio,      color: 'text-amber-400' },
              { value: '107',   tr: 'İzlenen İlçe',    en: 'Tracked Districts', icon: Map,      color: 'text-purple-400' },
              { value: '5 sn',  tr: 'RT Güncelleme',   en: 'RT Refresh',      icon: Activity,   color: 'text-green-400' },
            ].map(({ value, tr, en, icon: Icon, color }) => (
              <div key={tr} className="bg-city-card/60 border border-city-border rounded-2xl p-5 backdrop-blur-sm hover:border-slate-600 transition-colors">
                <Icon size={18} className={`${color} mb-3`} />
                <p className={`text-3xl font-black ${color}`}>{value}</p>
                <p className="text-xs text-slate-500 mt-1 font-medium">{tx(tr, en)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── 5 ŞEHİR ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-city-cyan font-semibold uppercase tracking-[0.2em] mb-3 block">{tx('Pilot Bölgeler', 'Pilot Regions')}</span>
            <h2 className="text-4xl font-black text-white mb-4">{tx('5 Metropol, Tek Platform', '5 Metropolises, One Platform')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{tx('Her şehir bağımsız sensör ağı ve AI modeli ile izleniyor. Seç, incele.', 'Each city is monitored with its own sensor network and AI model. Select and explore.')}</p>
          </div>

          {/* City tabs */}
          <div className="flex flex-wrap justify-center gap-3 mb-10">
            {CITIES.map((c, i) => (
              <button key={c.name} onClick={() => setActiveCity(i)}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                  activeCity === i
                    ? `bg-gradient-to-r ${c.color} text-white border-transparent shadow-lg ${c.glow}`
                    : 'border-city-border text-slate-400 hover:text-white hover:border-slate-500 bg-city-card/50'
                }`}>
                {c.name}
              </button>
            ))}
          </div>

          {/* Active city card */}
          <div className={`rounded-2xl border ${city.border} ${city.bg} backdrop-blur-sm p-8 transition-all shadow-2xl ${city.glow}`}>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="flex items-start gap-4 mb-6">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${city.color} flex items-center justify-center shadow-lg`}>
                    <Building2 size={28} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-3xl font-black text-white">{city.name}</h3>
                    <p className="text-slate-400">{tx(city.tagline, city.tagline.replace('Nüfus', 'Population'))} · {city.lat}</p>
                    <div className="mt-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-500/15 border border-green-500/25 text-green-400 text-xs font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      {tx(city.status, 'Active')}
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { tr: 'İzlenen İlçe', en: 'Tracked Districts', value: city.districts },
                    { tr: 'Aktif Sensör', en: 'Active Sensors', value: city.sensors + '+' },
                    { tr: 'Platform Modülü', en: 'Platform Modules', value: '8' },
                  ].map(({ tr, en, value }) => (
                    <div key={tr} className="bg-city-bg/40 rounded-xl p-4 border border-city-border/50">
                      <p className="text-2xl font-black text-white">{value}</p>
                      <p className="text-xs text-slate-500 mt-1">{tx(tr, en)}</p>
                    </div>
                  ))}
                </div>
              </div>
              <div className="space-y-3">
                <p className="text-xs text-slate-500 uppercase tracking-widest font-semibold mb-4">{tx('İzlenen Sistemler', 'Tracked Systems')}</p>
                {MODULES.map(({ label, icon: Icon, color }) => (
                  <div key={label} className="flex items-center gap-3 p-3 rounded-xl bg-city-bg/40 border border-city-border/50">
                    <Icon size={15} className={color} />
                    <span className="text-sm text-slate-300 font-medium">{tx(label, MODULE_LABEL_EN[label] ?? label)}</span>
                    <CheckCircle2 size={13} className="ml-auto text-green-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── MODÜLLER ────────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-city-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-city-cyan font-semibold uppercase tracking-[0.2em] mb-3 block">Platform</span>
            <h2 className="text-4xl font-black text-white mb-4">{tx('8 Modül, Sıfır Kör Nokta', '8 Modules, Zero Blind Spots')}</h2>
            <p className="text-slate-500 max-w-xl mx-auto">{tx('WebSocket üzerinden 5 saniyede bir güncellenen gerçek zamanlı veri akışı.', 'Real-time data stream updated every 5 seconds over WebSocket.')}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {MODULES.map(({ href, label, icon: Icon, color, border, glow, desc }) => (
              <Link key={href} href={href}
                className={`group relative p-5 rounded-2xl border ${border} ${glow} hover:scale-[1.02] hover:shadow-xl transition-all overflow-hidden`}>
                <div className="absolute top-0 right-0 w-24 h-24 rounded-full bg-current opacity-[0.03] -translate-y-8 translate-x-8" />
                <div className={`w-10 h-10 rounded-xl ${glow} border ${border} flex items-center justify-center mb-4`}>
                  <Icon size={18} className={color} />
                </div>
                <p className="text-white font-bold text-sm mb-2">{tx(label, MODULE_LABEL_EN[label] ?? label)}</p>
                <p className="text-xs text-slate-500 leading-relaxed mb-4">{tx(desc, MODULE_DESC_EN[desc] ?? desc)}</p>
                <div className={`flex items-center gap-1 text-xs font-semibold ${color} opacity-70 group-hover:opacity-100 transition-opacity`}>
                  {tx('İncele', 'Explore')} <ChevronRight size={12} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ─── VERİ KAYNAKLARI ─────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-city-border">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-amber-400 font-semibold uppercase tracking-[0.2em] mb-3 block">{tx('Veri Altyapısı', 'Data Backbone')}</span>
            <h2 className="text-4xl font-black text-white mb-4">{tx('Gerçek Veri Nasıl Toplanır?', 'How Is Real Data Collected?')}</h2>
            <p className="text-slate-500 max-w-2xl mx-auto">{tx('Pilot sonrası canlı sisteme geçiş için planlanan kaynak mimarisi', 'Planned source architecture for post-pilot production rollout')}</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              { icon: Radio, color: 'text-city-cyan', border: 'border-city-cyan/20', bg: 'bg-city-cyan/5', title: 'IoT Sensör Ağı', items: ['LoRaWAN & NB-IoT sensörler', 'Hava kalitesi, trafik, atık', '5–10 yıl pil ömrü', 'IP67 su geçirmez gövde'] },
              { icon: Database, color: 'text-purple-400', border: 'border-purple-400/20', bg: 'bg-purple-400/5', title: 'Açık Veri API', items: ['İBB Açık Veri Portalı', 'data.gov.tr (Devlet)', 'TÜİK istatistik API', 'EPDK enerji verileri'] },
              { icon: Globe, color: 'text-emerald-400', border: 'border-emerald-400/20', bg: 'bg-emerald-400/5', title: '3. Taraf API', items: ['Google Maps Trafik API', 'OpenWeatherMap / MGM', 'HERE Gerçek Zamanlı Trafik', 'IQAir Hava Kalitesi'] },
              { icon: Cpu, color: 'text-amber-400', border: 'border-amber-400/20', bg: 'bg-amber-400/5', title: 'Belediye Entegrasyonu', items: ['SCADA sistem bağlantısı', 'Kamera AI görüntü analizi', 'Akıllı park sensörleri', 'Su şebekesi sensörleri'] },
              { icon: Wifi, color: 'text-sky-400', border: 'border-sky-400/20', bg: 'bg-sky-400/5', title: 'Cihaz Mimarisi', items: ['Raspberry Pi 4 edge node', 'LoRa Gateway (EU868)', 'MQTT → FastAPI bridge', 'OTA güncelleme desteği'] },
              { icon: BarChart3, color: 'text-pink-400', border: 'border-pink-400/20', bg: 'bg-pink-400/5', title: 'AI & Analitik', items: ['Scikit-learn tahmin modelleri', 'Anomali tespit (Z-score)', 'Trafik tahmin LSTM', 'Rota optimizasyonu CP-SAT'] },
            ].map(({ icon: Icon, color, border, bg, title, items }) => (
              <div key={title} className={`p-6 rounded-2xl border ${border} ${bg}`}>
                <div className={`flex items-center gap-2 ${color} mb-4`}>
                  <Icon size={18} />
                  <span className="font-bold text-sm text-white">{tx(title, DATA_TITLE_EN[title] ?? title)}</span>
                </div>
                <ul className="space-y-2">
                  {items.map((item) => (
                    <li key={item} className="flex items-start gap-2 text-xs text-slate-400">
                      <span className={`${color} mt-0.5 flex-shrink-0`}>›</span>
                      {tx(item, DATA_ITEM_EN[item] ?? item)}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── YOL HARİTASI ────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-city-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <span className="text-xs text-purple-400 font-semibold uppercase tracking-[0.2em] mb-3 block">{tx('Yol Haritası', 'Roadmap')}</span>
            <h2 className="text-4xl font-black text-white mb-4">{tx('Proje Fazları', 'Project Phases')}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ROADMAP.map(({ phase, title, desc, done }) => (
              <div key={phase} className={`p-5 rounded-2xl border ${done ? 'border-green-500/25 bg-green-500/5' : 'border-city-border bg-city-card/40'}`}>
                <div className="flex items-center justify-between mb-3">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${done ? 'bg-green-500/20 text-green-400' : 'bg-slate-700/60 text-slate-500'}`}>
                    {tx(phase, ROADMAP_TEXT_EN[phase] ?? phase)}
                  </span>
                  {done
                    ? <CheckCircle2 size={16} className="text-green-400" />
                    : <div className="w-4 h-4 rounded-full border-2 border-slate-600" />}
                </div>
                <p className="text-white font-bold text-sm mb-1">{tx(title, ROADMAP_TEXT_EN[title] ?? title)}</p>
                <p className="text-xs text-slate-500 leading-relaxed">{tx(desc, ROADMAP_TEXT_EN[desc] ?? desc)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── TECH STACK ──────────────────────────────────────────────── */}
      <section className="py-16 px-6 border-t border-city-border">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <span className="text-xs text-slate-500 font-semibold uppercase tracking-[0.2em] mb-3 block">{tx('Teknoloji Yığını', 'Technology Stack')}</span>
            <h2 className="text-3xl font-black text-white">{tx('Endüstri Standartı Altyapı', 'Industry-Standard Platform')}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { name: 'Next.js 14',    sub: 'Frontend',        color: 'text-white',       icon: '▲' },
              { name: 'FastAPI',       sub: 'Backend API',     color: 'text-green-400',   icon: '⚡' },
              { name: 'Python 3.13',   sub: 'AI & Simülasyon', color: 'text-yellow-400',  icon: '🐍' },
              { name: 'WebSocket',     sub: 'Gerçek Zamanlı',  color: 'text-cyan-400',    icon: '📡' },
              { name: 'Tailwind CSS',  sub: 'UI Stili',        color: 'text-sky-400',     icon: '🎨' },
              { name: 'Recharts',      sub: 'Veri Görsel.',    color: 'text-purple-400',  icon: '📊' },
              { name: 'SQLAlchemy',    sub: 'Veritabanı ORM',  color: 'text-orange-400',  icon: '🗄️' },
              { name: 'TypeScript',    sub: 'Tip Güvenliği',   color: 'text-blue-400',    icon: '🔷' },
            ].map(({ name, sub, color, icon }) => (
              <div key={name} className="bg-city-card border border-city-border rounded-2xl p-4 hover:border-slate-600 transition-colors">
                <span className="text-xl mb-3 block">{icon}</span>
                <p className={`font-bold text-sm ${color}`}>{name}</p>
                <p className="text-xs text-slate-600 mt-1">{tx(sub, TECH_SUB_EN[sub] ?? sub)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 border-t border-city-border relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[400px] bg-city-cyan/5 rounded-full blur-[100px]" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <h2 className="text-5xl font-black text-white mb-6">
            {tx('Şehri ', 'Observe Your City ')}<span className="bg-gradient-to-r from-city-cyan to-city-purple bg-clip-text text-transparent">{tx('Şimdi', 'Now')}</span> {tx('İzle', 'Live')}
          </h2>
          <p className="text-slate-400 text-lg mb-10">
            {tx('5 şehirden canlı akan verilerle AI analizlerine erişin.', 'Access AI analytics with live streaming data from 5 cities.')}
          </p>
          <Link href="/dashboard"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-city-cyan to-city-purple text-white font-black text-lg hover:opacity-90 transition-all hover:scale-105 shadow-2xl shadow-city-cyan/20">
            <TrendingUp size={22} />
            {tx('Canlı Dashboard\'a Gir', 'Open Live Dashboard')}
          </Link>
        </div>
      </section>

      {/* ─── FOOTER ──────────────────────────────────────────────────── */}
      <footer className="border-t border-city-border py-10 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <p className="text-white font-bold text-base mb-2">Software Circuit Engineer</p>
            <p className="text-slate-400 text-sm">© 2026 City-V. Tüm hakları saklıdır.</p>
            <p className="text-slate-500 text-sm mt-1">by SCE INNOVATION LTD. ŞTİ.</p>
          </div>

          <div>
            <p className="text-white font-semibold mb-3">İletişim</p>
            <div className="space-y-2 text-sm text-slate-400">
              <p>📍 Çetin Emeç Bulvarı 25/3, Çankaya / Ankara</p>
              <p>✉️ sce@scegrup.com</p>
              <p>📞 +90 0850 888 1 889</p>
              <p>💬 Wp: +90 543 392 92 30</p>
            </div>
          </div>

          <div>
            <p className="text-white font-semibold mb-3">{tx('Yasal', 'Legal')}</p>
            <div className="space-y-2 text-sm">
              <Link href="/privacy-policy" className="block text-slate-400 hover:text-white transition-colors">🔒 {tx('Gizlilik Politikası', 'Privacy Policy')}</Link>
              <Link href="/terms" className="block text-slate-400 hover:text-white transition-colors">📋 {tx('Kullanım Koşulları', 'Terms of Use')}</Link>
              <Link href="/kvkk" className="block text-slate-400 hover:text-white transition-colors">🛡️ KVKK</Link>
              <Link href="/contact" className="block text-slate-400 hover:text-white transition-colors">📬 {tx('İletişim', 'Contact')}</Link>
            </div>
          </div>
        </div>
      </footer>

      <a
        href="https://wa.me/905433929230"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-[1200] w-14 h-14 rounded-full bg-green-500 text-white flex items-center justify-center shadow-2xl shadow-green-500/30 hover:bg-green-400 transition-colors"
        aria-label="WhatsApp ile iletişim"
        title="WhatsApp ile iletişim"
      >
        <MessageCircle size={26} />
      </a>
    </div>
  )
}


