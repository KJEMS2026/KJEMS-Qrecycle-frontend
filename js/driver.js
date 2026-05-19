import { logout } from './auth.js'

export function driverView() {
    document.querySelector('.content').innerHTML = `
    <p>driver</p>
    <button id="logout">Log ud</button>
    `

    document.getElementById('logout').addEventListener('click', logout)
}