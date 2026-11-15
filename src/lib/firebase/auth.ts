import { auth } from './config'
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
  User,
} from 'firebase/auth'

export const signIn = (email: string, password: string) =>
  signInWithEmailAndPassword(auth, email, password)

export const signUp = (email: string, password: string) =>
  createUserWithEmailAndPassword(auth, email, password)

export const signOutUser = () => signOut(auth)

export const resetPassword = (email: string) =>
  sendPasswordResetEmail(auth, email)

export const signInWithGoogle = () =>
  signInWithPopup(auth, new GoogleAuthProvider())

export const onAuthChange = (callback: (user: User | null) => void) =>
  onAuthStateChanged(auth, callback)
