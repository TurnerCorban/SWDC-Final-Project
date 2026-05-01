const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

async function getCsrfToken() {
    await fetch(`${API_URL}/auth/me`, {
        credentials: 'include',
    })
    const match = document.cookie.match(/XSRF-TOKEN=([^;]+)/)
    return match ? decodeURIComponent(match[1]) : null
}

export const AuthenticationService = {

    async login(username, password) {
        const csrfToken = await getCsrfToken()

        const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-XSRF-TOKEN': csrfToken,
            },
            credentials: 'include',
            body: JSON.stringify({ username, password }),
        })

        if (!res.ok) throw new Error('Invalid login')
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