import { useState } from 'react'
import './App.css'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [user, setUser] = useState(null)

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

      setUser(await response.json())
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (user) {
    return (
      <main className="user-page">
        <section className="user-header">
          <p className="eyebrow">Signed in</p>
          <p>
            Welcome, {user.username}.
          </p>
        </section>
      </main>
    )
  }

  return (
    <main className="login-page">
      <form className="login-form" onSubmit={handleLogin}>
        <div>
          <h1>User Login</h1>
        </div>

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
        <button >
          Create an Account
        </button>
      </form>
    </main>
  )
}

export default App
