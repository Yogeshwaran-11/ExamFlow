import { useEffect } from 'react'
import { useAuthStore } from '@/store/useAuthStore'
import { useStudyPlanStore } from '@/store/useStudyPlanStore'

export function useAuth() {
  const {
    user,
    loading,
    error,
    initialized,
    signIn,
    signUp,
    signOut,
    resetPassword,
    signInWithGoogle,
    clearError,
    initialize,
  } = useAuthStore()

  const { initializeStore, clearStore } = useStudyPlanStore()

  // Initialize auth listener on mount
  useEffect(() => {
    const unsub = initialize()
    return () => {
      if (typeof unsub === 'function') unsub()
    }
  }, [initialize])

  // Sync study plan store with auth state changes
  useEffect(() => {
    if (!initialized) return

    if (user?.uid) {
      initializeStore(user.uid)
    } else {
      // When logged out, reset store or load default offline state
      clearStore()
      initializeStore('default_user')
    }
  }, [user?.uid, initialized, initializeStore, clearStore])

  const handleSignOut = async () => {
    await signOut()
    clearStore()
    initializeStore('default_user')
  }

  return {
    user,
    loading,
    error,
    initialized,
    isAuthenticated: !!user,
    signIn,
    signUp,
    signOut: handleSignOut,
    resetPassword,
    signInWithGoogle,
    clearError,
  }
}
