import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { format, subDays } from 'date-fns'
import { statisticsApi } from '../services/api'
import { useUiStore } from '../store/uiStore'
import { t } from '../i18n'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { mockBlocksPerDay, mockTopPatterns } from '../services/mockData'

type Granularity = 'daily' | 'weekly' | 'monthly'

const PLATFORM_COLORS = { Android: '#00C2FF', iOS: '#8B5CF6' }
const LANG_COLORS: Record<string, string> = { pt: '#00C2FF', en: '#8B5CF6' }

function buildDefaultRange() {
  return { from: format(subDays(new Date(), 29), 'yyyy-MM-dd'), to: format(new Date(), 'yyyy-MM-dd') }
}

export function Statistics() {
  const { language, addToast } = useUiStore()
  const [loading, setLoading] = useState(true)
  const [granularity, setGranularity] = useState<Granularity>('daily')
  const [range, setRange] = useState(buildDefaultRange)

  const [blocksOverTime, setBlocksOverTime] = useState<{ date: string; count: number }[]>([])
  const [byPlatform, setByPlatform] = useState<{ platform: string; count: number }[]>([])
  const [bySeverity, setBySeverity] = useState<{ name: string; value: number; color: string }[]>([])
  const [byLanguage, setByLanguage] = useState<{ language: string; count: number }[]>([])
  const [topPatterns, setTopPatterns] = useState(mockTopPatterns)

  const fetchAll = useCallback(async () => {
    setLoading(true)
    const params = { from: range.from, to: range.to, granularity }
    try {
      const [timeRes, platRes, sevRes, langRes, topRes] = await Promise.allSettled([
        statisticsApi.getBlocksOverTime(params),
        statisticsApi.getBlocksByPlatform(params),
        statisticsApi.getBlocksBySeverity(params),
        statisticsApi.getBlocksByLanguage(params),
        statisticsApi.getTopPatterns(params),
      ])
      setBlocksOverTime(timeRes.status === 'fulfilled' ? timeRes.value.data : mockBlocksPerDay)
      setByPlatform(platRes.status === 'fulfilled' ? platRes.value.data : [{ platform: 'Android', count: 31204 }, { platform: 'iOS', count: 17087 }])
      setBySeverity(sevRes.status === 'fulfilled' ? sevRes.value.data : [
        { name: 'Low', value: 12000, color: '#22C55E' },
        { name: 'Medium', value: 22000, color: '#F59E0B' },
        { name: 'High', value: 14291, color: '#EF4444' },
      ])
      setByLanguage(langRes.status === 'fulfilled' ? langRes.value.data : [{ language: 'pt', count: 35000 }, { language: 'en', count: 13291 }])
      setTopPatterns(topRes.status === 'fulfilled' ? topRes.value.data : mockTopPatterns)
    } catch {
      addToast('error', t(language, 'errorFetch'))
    } finally {
      setLoading(false)
    }
  }, [range, granularity, language, addToast])

  useEffect(() => { fetchAll() }, [fetchAll])

  if (loading) return <PageSpinner />

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-text">{t(language, 'statistics')}</h1>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <label className="text-sm text-text-muted">{t(language, 'dateRange')}:</label>
            <input type="date" value={range.from} onChange={(e) => setRange((r) => ({ ...r, from: e.target.value }))}
              className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
            <span className="text-text-muted">–</span>
            <input type="date" value={range.to} onChange={(e) => setRange((r) => ({ ...r, to: e.target.value }))}
              className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-1.5 text-sm text-text focus:border-primary focus:outline-none" />
          </div>
          <div className="flex rounded-lg border border-slate-600 overflow-hidden">
            {(['daily', 'weekly', 'monthly'] as Granularity[]).map((g) => (
              <button key={g} onClick={() => setGranularity(g)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${granularity === g ? 'bg-primary text-background' : 'bg-surface-2 text-text-muted hover:text-text'}`}>
                {t(language, g)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Blocks over time */}
      <Card title={t(language, 'blocksPerDay')}>
        {blocksOverTime.length === 0 ? <EmptyState message={t(language, 'noData')} /> : (
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={blocksOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }} />
              <Line type="monotone" dataKey="count" stroke="#00C2FF" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Platform + Severity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card title={t(language, 'blocksByPlatform')}>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={byPlatform}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis dataKey="platform" tick={{ fill: '#94A3B8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }} />
              <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                {byPlatform.map((p, i) => (
                  <Cell key={i} fill={PLATFORM_COLORS[p.platform as keyof typeof PLATFORM_COLORS] ?? '#00C2FF'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title={t(language, 'blocksBySeverity')}>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={bySeverity} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                {bySeverity.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }} />
              <Legend formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Language */}
      <Card title={t(language, 'blocksByLanguage')}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={byLanguage}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
            <XAxis dataKey="language" tick={{ fill: '#94A3B8', fontSize: 12 }} />
            <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
            <Tooltip contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }} />
            <Bar dataKey="count" radius={[4, 4, 0, 0]}>
              {byLanguage.map((p, i) => (
                <Cell key={i} fill={LANG_COLORS[p.language] ?? '#00C2FF'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Top patterns table */}
      <Card title={t(language, 'topMatchedPatterns')}>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700">
                {[t(language, 'patternText'), t(language, 'matches'), t(language, 'lastMatched'), t(language, 'severity')].map((h) => (
                  <th key={h} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {topPatterns.map((p) => (
                <tr key={p.patternId} className="hover:bg-surface-2/50">
                  <td className="py-3 font-mono text-xs text-text max-w-xs truncate">{p.patternText}</td>
                  <td className="py-3 text-text-muted">{p.count.toLocaleString()}</td>
                  <td className="py-3 text-text-muted">{format(new Date(p.lastMatched), 'dd/MM/yyyy HH:mm')}</td>
                  <td className="py-3"><Badge severity={p.severity}>{t(language, p.severity)}</Badge></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
