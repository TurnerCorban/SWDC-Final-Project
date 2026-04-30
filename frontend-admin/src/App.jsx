import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [admin, setAdmin] = useState(null)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!API_URL) {
        throw new Error('Missing VITE_API_URL')
      }

      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ username, password }),
      })

      if (!response.ok) {
        throw new Error('Invalid username or password')
      }

      const user = await response.json()

      if (user.role !== 'ADMIN') {
        throw new Error('Admin access required')
      }

      setAdmin(user)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (admin) {
    return (
        <main className="admin-page">
          <section className="admin-header">
            <h1>Admin Dashboard</h1>
            <p>Signed in as {admin.username}</p>
          </section>
        </main>
    )
  }

  return (
      <main className="login-page">
        <form className="login-form" onSubmit={handleLogin}>
          <h1>Admin Login</h1>

          <label>
            Username
            <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="username"
                required
            />
          </label>

          <label>
            Password
            <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
            />
          </label>

          {error && <p className="login-error">{error}</p>}

          <button type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign in'}
          </button>
        </form>
      </main>
  )
}

export default App
