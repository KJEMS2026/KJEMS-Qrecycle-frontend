const BACKEND_URL = 'http://localhost:8080'

export async function sendPickupRequest(userId, bagCount) {
    const response = await fetch(`${BACKEND_URL}/pickup-requests/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bagsToBeCollected: bagCount })
    })
    return response.ok
}
const BACKEND_URL = 'http://localhost:8080'

export async function getActivePickupRequests() {
    const response = await fetch(`${BACKEND_URL}/active-pickup-requests`);


    return response.json();
}