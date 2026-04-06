'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { Building2, Globe, Palette, Languages, ShieldCheck, SlidersHorizontal, Save, LogIn, UserPlus } from 'lucide-react'
import { useLanguage } from '@/components/Language/LanguageProvider'
import { api } from '@/lib/api'

type TenantRow = {
  tenant_id: string
  tenant_name: string
  domain: string
  region: string
  locale: string
  theme: string
  data_profile: string
  sensor_namespace: string
  enabled_modules: string[]
}

type MeResponse = {
  username: string
  role: 'superadmin' | 'tenant_admin' | 'tenant_user'
  tenant_id: string | null
  tenant?: TenantRow | null
}

const MODULES = [
  { key: 'traffic', tr: 'Trafik AI', en: 'Traffic AI' },
  { key: 'energy', tr: 'Enerji Sebeke', en: 'Energy Grid' },
  { key: 'waste', tr: 'Atik Yonetimi', en: 'Waste Management' },
  { key: 'safety', tr: 'Guvenlik', en: 'Safety' },
  { key: 'air', tr: 'Hava Kalitesi', en: 'Air Quality' },
  { key: 'citizens', tr: 'Vatandas Portali', en: 'Citizen Portal' },
  { key: 'venues', tr: 'Mekan Yogunlugu', en: 'Venue Density' },
  { key: 'admin', tr: 'Tenant Admin', en: 'Tenant Admin' },
]

export default function AdminPage() {
  const { tx } = useLanguage()

  const [token, setToken] = useState<string>('')
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginState, setLoginState] = useState<'idle' | 'loading' | 'error'>('idle')

  const [me, setMe] = useState<MeResponse | null>(null)
  const [templates, setTemplates] = useState<TenantRow[]>([])
  const [users, setUsers] = useState<any[]>([])

  const [selected, setSelected] = useState('')
  const [tenantName, setTenantName] = useState('')
  const [theme, setTheme] = useState('cyan')
  const [domain, setDomain] = useState('')
  const [region, setRegion] = useState('')
  const [locale, setLocale] = useState('tr')
  const [dataProfile, setDataProfile] = useState('simulator-default')
  const [sensorNamespace, setSensorNamespace] = useState('default')
  const [modules, setModules] = useState<string[]>([])
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [newTenantId, setNewTenantId] = useState('')
  const [newTenantName, setNewTenantName] = useState('')
  const [newTenantDomain, setNewTenantDomain] = useState('')
  const [newTenantRegion, setNewTenantRegion] = useState('')
  const [newTenantLocale, setNewTenantLocale] = useState('tr')
  const [newTenantTheme, setNewTenantTheme] = useState('cyan')
  const [newTenantState, setNewTenantState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const [newUsername, setNewUsername] = useState('')
  const [newUserPassword, setNewUserPassword] = useState('')
  const [newUserRole, setNewUserRole] = useState<'tenant_user' | 'tenant_admin'>('tenant_user')
  const [newUserTenant, setNewUserTenant] = useState('')
  const [newUserState, setNewUserState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')

  const isSuperAdmin = me?.role === 'superadmin'

  const tenant = useMemo(() => templates.find((t) => t.tenant_id === selected) ?? null, [selected, templates])

  const syncTenantForm = useCallback((t: TenantRow | null) => {
    if (!t) return
    setSelected(t.tenant_id)
    setTenantName(t.tenant_name)
    setTheme(t.theme)
    setDomain(t.domain)
    setRegion(t.region)
    setLocale(t.locale)
    setDataProfile(t.data_profile)
    setSensorNamespace(t.sensor_namespace)
    setModules(t.enabled_modules)
    setNewUserTenant(t.tenant_id)
  }, [])

  const loadAdminData = useCallback(async () => {
    try {
      const meData = await api.admin.me()
      setMe(meData)

      const rows = await api.admin.tenants()
      setTemplates(rows)

      if (meData.role === 'superadmin') {
        syncTenantForm(rows[0] ?? null)
      } else {
        const own = rows.find((r: TenantRow) => r.tenant_id === meData.tenant_id) ?? meData.tenant ?? null
        syncTenantForm(own)
      }

      const userRows = await api.admin.users()
      setUsers(userRows)
    } catch {
      setToken('')
      setMe(null)
      if (typeof window !== 'undefined') window.localStorage.removeItem('cityv-admin-token')
    }
  }, [syncTenantForm])

  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('cityv-admin-token') || ''
    if (saved) {
      setToken(saved)
      loadAdminData()
    }
  }, [loadAdminData])

  const login = async () => {
    setLoginState('loading')
    try {
      const host = typeof window !== 'undefined' ? window.location.hostname : 'localhost'
      const result = await api.admin.login({ username: loginUsername, password: loginPassword, host })
      const nextToken = result.access_token as string
      setToken(nextToken)
      if (typeof window !== 'undefined') window.localStorage.setItem('cityv-admin-token', nextToken)
      setLoginState('idle')
      await loadAdminData()
    } catch {
      setLoginState('error')
    }
  }

  const logout = () => {
    setToken('')
    setMe(null)
    setTemplates([])
    setUsers([])
    if (typeof window !== 'undefined') window.localStorage.removeItem('cityv-admin-token')
  }

  const toggleModule = (key: string) => {
    setModules((prev) => (prev.includes(key) ? prev.filter((m) => m !== key) : [...prev, key]))
  }

  const saveConfig = async () => {
    if (!selected) return
    setSaveState('saving')
    try {
      await api.admin.updateTenant(selected, {
        tenant_id: selected,
        tenant_name: tenantName,
        domain,
        region,
        locale,
        theme,
        data_profile: dataProfile,
        sensor_namespace: sensorNamespace,
        enabled_modules: modules,
      })
      await loadAdminData()
      setSaveState('saved')
      setTimeout(() => setSaveState('idle'), 1800)
    } catch {
      setSaveState('error')
    }
  }

  const createTenant = async () => {
    setNewTenantState('saving')
    try {
      await api.admin.createTenant({
        tenant_id: newTenantId,
        tenant_name: newTenantName,
        domain: newTenantDomain,
        region: newTenantRegion,
        locale: newTenantLocale,
        theme: newTenantTheme,
        data_profile: `${newTenantId}-profile`,
        sensor_namespace: newTenantId.replace(/-/g, '.'),
        enabled_modules: ['traffic', 'energy', 'waste', 'safety', 'air', 'citizens', 'venues', 'admin'],
      })
      setNewTenantState('saved')
      setNewTenantId('')
      setNewTenantName('')
      setNewTenantDomain('')
      setNewTenantRegion('')
      await loadAdminData()
      setTimeout(() => setNewTenantState('idle'), 1800)
    } catch {
      setNewTenantState('error')
    }
  }

  const createUser = async () => {
    setNewUserState('saving')
    try {
      await api.admin.createUser({
        username: newUsername,
        password: newUserPassword,
        role: newUserRole,
        tenant_id: isSuperAdmin ? newUserTenant : me?.tenant_id,
      })
      setNewUserState('saved')
      setNewUsername('')
      setNewUserPassword('')
      await loadAdminData()
      setTimeout(() => setNewUserState('idle'), 1800)
    } catch {
      setNewUserState('error')
    }
  }

  if (!token || !me) {
    return (
      <div className="max-w-md mx-auto mt-16 city-card">
        <h1 className="text-xl font-bold text-white mb-1">{tx('Tenant Admin Girisi', 'Tenant Admin Login')}</h1>
        <p className="text-sm text-slate-500 mb-5">{tx('Bu alana erisim icin kullanici adi ve sifre zorunludur.', 'Username and password are required to access this area.')}</p>
        <div className="space-y-3">
          <input
            value={loginUsername}
            onChange={(e) => setLoginUsername(e.target.value)}
            placeholder={tx('Kullanici adi', 'Username')}
            className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50"
          />
          <input
            type="password"
            value={loginPassword}
            onChange={(e) => setLoginPassword(e.target.value)}
            placeholder={tx('Sifre', 'Password')}
            className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50"
          />
          <button onClick={login} className="w-full inline-flex justify-center items-center gap-2 px-4 py-2 rounded-lg border border-city-cyan/30 text-city-cyan hover:bg-city-cyan/10 transition-colors text-sm font-medium">
            <LogIn size={15} />
            {loginState === 'loading' ? tx('Giris yapiliyor...', 'Signing in...') : tx('Giris Yap', 'Sign In')}
          </button>
          {loginState === 'error' && <p className="text-xs text-red-400">{tx('Giris basarisiz. Bilgileri kontrol edin.', 'Login failed. Please check credentials.')}</p>}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{tx('Tenant Admin', 'Tenant Admin')}</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            {tx('Admin tarafindan kayitli kullanici/domain modeli ile il ve arayuz baglantisi', 'City and interface binding via admin-registered user/domain model')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400">{me.username} · {me.role}</span>
          <button onClick={logout} className="px-3 py-2 rounded-lg border border-city-border text-slate-300 hover:bg-white/5 text-xs">{tx('Cikis', 'Logout')}</button>
          <button onClick={saveConfig} className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-city-cyan/30 text-city-cyan hover:bg-city-cyan/10 transition-colors text-sm font-medium">
            <Save size={15} />
            {saveState === 'saving' ? tx('Kaydediliyor...', 'Saving...') : saveState === 'saved' ? tx('Kaydedildi', 'Saved') : tx('Tenant Kaydet', 'Save Tenant')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          <div className="city-card">
            <div className="flex items-center gap-2 mb-4">
              <Building2 size={16} className="text-fuchsia-400" />
              <p className="text-sm font-medium text-slate-300">{tx('Tenant Secimi', 'Tenant Selection')}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              {templates.map((t) => (
                <button
                  key={t.tenant_id}
                  onClick={() => isSuperAdmin && syncTenantForm(t)}
                  className={`text-left rounded-xl border p-4 transition-colors ${selected === t.tenant_id ? 'border-fuchsia-500/50 bg-fuchsia-500/10' : 'border-city-border hover:border-slate-600 bg-white/2'} ${isSuperAdmin ? '' : 'cursor-default'}`}>
                  <p className="text-white font-medium text-sm">{t.tenant_name}</p>
                  <p className="text-xs text-slate-500 mt-1">{t.region}</p>
                  <p className="text-[11px] text-slate-500 mt-1">{t.domain}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="city-card">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal size={16} className="text-city-cyan" />
              <p className="text-sm font-medium text-slate-300">{tx('Tenant Ayarlari', 'Tenant Settings')}</p>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Tenant Adi', 'Tenant Name')}</span>
                <input value={tenantName} onChange={(e) => setTenantName(e.target.value)} disabled={!isSuperAdmin} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50 disabled:opacity-70" />
              </label>

              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Domain', 'Domain')}</span>
                <input value={domain} onChange={(e) => setDomain(e.target.value)} disabled={!isSuperAdmin} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50 disabled:opacity-70" />
              </label>

              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Bolge', 'Region')}</span>
                <input value={region} onChange={(e) => setRegion(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50" />
              </label>

              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Tema', 'Theme')}</span>
                <select value={theme} onChange={(e) => setTheme(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50">
                  <option value="cyan">Cyan</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </label>

              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Varsayilan Dil', 'Default Locale')}</span>
                <select value={locale} onChange={(e) => setLocale(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50">
                  <option value="tr">Turkce</option>
                  <option value="en">English</option>
                  <option value="es">Espanol</option>
                </select>
              </label>

              <label className="text-xs text-slate-500">
                <span className="mb-1 block">{tx('Veri Profili', 'Data Profile')}</span>
                <input value={dataProfile} onChange={(e) => setDataProfile(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50" />
              </label>

              <label className="text-xs text-slate-500 sm:col-span-2">
                <span className="mb-1 block">{tx('Sensor Namespace', 'Sensor Namespace')}</span>
                <input value={sensorNamespace} onChange={(e) => setSensorNamespace(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 outline-none focus:border-city-cyan/50" />
              </label>
            </div>
          </div>

          <div className="city-card">
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck size={16} className="text-green-400" />
              <p className="text-sm font-medium text-slate-300">{tx('Modul Yetkilendirme (8 Modul)', 'Module Entitlement (8 Modules)')}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {MODULES.map((m) => (
                <label key={m.key} className="flex items-center gap-2 text-sm text-slate-300 bg-white/2 border border-city-border rounded-lg px-3 py-2">
                  <input type="checkbox" checked={modules.includes(m.key)} onChange={() => toggleModule(m.key)} />
                  <span>{tx(m.tr, m.en)}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="city-card">
            <div className="flex items-center gap-2 mb-4">
              <UserPlus size={16} className="text-amber-400" />
              <p className="text-sm font-medium text-slate-300">{tx('Kullanici Olustur', 'Create User')}</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <input value={newUsername} onChange={(e) => setNewUsername(e.target.value)} placeholder={tx('Kullanici adi', 'Username')} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
              <input type="password" value={newUserPassword} onChange={(e) => setNewUserPassword(e.target.value)} placeholder={tx('Sifre', 'Password')} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
              <select value={newUserRole} onChange={(e) => setNewUserRole(e.target.value as 'tenant_user' | 'tenant_admin')} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200">
                <option value="tenant_user">tenant_user</option>
                <option value="tenant_admin">tenant_admin</option>
              </select>
              <select value={newUserTenant} onChange={(e) => setNewUserTenant(e.target.value)} disabled={!isSuperAdmin} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200 disabled:opacity-70">
                {templates.map((t) => <option key={t.tenant_id} value={t.tenant_id}>{t.tenant_name}</option>)}
              </select>
            </div>
            <button onClick={createUser} className="mt-3 px-4 py-2 rounded-lg border border-amber-400/30 text-amber-300 hover:bg-amber-400/10 text-sm">
              {newUserState === 'saving' ? tx('Olusturuluyor...', 'Creating...') : tx('Kullaniciyi Kaydet', 'Save User')}
            </button>
            {newUserState === 'error' && <p className="text-xs text-red-400 mt-2">{tx('Kullanici kaydi basarisiz.', 'User creation failed.')}</p>}
          </div>

          {isSuperAdmin && (
            <div className="city-card">
              <div className="flex items-center gap-2 mb-4">
                <Building2 size={16} className="text-indigo-400" />
                <p className="text-sm font-medium text-slate-300">{tx('Yeni Tenant Kaydi', 'Register New Tenant')}</p>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <input value={newTenantId} onChange={(e) => setNewTenantId(e.target.value)} placeholder="tenant_id (ankara-city)" className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
                <input value={newTenantName} onChange={(e) => setNewTenantName(e.target.value)} placeholder={tx('Tenant adi', 'Tenant name')} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
                <input value={newTenantDomain} onChange={(e) => setNewTenantDomain(e.target.value)} placeholder="ankara.city-v.com" className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
                <input value={newTenantRegion} onChange={(e) => setNewTenantRegion(e.target.value)} placeholder="TR-06 / Turkiye" className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200" />
                <select value={newTenantLocale} onChange={(e) => setNewTenantLocale(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200">
                  <option value="tr">Turkce</option>
                  <option value="en">English</option>
                  <option value="es">Espanol</option>
                </select>
                <select value={newTenantTheme} onChange={(e) => setNewTenantTheme(e.target.value)} className="w-full bg-city-bg border border-city-border rounded-lg px-3 py-2 text-slate-200">
                  <option value="cyan">Cyan</option>
                  <option value="emerald">Emerald</option>
                  <option value="amber">Amber</option>
                  <option value="rose">Rose</option>
                </select>
              </div>
              <button onClick={createTenant} className="mt-3 px-4 py-2 rounded-lg border border-indigo-400/30 text-indigo-300 hover:bg-indigo-400/10 text-sm">
                {newTenantState === 'saving' ? tx('Kaydediliyor...', 'Saving...') : tx('Tenanti Kaydet', 'Save Tenant')}
              </button>
              {newTenantState === 'error' && <p className="text-xs text-red-400 mt-2">{tx('Tenant kaydi basarisiz.', 'Tenant creation failed.')}</p>}
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="city-card">
            <div className="flex items-center gap-2 mb-3">
              <Globe size={15} className="text-indigo-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{tx('Domain Yetkisi', 'Domain Authorization')}</p>
            </div>
            <p className="text-sm text-slate-300 leading-relaxed">
              {tx('Kullanici girisinde host kontrol edilir. Kullanici sadece kendi tenant domaininde oturum acabilir.', 'Host is checked at login. A user can sign in only on their assigned tenant domain.')}
            </p>
          </div>

          <div className="city-card">
            <div className="flex items-center gap-2 mb-3">
              <Languages size={15} className="text-amber-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{tx('Dil / Yerellesme', 'Language / Localization')}</p>
            </div>
            <p className="text-xs text-slate-400">
              {tx('Tenant default locale alanindan otomatik dil secilir, kullanici isterse arayuzden degistirebilir.', 'Default language is selected from tenant locale, and users can still switch from UI.')}
            </p>
          </div>

          <div className="city-card">
            <div className="flex items-center gap-2 mb-3">
              <Palette size={15} className="text-pink-400" />
              <p className="text-xs text-slate-400 uppercase tracking-wider">{tx('Kullanici Listesi', 'User List')}</p>
            </div>
            <div className="space-y-2 max-h-80 overflow-auto pr-1">
              {users.map((u) => (
                <div key={u.username} className="rounded-lg border border-city-border bg-white/2 p-2 text-xs">
                  <p className="text-slate-200">{u.username}</p>
                  <p className="text-slate-500">{u.role} · {u.tenant_id || 'global'}</p>
                </div>
              ))}
              {users.length === 0 && <p className="text-xs text-slate-500">{tx('Kullanici bulunamadi', 'No users found')}</p>}
            </div>
          </div>
        </div>
      </div>

      {tenant && (
        <p className="text-xs text-slate-500">
          {tx('Aktif tenant:', 'Active tenant:')} <span className="text-slate-300">{tenant.tenant_name}</span> · {tenant.domain}
        </p>
      )}
    </div>
  )
}
