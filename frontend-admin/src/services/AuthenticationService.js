const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const AuthenticationService = {

    async login(username, password) {
        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        })

        if (!res.ok) throw new Error('Login failed')
        return res.json()
    },

    async getAdmins() {
        const res = await fetch(`${API_URL}/auth/admins`, {
            credentials: 'include',
        })

        if (!res.ok) throw new Error('Failed to fetch admins')

        return res.json()
    },

    async getMe() {
        const res = await fetch(`${API_URL}/auth/me`, {
            credentials: 'include',
        })

        if (!res.ok) throw new Error('Not authenticated')
        return res.json()
    }

}