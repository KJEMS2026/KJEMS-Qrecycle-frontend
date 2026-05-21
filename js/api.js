import { BACKEND_URL } from './env.js'

export async function fetchRouteStops() {
    const response = await fetch(`${BACKEND_URL}/driver/route`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
    if (!response.ok) throw new Error('Kunne ikke hente rute')
    return response.json()
}