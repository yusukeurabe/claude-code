import { Link } from 'react-router-dom'
import type { Report } from '../../types'

interface Props {
  report: Report
  onDelete: (id: string) => void
}

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

export default function ReportCard({ report, onDelete }: Props) {
  const workHours = calcWorkHours(report.start_time, report.end_time)

  const handleDelete = () => {
    if (window.confirm('この日報を削除しますか？')) {
      onDelete(report.id)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all p-5">
      {/* Top row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <Link to={`/reports/${report.id}`} className="block">
            <h3 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors truncate text-base">
              {report.title}
            </h3>
          </Link>
          <p className="text-sm text-gray-500 mt-0.5">{formatDate(report.report_date)}</p>
        </div>

        <div className="flex items-center gap-1 shrink-0">
          <Link
            to={`/reports/${report.id}/edit`}
            className="text-xs text-gray-400 hover:text-blue-600 px-2 py-1 rounded transition-colors"
          >
            編集
          </Link>
          <button
            onClick={handleDelete}
            className="text-xs text-gray-400 hover:text-red-500 px-2 py-1 rounded transition-colors"
          >
            削除
          </button>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-2 mb-3">
        <span className="text-xs bg-purple-50 text-purple-600 px-2 py-0.5 rounded-full font-medium">
          {report.report_type}
        </span>
        {report.category && (
          <span
            className="text-xs px-2 py-0.5 rounded-full font-medium"
            style={{
              backgroundColor: report.category.color + '20',
              color: report.category.color,
            }}
          >
            {report.category.name}
          </span>
        )}
        {workHours && (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {formatTime(report.start_time)}〜{formatTime(report.end_time)}（{workHours}）
          </span>
        )}
      </div>

      {/* Body preview */}
      {report.body && (
        <p className="text-sm text-gray-600 line-clamp-2 mb-3">{report.body}</p>
      )}

      {/* Tags */}
      {report.tags.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {report.tags.map(tag => (
            <span key={tag} className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">
              #{tag}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
