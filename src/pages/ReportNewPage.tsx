import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { useReports } from '../hooks/useReports'
import { generateReport } from '../lib/claude'

const REPORT_TYPES = ['日報', '週報', '月報', 'その他'] as const

type Phase = 'input' | 'generating' | 'review'

export default function ReportNewPage() {
  const { user } = useAuth()
  const { createReport } = useReports(user?.id)
  const navigate = useNavigate()

  const today = new Date().toISOString().slice(0, 10)

  const [phase, setPhase] = useState<Phase>('input')
  const [reportDate, setReportDate] = useState(today)
  const [reportType, setReportType] = useState<string>('日報')
  const [rawInput, setRawInput] = useState('')
  const [generatedBody, setGeneratedBody] = useState('')
  const [title, setTitle] = useState('')
  const [isListening, setIsListening] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [speechSupported, setSpeechSupported] = useState(false)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const recognitionRef = useRef<any>(null)

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const getSR = (): any => (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition

  useEffect(() => {
    setSpeechSupported(!!getSR())
  }, [])

  const handleVoiceToggle = () => {
    const SR = getSR()
    if (!SR) return

    if (isListening) {
      recognitionRef.current?.stop()
      setIsListening(false)
      return
    }

    const recognition = new SR()
    recognition.lang = 'ja-JP'
    recognition.continuous = true
    recognition.interimResults = false

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    recognition.onresult = (event: any) => {
      const transcript = Array.from(event.results as any[])
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        .map((r: any) => r[0].transcript)
        .join('')
      setRawInput(prev => prev ? prev + '\n' + transcript : transcript)
    }
    recognition.onerror = () => setIsListening(false)
    recognition.onend = () => setIsListening(false)

    recognition.start()
    recognitionRef.current = recognition
    setIsListening(true)
  }

  const handleGenerate = async () => {
    if (!rawInput.trim()) { setError('業務メモを入力してください'); return }
    setError(null)
    setPhase('generating')

    try {
      const result = await generateReport(rawInput, reportType, reportDate)
      setGeneratedBody(result)
      setTitle(`${reportType} ${reportDate}`)
      setPhase('review')
    } catch (e) {
      setError(e instanceof Error ? e.message : 'AI生成に失敗しました')
      setPhase('input')
    }
  }

  const handleSave = async () => {
    if (!title.trim()) { setError('タイトルを入力してください'); return }
    if (!generatedBody.trim()) { setError('報告書の内容が空です'); return }

    setIsSaving(true)
    setError(null)

    const result = await createReport({
      title,
      report_date: reportDate,
      body: generatedBody,
      start_time: '',
      end_time: '',
      category_id: '',
      tags: [],
      tomorrow_plan: '',
      impression: '',
      raw_input: rawInput,
      report_type: reportType,
    })

    setIsSaving(false)
    if (!result.error) {
      navigate('/')
    } else {
      setError(result.error)
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1 mb-3"
        >
          ← 戻る
        </button>
        <h1 className="text-2xl font-bold text-gray-900">日報を生成する</h1>
        <p className="text-sm text-gray-500 mt-1">業務メモを入力するだけで、AIが整った報告書を自動生成します</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-6">

        {/* フェーズ1: 入力 */}
        {(phase === 'input' || phase === 'generating') && (
          <>
            {/* 日付・タイプ */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">日付</label>
                <input
                  type="date"
                  value={reportDate}
                  onChange={e => setReportDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">報告書タイプ</label>
                <select
                  value={reportType}
                  onChange={e => setReportType(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  {REPORT_TYPES.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* 業務メモ入力 */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                業務メモ
                <span className="text-gray-400 font-normal ml-2">（箇条書きや自由記述でOK）</span>
              </label>
              <textarea
                value={rawInput}
                onChange={e => setRawInput(e.target.value)}
                rows={8}
                placeholder={`例:\n・朝会に参加\n・ログイン周りのバグを修正\n・コードレビュー2件\n・午後は新機能の設計`}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y text-sm"
                disabled={phase === 'generating'}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex items-center gap-3">
              {/* 音声入力ボタン */}
              <button
                type="button"
                onClick={handleVoiceToggle}
                disabled={!speechSupported || phase === 'generating'}
                title={!speechSupported ? 'このブラウザは音声入力に対応していません（Chrome/Edge推奨）' : ''}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors
                  ${isListening
                    ? 'bg-red-50 border-red-300 text-red-600 animate-pulse'
                    : speechSupported
                      ? 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-50 border-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                    d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
                {isListening ? '録音中... (クリックで停止)' : '音声入力'}
              </button>

              {/* AI生成ボタン */}
              <button
                type="button"
                onClick={handleGenerate}
                disabled={phase === 'generating' || !rawInput.trim()}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
              >
                {phase === 'generating' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                    </svg>
                    AIが報告書を生成中...
                  </>
                ) : (
                  <>✨ AIで生成する</>
                )}
              </button>
            </div>
          </>
        )}

        {/* フェーズ2: 確認・保存 */}
        {phase === 'review' && (
          <>
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-gray-900">生成された報告書</h2>
              <span className="text-xs bg-purple-50 text-purple-600 px-2 py-1 rounded-full font-medium">{reportType}</span>
            </div>

            {/* タイトル */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">タイトル</label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* 生成結果（編集可能） */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                内容
                <span className="text-gray-400 font-normal ml-2">（編集できます）</span>
              </label>
              <textarea
                value={generatedBody}
                onChange={e => setGeneratedBody(e.target.value)}
                rows={14}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-y font-mono text-sm"
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
                {error}
              </div>
            )}

            {/* アクションボタン */}
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => { setPhase('input'); setError(null) }}
                className="flex items-center gap-1 px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                ← 再生成する
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={isSaving}
                className="flex-1 flex items-center justify-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium rounded-lg transition-colors"
              >
                {isSaving ? '保存中...' : '💾 保存する'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
