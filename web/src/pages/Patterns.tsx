import { useEffect, useState, useCallback } from 'react'
import { Plus, Search, Pencil, Trash2, ChevronUp, ChevronDown } from 'lucide-react'
import { patternsApi } from '../services/api'
import { useUiStore } from '../store/uiStore'
import { t } from '../i18n'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Badge } from '../components/ui/Badge'
import { Toggle } from '../components/ui/Toggle'
import { Modal } from '../components/ui/Modal'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { Pagination } from '../components/ui/Pagination'
import { PageSpinner } from '../components/ui/Spinner'
import { EmptyState } from '../components/ui/EmptyState'
import { Input, Select } from '../components/ui/Input'
import type { PhishingPattern, PatternType, Language, Severity, PatternStatus } from '../types'
import { mockPatterns } from '../services/mockData'

const PAGE_SIZE = 20

type SortKey = keyof PhishingPattern
type SortDir = 'asc' | 'desc'

interface PatternForm {
  pattern: string
  type: PatternType
  language: Language
  severity: Severity
  status: PatternStatus
}

const defaultForm: PatternForm = { pattern: '', type: 'keyword', language: 'pt', severity: 'medium', status: 'active' }

export function Patterns() {
  const { language, addToast } = useUiStore()
  const [loading, setLoading] = useState(true)
  const [patterns, setPatterns] = useState<PhishingPattern[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterLang, setFilterLang] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterStatus, setFilterStatus] = useState('')
  const [sortKey, setSortKey] = useState<SortKey>('createdAt')
  const [sortDir, setSortDir] = useState<SortDir>('desc')
  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState<PhishingPattern | null>(null)
  const [form, setForm] = useState<PatternForm>(defaultForm)
  const [formError, setFormError] = useState('')
  const [saving, setSaving] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState<PhishingPattern | null>(null)
  const [deleting, setDeleting] = useState(false)
  const [toggling, setToggling] = useState<string | null>(null)

  const fetchPatterns = useCallback(async () => {
    setLoading(true)
    try {
      const params: Record<string, string | number> = {
        page, pageSize: PAGE_SIZE, sortKey, sortDir,
        ...(search && { search }),
        ...(filterType && { type: filterType }),
        ...(filterLang && { language: filterLang }),
        ...(filterSeverity && { severity: filterSeverity }),
        ...(filterStatus && { status: filterStatus }),
      }
      const res = await patternsApi.list(params)
      setPatterns(res.data.data)
      setTotal(res.data.total)
    } catch {
      // fallback to mock
      let data = [...mockPatterns]
      if (search) data = data.filter((p) => p.pattern.includes(search))
      if (filterType) data = data.filter((p) => p.type === filterType)
      if (filterLang) data = data.filter((p) => p.language === filterLang)
      if (filterSeverity) data = data.filter((p) => p.severity === filterSeverity)
      if (filterStatus) data = data.filter((p) => p.status === filterStatus)
      setTotal(data.length)
      setPatterns(data.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE))
    } finally {
      setLoading(false)
    }
  }, [page, search, filterType, filterLang, filterSeverity, filterStatus, sortKey, sortDir])

  useEffect(() => { fetchPatterns() }, [fetchPatterns])

  const handleSort = (key: SortKey) => {
    if (key === sortKey) setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    else { setSortKey(key); setSortDir('asc') }
  }

  const openAdd = () => { setEditing(null); setForm(defaultForm); setFormError(''); setModalOpen(true) }
  const openEdit = (p: PhishingPattern) => {
    setEditing(p)
    setForm({ pattern: p.pattern, type: p.type, language: p.language, severity: p.severity, status: p.status })
    setFormError('')
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!form.pattern.trim()) { setFormError(t(language, 'patternRequired')); return }
    setSaving(true)
    try {
      if (editing) {
        await patternsApi.update(editing.id, form as unknown as Record<string, unknown>)
      } else {
        await patternsApi.create(form as unknown as Record<string, unknown>)
      }
      addToast('success', t(language, editing ? 'updated' : 'saved'))
      setModalOpen(false)
      fetchPatterns()
    } catch {
      // mock: apply locally
      if (editing) {
        setPatterns((prev) => prev.map((p) => p.id === editing.id ? { ...p, ...form } : p))
        addToast('success', t(language, 'updated'))
      } else {
        const newP: PhishingPattern = { id: Date.now().toString(), ...form, matchCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
        setPatterns((prev) => [newP, ...prev])
        addToast('success', t(language, 'saved'))
      }
      setModalOpen(false)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!deleteTarget) return
    setDeleting(true)
    try {
      await patternsApi.delete(deleteTarget.id)
      addToast('success', t(language, 'deleted'))
    } catch {
      setPatterns((prev) => prev.filter((p) => p.id !== deleteTarget.id))
      addToast('success', t(language, 'deleted'))
    } finally {
      setDeleting(false)
      setDeleteTarget(null)
      fetchPatterns()
    }
  }

  const handleToggle = async (p: PhishingPattern) => {
    const newStatus = p.status === 'active' ? 'inactive' : 'active'
    setToggling(p.id)
    try {
      await patternsApi.toggleStatus(p.id, newStatus)
      addToast('success', t(language, 'updated'))
    } catch {
      setPatterns((prev) => prev.map((x) => x.id === p.id ? { ...x, status: newStatus } : x))
      addToast('success', t(language, 'updated'))
    } finally {
      setToggling(null)
    }
  }

  const SortIcon = ({ k }: { k: SortKey }) =>
    sortKey === k ? (sortDir === 'asc' ? <ChevronUp size={13} /> : <ChevronDown size={13} />) : null

  const totalPages = Math.ceil(total / PAGE_SIZE)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-text">{t(language, 'patterns')}</h1>
        <Button onClick={openAdd}><Plus size={16} />{t(language, 'addNewPattern')}</Button>
      </div>

      {/* Filters */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="relative flex-1 min-w-48">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={t(language, 'searchPatterns')}
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              className="w-full rounded-lg border border-slate-600 bg-surface-2 py-2 pl-9 pr-3 text-sm text-text placeholder-slate-500 focus:border-primary focus:outline-none"
            />
          </div>
          {[
            { label: t(language, 'filterByType'), value: filterType, onChange: (v: string) => { setFilterType(v); setPage(1) }, options: [['keyword', t(language, 'keyword')], ['url', 'URL'], ['regex', 'Regex']] },
            { label: t(language, 'filterByLanguage'), value: filterLang, onChange: (v: string) => { setFilterLang(v); setPage(1) }, options: [['pt', 'PT'], ['en', 'EN'], ['both', t(language, 'both')]] },
            { label: t(language, 'filterBySeverity'), value: filterSeverity, onChange: (v: string) => { setFilterSeverity(v); setPage(1) }, options: [['low', t(language, 'low')], ['medium', t(language, 'medium')], ['high', t(language, 'high')]] },
            { label: t(language, 'filterByStatus'), value: filterStatus, onChange: (v: string) => { setFilterStatus(v); setPage(1) }, options: [['active', t(language, 'active')], ['inactive', t(language, 'inactive')]] },
          ].map(({ label, value, onChange, options }) => (
            <select
              key={label}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              className="rounded-lg border border-slate-600 bg-surface-2 px-3 py-2 text-sm text-text focus:border-primary focus:outline-none"
            >
              <option value="">{label}: {t(language, 'all')}</option>
              {options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
            </select>
          ))}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {loading ? <PageSpinner /> : patterns.length === 0 ? (
          <EmptyState message={t(language, 'noResults')} />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-700">
                  {([
                    ['pattern', t(language, 'patternText')],
                    ['type', t(language, 'type')],
                    ['language', t(language, 'language')],
                    ['severity', t(language, 'severity')],
                    ['status', t(language, 'status')],
                    ['matchCount', t(language, 'matches')],
                    [null, t(language, 'actions')],
                  ] as [SortKey | null, string][]).map(([k, label]) => (
                    <th
                      key={label}
                      onClick={() => k && handleSort(k)}
                      className={`pb-3 text-left text-xs font-medium uppercase tracking-wider text-text-muted ${k ? 'cursor-pointer hover:text-text select-none' : ''}`}
                    >
                      <span className="inline-flex items-center gap-1">{label}{k && <SortIcon k={k} />}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700/50">
                {patterns.map((p) => (
                  <tr key={p.id} className="hover:bg-surface-2/50 transition-colors">
                    <td className="py-3 font-mono text-xs text-text max-w-xs truncate">{p.pattern}</td>
                    <td className="py-3 text-text-muted capitalize">{p.type}</td>
                    <td className="py-3 text-text-muted uppercase">{p.language}</td>
                    <td className="py-3"><Badge severity={p.severity}>{t(language, p.severity)}</Badge></td>
                    <td className="py-3">
                      <Toggle checked={p.status === 'active'} onChange={() => handleToggle(p)} disabled={toggling === p.id} />
                    </td>
                    <td className="py-3 text-text-muted">{p.matchCount.toLocaleString()}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-2">
                        <button onClick={() => openEdit(p)} className="text-text-muted hover:text-primary transition-colors p-1 rounded hover:bg-surface-2">
                          <Pencil size={15} />
                        </button>
                        <button onClick={() => setDeleteTarget(p)} className="text-text-muted hover:text-red-400 transition-colors p-1 rounded hover:bg-surface-2">
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
          </div>
        )}
      </Card>

      {/* Add/Edit Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? t(language, 'editPattern') : t(language, 'addNewPattern')}>
        <div className="space-y-4">
          <Input
            label={t(language, 'patternText')}
            value={form.pattern}
            onChange={(e) => setForm({ ...form, pattern: e.target.value })}
            error={formError}
          />
          <div className="grid grid-cols-2 gap-4">
            <Select label={t(language, 'type')} value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as PatternType })}>
              <option value="keyword">{t(language, 'keyword')}</option>
              <option value="url">URL</option>
              <option value="regex">Regex</option>
            </Select>
            <Select label={t(language, 'language')} value={form.language} onChange={(e) => setForm({ ...form, language: e.target.value as Language })}>
              <option value="pt">PT</option>
              <option value="en">EN</option>
              <option value="both">{t(language, 'both')}</option>
            </Select>
            <Select label={t(language, 'severity')} value={form.severity} onChange={(e) => setForm({ ...form, severity: e.target.value as Severity })}>
              <option value="low">{t(language, 'low')}</option>
              <option value="medium">{t(language, 'medium')}</option>
              <option value="high">{t(language, 'high')}</option>
            </Select>
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-text-muted">{t(language, 'status')}</label>
              <div className="flex items-center gap-2 pt-2">
                <Toggle checked={form.status === 'active'} onChange={(c) => setForm({ ...form, status: c ? 'active' : 'inactive' })} />
                <span className="text-sm text-text-muted">{form.status === 'active' ? t(language, 'active') : t(language, 'inactive')}</span>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setModalOpen(false)} disabled={saving}>{t(language, 'cancel')}</Button>
            <Button onClick={handleSave} loading={saving}>{t(language, 'save')}</Button>
          </div>
        </div>
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={t(language, 'deletePattern')}
        message={t(language, 'confirmDeleteMsg')}
        confirmLabel={t(language, 'delete')}
        loading={deleting}
      />
    </div>
  )
}
