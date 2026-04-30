import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

import { AuthenticationService } from './services/AuthenticationService'
import { TicketService } from './services/TicketService'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function App() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [admin, setAdmin] = useState(null)
  const [admins, setAdmins] = useState([])
  const [tickets, setTickets] = useState([])
  const [loadingTickets, setLoadingTickets] = useState(false)

  async function handleLogin(event) {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const user = await AuthenticationService.login(username, password)

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

  async function fetchTickets() {

      setLoadingTickets(true);
      setError("");

      try {

          const data = await TicketService.getAllTickets()
          setTickets(data)

      } catch (err) {

          setError(err.message);

      } finally {

          setLoadingTickets(false);

      }

  }

  async function fetchAdmins() {

      try {

          const data = await AuthenticationService.getAdmins()
          setAdmins(data)

      } catch (err) {

          setError(err.message)

      }

  }

  async function assignWorker(ticketId, workerId) {

      if (!workerId) return

      await TicketService.assignWorker(ticketId, workerId)
      fetchTickets()

  }

  async function markCompleted(ticketId) {

      await TicketService.markComplete(ticketId)

      fetchTickets()

  }

  async function handleLogout() {

      setAdmin(null);
      setTickets([]);
      setAdmins([])
      setUsername('');
      setPassword('');

  }

  useEffect(() => {

      if (admin) {

          fetchTickets();
          fetchAdmins();

      }

  }, [admin]);

    if (admin) {
        return (
            <main className="admin-page">
                <header className="admin-header">
                    <h1>Maintenance Dashboard</h1>

                    <div className="admin-actions">
                        <span>Signed in as {admin.username}</span>
                        <button onClick={handleLogout}>Logout</button>
                    </div>
                </header>

                {error && <p className="login-error">{error}</p>}

                <section className="ticket-section">
                    <h2>Tickets</h2>

                    {loadingTickets ? (
                        <p>Loading tickets...</p>
                    ) : (
                        <table className="ticket-table">
                            <thead>
                            <tr>
                                <th>ID</th>
                                <th>Location</th>
                                <th>Description</th>
                                <th>Status</th>
                                <th>Submitted By</th>
                                <th>Assigned Worker</th>
                                <th>Date Submitted</th>
                                <th>Date Completed</th>
                            </tr>
                            </thead>
                            <tbody>
                            {tickets.length === 0 ? (
                                <tr>
                                    <td colSpan="8">No tickets found.</td>
                                </tr>
                            ) : (
                                tickets.map((ticket) => (
                                    <tr key={ticket.id}>
                                        <td>{ticket.id}</td>
                                        <td>{ticket.location}</td>
                                        <td>{ticket.description}</td>
                                        <td>{ticket.status}</td>
                                        <td>{ticket.user ? ticket.user.username : "-"}</td>
                                        <td>{ticket.worker ? ticket.worker.username : "Unassigned"}</td>
                                        <td>{ticket.timeSubmitted ? ticket.timeSubmitted : "-"}</td>
                                        <td>{ticket.timeCompleted ? ticket.timeCompleted : "-"}</td>
                                        <td>
                                            <select
                                                value={ticket.worker?.id || ""}
                                                onChange={(e) => assignWorker(ticket.id, e.target.value)}
                                            >
                                                <option value="">Unassigned</option>
                                                {admins.map((a) => (
                                                    <option key={a.id} value={a.id}>
                                                        {a.username}
                                                    </option>
                                                ))}
                                            </select>
                                        </td>
                                        <td>
                                            <button onClick={() => markCompleted(ticket.id)}>
                                                Complete
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    )}

                    <button onClick={fetchTickets}>Refresh</button>
                </section>
            </main>
        );
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
