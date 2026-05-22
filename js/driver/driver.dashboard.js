import { geoUtils } from './geo.utils.js'
import { logout } from '../auth.js'

export const driverDashboard = {
    show(firstName, stops, callbacks) {
        document.querySelector('.content').innerHTML = this.buildHtml(firstName, stops)
        this.attachListeners(callbacks)
    },

    buildHtml(firstName, stops) {
        return `
            <div class="driver-app">
                          
                <header class="app-header">
                    <img src="docs/image/logo.png" alt="Qrecycle" class="app-logo">
                    <button class="btn-logout-company" id="btn-logout">Log ud</button>
                </header>
                
                
                <main class="driver-main">
                    <h1 class="driver-greeting">Goddag, ${firstName}</h1>
                    <p class="driver-date">${geoUtils.formatCurrentDate()}</p>
                    <button class="driver-card" id="btn-see-route">
                        <div class="driver-card-content">
                            <span>Se dagens rute</span>
                        </div>
                        <span class="driver-card-arrow">→</span>
                    </button>
                    <button class="driver-card driver-card-gold">
                        <div class="driver-card-content">
                            <span>Registrér omkostning</span>
                            <small>Parkering, brændstof, andet</small>
                        </div>
                        <span class="driver-card-arrow">+</span>
                    </button>
                </main>
            </div>
        `
    },

    attachListeners(callbacks) {
        document.getElementById('btn-see-route').addEventListener('click', callbacks.onViewRoute)
        document.getElementById('btn-logout').addEventListener('click', logout)
    }
}
