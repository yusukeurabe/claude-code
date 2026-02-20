import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import Header from './components/layout/Header'
import AuthPage from './pages/AuthPage'
import DashboardPage from './pages/DashboardPage'
import ReportNewPage from './pages/ReportNewPage'
import ReportEditPage from './pages/ReportEditPage'
import ReportDetailPage from './pages/ReportDetailPage'

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  if (loading) return <div className="min-h-screen flex items-center justify-center text-gray-400">読み込み中...</div>
  if (!user) return <Navigate to="/auth" replace />
  return <>{children}</>
}

function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main>{children}</main>
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout><DashboardPage /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/new"
          element={
            <PrivateRoute>
              <AppLayout><ReportNewPage /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <PrivateRoute>
              <AppLayout><ReportDetailPage /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route
          path="/reports/:id/edit"
          element={
            <PrivateRoute>
              <AppLayout><ReportEditPage /></AppLayout>
            </PrivateRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
