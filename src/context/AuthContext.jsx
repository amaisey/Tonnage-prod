import { createContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'

export const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isFirstLogin, setIsFirstLogin] = useState(false)

  useEffect(() => {
    if (!supabase) {
      setIsLoading(false)
      return
    }

    // Restore session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        // Only update user state when the identity actually changes,
        // not on TOKEN_REFRESHED or other events that return the same user.
        // Avoids creating a new object reference that restarts the sync loop.
        setUser(prev => {
          const incoming = session?.user ?? null
          if (prev?.id === incoming?.id) return prev
          return incoming
        })

        if (event === 'SIGNED_IN' && session?.user) {
          // Check if this is first login (no cloud data yet)
          try {
            const { count } = await supabase
              .from('workouts')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', session.user.id)

            if (count === 0) {
              setIsFirstLogin(true)
            }
          } catch (err) {
            console.warn('Could not check first login status:', err)
          }
        }

        if (event === 'SIGNED_OUT') {
          setIsFirstLogin(false)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const signUp = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signUp({ email, password })
    if (error) throw error
    return data
  }, [])

  const signIn = useCallback(async (email, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
    return data
  }, [])

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    // Clear user state FIRST for immediate UI response.
    // supabase.auth.signOut() can hang in Brave due to async internal cleanup
    // (BroadcastChannel, storage events). By clearing state first, the UI
    // updates instantly regardless of what Supabase does internally.
    setUser(null)
    setIsFirstLogin(false)

    if (!supabase) return
    try {
      await supabase.auth.signOut({ scope: 'local' })
    } catch (err) {
      console.error('Sign out error:', err)
    }
  }, [])

  const clearFirstLogin = useCallback(() => {
    setIsFirstLogin(false)
  }, [])

  const value = {
    user,
    isLoading,
    isFirstLogin,
    clearFirstLogin,
    signUp,
    signIn,
    signInWithGoogle,
    signOut,
    supabaseConfigured: !!supabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
