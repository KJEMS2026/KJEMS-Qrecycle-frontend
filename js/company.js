import {logout} from "./auth.js";

export function companyView() {
    document.querySelector('.content').innerHTML = `
    <p>company</p>
    <button id="logout">Log ud</button>
    `

    document.getElementById('logout').addEventListener('click', logout)
}