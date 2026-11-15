import { create } from 'zustand'
import { User as FirebaseUser } from 'firebase/auth'
import {
  onAuthChange,
  signIn as fbSignIn,
  signUp as fbSignUp,
  signOutUser as fbSignOut,
  resetPassword as fbResetPassword,
  signInWithGoogle as fbGoogleSignIn,
} from '@/lib/firebase/auth'
import { isDemoMode } from '@/lib/firebase/config'

function getFirebaseErrorMessage(code: string): string {
  switch (code) {
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-in is not enabled in Firebase Console yet. Please enable it under Authentication > Sign-in method.'
    case 'auth/configuration-not-found':
      return 'Authentication is not yet set up for this Firebase project. Please click "Get Started" in Firebase Authentication.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/user-not-found':
      return 'No account found with this email address.'
    case 'auth/wrong-password':
      return 'Incorrect password. Please try again.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Try signing in instead.'
    case 'auth/invalid-email':
      return 'Please enter a valid email address.'
    case 'auth/too-many-requests':
      return 'Too many failed attempts. Please wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Please check your connection and try again.'
    case 'auth/invalid-credential':
      return 'Invalid credentials. Please check your email and password.'
    case 'auth/popup-closed-by-user':
      return 'Sign-in popup was closed. Please try again.'
    default:
      return code ? `Firebase error: ${code}` : 'An error occurred. Please try again.'
  }
}

const DEMO_USER: FirebaseUser = {
  uid: 'demo-user-123',
  email: 'demo@examflow.app',
  displayName: 'Yogesh (Demo)',
  emailVerified: true,
  isAnonymous: false,
  metadata: {} as any,
  providerData: [],
  refreshToken: '',
  tenantId: null,
  delete: async () => {},
  getIdToken: async () => 'demo-token',
  getIdTokenResult: async () => ({} as any),
  reload: async () => {},
  toJSON: () => ({}),
  phoneNumber: null,
  photoURL: null,
  providerId: 'demo',
}

interface AuthState {
  user: FirebaseUser | null
  loading: boolean
  error: string | null
  initialized: boolean
  initialize: () => () => void
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<void>
  signInWithGoogle: () => Promise<void>
  signInAsDemo: () => void
  clearError: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: false,
  error: null,
  initialized: false,

  initialize: () => {
    if (isDemoMode) {
      const savedDemo = localStorage.getItem('examflow-demo-logged-in') === 'true'
      set({ initialized: true, user: savedDemo ? DEMO_USER : null, loading: false })
      return () => {}
    }
    const unsubscribe = onAuthChange((user) => {
      set({ user, initialized: true, loading: false })
    })
    return unsubscribe
  },

  signIn: async (email, password) => {
    set({ loading: true, error: null })
    if (isDemoMode) {
      localStorage.setItem('examflow-demo-logged-in', 'true')
      set({ user: { ...DEMO_USER, email }, loading: false })
      return
    }
    try {
      await fbSignIn(email, password)
      set({ loading: false })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      set({ loading: false, error: getFirebaseErrorMessage(code) })
      throw err
    }
  },

  signUp: async (email, password) => {
    set({ loading: true, error: null })
    if (isDemoMode) {
      localStorage.setItem('examflow-demo-logged-in', 'true')
      set({ user: { ...DEMO_USER, email }, loading: false })
      return
    }
    try {
      await fbSignUp(email, password)
      set({ loading: false })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      set({ loading: false, error: getFirebaseErrorMessage(code) })
      throw err
    }
  },

  signOut: async () => {
    set({ loading: true, error: null })
    localStorage.removeItem('examflow-demo-logged-in')
    if (isDemoMode) {
      set({ user: null, loading: false })
      return
    }
    try {
      await fbSignOut()
      set({ user: null, loading: false })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      set({ loading: false, error: getFirebaseErrorMessage(code) })
    }
  },

  resetPassword: async (email) => {
    set({ loading: true, error: null })
    if (isDemoMode) {
      set({ loading: false })
      return
    }
    try {
      await fbResetPassword(email)
      set({ loading: false })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      set({ loading: false, error: getFirebaseErrorMessage(code) })
      throw err
    }
  },

  signInWithGoogle: async () => {
    set({ loading: true, error: null })
    if (isDemoMode) {
      localStorage.setItem('examflow-demo-logged-in', 'true')
      set({ user: DEMO_USER, loading: false })
      return
    }
    try {
      await fbGoogleSignIn()
      set({ loading: false })
    } catch (err: unknown) {
      const code = (err as { code?: string }).code ?? ''
      set({ loading: false, error: getFirebaseErrorMessage(code) })
      throw err
    }
  },

  signInAsDemo: () => {
    localStorage.setItem('examflow-demo-logged-in', 'true')
    set({ user: DEMO_USER, loading: false, error: null, initialized: true })
  },

  clearError: () => set({ error: null }),
}))
