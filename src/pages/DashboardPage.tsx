import { useState, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import { useCategories } from '../hooks/useCategories'
import ReportCard from '../components/reports/ReportCard'
import type { ReportFilters } from '../types'

const emptyFilters: ReportFilters = {
  search: '',
  category_id: '',
  date_from: '',
  date_to: '',
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { reports, loading, fetchReports, deleteReport } = useReports(user?.id)
  const { categories } = useCategories(user?.id)
  const [filters, setFilters] = useState<ReportFilters>(emptyFilters)
  const [applied, setApplied] = useState<ReportFilters>(emptyFilters)

  const set = <K extends keyof ReportFilters>(key: K, value: string) =>
    setFilters(prev => ({ ...prev, [key]: value }))

  const applyFilters = useCallback(() => {
    setApplied(filters)
    fetchReports(filters)
  }, [filters, fetchReports])

  const clearFilters = () => {
    setFilters(emptyFilters)
    setApplied(emptyFilters)
    fetchReports(emptyFilters)
  }

  const hasFilters = Object.values(applied).some(v => v !== '')

  const handleDelete = async (id: string) => {
    await deleteReport(id)
  }

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') applyFilters()
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <StatCard label="総日報数" value={reports.length} />
        <StatCard
          label="今月の日報"
          value={reports.filter(r => r.report_date.startsWith(new Date().toISOString().slice(0, 7))).length}
        />
        <StatCard
          label="今週の日報"
          value={(() => {
            const now = new Date()
            const monday = new Date(now)
            monday.setDate(now.getDate() - now.getDay() + 1)
            monday.setHours(0, 0, 0, 0)
            return reports.filter(r => new Date(r.report_date + 'T00:00:00') >= monday).length
          })()}
        />
        <StatCard label="カテゴリ数" value={categories.length} />
      </div>

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-3">
          {/* Search */}
          <div className="sm:col-span-2">
            <input
              type="text"
              value={filters.search}
              onChange={e => set('search', e.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="タイトル・本文で検索..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          {/* Category */}
          <div>
            <select
              value={filters.category_id}
              onChange={e => set('category_id', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">すべてのカテゴリ</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          {/* Date from */}
          <div>
            <input
              type="date"
              value={filters.date_from}
              onChange={e => set('date_from', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="開始日"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-start-4">
            <input
              type="date"
              value={filters.date_to}
              onChange={e => set('date_to', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="終了日"
            />
          </div>
        </div>

        <div className="flex justify-between items-center mt-3">
          <div>
            {hasFilters && (
              <button
                onClick={clearFilters}
                className="text-sm text-gray-400 hover:text-gray-600 transition-colors"
              >
                フィルタをクリア
              </button>
            )}
          </div>
          <button
            onClick={applyFilters}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors"
          >
            検索・フィルタ適用
          </button>
        </div>
      </div>

      {/* Results header */}
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-500">
          {loading ? '読み込み中...' : `${reports.length} 件`}
          {hasFilters && ' (フィルタ適用中)'}
        </p>
        <Link
          to="/reports/new"
          className="text-sm text-blue-600 hover:text-blue-700 font-medium"
        >
          + 新規作成
        </Link>
      </div>

      {/* Report list */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">読み込み中...</div>
      ) : reports.length === 0 ? (
        <EmptyState hasFilters={hasFilters} onClear={clearFilters} />
      ) : (
        <div className="space-y-4">
          {reports.map(report => (
            <ReportCard key={report.id} report={report} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  )
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 text-center">
      <p className="text-2xl font-bold text-blue-600">{value}</p>
      <p className="text-xs text-gray-500 mt-1">{label}</p>
    </div>
  )
}

function EmptyState({ hasFilters, onClear }: { hasFilters: boolean; onClear: () => void }) {
  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">📋</div>
      {hasFilters ? (
        <>
          <p className="text-gray-500 mb-3">条件に一致する日報が見つかりませんでした。</p>
          <button onClick={onClear} className="text-blue-600 hover:underline text-sm">
            フィルタをクリア
          </button>
        </>
      ) : (
        <>
          <p className="text-gray-500 mb-3">まだ日報がありません。</p>
          <Link
            to="/reports/new"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
          >
            最初の日報を作成する
          </Link>
        </>
      )}
    </div>
  )
}
