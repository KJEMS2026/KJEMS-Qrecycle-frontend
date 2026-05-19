import {logout} from "./auth.js";

export function adminView() {
    document.querySelector('.content').innerHTML = `
    <p>admin</p>
    <button id="logout">Log ud</button>
    `

    document.getElementById('logout').addEventListener('click', logout)
}