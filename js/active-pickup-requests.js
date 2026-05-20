import { getActivePickupRequests } from "./api.js";
import {logout} from "./auth.js";

let activePickupRequests = [];

export async function pickupRequestView() {
    activePickupRequests = await getActivePickupRequests()
    console.log(activePickupRequests);

    document.querySelector('.content').innerHTML = `
    <p>admin</p>
    <button id="logout">Log ud</button>
    <table>
            <thead>
                <tr>
                    <th>Virksomhed</th>
                    <th>Dato oprettet</th>
                    <th>Poser til afhentning</th>
                </tr>
            </thead>
            <tbody>
                ${activePickupRequests.map(req => `
                    <tr>
                        <td>${req.companyName}</td>
                        <td>${new Date(req.createdAt).toLocaleDateString('da-DK')}</td>
                        <td>${req.bagsToBeCollected}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `

    document.getElementById('logout').addEventListener('click', logout)
}