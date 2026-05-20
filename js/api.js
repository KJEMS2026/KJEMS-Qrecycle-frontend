const BACKEND_URL = 'http://localhost:8080'

export async function getActivePickupRequests() {
    const response = await fetch(`${BACKEND_URL}/active-pickup-requests`);


    return response.json();
}