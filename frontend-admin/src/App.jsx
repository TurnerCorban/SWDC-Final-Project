import {useState, useEffect} from 'react'
import './App.css'

import {AuthenticationService} from './services/AuthenticationService'
import {TicketService} from './services/TicketService'

const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

function App() {
    const [username, setUsername] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)
    const [admin, setAdmin] = useState(null)
    const [admins, setAdmins] = useState([])
    const [users, setUsers] = useState([])
    const [tickets, setTickets] = useState([])
    const [loadingTickets, setLoadingTickets] = useState(false)

    function formatTicketTime(value) {
        if (!value) return '-'

        const rawValue = String(value)
        const hasTimeZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(rawValue)
        const normalizedValue = hasTimeZone ? rawValue : `${rawValue}Z`
        const date = new Date(normalizedValue)

        if (Number.isNaN(date.getTime())) {
            return value
        }

        const parts = new Intl.DateTimeFormat('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour12: true,
        })
            .formatToParts(date)
            .reduce((current, part) => {
                current[part.type] = part.value
                return current
            }, {})

        return `${parts.hour}:${parts.minute} ${parts.dayPeriod} ${parts.day}/${parts.month}/${parts.year}`
    }

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

    async function fetchUsers() {

        const res = await fetch(`${API_URL}/admin/users`, {
            credentials: "include",
        })

        if (res.ok) {
            setUsers(await res.json())
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

    async function updateUserRole(userId, role) {
        await fetch(`${API_URL}/auth/me`, { credentials: 'include' })
        const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
        const csrfToken = match ? decodeURIComponent(match[1]) : null

        await fetch(`${API_URL}/admin/users/${userId}/role`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                "X-XSRF-TOKEN": csrfToken,
            },
            credentials: "include",
            body: JSON.stringify(role),
        })

        await fetchUsers()
    }

    async function deleteUser(userId) {

        setError("")

        const res = await fetch(`${API_URL}/admin/users/${userId}`, {
            method: "DELETE",
            credentials: "include",
        })

        if (!res.ok) {
            setError("Failed to delete user")
            return
        }

        setUsers(prev => prev.filter(u => u.id !== userId))
        await fetchTickets()
        await fetchAdmins()

    }

    useEffect(() => {

        if (admin) {

            fetchTickets()
            fetchAdmins()
            fetchUsers()

        }

    }, [admin]);

    useEffect(() => {
        async function checkSession() {
            try {
                const user = await AuthenticationService.getMe()
                setUser(user)
                setView('dashboard')
            } catch {
                setView('login')
            }
        }

        checkSession()
    }, [])

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
                                        <td>{formatTicketTime(ticket.timeSubmitted)}</td>
                                        <td>{ticket.timeCompleted ? formatTicketTime(ticket.timeCompleted) : "Incomplete"}</td>
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

                    <h2>Users</h2>

                    <table className="ticket-table">
                        <thead>
                        <tr>
                            <th>ID</th>
                            <th>Username</th>
                            <th>Email</th>
                            <th>Phone</th>
                            <th>Role</th>
                            <th>Actions</th>
                        </tr>
                        </thead>

                        <tbody>
                        {users.length === 0 ? (
                            <tr>
                                <td colSpan="6">No users found.</td>
                            </tr>
                        ) : (
                            users.map((u) => (
                                <tr key={u.id}>
                                    <td>{u.id}</td>
                                    <td>{u.username}</td>
                                    <td>{u.email}</td>
                                    <td>{u.phoneNumber}</td>

                                    <td>
                                        <select
                                            value={u.role}
                                            onChange={(e) => updateUserRole(u.id, e.target.value)}
                                        >
                                            <option value="USER">USER</option>
                                            <option value="ADMIN">ADMIN</option>
                                        </select>
                                    </td>
                                    <td>
                                        <button
                                            type="button"
                                            onClick={() => deleteUser(u.id)}
                                            disabled={u.id === admin.id}
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                        </tbody>
                    </table>

                    <button onClick={refreshAll}>Refresh</button>
                </section>
            </main>
        );
    }

    function refreshAll() {

        fetchTickets()
        fetchUsers()

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
                <br/>
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
                <br/>

                {error && <p className="login-error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? 'Signing in...' : 'Sign in'}
                </button>
            </form>
        </main>
    )
}

export default App
