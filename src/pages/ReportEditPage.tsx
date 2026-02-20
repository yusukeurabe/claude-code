import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import ReportForm from '../components/reports/ReportForm'
import type { Report, ReportFormData } from '../types'

export default function ReportEditPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const { reports, updateReport } = useReports(user?.id)
  const navigate = useNavigate()
  const [report, setReport] = useState<Report | null>(null)

  useEffect(() => {
    const found = reports.find(r => r.id === id)
    if (found) setReport(found)
  }, [reports, id])

  const handleSubmit = async (data: ReportFormData) => {
    if (!id) return { error: 'IDが見つかりません' }
    const result = await updateReport(id, data)
    if (!result.error) navigate(`/reports/${id}`)
    return result
  }

  if (!report) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 text-center text-gray-500">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-2"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">報告書を編集</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ReportForm
          initialData={report}
          onSubmit={handleSubmit}
          onCancel={() => navigate(`/reports/${id}`)}
        />
      </div>
    </div>
  )
}
