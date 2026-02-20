import { useState } from 'react'
import type { Report, ReportFormData } from '../../types'

interface Props {
  initialData?: Report
  onSubmit: (data: ReportFormData) => Promise<{ error: string | null }>
  onCancel: () => void
}

export default function ReportForm({ initialData, onSubmit, onCancel }: Props) {
  const today = new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState(initialData?.title ?? '')
  const [body, setBody] = useState(initialData?.body ?? '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) { setError('タイトルを入力してください'); return }
    if (!body.trim()) { setError('報告書の内容を入力してください'); return }

    setLoading(true)
    setError(null)

    const submitData: ReportFormData = {
      title,
      report_date: initialData?.report_date ?? today,
      body,
      start_time: initialData?.start_time ?? '',
      end_time: initialData?.end_time ?? '',
      category_id: initialData?.category_id ?? '',
      tags: initialData?.tags ?? [],
      tomorrow_plan: initialData?.tomorrow_plan ?? '',
      impression: initialData?.impression ?? '',
      raw_input: initialData?.raw_input ?? '',
      report_type: initialData?.report_type ?? '日報',
    }

    const result = await onSubmit(submitData)
    if (result.error) setError(result.error)
    setLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
        <input
          type="text"
          value={title}
          onChange={e => setTitle(e.target.value)}
          required
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="例：日報 2024-01-15"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">報告書の内容</label>
        <textarea
          value={body}
          onChange={e => setBody(e.target.value)}
          required
          rows={14}
          className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y font-mono text-sm"
        />
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 rounded-lg transition-colors"
        >
          {loading ? '保存中...' : '更新する'}
        </button>
      </div>
    </form>
  )
}
