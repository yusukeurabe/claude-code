import { useState, useEffect } from 'react'
import type { Report, ReportFormData, Category } from '../../types'

interface Props {
  initialData?: Report
  categories: Category[]
  onSubmit: (data: ReportFormData) => Promise<{ error: string | null }>
  onCancel: () => void
}

const today = new Date().toISOString().split('T')[0]

const empty: ReportFormData = {
  title: '',
  report_date: today,
  body: '',
  start_time: '',
  end_time: '',
  category_id: '',
  tags: [],
  tomorrow_plan: '',
  impression: '',
}

export default function ReportForm({ initialData, categories, onSubmit, onCancel }: Props) {
  const [form, setForm] = useState<ReportFormData>(empty)
  const [tagInput, setTagInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title,
        report_date: initialData.report_date,
        body: initialData.body,
        start_time: initialData.start_time ?? '',
        end_time: initialData.end_time ?? '',
        category_id: initialData.category_id ?? '',
        tags: initialData.tags,
        tomorrow_plan: initialData.tomorrow_plan ?? '',
        impression: initialData.impression ?? '',
      })
    }
  }, [initialData])

  const set = <K extends keyof ReportFormData>(key: K, value: ReportFormData[K]) =>
    setForm(prev => ({ ...prev, [key]: value }))

  const addTag = () => {
    const tag = tagInput.trim()
    if (tag && !form.tags.includes(tag)) {
      set('tags', [...form.tags, tag])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) =>
    set('tags', form.tags.filter(t => t !== tag))

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') { e.preventDefault(); addTag() }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!form.title.trim()) { setError('タイトルを入力してください'); return }
    setLoading(true)
    setError(null)
    const { error } = await onSubmit(form)
    setLoading(false)
    if (error) setError(error)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
          {error}
        </div>
      )}

      {/* タイトル・日付 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="sm:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            タイトル <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={form.title}
            onChange={e => set('title', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="例：〇〇機能の実装"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            日付 <span className="text-red-500">*</span>
          </label>
          <input
            type="date"
            value={form.report_date}
            onChange={e => set('report_date', e.target.value)}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 作業時間・カテゴリ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">開始時刻</label>
          <input
            type="time"
            value={form.start_time}
            onChange={e => set('start_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">終了時刻</label>
          <input
            type="time"
            value={form.end_time}
            onChange={e => set('end_time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">カテゴリ</label>
          <select
            value={form.category_id}
            onChange={e => set('category_id', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">なし</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* タグ */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">タグ</label>
        <div className="flex gap-2 flex-wrap mb-2">
          {form.tags.map(tag => (
            <span key={tag} className="inline-flex items-center gap-1 bg-blue-100 text-blue-700 text-sm px-2 py-0.5 rounded-full">
              #{tag}
              <button type="button" onClick={() => removeTag(tag)} className="hover:text-red-500">×</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={tagInput}
            onChange={e => setTagInput(e.target.value)}
            onKeyDown={handleTagKeyDown}
            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="タグを入力して Enter"
          />
          <button
            type="button"
            onClick={addTag}
            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
          >
            追加
          </button>
        </div>
      </div>

      {/* 本文 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          業務内容 <span className="text-red-500">*</span>
        </label>
        <textarea
          value={form.body}
          onChange={e => set('body', e.target.value)}
          rows={6}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="今日の業務内容を記述してください"
        />
      </div>

      {/* 所感 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">所感・振り返り</label>
        <textarea
          value={form.impression}
          onChange={e => set('impression', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="今日の感想や気づいたこと"
        />
      </div>

      {/* 明日の予定 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">明日の予定</label>
        <textarea
          value={form.tomorrow_plan}
          onChange={e => set('tomorrow_plan', e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y"
          placeholder="明日の作業予定を記述してください"
        />
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="px-5 py-2 border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
        >
          キャンセル
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-lg text-sm font-medium transition-colors"
        >
          {loading ? '保存中...' : initialData ? '更新する' : '作成する'}
        </button>
      </div>
    </form>
  )
}
