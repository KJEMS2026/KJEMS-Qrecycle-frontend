import { logout, getSessionUserId } from './auth.js'
import {getActivePickupRequestsCompany, sendPickupRequest} from './api.js'

let activePickupRequests = [];

export async function companyView() {
    activePickupRequests = await getActivePickupRequestsCompany()
    showDashboard()
}

function showDashboard() {
    renderContent(dashboardHTML())
    document.getElementById('btn-opret').addEventListener('click', showCreateForm)
    document.getElementById('btn-logout').addEventListener('click', logout)
}

function showCreateForm() {
    renderContent(createFormHTML())
    // Header tilbage-pil: navigationsknap øverst på siden
    document.getElementById('btn-back').addEventListener('click', showDashboard)
    // Annullér-link: afbryder formularen og vender tilbage til dashboard
    document.getElementById('btn-cancel').addEventListener('click', showDashboard)
    document.getElementById('btn-plus').addEventListener('click', incrementBagCount)
    document.getElementById('btn-minus').addEventListener('click', decrementBagCount)
    document.getElementById('btn-send').addEventListener('click', submitPickupRequest)
    document.getElementById('btn-send').addEventListener('click', companyView)
}

function incrementBagCount() {
    const bagsInput = document.getElementById('bags')
    bagsInput.value = parseInt(bagsInput.value) + 1
}

function decrementBagCount() {
    const bagsInput = document.getElementById('bags')
    if (parseInt(bagsInput.value) > 1) bagsInput.value = parseInt(bagsInput.value) - 1
}

async function submitPickupRequest() {
    const bagCount = parseInt(document.getElementById('bags').value)
    const feedbackEl = document.getElementById('feedback')

    try {
        const userId = await getSessionUserId()
        const wasAccepted = await sendPickupRequest(userId, bagCount)
        if (wasAccepted) {
            showDashboard()
        } else {
            feedbackEl.textContent = 'Noget gik galt. Prøv igen.'
        }
    } catch (error) {
        feedbackEl.textContent = 'Kunne ikke forbinde til serveren.'
    }
}

function renderContent(html) {
    document.querySelector('.content').innerHTML = html
}

function dashboardHTML() {
    return `
        <header class="app-header">
            <img src="docs/image/logo.png" alt="Qrecycle" class="app-logo">
            <button class="btn-logout-company" id="btn-logout">Log ud</button>
        </header>
        <main class="app-main">
            <div class="company-table-card">
            <table>
                <thead>
                    <tr>              
                        <th>Dine anmodninger</th>                         
                    </tr>
                </thead>
                <tbody>
                    ${activePickupRequests.map(req => `
                        <tr>
                            <td>${req.bagsToBeCollected} Poser</td>                           
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
        </main>
        <div class="bottom-bar">
            <button class="btn-bottom" id="btn-opret">+ Opret ny afhentning</button>
        </div>
    `
}

function createFormHTML() {
    return `
        <header class="app-header">
            <button class="btn-back" id="btn-back">←</button>
            <img src="docs/image/logo.png" alt="Qrecycle" class="app-logo">
        </header>
        <main class="app-main">
            <h1 class="page-title">Ny afhentning</h1>
            <p class="text-muted form-subtitle">Udfyld og send anmodningen</p>
            <div class="form-group">
                <label>ANTAL POSER (VALGFRIT)</label>
                <div class="number-input">
                    <input type="number" id="bags" value="1" min="1">
                    <div class="number-controls">
                        <button class="btn-counter" id="btn-plus">+</button>
                        <span class="counter-divider">/</span>
                        <button class="btn-counter" id="btn-minus">−</button>
                    </div>
                </div>
            </div>
            <button class="btn-primary" id="btn-send">Send afhentningsanmodning</button>
            <button class="btn-link" id="btn-cancel">Annullér</button>
            <p class="feedback" id="feedback"></p>
        </main>
    `
}