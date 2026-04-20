import { useEffect, useState, useCallback } from 'react'
import { Search, Download, Smartphone, Apple, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { messagesApi } from '../services/api'
import { useUiStore } from '../store/uiStore'
import { t } from '../i18n'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import type { BlockedMessage } from '../types'
import { mockMessages } from '../services/mockData'

const PAGE_SIZE = 20
type SortKey = keyof BlockedMessage
type SortDir = 'asc' | 'desc'

export function Messages() {
  const { language } = useUiStore()
  const [loading, setLoading] = useState(true)
  const [messages, setMessages] = useState<BlockedMessage[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [fromDate, setFromDate] = useState('')
  const [toDate, setToDate] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('blockedAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [selected, setSelected] = useState<BlockedMessage | null>(null)

  const fetchMessages = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page, pageSize: PAGE_SIZE, sortKey, sortDir,
        ...(search && { search }),
        ...(filterPlatform && { platform: filterPlatform }),
        ...(filterSeverity && { severity: filterSeverity }),
        ...(fromDate && { from: fromDate }),
        ...(toDate && { to: toDate }),
      }
      const res = await messagesApi.list(params)
      setMessages(res.data.data)
      setTotal(res.data.total)
    } catch {
      let data = [...mockMessages]
      if (search) data = data.filter((m) => m.sender.includes(search) || m.patternText.includes(search))
      if (filterPlatform) data = data.filter((m) => m.platform === filterPlatform)
      if (filterSeverity) data = data.filter((m) => m.severity === filterSeverity)
      setTotal(data.length)
      const sorted = [...data].sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
      setMessages(sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
    } finally {
      setLoading(false)
    }
  }, [page, search, filterPlatform, filterSeverity, fromDate, toDate, sortKey, sortDir])

  useEffect(() => { fetchMessages() }, [fetchMessages])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const exportCSV = () => {
    const headers = ['deviceId', 'sender', 'patternText', 'severity', 'platform', 'appVersion', 'blockedAt']
    const rows = messages.map((m) => headers.map((h) => ((m as unknown) as Record<string, unknown>)[h] ?? '').join(','))
    const csv = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url; a.download = 'blocked-messages.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">{t(language, 'messages')}</h1>
        <Button variant="secondary" onClick={exportCSV}><Download size={16} />{t(language, 'exportCSV')}</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t(language, 'searchMessages')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-slate-600 bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder-slate-500 focus:border-primary focus:outline-none"
            />
          </div>
          <select value={filterPlatform} onChange={(e) => { setFilterPlatform(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">{t(language, 'platform')}: {t(language, 'all')}</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
          <select value={filterSeverity} onChange={(e) => { setFilterSeverity(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">{t(language, 'severity')}: {t(language, 'all')}</option>
            <option value="low">{t(language, 'low')}</option>
            <option value="medium">{t(language, 'medium')}</option>
            <option value="high">{t(language, 'high')}</option>
          </select>
          <input type="date" value={fromDate} onChange={(e) => { setFromDate(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
          <input type="date" value={toDate} onChange={(e) => { setToDate(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none" />
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <PageSpinner /> : messages.length === 0 ? <EmptyState message={t(language, 'noResults')} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {([
                    ['deviceId', t(language, 'deviceId')],
                    ['sender', t(language, 'sender')],
                    ['patternText', t(language, 'patternMatched')],
                    ['severity', t(language, 'severity')],
                    ['platform', t(language, 'platform')],
                    ['appVersion', t(language, 'appVersion')],
                    ['blockedAt', t(language, 'dateTime')],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} onClick={() => handleSort(k)}
                      className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted cursor-pointer hover:text-text select-none">
                      <span className="inline-flex items-center gap-1">{label}<SortIcon k={k} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {messages.map((m) => (
                  <tr key={m.id} onClick={() => setSelected(m)}
                    className="hover:bg-surface-2/50 transition-colors cursor-pointer">
                    <td className="py-3 font-mono text-xs text-text-muted">{m.deviceId}</td>
                    <td className="py-3 font-mono text-xs text-text">{m.sender}</td>
                    <td className="py-3 max-w-xs truncate text-text-muted text-xs">{m.patternText}</td>
                    <td className="py-3"><Badge severity={m.severity}>{t(language, m.severity)}</Badge></td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        {m.platform === 'android' ? <Smartphone size={14} className="text-green-400" /> : <Apple size={14} className="text-blue-400" />}
                        <span className="capitalize text-xs">{m.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-text-muted">{m.appVersion}</td>
                    <td className="py-3 text-xs text-text-muted">{format(new Date(m.blockedAt), 'dd/MM/yyyy HH:mm')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Detail modal */}
      {selected && (
        <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={t(language, 'messageDetails')}>
          <div className="space-y-3 text-sm">
            {[
              [t(language, 'deviceId'), selected.deviceId],
              [t(language, 'sender'), selected.sender],
              [t(language, 'patternMatched'), selected.patternText],
              [t(language, 'appVersion'), selected.appVersion],
              [t(language, 'blockedAt'), format(new Date(selected.blockedAt), 'dd/MM/yyyy HH:mm:ss')],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
                <span className="text-text-muted">{label}</span>
                <span className="text-text font-mono text-xs text-right">{value}</span>
              </div>
            ))}
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <span className="text-text-muted">{t(language, 'severity')}</span>
              <Badge severity={selected.severity}>{t(language, selected.severity)}</Badge>
            </div>
            <div className="flex justify-between gap-4 border-b border-slate-700/50 pb-2">
              <span className="text-text-muted">{t(language, 'platform')}</span>
              <Badge platform={selected.platform}>{selected.platform}</Badge>
            </div>
            {selected.rawContent && (
              <div>
                <p className="mb-2 text-text-muted">{t(language, 'rawContent')}</p>
                <div className="rounded-lg bg-surface-2 p-3 font-mono text-xs text-text-muted leading-relaxed">
                  {selected.rawContent}
                </div>
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  )
}
