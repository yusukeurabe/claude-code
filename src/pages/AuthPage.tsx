import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

function getErrorMessage(msg: string): string {
  if (msg.includes('Invalid login credentials')) return 'メールアドレスまたはパスワードが正しくありません。'
  if (msg.includes('Email not confirmed')) return 'メールアドレスの確認が完了していません。確認メールをご確認ください。'
  if (msg.includes('User already registered')) return 'このメールアドレスはすでに登録されています。'
  if (msg.includes('Password should be at least')) return 'パスワードは6文字以上で入力してください。'
  if (msg.includes('Unable to validate email address')) return '有効なメールアドレスを入力してください。'
  if (msg.includes('Signup is disabled')) return '現在、新規登録は無効になっています。'
  return msg
}

export default function AuthPage() {
  const { signIn, signUp, user, loading } = useAuth()
  const navigate = useNavigate()

  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // すでにログイン済みならダッシュボードへリダイレクト
  useEffect(() => {
    if (!loading && user) {
      navigate('/', { replace: true })
    }
  }, [user, loading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setMessage(null)
    setSubmitting(true)

    if (isSignUp) {
      const { data, error } = await signUp(email, password, fullName)
      if (error) {
        setError(getErrorMessage(error.message))
      } else if (data?.session) {
        // メール認証なし → 即ログイン成功
        navigate('/', { replace: true })
      } else {
        // メール認証あり → 確認メール案内
        setMessage('確認メールを送信しました。メールを確認してからログインしてください。')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(getErrorMessage(error.message))
      }
      // 成功時は onAuthStateChange が発火 → useEffect がリダイレクト
    }

    setSubmitting(false)
  }

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp)
    setError(null)
    setMessage(null)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        読み込み中...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">業務報告アプリ</h1>
          <p className="text-gray-500 mt-1 text-sm">
            {isSignUp ? 'アカウントを作成してください' : 'アカウントにログインしてください'}
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                お名前
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                required={isSignUp}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="山田 太郎"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              メールアドレス
            </label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="example@company.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              パスワード
            </label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="6文字以上"
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">
              {error}
            </div>
          )}
          {message && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
              {message}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-medium py-2.5 rounded-lg transition-colors"
          >
            {submitting ? '処理中...' : isSignUp ? 'アカウント作成' : 'ログイン'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-gray-600 mt-6">
          {isSignUp ? 'すでにアカウントをお持ちですか？' : 'アカウントをお持ちでないですか？'}
          {' '}
          <button
            onClick={handleToggleMode}
            className="text-blue-600 hover:underline font-medium"
          >
            {isSignUp ? 'ログイン' : '新規登録'}
          </button>
        </p>
      </div>
    </div>
  )
}
