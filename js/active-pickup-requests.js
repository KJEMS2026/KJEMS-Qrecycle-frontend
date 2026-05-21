import { getActivePickupRequests } from "./api.js";
import { logout } from "./auth.js";
import { renderAdminLayout } from "./admin-sidebar.js";

let activePickupRequests = [];

export async function pickupRequestView() {
    activePickupRequests = await getActivePickupRequests();

    renderAdminLayout(`
        <div class="page-header">
    <div>
        <h1>Anmodninger</h1>
    </div>
    <div>
        <button class="btn-primary">+ Opret på vegne af virksomhed</button>
    </div>
</div>
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Virksomhed</th>
                        <th>Oprettet</th>
                        <th>Poser til afhentning</th>
                        <th>Handlinger</th>
                    </tr>
                </thead>
                <tbody>
                    ${activePickupRequests.map(req => `
                        <tr>
                            <td>${req.companyName}</td>
                            <td>${new Date(req.createdAt).toLocaleDateString('da-DK')}</td>
                            <td>${req.bagsToBeCollected}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="delete-btn">Slet</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `, 'active-pickup-requests', totalBagsToCollect());

    document.getElementById('logout').addEventListener('click', logout);
}

function totalBagsToCollect(){
    let total = 0;
    for (let pickupRequest of activePickupRequests){
        total += pickupRequest.bagsToBeCollected;
    }
    return total;
}