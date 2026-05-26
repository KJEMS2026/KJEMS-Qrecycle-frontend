import { getCompaniesAndCompanyUsers } from "./api.js";
import { renderAdminLayout } from "./admin-sidebar.js";

let companiesAndUsers = [];

export async function CompanyAdminView() {
    companiesAndUsers = await getCompaniesAndCompanyUsers();

    await renderAdminLayout(`<div class="page-header">
    <div>
        <h1>Virksomheder</h1>
    </div>
</div>
        <div class="table-card">
            <table>
                <thead>
                    <tr>
                        <th>Virksomhed</th>
                        <th>Adresse</th>
                        <th>Kontaktperson</th>
                        <th>E-mail</th>
                        <th>Telefon</th>
                    </tr>
                </thead>
                <tbody>
                    ${companiesAndUsers.map(companyAndUser => `
                        <tr>
                            <td>${companyAndUser.companyName}</td>
                            <td>${companyAndUser.address}</td>
                            <td>${companyAndUser.fullName}</td>
                            <td>${companyAndUser.email}</td>
                            <td>${companyAndUser.phone}</td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `, 'companies')
}