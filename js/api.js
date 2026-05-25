import {getSessionUserId} from "./auth.js";

const BACKEND_URL = 'http://localhost:8080'

export async function sendPickupRequest(userId, bagCount) {
    const response = await fetch(`${BACKEND_URL}/pickup-requests/company`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bagsToBeCollected: bagCount })
    })
    return response.ok
}

export async function sendPickupRequestAdmin(companyId, bagCount) {
    const response = await fetch(`${BACKEND_URL}/pickup-requests/admin`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ companyId, bagsToBeCollected: bagCount })
    })
    return response.ok
}

export async function getActivePickupRequests() {
    const response = await fetch(`${BACKEND_URL}/active-pickup-requests`);

    return response.json();
}

export async function getActivePickupRequestsCompany() {
    const userId = await getSessionUserId();
    const response = await fetch(`${BACKEND_URL}/active-pickup-requests-company/${userId}`);

    return response.json();
}

export async function getStatisticList() {
    const response = await fetch(`${BACKEND_URL}/stats`)

    return response.json();
}

export async function getCompanies() {
    const response = await fetch(`${BACKEND_URL}/companies`);

    return response.json();
}

export async function fetchRouteStops() {
    const response = await fetch(`${BACKEND_URL}/driver/route`)
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

export async function getExpenses(){
    const response = await fetch(`${BACKEND_URL}/expenses`)

    return response.json();
}