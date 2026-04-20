import { useEffect, useState, useCallback } from 'react'
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { ShieldX, Smartphone, ListFilter, Clock } from 'lucide-react'
import { format } from 'date-fns'
import { overviewApi } from '../services/api'
import { useUiStore } from '../store/uiStore'
import { usePolling } from '../hooks/usePolling'
import { t } from '../i18n'
import { StatCard, Card } from '../components/ui/Card'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Badge } from '../components/ui/Badge'
import type { OverviewStats, BlocksPerDay, BlocksByPlatform, TopPattern, BlockedMessage } from '../types'
import {
  mockStats, mockBlocksPerDay, mockBlocksByPlatform,
  mockTopPatterns, mockMessages
} from '../services/mockData'

const PLATFORM_COLORS = { android: '#00C2FF', ios: '#8B5CF6' }
const SEVERITY_COLORS = { low: '#22C55E', medium: '#F59E0B', high: '#EF4444' }

export function Overview() {
  const { language, addToast } = useUiStore()
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [blocksPerDay, setBlocksPerDay] = useState<BlocksPerDay[]>([])
  const [byPlatform, setByPlatform] = useState<BlocksByPlatform[]>([])
  const [topPatterns, setTopPatterns] = useState<TopPattern[]>([])
  const [recent, setRecent] = useState<BlockedMessage[]>([])

  const fetchAll = useCallback(async () => {
    try {
      const [statsRes, daysRes, platformRes, patternsRes, recentRes] = await Promise.allSettled([
        overviewApi.getStats(),
        overviewApi.getBlocksPerDay(),
        overviewApi.getBlocksByPlatform(),
        overviewApi.getTopPatterns(),
        overviewApi.getRecentBlocked(),
      ])

      setStats(statsRes.status === 'fulfilled' ? statsRes.value.data : mockStats)
      setBlocksPerDay(daysRes.status === 'fulfilled' ? daysRes.value.data : mockBlocksPerDay)
      setByPlatform(platformRes.status === 'fulfilled' ? platformRes.value.data : mockBlocksByPlatform)
      setTopPatterns(patternsRes.status === 'fulfilled' ? patternsRes.value.data : mockTopPatterns)
      setRecent(recentRes.status === 'fulfilled' ? recentRes.value.data : mockMessages.slice(0, 10))
    } catch {
      addToast('error', t(language, 'errorFetch'))
    } finally {
      setLoading(false)
    }
  }, [language, addToast])

  useEffect(() => { fetchAll() }, [fetchAll])
  usePolling(fetchAll, 30_000)

  if (loading) return <PageSpinner />

  const pieData = byPlatform.map((p) => ({
    name: p.platform === 'android' ? t(language, 'android') : t(language, 'ios'),
    value: p.count,
    color: PLATFORM_COLORS[p.platform],
  }))

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold text-text">{t(language, 'overview')}</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title={t(language, 'totalBlocked')}
          value={stats?.totalBlocked ?? 0}
          subtitle={t(language, 'allTime')}
          icon={<ShieldX size={22} />}
        />
        <StatCard
          title={t(language, 'activeDevices')}
          value={stats?.activeDevices ?? 0}
          subtitle={t(language, 'last30Days')}
          icon={<Smartphone size={22} />}
          color="text-violet-400"
        />
        <StatCard
          title={t(language, 'activePatterns')}
          value={stats?.activePatterns ?? 0}
          icon={<ListFilter size={22} />}
          color="text-emerald-400"
        />
        <StatCard
          title={t(language, 'blockedLast24h')}
          value={stats?.blockedLast24h ?? 0}
          subtitle={t(language, 'last24Hours')}
          icon={<Clock size={22} />}
          color="text-orange-400"
        />
      </div>

      {/* Charts row 1 */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card title={t(language, 'blocksPerDay')} className="lg:col-span-2">
          {blocksPerDay.length === 0 ? (
            <EmptyState message={t(language, 'noData')} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={blocksPerDay}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                <XAxis dataKey="date" tick={{ fill: '#94A3B8', fontSize: 11 }} tickFormatter={(v) => v.slice(5)} />
                <YAxis tick={{ fill: '#94A3B8', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }}
                />
                <Line type="monotone" dataKey="count" stroke="#00C2FF" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          )}
        </Card>

        <Card title={t(language, 'blocksByPlatform')}>
          {pieData.length === 0 ? (
            <EmptyState message={t(language, 'noData')} />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" paddingAngle={3}>
                  {pieData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }}
                />
                <Legend formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </Card>
      </div>

      {/* Charts row 2 */}
      <Card title={t(language, 'topPatterns')}>
        {topPatterns.length === 0 ? (
          <EmptyState message={t(language, 'noData')} />
        ) : (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topPatterns} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
              <XAxis type="number" tick={{ fill: '#94A3B8', fontSize: 11 }} />
              <YAxis type="category" dataKey="patternText" tick={{ fill: '#94A3B8', fontSize: 11 }} width={160} />
              <Tooltip
                contentStyle={{ backgroundColor: '#1E293B', border: '1px solid #334155', borderRadius: 8, color: '#F1F5F9' }}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {topPatterns.map((p, i) => (
                  <Cell key={i} fill={SEVERITY_COLORS[p.severity]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>

      {/* Recent blocked table */}
      <Card title={t(language, 'recentBlocked')}>
        {recent.length === 0 ? (
          <EmptyState message={t(language, 'noData')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {[t(language, 'sender'), t(language, 'patternMatched'), t(language, 'severity'), t(language, 'platform'), t(language, 'dateTime')].map((h) => (
                    <th key={h} className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {recent.map((msg) => (
                  <tr key={msg.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-text">{msg.sender}</td>
                    <td className="py-3 max-w-xs truncate text-text-muted">{msg.patternText}</td>
                    <td className="py-3"><Badge severity={msg.severity}>{t(language, msg.severity)}</Badge></td>
                    <td className="py-3"><Badge platform={msg.platform}>{msg.platform}</Badge></td>
                    <td className="py-3 text-text-muted">{format(new Date(msg.blockedAt), 'dd/MM HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  )
}
