import { useState, useEffect } from 'react'
import './App.css'
import { AuthenticationService } from './services/AuthenticationService'
import { TicketService } from './services/TicketService'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export default function App() {
  const [view, setView] = useState('login')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [tickets, setTickets] = useState([])
  const [ticketForm, setTicketForm] = useState({location: '', description: ''})
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

      const user = await AuthenticationService.login(username, password)
      setUser(user);
      setView('dashboard');

    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const [form, setForm] = useState({

      username: '',
      password: '',
      phoneNumber: '',
      firstName: '',
      lastName: '',
      email: '',
      address: ''

  })

  function updateTicketForm(event) {

      setTicketForm({

          ...ticketForm,
          [event.target.name]: event.target.value

      })

  }

  async function submitTicket(event) {

      event.preventDefault()
      setError('')
      setLoading(true)

      try {

          await TicketService.createTicket(ticketForm)
          setTicketForm({ location: '', description: '' })
          setView('dashboard')
          fetchTickets()

      } catch(err) {

          setError(err.message)

      } finally {

          setLoading(false)

      }

  }

  function updateField(event) {

      setForm({ ...form, [event.target.name]: event.target.value })

  }

  async function register(event) {

      event.preventDefault()
      setError('')
      setLoading(true)

      try {

          await AuthenticationService.register(form)
          setView('login')

      } catch (err) {

          setError(err.message)

      } finally {

          setLoading(false)

      }

  }

  async function fetchTickets() {

      try {

          const data = await TicketService.getMyTickets()
          setTickets(data)

      } catch (err) {

          setError(err.message)

      }

  }

  useEffect(() => {

      if (view === 'dashboard') {

          fetchTickets()

      }

  }, [view])

  function logout() {

      setUser(null)
      setView('login')
      setTickets([])

  }

    function renderView() {
        if (view === 'login') {
            return (
                <form className="login-form" onSubmit={handleLogin}>
                    <h1>User Login</h1>

                    <label>
                        Username
                        <input
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </label>

                    <label>
                        Password
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </label>

                    {error && <p className="login-error">{error}</p>}

                    <button disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign in'}
                    </button>

                    <button type="button" onClick={() => setView('register')}>
                        Create Account
                    </button>
                </form>
            )
        }

        if (view === 'dashboard') {
            return (
                <>
                    <header className="user-header">
                        <h1>My Tickets</h1>
                        <div>
                            <button onClick={logout}>Logout</button>
                            <button onClick={() => setView('createTicket')}>
                                Submit Ticket
                            </button>
                        </div>
                    </header>

                    <p>Welcome {user?.username}</p>

                    <table className="ticket-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Location</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Assigned To</th>
                            <th>Submitted</th>
                            <th>Completed</th>
                        </tr>
                        </thead>

                        <tbody>
                        {tickets.map((t) => (
                            <tr key={t.id}>
                                <td>{t.id}</td>
                                <td>{t.location}</td>
                                <td>{t.description}</td>
                                <td>{t.status}</td>
                                <td>{t.worker?.username ?? 'Unassigned'}</td>
                                <td>{t.timeSubmitted}</td>
                                <td>{t.timeCompleted ?? '-'}</td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </>
            )
        }

        if (view === 'createTicket') {
            return (
                <main className="app-page">
                    <form className="login-form" onSubmit={submitTicket}>
                        <h1>Submit Ticket</h1>

                        <label>
                            Location
                            <input
                                name="location"
                                value={ticketForm.location}
                                onChange={updateTicketForm}
                                required
                            />
                        </label>

                        <label>
                            Description
                            <textarea
                                name="description"
                                value={ticketForm.description}
                                onChange={updateTicketForm}
                                required
                            />
                        </label>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Submitting...' : 'Submit Ticket'}
                        </button>

                        <button type="button" onClick={() => setView('dashboard')}>
                            Back
                        </button>
                    </form>
                </main>
            )
        }

        if (view === 'register') {
            return (
                <main className="app-page">
                    <form className="login-form" onSubmit={register}>
                        <h1>Create Account</h1>

                        <label>
                            Username
                            <input
                                name="username"
                                value={form.username}
                                onChange={updateField}
                                required
                            />
                        </label>

                        <label>
                            Password
                            <input
                                type="password"
                                name="password"
                                value={form.password}
                                onChange={updateField}
                                required
                            />
                        </label>

                        <label>
                            Phone Number
                            <input
                                name="phoneNumber"
                                value={form.phoneNumber}
                                onChange={updateField}
                            />
                        </label>

                        <label>
                            First Name
                            <input
                                name="firstName"
                                value={form.firstName}
                                onChange={updateField}
                            />
                        </label>

                        <label>
                            Last Name
                            <input
                                name="lastName"
                                value={form.lastName}
                                onChange={updateField}
                            />
                        </label>

                        <label>
                            Email
                            <input
                                name="email"
                                value={form.email}
                                onChange={updateField}
                            />
                        </label>

                        <label>
                            Address
                            <input
                                name="address"
                                value={form.address}
                                onChange={updateField}
                            />
                        </label>

                        {error && <p className="login-error">{error}</p>}

                        <button type="submit" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Account'}
                        </button>

                        <button type="button" onClick={() => setView('login')}>
                            Back to Login
                        </button>
                    </form>
                </main>
            )
        }
    }

    return (
        <main className="app-page">
            {renderView()}
        </main>
    )

}