import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import { useCategories } from '../hooks/useCategories'
import ReportForm from '../components/reports/ReportForm'
import type { ReportFormData } from '../types'

export default function ReportNewPage() {
  const { user } = useAuth()
  const { createReport } = useReports(user?.id)
  const { categories } = useCategories(user?.id)
  const navigate = useNavigate()

  const handleSubmit = async (data: ReportFormData) => {
    const result = await createReport(data)
    if (!result.error) navigate('/')
    return result
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
        <h1 className="text-2xl font-bold text-gray-900">新規日報作成</h1>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <ReportForm
          categories={categories}
          onSubmit={handleSubmit}
          onCancel={() => navigate('/')}
        />
      </div>
    </div>
  )
}
