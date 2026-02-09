import { useState } from 'react'
import { useAuth } from '../hooks/useAuth'

export default function AuthModal({ isOpen, onClose }) {
  const { signUp, signIn, signInWithGoogle, signInWithApple, supabaseConfigured } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  if (!isOpen) return null

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccessMessage(null)
    setLoading(true)

    try {
      if (mode === 'signup') {
        await signUp(email, password)
        setSuccessMessage('Check your email for a confirmation link!')
      } else {
        await signIn(email, password)
        onClose()
      }
    } catch (err) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleOAuth = async (provider) => {
    setError(null)
    setLoading(true)
    try {
      if (provider === 'google') {
        await signInWithGoogle()
      } else {
        await signInWithApple()
      }
      // OAuth will redirect, so we don't need to close
    } catch (err) {
      setError(err.message || `${provider} login failed`)
      setLoading(false)
    }
  }

  if (!supabaseConfigured) {
    return (
      <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
        onClick={onClose}>
        <div className="bg-gray-900 rounded-2xl p-6 mx-4 max-w-sm w-full border border-white/10"
          onClick={e => e.stopPropagation()}>
          <h2 className="text-white text-xl font-bold mb-3">Cloud Sync Not Available</h2>
          <p className="text-gray-400 text-sm mb-4">
            Supabase is not configured for this deployment. The app works fully offline with local storage.
          </p>
          <button onClick={onClose}
            className="w-full bg-gray-700 hover:bg-gray-600 text-white py-3 px-4 rounded-xl font-medium transition-colors">
            Got It
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}>
      <div className="bg-gray-900 rounded-2xl p-6 mx-4 max-w-sm w-full border border-white/10"
        onClick={e => e.stopPropagation()}>

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-white text-xl font-bold">
            {mode === 'signin' ? 'Sign In' : 'Create Account'}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Error / Success */}
        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 text-sm rounded-xl p-3 mb-4">
            {error}
          </div>
        )}
        {successMessage && (
          <div className="bg-green-500/10 border border-green-500/30 text-green-400 text-sm rounded-xl p-3 mb-4">
            {successMessage}
          </div>
        )}

        {/* OAuth Buttons */}
        <div className="space-y-3 mb-4">
          <button
            onClick={() => handleOAuth('google')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-white hover:bg-gray-100 text-gray-900 py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <button
            onClick={() => handleOAuth('apple')}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 bg-black hover:bg-gray-900 text-white py-3 px-4 rounded-xl font-medium transition-colors border border-white/20 disabled:opacity-50">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
            </svg>
            Continue with Apple
          </button>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 my-4">
          <div className="flex-1 h-px bg-white/10"></div>
          <span className="text-gray-500 text-xs uppercase">or</span>
          <div className="flex-1 h-px bg-white/10"></div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleSubmit} className="space-y-3">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full bg-white/5 border border-white/10 text-white placeholder-gray-500 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30"
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-4 rounded-xl font-medium transition-colors disabled:opacity-50">
            {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <p className="text-center text-gray-500 text-sm mt-4">
          {mode === 'signin' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setSuccessMessage(null) }}
            className="text-cyan-400 hover:text-cyan-300 transition-colors">
            {mode === 'signin' ? 'Sign Up' : 'Sign In'}
          </button>
        </p>
      </div>
    </div>
  )
}
