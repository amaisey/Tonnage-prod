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
        const previousUser = user
        setUser(session?.user ?? null)

        if (event === 'SIGNED_IN' && !previousUser && session?.user) {
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

  const signInWithApple = useCallback(async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'apple',
      options: { redirectTo: window.location.origin }
    })
    if (error) throw error
    return data
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    const { error } = await supabase.auth.signOut()
    if (error) throw error
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
    signInWithApple,
    signOut,
    supabaseConfigured: !!supabase
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}
