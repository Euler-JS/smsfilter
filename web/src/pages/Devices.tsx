import { useEffect, useState, useCallback } from 'react'
import { Smartphone, Apple, ChevronUp, ChevronDown } from 'lucide-react'
import { format } from 'date-fns'
import { devicesApi } from '../services/api'
import { useUiStore } from '../store/uiStore'
import { t } from '../i18n'
import { Card } from '../components/ui/Card'
import { Badge } from '../components/ui/Badge'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import type { Device } from '../types'
import { mockDevices } from '../services/mockData'

const PAGE_SIZE = 20
type SortKey = keyof Device
type SortDir = 'asc' | 'desc'

export function Devices() {
  const { language } = useUiStore()
  const [loading, setLoading] = useState(true)
  const [devices, setDevices] = useState<Device[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [filterPlatform, setFilterPlatform] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('lastActive')
  const [sortDir, setSortDir] = useState<SortDir>('desc')

  const fetch = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page, pageSize: PAGE_SIZE, sortKey, sortDir,
        ...(filterPlatform && { platform: filterPlatform }),
        ...(filterStatus && { status: filterStatus }),
      }
      const res = await devicesApi.list(params)
      setDevices(res.data.data)
      setTotal(res.data.total)
    } catch {
      let data = [...mockDevices]
      if (filterPlatform) data = data.filter((d) => d.platform === filterPlatform)
      if (filterStatus) data = data.filter((d) => d.status === filterStatus)
      setTotal(data.length)
      const sorted = [...data].sort((a, b) => {
        const av = String(a[sortKey] ?? '')
        const bv = String(b[sortKey] ?? '')
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av)
      })
      setDevices(sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
    } finally {
      setLoading(false)
    }
  }, [page, filterPlatform, filterStatus, sortKey, sortDir])

  useEffect(() => { fetch() }, [fetch])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">{t(language, 'devices')}</h1>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <select value={filterPlatform} onChange={(e) => { setFilterPlatform(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">{t(language, 'platform')}: {t(language, 'all')}</option>
            <option value="android">Android</option>
            <option value="ios">iOS</option>
          </select>
          <select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setPage(1) }}
            className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none">
            <option value="">{t(language, 'status')}: {t(language, 'all')}</option>
            <option value="active">{t(language, 'active')}</option>
            <option value="expired">{t(language, 'expired')}</option>
          </select>
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <PageSpinner /> : devices.length === 0 ? <EmptyState message={t(language, 'noResults')} /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {([
                    ['deviceId', t(language, 'deviceId')],
                    ['platform', t(language, 'platform')],
                    ['appVersion', t(language, 'appVersion')],
                    ['totalBlocked', t(language, 'totalMessages')],
                    ['lastActive', t(language, 'lastActive')],
                    ['status', t(language, 'protectionStatus')],
                  ] as [SortKey, string][]).map(([k, label]) => (
                    <th key={k} onClick={() => handleSort(k)}
                      className="pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted cursor-pointer hover:text-text select-none">
                      <span className="inline-flex items-center gap-1">{label}<SortIcon k={k} /></span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {devices.map((d) => (
                  <tr key={d.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-text-muted">{d.deviceId}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5 text-text-muted">
                        {d.platform === 'android'
                          ? <Smartphone size={14} className="text-green-400" />
                          : <Apple size={14} className="text-blue-400" />}
                        <span className="capitalize text-xs">{d.platform}</span>
                      </div>
                    </td>
                    <td className="py-3 text-xs text-text-muted">{d.appVersion}</td>
                    <td className="py-3 text-text-muted">{d.totalBlocked.toLocaleString()}</td>
                    <td className="py-3 text-xs text-text-muted">{format(new Date(d.lastActive), 'dd/MM/yyyy HH:mm')}</td>
                    <td className="py-3">
                      <Badge status={d.status}>
                        {d.status === 'active' ? t(language, 'active') : t(language, 'expired')}
                      </Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>
    </div>
  )
}
