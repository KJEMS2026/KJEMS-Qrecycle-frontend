import { getExpenses } from "./api.js";
import {renderAdminLayout} from "./admin-sidebar.js";

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