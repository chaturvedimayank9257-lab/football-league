'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createBrowserClient } from '@/lib/supabase/client'
import Image from 'next/image'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    // Shortcut: typing "admin" expands to admin@bpl.local
    const loginEmail = email === 'admin' ? 'admin@bpl.local' : email

    const supabase = createBrowserClient()
    const { data, error: authError } = await supabase.auth.signInWithPassword({
      email: loginEmail,
      password,
    })

    if (authError) {
      setError(authError.message)
      setLoading(false)
      return
    }

    const role = data.user?.user_metadata?.role
    router.push(role === 'admin' ? '/admin/players' : '/draft')
    router.refresh()
  }

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="bg-navy-light border border-gold/20 rounded-xl p-8 w-full max-w-sm">
        <div className="text-center mb-8">
          <Image src="/logo.png" alt="BPL Crest" width={64} height={64} className="mx-auto mb-4 rounded" />
          <h1 className="text-xl font-bold text-gold">Barely Premier League</h1>
          <p className="text-cream/40 text-xs mt-1 tracking-widest uppercase">Captain Login</p>
        </div>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">Email</label>
            <input
              type="text"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin"
              required
              className="w-full bg-navy border border-navy-mid text-cream rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition"
            />
          </div>
          <div>
            <label className="text-xs text-cream/40 uppercase tracking-wider block mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full bg-navy border border-navy-mid text-cream rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:border-gold/50 transition"
            />
          </div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gold hover:bg-gold-light disabled:opacity-50 text-navy font-bold py-2.5 rounded-lg transition uppercase tracking-wider text-sm"
          >
            {loading ? 'Signing in\u2026' : 'Sign In'}
          </button>
        </form>
      </div>
    </main>
  )
}
