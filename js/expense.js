import {getExpenses, saveExpense } from "./api.js";
import {renderAdminLayout} from "./admin-sidebar.js";
import { getSessionUserId } from "./auth.js";
import {driverView} from "./driver.js";
import { supabase } from "./supabase.js";

let expenses = [];
export async function expenseView(){
    expenses = await getExpenses();

    await renderAdminLayout(`<div class="page-header">
    <div>
        <h1>Omkostninger</h1>
    </div>
</div>
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Dato for upload</th>
                        <th>Titel</th>
                        <th>Beskrivelse</th>
                        <th>Bilag</th>
                        <th>Chauffør</th>
                    </tr>
                </thead>
                <tbody>
                    ${expenses.map(expense => `
                        <tr>
                            <td>${new Date(expense.creationDate).toLocaleDateString('da-DK')}</td>
                            <td>${expense.title}</td>
                            <td>${expense.description}</td>
                            <td><a href="${expense.image}" target="_blank">Se bilag</a></td>
                            <td>${expense.createdBy}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `, 'expenses');
}

export async function expenseForm(){
    document.querySelector('.content').innerHTML = `
    <div class="expense-form-container">
    <h2>Opret ny omkostning</h2>
    <form>
        <div class="expense-form-field">
            <label for="expense-title">Titel</label>
            <input type="text" id="expense-title" required>
        </div>
        <div class="expense-form-field">
            <label for="expense-description">Beskrivelse</label>
            <input type="text" id="expense-description" required>
        </div>
        <div class="expense-form-field">
    <label class="expense-file-label" for="expense-image">
        Tilføj billede af kvitto
    </label>
    <input type="file" id="expense-image" accept="image/*" required>
    <span class="expense-file-name" id="expense-file-name"></span>
</div>
        <div class="expense-form-actions">
            <button type="button" id="btn-cancel" class="btn-cancel">Annullér</button>
            <button type="button" id="btn-submit" class="btn-primary">Gem omkostning</button>
        </div>
    </form>
</div>
    `;
    document.getElementById('btn-submit').addEventListener('click', async () => {
        const title = document.getElementById('expense-title').value
        const description = document.getElementById('expense-description').value
        const image = document.getElementById('expense-image').files[0]
        const driverId = await getSessionUserId()
        const wasAccepted = await registerExpense(driverId, title, description, image)
        if (wasAccepted) {
            await driverView()
        }
    })
    document.getElementById('expense-image').addEventListener('change', (e) => {
        document.getElementById('expense-file-name').textContent = e.target.files[0]?.name ?? '';
    });

    document.getElementById('btn-cancel').addEventListener('click', driverView)
}

async function registerExpense(driverId, title, description, image){

    const fileName = `${driverId}-${Date.now()}`
    const { data, error } = await supabase.storage
        .from('images')
        .upload(fileName, image);

    if (error) throw error;

    // 2. Hent den offentlige URL
    const { data: { publicUrl } } = supabase.storage
        .from('images')
        .getPublicUrl(fileName);

    return await saveExpense(driverId, title, description, publicUrl)
}