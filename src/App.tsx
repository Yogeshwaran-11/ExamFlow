import React, { Suspense, useEffect } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { AppShell } from '@/components/layout/AppShell'
import { LoginPage } from '@/components/auth/LoginPage'
import { RegisterPage } from '@/components/auth/RegisterPage'
import { ForgotPasswordPage } from '@/components/auth/ForgotPasswordPage'
import { useAuthStore } from '@/store/useAuthStore'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'
import { useSyllabusStore } from '@/store/useSyllabusStore'
import { useFirestoreSync } from '@/hooks/useFirestoreSync'

// Lazy-loaded pages
const TodayPage = React.lazy(() => import('@/pages/TodayPage'))
const PlanPage = React.lazy(() => import('@/pages/PlanPage'))
const SubjectsPage = React.lazy(() => import('@/pages/SubjectsPage'))
const SubjectDetailPage = React.lazy(() => import('@/pages/SubjectDetailPage'))
const SyllabusPage = React.lazy(() => import('@/pages/SyllabusPage'))
const StatsPage = React.lazy(() => import('@/pages/StatsPage'))
const NotesPage = React.lazy(() => import('@/pages/NotesPage'))
const SettingsPage = React.lazy(() => import('@/pages/SettingsPage'))
const TimerPage = React.lazy(() => import('@/pages/TimerPage'))
const ExamMorningPage = React.lazy(() => import('@/pages/ExamMorningPage'))

function PageFallback() {
  return (
    <div className="flex items-center justify-center min-h-[40vh]">
      <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard>
      <AppShell>
        <Suspense fallback={<PageFallback />}>
          {children}
        </Suspense>
      </AppShell>
    </AuthGuard>
  )
}

export default function App() {
  const initializeAuth = useAuthStore((s) => s.initialize)
  const user = useAuthStore((s) => s.user)
  const initialized = useAuthStore((s) => s.initialized)
  const initializeStore = useStudyPlanStore((s) => s.initializeStore)
  const initializeSyllabus = useSyllabusStore((s) => s.initializeSyllabus)

  useFirestoreSync()

  useEffect(() => {
    const unsubscribe = initializeAuth()
    return unsubscribe
  }, [initializeAuth])

  useEffect(() => {
    if (initialized) {
      initializeStore(user?.uid || 'default_user')
      initializeSyllabus(user?.uid || 'default_user')
    }
  }, [user?.uid, initialized, initializeStore, initializeSyllabus])

  return (
    <Routes>
      {/* Auth routes */}
      <Route path="/auth/login" element={<LoginPage />} />
      <Route path="/auth/register" element={<RegisterPage />} />
      <Route path="/auth/forgot" element={<ForgotPasswordPage />} />

      {/* Protected routes */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <TodayPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/plan"
        element={
          <ProtectedRoute>
            <PlanPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects"
        element={
          <ProtectedRoute>
            <SubjectsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/subjects/:subjectId"
        element={
          <ProtectedRoute>
            <SubjectDetailPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/syllabus"
        element={
          <ProtectedRoute>
            <SyllabusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/syllabus/:subjectId"
        element={
          <ProtectedRoute>
            <SyllabusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/stats"
        element={
          <ProtectedRoute>
            <StatsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/notes"
        element={
          <ProtectedRoute>
            <NotesPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <SettingsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/timer"
        element={
          <ProtectedRoute>
            <TimerPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/exam-morning/:subjectId"
        element={
          <ProtectedRoute>
            <ExamMorningPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/syllabus"
        element={
          <ProtectedRoute>
            <SyllabusPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/syllabus/:subjectId"
        element={
          <ProtectedRoute>
            <SyllabusPage />
          </ProtectedRoute>
        }
      />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
