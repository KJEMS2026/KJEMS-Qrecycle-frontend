import { renderAdminLayout } from "./admin-sidebar.js";
import { getAllUsers } from "./api.js";

export async function allUsers(){
    let users = await getAllUsers();
    const roleMap = {
        ADMIN: "Admin",
        DRIVER: "Chauffør",
        COMPANY: "Virksomhed"
    }

    await renderAdminLayout(
        document.querySelector('.content').innerHTML = `
    <div class="page-header">
    <div>
        <h1>Brugere</h1>
    </div>
</div>
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Navn</th>
                        <th>E-mail</th>
                        <th>Rolle</th>
                        <th>Tilknyttet virksomhed</th>
                        <th>Handlinger</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.map(user => `
                        <tr>
                            <td>${user.fullName}</td>
                            <td>${user.email}</td>
                            <td>${roleMap[user.role]}</td>
                            <td>${user.company}</td>
                            <td>
                                <div class="action-buttons">
                                    <button class="delete-btn">Rediger</button>
                                    <button class="delete-btn">Slet</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `, users)

}