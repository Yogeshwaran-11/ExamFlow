import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '@/store/useAuthStore'
import { isDemoMode } from '@/lib/firebase/config'
import { Zap } from 'lucide-react'

const schema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
})

type FormData = z.infer<typeof schema>

export function LoginPage() {
  const navigate = useNavigate()
  const { signIn, signInWithGoogle, signInAsDemo, loading, error, clearError } = useAuthStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  const onSubmit = async (data: FormData) => {
    clearError()
    try {
      await signIn(data.email, data.password)
      navigate('/')
    } catch {
      // error handled in store
    }
  }

  const handleGoogle = async () => {
    clearError()
    try {
      await signInWithGoogle()
      navigate('/')
    } catch {
      // error handled in store
    }
  }

  const handleDemoAccess = () => {
    signInAsDemo()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-primary-50/20 to-gray-100 dark:from-gray-950 dark:via-primary-950/10 dark:to-gray-950 flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-500 to-primary-600 mb-4 shadow-lg shadow-primary-500/25">
            <Zap className="w-8 h-8 text-white fill-white" />
          </div>
          <h1 className="text-3xl font-black text-gray-900 dark:text-white tracking-tight">
            Exam<span className="text-primary-500">Flow</span>
          </h1>
          <p className="mt-1.5 text-sm text-gray-500 dark:text-gray-400">
            Your intelligent exam preparation companion
          </p>
        </div>

        {/* Demo mode — prominent primary CTA */}
        {isDemoMode && (
          <div className="mb-6">
            <button
              type="button"
              onClick={handleDemoAccess}
              className="w-full flex items-center justify-center gap-2.5 py-4 px-5 bg-primary-600 hover:bg-primary-700 active:scale-[0.99] text-white rounded-2xl font-bold text-sm shadow-lg shadow-primary-500/25 transition-all min-h-[52px]"
            >
              <Zap className="w-5 h-5 fill-white" />
              Enter App — Explore Demo
            </button>
            <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-2">
              No account needed · Full features · Data saved locally
            </p>

            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
              <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">or sign in with account</span>
              <div className="flex-1 h-px bg-gray-200 dark:bg-gray-800" />
            </div>
          </div>
        )}

        {/* Auth card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 p-6">
          {!isDemoMode && (
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-5">Sign in</h2>
          )}

          {/* Error */}
          {error && (
            <div className="mb-4 bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-xl p-3 animate-fade-in">
              <p className="text-red-600 dark:text-red-400 text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                Email
              </label>
              <input
                {...register('email')}
                type="email"
                autoComplete="email"
                placeholder="you@university.edu"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 ${
                  errors.email ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.email && (
                <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300">
                  Password
                </label>
                <Link
                  to="/auth/forgot"
                  className="text-xs text-primary-600 dark:text-primary-400 hover:underline"
                >
                  Forgot?
                </Link>
              </div>
              <input
                {...register('password')}
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className={`w-full px-4 py-3 rounded-xl border bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-all focus:ring-2 focus:ring-primary-500 focus:border-primary-500 focus:bg-white dark:focus:bg-gray-800 ${
                  errors.password ? 'border-red-400 dark:border-red-500' : 'border-gray-200 dark:border-gray-700'
                }`}
              />
              {errors.password && (
                <p className="mt-1 text-xs text-red-500">{errors.password.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-gray-900 dark:bg-white hover:bg-gray-800 dark:hover:bg-gray-100 disabled:opacity-60 disabled:cursor-not-allowed text-white dark:text-gray-900 rounded-xl px-4 py-3 font-bold text-sm transition-colors flex items-center justify-center gap-2 min-h-[48px]"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-100 dark:border-gray-800" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-white dark:bg-gray-900 px-3 text-gray-400">or</span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleGoogle}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 font-medium text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-60 min-h-[48px]"
          >
            {/* Google "G" SVG */}
            <svg width="18" height="18" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" fill="#FFC107"/>
              <path d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" fill="#FF3D00"/>
              <path d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0124 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" fill="#4CAF50"/>
              <path d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 01-4.087 5.571l.003-.002 6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z" fill="#1976D2"/>
            </svg>
            Continue with Google
          </button>

          <p className="mt-5 text-center text-sm text-gray-500 dark:text-gray-400">
            New here?{' '}
            <Link to="/auth/register" className="text-primary-600 dark:text-primary-400 font-semibold hover:underline">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
