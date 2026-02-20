import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import type { Report } from '../types'

function formatDate(dateStr: string) {
  const d = new Date(dateStr + 'T00:00:00')
  return d.toLocaleDateString('ja-JP', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'short' })
}

function formatTime(t: string | null) {
  if (!t) return null
  return t.slice(0, 5)
}

function calcWorkHours(start: string | null, end: string | null): string | null {
  if (!start || !end) return null
  const [sh, sm] = start.split(':').map(Number)
  const [eh, em] = end.split(':').map(Number)
  const minutes = (eh * 60 + em) - (sh * 60 + sm)
  if (minutes <= 0) return null
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return m > 0 ? `${h}時間${m}分` : `${h}時間`
}

interface SectionProps { title: string; children: React.ReactNode }
function Section({ title, children }: SectionProps) {
  return (
    <div className="border-t border-gray-100 pt-5">
      <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">{title}</h2>
      {children}
    </div>
  )
}

export default function ReportDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { reports, deleteReport } = useReports(user?.id)
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    const found = reports.find(r => r.id === id)
    if (found) setReport(found)
  }, [reports, id])

  const handleDelete = async () => {
    if (!id || !window.confirm('この日報を削除しますか？')) return
    const { error } = await deleteReport(id)
    if (!error) navigate('/')
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  const workHours = calcWorkHours(report.start_time, report.end_time)

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-6"
      >
        ← 一覧に戻る
      </button>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-5">
        {/* Title & actions */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{report.title}</h1>
            <p className="text-gray-500 mt-1">{formatDate(report.report_date)}</p>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              to={`/reports/${report.id}/edit`}
              className="text-sm px-3 py-1.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              編集
            </Link>
            <button
              onClick={handleDelete}
              className="text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              削除
            </button>
          </div>
        </div>

        {/* Meta badges */}
        <div className="flex flex-wrap gap-2">
          <span className="text-sm bg-purple-50 text-purple-600 px-3 py-1 rounded-full font-medium">
            {report.report_type}
          </span>
          {report.category && (
            <span
              className="text-sm px-3 py-1 rounded-full font-medium"
              style={{
                backgroundColor: report.category.color + '20',
                color: report.category.color,
              }}
            >
              {report.category.name}
            </span>
          )}
          {workHours && (
            <span className="text-sm bg-gray-100 text-gray-600 px-3 py-1 rounded-full flex items-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {formatTime(report.start_time)}〜{formatTime(report.end_time)}（{workHours}）
            </span>
          )}
          {report.tags.map(tag => (
            <span key={tag} className="text-sm bg-blue-50 text-blue-600 px-3 py-1 rounded-full">
              #{tag}
            </span>
          ))}
        </div>

        {/* Body */}
        <Section title="業務内容">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{report.body}</p>
        </Section>

        {/* Impression */}
        {report.impression && (
          <Section title="所感・振り返り">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{report.impression}</p>
          </Section>
        )}

        {/* Tomorrow plan */}
        {report.tomorrow_plan && (
          <Section title="明日の予定">
            <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{report.tomorrow_plan}</p>
          </Section>
        )}

        {/* 元のメモ */}
        {report.raw_input && (
          <Section title="元の業務メモ">
            <p className="text-gray-600 whitespace-pre-wrap leading-relaxed text-sm bg-gray-50 rounded-lg p-3">
              {report.raw_input}
            </p>
          </Section>
        )}

        {/* Footer */}
        <div className="border-t border-gray-100 pt-4 text-xs text-gray-400">
          作成日時: {new Date(report.created_at).toLocaleString('ja-JP')}
          {report.updated_at !== report.created_at &&
            ` / 更新日時: ${new Date(report.updated_at).toLocaleString('ja-JP')}`}
        </div>
      </div>
    </div>
  )
}
