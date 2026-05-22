import { getActivePickupRequests } from "./api.js";
import { renderAdminLayout } from "./admin-sidebar.js";
import { getCompanies } from "./api.js";
import { sendPickupRequestAdmin } from "./api.js";

let companies = [];

export async function pickupRequestView() {
    let activePickupRequests = await getActivePickupRequests();

    const totalBags = activePickupRequests.reduce((sum, req) => sum + req.bagsToBeCollected, 0);

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
    `, 'active-pickup-requests');

    document.getElementById('bags-badge').textContent = totalBags;
    document.getElementById('create-request-btn').addEventListener('click', pickupRequestForm)
}

async function pickupRequestForm() {
    companies = await getCompanies();
    document.querySelector('.content').innerHTML = `
    <div class="pickup-request-form-container">
        <h2>Opret ny anmodning</h2>
        <form>
            <div class="form-field">
                <label for="company">Vælg virksomhed</label>
                <select id="company" name="company" required>
                    <option value="">Vælg virksomhed...</option>
                    ${companies.map(company => `
                        <option value="${company.id}">${company.name}</option>
                    `).join('')}
                </select>
            </div>

            <div class="form-field">
                <label for="bags">Vælg antal poser</label>
                <input type="number" id="bags" name="bags" min="1" value="1" required placeholder="1">
            </div>

            <div class="form-actions">
                <button type="button" id="btn-cancel" class="btn-cancel">Annullér</button>
                <button type="button" id="btn-submit" class="btn-primary">Opret anmodning</button>
            </div>
        </form>
    </div>
    `;
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