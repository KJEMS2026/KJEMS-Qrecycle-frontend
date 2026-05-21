import { BACKEND_URL } from './env.js'

export async function fetchRouteStops() {
    const response = await fetch(`${BACKEND_URL}/driver/route`)
    if (!response.ok) throw new Error('Kunne ikke hente rute')
    return response.json()
}