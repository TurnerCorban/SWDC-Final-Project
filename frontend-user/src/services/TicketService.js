const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const TicketService = {

    async getMyTickets() {

        const res = await fetch(`${API_URL}/tickets/current`, {

            credentials: 'include',

        })

        if (!res.ok) throw new Error('Failed to load tickets')

        return res.json()

    },

    async createTicket(ticket) {

        const res = await fetch(`${API_URL}/tickets`, {

            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            credentials: 'include',
            body: JSON.stringify(ticket),

        })

        if (!res.ok) throw new Error ('Failed to create ticket')

        return res.json()

    }

}