import { renderAdminLayout } from "./admin-sidebar.js";
import { getAllUsers, saveUser, deleteUser, getPrefilledUserForEditForm, updateUser } from "./api.js";

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
    <div>
        <button id="create-user-btn" class="btn-primary">+ Opret ny bruger</button>
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
                                    <button class="update-btn" data-id="${user.id}">Rediger</button>
                                    <button class="delete-btn" data-id="${user.id}">Slet</button>
                                </div>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        </div>
    `, users)
    document.getElementById('create-user-btn').addEventListener('click', createUser)
    document.querySelectorAll('.delete-btn').forEach(button => {
        button.addEventListener('click', async() => {
            const confirmed = confirm("Er du sikker på du vil slette brugeren? Handlingen kan ikke fortrydes.")
            if (!confirmed) return
            const userId = button.getAttribute('data-id');
            await deleteUser(userId)
            await allUsers()
        });

    });
    document.querySelectorAll('.update-btn').forEach(button => {
        button.addEventListener('click', async() => {
            const userId = button.getAttribute('data-id');
            await editUser(userId)
        })
    })
}

async function createUser(){
    let selectedRole = null;

    document.querySelector('.content').innerHTML = `
    <div class="pickup-request-form-container">
        <h2>Opret ny bruger</h2>
        <form>
        
            <div class="form-field">
                <label for="firstName">Fornavn</label>
                <input type="text" id="firstName">
                <label for="lastName">Efternavn</label>
                <input type="text" id="lastName">
                <label for="email">E-mail</label>
                <input type="text" id="email">
                <label for="phonenumber">Telefonnummer</label>
                <input type="text" id="phonenumber">
                <label for="password">Adgangskode</label>
                <input type="text" id="password">
                
            </div>
            <div class="expense-form-field">
            <label>Rolle</label>
            <div class="role-selector">
            <button type="button" class="role-btn" data-role="COMPANY">Virksomhed</button>
            <button type="button" class="role-btn" data-role="DRIVER">Chauffør</button>
            <button type="button" class="role-btn" data-role="ADMIN">Admin</button>
            </div>
            </div>
            
            <div class="form-field hidden" id="company-fields">
                <label for="companyName">Virksomhedsnavn</label>
                <input type="text" id="companyName">
                <label for="companyAddress">Adresse</label>
                <input type="text" id="companyAddress" placeholder="Retortvej 38, 2500 København">
            </div>

            <div class="form-actions">
                <button type="button" id="btn-cancel" class="btn-cancel">Annullér</button>
                <button type="button" id="btn-submit" class="btn-primary">Opret bruger</button>
            </div>
        </form>
    </div>
    `;
    document.querySelectorAll('.role-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'))
            btn.classList.add('active')
            selectedRole = btn.dataset.role
            const companyFields = document.getElementById('company-fields')
            companyFields.classList.toggle('hidden', selectedRole !== 'COMPANY')
        })
    })
    document.getElementById('btn-submit').addEventListener('click', async () => {
        const firstName = document.getElementById('firstName').value
        const lastName = document.getElementById('lastName').value
        const email = document.getElementById('email').value
        const phonenumber = document.getElementById('phonenumber').value
        const password = document.getElementById('password').value

        if (!firstName || !lastName || !email || !phonenumber || !selectedRole || !password) {
            alert("Udfyld venligst alle felter")
            return
        }

        let companyName = null
        let companyAddress = null

        if (selectedRole === 'COMPANY') {
            companyName = document.getElementById('companyName').value
            companyAddress = document.getElementById('companyAddress').value

            if (!companyName || !companyAddress) {
                alert("Udfyld venligst virksomhedsnavn og adresse")
                return
            }
        }

        const wasAccepted = await saveUser(firstName, lastName, email, phonenumber, selectedRole, password, companyName, companyAddress)
        if (wasAccepted) {
            await allUsers()
        }
    })

    document.getElementById('btn-cancel').addEventListener('click', allUsers)
}

async function editUser(id){
    const user = await getPrefilledUserForEditForm(id)

    document.querySelector('.content').innerHTML = `
    <div class="pickup-request-form-container">
        <h2>Rediger bruger</h2>
        <form>
            <div class="form-field">
                <label for="firstName">Fornavn</label>
                <input type="text" id="firstName" value="${user.firstName}">
                <label for="lastName">Efternavn</label>
                <input type="text" id="lastName" value="${user.lastName}">
                <label for="email">E-mail</label>
                <input type="text" id="email" value="${user.email}">
                <label for="phonenumber">Telefonnummer</label>
                <input type="text" id="phonenumber" value="${user.phonenumber}">
                <label for="password">Ny adgangskode</label>
                <input type="text" id="password" placeholder="Lad være tom for at beholde nuværende">
            </div>

            ${user.role === 'COMPANY' ? `
            <div class="form-field">
                <label for="companyName">Virksomhedsnavn</label>
                <input type="text" id="companyName" value="${user.companyName}">
                <label for="companyAddress">Adresse</label>
                <input type="text" id="companyAddress" value="${user.companyAddress}">
            </div>` : ''}

            <div class="form-actions">
                <button type="button" id="btn-cancel" class="btn-cancel">Annullér</button>
                <button type="button" id="btn-submit" class="btn-primary">Gem ændringer</button>
            </div>
        </form>
    </div>
    `

    document.getElementById('btn-submit').addEventListener('click', async () => {
        const firstName = document.getElementById('firstName').value
        const lastName = document.getElementById('lastName').value
        const email = document.getElementById('email').value
        const phonenumber = document.getElementById('phonenumber').value
        const password = document.getElementById('password').value

        if (!firstName || !lastName || !email || !phonenumber) {
            alert("Udfyld venligst alle felter")
            return
        }

        let companyName = null
        let companyAddress = null

        if (user.role === 'COMPANY') {
            companyName = document.getElementById('companyName').value
            companyAddress = document.getElementById('companyAddress').value

            if (!companyName || !companyAddress) {
                alert("Udfyld venligst virksomhedsnavn og adresse")
                return
            }
        }

        const wasAccepted = await updateUser(id, firstName, lastName, email, phonenumber, password, companyName, companyAddress)
        if (wasAccepted) {
            await allUsers()
        }
    })

    document.getElementById('btn-cancel').addEventListener('click', allUsers)
}