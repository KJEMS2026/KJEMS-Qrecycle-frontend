import { getActivePickupRequests } from "./api.js";
import { logout } from "./auth.js";
import { renderAdminLayout } from "./admin-sidebar.js";
import { getCompanies } from "./api.js";
import { sendPickupRequestAdmin } from "./api.js";

let activePickupRequests = [];
let companies = [];

export async function pickupRequestView() {
    activePickupRequests = await getActivePickupRequests();

    renderAdminLayout(`
        <div class="page-header">
    <div>
        <h1>Anmodninger</h1>
    </div>
    <div>
        <button id="create-request-btn" class="btn-primary">+ Opret på vegne af virksomhed</button>
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
    document.getElementById('create-request-btn').addEventListener('click', pickupRequestForm)
}

async function pickupRequestForm() {
    companies = await getCompanies();
    document.querySelector('.content').innerHTML = `
    <form>
        <div class="pickup-request-form-admin">
            <label for="company">Virksomheder</label>
            <select id="company" name="company" required>
                <option value="">Vælg virksomhed...</option>
                ${companies.map(company => `
                <option value="${company.id}">${company.name}</option>
                `).join('')}
            </select>
        </div>
        
        <div class="pickup-request-form-admin">
            <label for="bags">Antal poser</label>
            <input type="number" id="bags" name="bags" min="1" value="1" required>
        </div>
        
        <div class="pickup-request-form-admin">
            <button type="button" id="btn-submit" class="btn-submit-request-admin">Opret anmodning</button>
            <button type="button" id="btn-cancel" class="btn-cancel">Annullér</button>
        </div>
    </form>
    `
    document.getElementById('btn-submit').addEventListener('click', async () => {
        const bagCount = parseInt(document.getElementById('bags').value)
        const companyId = document.getElementById('company').value
        const wasAccepted = await sendPickupRequestAdmin(companyId, bagCount)
        if (wasAccepted) {
            await pickupRequestView()
        }
    })
    document.getElementById('btn-cancel').addEventListener('click', pickupRequestView)
}

function totalBagsToCollect(){
    let total = 0;
    for (let pickupRequest of activePickupRequests){
        total += pickupRequest.bagsToBeCollected;
    }
    return total;
}