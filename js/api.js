import { BACKEND_URL } from './env.js'

export async function fetchRouteStops() {
    const response = await fetch(`${BACKEND_URL}/driver/route`, { headers: { 'ngrok-skip-browser-warning': 'true' } })
    if (!response.ok) throw new Error('Kunne ikke hente rute')
    return response.json()
}

export async function postRegisterPickup(driverId, pickupRequestId, bagsCollected) {
    const response = await fetch(`${BACKEND_URL}/update-pickuprequest/${driverId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            pickupRequestId,
            bagsCollected,
            dateCollected: new Date().toISOString()
        })
    })
    if (!response.ok) throw new Error('Kunne ikke registrere afhentning')
}