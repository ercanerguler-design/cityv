'use client'
import { useState, useEffect, useRef } from 'react'
import { Users, MessageSquare, AlertTriangle, CheckCircle, Send, ThumbsUp } from 'lucide-react'
import StatCard from '@/components/Cards/StatCard'
import { api } from '@/lib/api'
import { useLanguage } from '@/components/Language/LanguageProvider'

const CATEGORIES = [
  'Trafik', 'Güvenlik', 'Altyapı', 'Çevre', 'Gürültü',
  'Aydınlatma', 'Temizlik', 'Yeşil Alan', 'Diğer',
]

export default function CitizensPage() {
  const { tx } = useLanguage()
  const [reports, setReports] = useState<any[]>([])
  const [summary, setSummary] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [filter, setFilter] = useState<string>('all')
  const titleRef = useRef<HTMLInputElement>(null)
  const descRef = useRef<HTMLTextAreaElement>(null)
  const [category, setCategory] = useState('Trafik')

  const fetchReports = () => {
    api.citizens.reports(20).then((r: any) => setReports(r?.reports ?? r ?? [])).catch(() => {})
    api.citizens.summary().then(setSummary).catch(() => {})
  }

  useEffect(() => {
    fetchReports()
    const interval = setInterval(fetchReports, 15000)
    return () => clearInterval(interval)
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const title = titleRef.current?.value?.trim()
    const description = descRef.current?.value?.trim()
    if (!title || !description) return
    setSubmitting(true)
    try {
      await api.citizens.submit({ title, description, category })
      setSubmitted(true)
      if (titleRef.current) titleRef.current.value = ''
      if (descRef.current) descRef.current.value = ''
      setTimeout(() => {
        setSubmitted(false)
        fetchReports()
      }, 2000)
    } catch {}
    setSubmitting(false)
  }

  const handleUpvote = async (reportId: string) => {
    try {
      await api.citizens.upvote(reportId)
      fetchReports()
    } catch {}
  }

  const PRIORITY_STYLE: Record<string, string> = {
    CRITICAL: 'bg-red-900/20 border-red-700/40 text-red-400',
    HIGH:     'bg-amber-900/20 border-amber-700/40 text-amber-400',
    MEDIUM:   'bg-yellow-900/20 border-yellow-700/40 text-yellow-400',
    LOW:      'bg-green-900/20 border-green-700/40 text-green-400',
  }

  const filtered = filter === 'all' ? reports : reports.filter((r) => r.status === filter)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">{tx('Vatandaş Portalı', 'Citizen Portal')}</h1>
        <p className="text-sm text-slate-500 mt-0.5">{tx('Şikayet & öneri bildirimi ve AI yanıtlama sistemi', 'Complaint & suggestion reporting with AI response flow')}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Toplam Rapor" value={summary?.total_reports ?? reports.length}
          icon={MessageSquare} iconColor="text-city-cyan" subtitle="tüm zamanlar" />
        <StatCard title="Bekleyen" value={summary?.pending_reports ?? reports.filter((r) => r.status === 'PENDING').length}
          icon={AlertTriangle} iconColor="text-amber-400"
          alert={(summary?.pending_reports ?? 0) > 10} subtitle="yanıt bekliyor" />
        <StatCard title="Çözüldü" value={summary?.resolved_reports ?? reports.filter((r) => r.status === 'RESOLVED').length}
          icon={CheckCircle} iconColor="text-green-400" subtitle="tamamlanan" />
        <StatCard title="Vatandaş" value={summary?.unique_reporters ?? '—'}
          icon={Users} iconColor="text-purple-400" subtitle="aktif kullanıcı" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Submit Form */}
        <div className="lg:col-span-2 city-card">
          <p className="text-sm font-medium text-slate-300 mb-4">{tx('Yeni Bildirim Oluştur', 'Create New Report')}</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">{tx('Kategori', 'Category')}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-white/5 border border-city-border text-slate-300 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-city-cyan/50"
              >
                {CATEGORIES.map((c) => <option key={c} value={c} className="bg-[#0d1627]">{c}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">{tx('Başlık', 'Title')}</label>
              <input
                ref={titleRef}
                type="text"
                placeholder="Kısaca açıklayın..."
                required
                className="w-full bg-white/5 border border-city-border text-slate-300 placeholder-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-city-cyan/50"
              />
            </div>
            <div>
              <label className="text-xs text-slate-500 mb-1.5 block">{tx('Detay', 'Details')}</label>
              <textarea
                ref={descRef}
                rows={4}
                placeholder="Sorun veya önerinizi detaylandırın..."
                required
                className="w-full bg-white/5 border border-city-border text-slate-300 placeholder-slate-600 text-sm rounded-lg px-3 py-2 focus:outline-none focus:border-city-cyan/50 resize-none"
              />
            </div>
            <button
              type="submit"
              disabled={submitting || submitted}
              className="w-full flex items-center justify-center gap-2 bg-city-cyan/10 hover:bg-city-cyan/20 border border-city-cyan/30 text-city-cyan py-2.5 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {submitted ? (
                <><CheckCircle size={15} /> Gönderildi!</>
              ) : submitting ? (
                'Gönderiliyor...'
              ) : (
                <><Send size={15} /> Bildir</>
              )}
            </button>
          </form>
        </div>

        {/* Report List */}
        <div className="lg:col-span-3 city-card flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <p className="text-sm font-medium text-slate-300">Raporlar</p>
            <div className="flex gap-1">
              {['all', 'PENDING', 'IN_PROGRESS', 'RESOLVED'].map((s) => (
                <button
                  key={s}
                  onClick={() => setFilter(s)}
                  className={`px-2.5 py-1 rounded text-xs transition-colors ${
                    filter === s
                      ? 'bg-city-cyan/20 text-city-cyan border border-city-cyan/30'
                      : 'text-slate-500 hover:text-slate-300 border border-transparent'
                  }`}
                >
                  {s === 'all' ? 'Tümü' : s === 'PENDING' ? 'Bekleyen' : s === 'IN_PROGRESS' ? 'Devam' : 'Çözüldü'}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3 overflow-y-auto max-h-[520px] flex-1">
            {filtered.slice(0, 15).map((r: any, i: number) => (
              <div key={i} className={`p-4 rounded-lg border text-xs ${PRIORITY_STYLE[r.priority] ?? 'border-city-border bg-white/3'}`}>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex-1 min-w-0">
                    <span className="font-medium text-slate-200 block truncate">{r.title}</span>
                    <span className="text-slate-500 mt-0.5 block">{r.category} · {r.priority}</span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <button
                      onClick={() => handleUpvote(r.report_id)}
                      className="flex items-center gap-1 text-slate-500 hover:text-city-cyan transition-colors"
                    >
                      <ThumbsUp size={11} /> {r.upvotes ?? 0}
                    </button>
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-medium border ${
                      r.status === 'RESOLVED'    ? 'border-green-700/40 text-green-400 bg-green-900/20' :
                      r.status === 'IN_PROGRESS' ? 'border-blue-700/40 text-blue-400 bg-blue-900/20' :
                                                   'border-slate-700/40 text-slate-400 bg-white/3'
                    }`}>
                      {r.status === 'RESOLVED' ? 'Çözüldü' : r.status === 'IN_PROGRESS' ? 'Devam' : 'Bekliyor'}
                    </span>
                  </div>
                </div>
                <p className="text-slate-500 mb-2 leading-relaxed line-clamp-2">{r.description}</p>
                {r.ai_response && (
                  <div className="mt-2 pt-2 border-t border-white/5">
                    <p className="text-[10px] text-city-cyan mb-1 font-medium">AI Yanıtı</p>
                    <p className="text-slate-400 leading-relaxed">{r.ai_response}</p>
                  </div>
                )}
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <MessageSquare size={32} className="text-slate-700 mb-3" />
                <p className="text-sm text-slate-600">Rapor bulunamadı</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
