import {useState, useEffect, useMemo} from 'react'
import './App.css'
import {AuthenticationService} from './services/AuthenticationService'
import {TicketService} from './services/TicketService'

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
    const [ticketSearch, setTicketSearch] = useState('')
    const [ticketFilters, setTicketFilters] = useState({
        inProgress: false,
        assigned: false,
        completed: false,
    })
    const [ticketSort, setTicketSort] = useState({key: 'id', direction: 'asc'})

    const ticketColumns = [
        {key: 'id', label: 'ID'},
        {key: 'location', label: 'Location'},
        {key: 'description', label: 'Description'},
        {key: 'status', label: 'Status'},
        {key: 'worker', label: 'Assigned To'},
        {key: 'timeSubmitted', label: 'Submitted'},
        {key: 'timeCompleted', label: 'Completed'},
    ]

    function getTicketSortValue(ticket, key) {
        if (key === 'worker') return ticket.worker?.username ?? ''
        if (key === 'id') return Number(ticket.id) || 0
        return ticket[key] ?? ''
    }

    function matchesStatus(ticket, status) {
        return String(ticket.status ?? '').toUpperCase().replace(/\s+/g, '_') === status
    }

    const visibleTickets = useMemo(() => {
        const search = ticketSearch.trim().toLowerCase()

        return tickets
            .filter((ticket) => {
                if (ticketFilters.inProgress && !matchesStatus(ticket, 'IN_PROGRESS')) {
                    return false
                }

                if (ticketFilters.assigned && !ticket.worker) {
                    return false
                }

                if (ticketFilters.completed && !ticket.timeCompleted && !matchesStatus(ticket, 'COMPLETED')) {
                    return false
                }

                if (!search) {
                    return true
                }

                return [
                    ticket.id,
                    ticket.location,
                    ticket.description,
                    ticket.status,
                    ticket.worker?.username,
                    ticket.timeSubmitted,
                    ticket.timeCompleted,
                ]
                    .some((value) => String(value ?? '').toLowerCase().includes(search))
            })
            .sort((a, b) => {
                const aValue = getTicketSortValue(a, ticketSort.key)
                const bValue = getTicketSortValue(b, ticketSort.key)

                if (typeof aValue === 'number' && typeof bValue === 'number') {
                    return ticketSort.direction === 'asc' ? aValue - bValue : bValue - aValue
                }

                return ticketSort.direction === 'asc'
                    ? String(aValue).localeCompare(String(bValue), undefined, {numeric: true, sensitivity: 'base'})
                    : String(bValue).localeCompare(String(aValue), undefined, {numeric: true, sensitivity: 'base'})
            })
    }, [tickets, ticketFilters, ticketSearch, ticketSort])

    function updateTicketFilter(filterName) {
        setTicketFilters((current) => ({
            ...current,
            [filterName]: !current[filterName],
        }))
    }

    function updateTicketSort(key) {
        setTicketSort((current) => ({
            key,
            direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
        }))
    }

    function getSortLabel(key) {
        if (ticketSort.key !== key) return ''
        return ticketSort.direction === 'asc' ? ' sorted ascending' : ' sorted descending'
    }

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

    function formatStatus(status) {
        if (!status) return 'Not Available'
        return status.toLowerCase().replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
    }

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
            setUsername('');
            setPassword('');

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
            setTicketForm({location: '', description: ''})
            setView('dashboard')
            fetchTickets()

        } catch (err) {

            setError(err.message)

        } finally {

            setLoading(false)

        }

    }

    function updateField(event) {

        setForm({...form, [event.target.name]: event.target.value})

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

    async function logout() {
        await AuthenticationService.logout()
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
                <div className="dashboard-view">
                    <header className="user-header">
                        <div>
                            <h1>Dashboard</h1>
                        </div>
                        <div>
                            <button onClick={logout}>Logout</button>
                        </div>
                    </header>

                    <section className="ticket-panel">
                        <div className="ticket-panel-actions">
                            <h1>My Tickets</h1>
                            <button onClick={() => setView('createTicket')}>
                                Submit Ticket
                            </button>
                        </div>

                        <div className="ticket-controls">
                            <label className="ticket-search">
                                <input
                                    value={ticketSearch}
                                    onChange={(event) => setTicketSearch(event.target.value)}
                                    placeholder="Search Tickets"
                                />
                            </label>

                            <div className="ticket-filter-group">
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ticketFilters.inProgress}
                                        onChange={() => updateTicketFilter('inProgress')}
                                    />
                                    In progress
                                </label>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ticketFilters.assigned}
                                        onChange={() => updateTicketFilter('assigned')}
                                    />
                                    Assigned
                                </label>

                                <label>
                                    <input
                                        type="checkbox"
                                        checked={ticketFilters.completed}
                                        onChange={() => updateTicketFilter('completed')}
                                    />
                                    Completed
                                </label>
                            </div>
                        </div>

                        <table className="ticket-table">
                            <thead>
                            <tr>
                                {ticketColumns.map((column) => (
                                    <th
                                        key={column.key}
                                        className={ticketSort.key === column.key ? 'sorted-column' : ''}
                                    >
                                        <button
                                            type="button"
                                            className="sort-button"
                                            onClick={() => updateTicketSort(column.key)}
                                            aria-label={`Sort by ${column.label}${getSortLabel(column.key)}`}
                                        >
                                            {column.label}
                                            <span
                                                className={ticketSort.key === column.key ? `sort-icon ${ticketSort.direction}` : 'sort-icon'}/>
                                        </button>
                                    </th>
                                ))}
                            </tr>
                            </thead>

                            <tbody>
                            {visibleTickets.length === 0 ? (
                                <tr>
                                    <td colSpan={ticketColumns.length}>No tickets match the current filters.</td>
                                </tr>
                            ) : (
                                visibleTickets.map((t) => (
                                    <tr key={t.id}>
                                        <td>{t.id}</td>
                                        <td>{t.location}</td>
                                        <td>{t.description}</td>
                                        <td>{formatStatus(t.status)}</td>
                                        <td>{t.worker?.username ?? 'Unassigned'}</td>
                                        <td>{formatTicketTime(t.timeSubmitted)}</td>
                                        <td>{t.timeCompleted ? formatTicketTime(t.timeCompleted) : 'Incomplete'}</td>

                                    </tr>
                                ))
                            )}
                            </tbody>
                        </table>
                    </section>


                </div>
            )
        }

        if (view === 'createTicket') {
            return (
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
            )
        }

        if (view === 'register') {
            return (
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
            )
        }
    }

    return (
        <main className={view === 'dashboard' ? 'dashboard-page' : 'app-page'}>
            {renderView()}
        </main>
    )

}
