const API_URL = import.meta.env.VITE_API_URL?.replace(/\/$/, '')

export const TicketService = {
    async getAllTickets() {
        const res = await fetch(`${API_URL}/tickets`, {
            credentials: 'include',
        })

        if (!res.ok) throw new Error('Failed to load tickets')
        return res.json()
    },

    async assignWorker(ticketId, workerId) {
        const res = await fetch(
            `${API_URL}/tickets/${ticketId}/assign/${workerId}`,
            {
                method: 'PUT',
                credentials: 'include',
            }
        )

        if (!res.ok) throw new Error('Failed to assign worker')
        return res.json()
    },

    async markComplete(ticketId) {
        const res = await fetch(
            `${API_URL}/tickets/${ticketId}/status/COMPLETE`,
            {
                method: 'PUT',
                credentials: 'include',
            }
        )

        if (!res.ok) throw new Error('Failed to complete ticket')
        return res.json()
    },
}