import { logout } from "./auth.js";
import { collectedBagsStats } from "./collected-bags-stats.js";
import { getActivePickupRequests } from "./api.js";
import { pickupRequestView } from "./active-pickup-requests.js";
import { expenseView } from "./expense.js"
import { allUsers } from "./user.js"

export async function renderAdminLayout(contentHTML, activeNav = '') {
    document.querySelector('.content').innerHTML = `
        <div class="admin-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="docs/image/logo.png" alt="Qrecycle-logo" class="sidebar-logo-img">
                    <div class="sidebar-logo-text">Qrecycle<span></span></div>
                </div>
                <nav class="sidebar-nav">
                    <a class="${activeNav === 'active-pickup-requests' ? 'active' : ''}" id="nav-pickupRequests">
            Anmodninger <span class="badge" id="bags-badge">0</span>
        </a>
                    <a class="${activeNav === 'users' ? 'active' : ''}" id="nav-users">Brugere</a>
                    <a class="${activeNav === 'companies' ? 'active' : ''}" id="nav-companies">Virksomheder</a>
                    <a class="${activeNav === 'stats' ? 'active' : ''}" id="nav-stats">Statistik</a>
                    <a class="${activeNav === 'expenses' ? 'active' : ''}" id="nav-expenses">Omkostninger</a>
                </nav>
                 <button id="logout" class="btn-logout">Log ud</button>
            </aside>
            <div class="main">
                <div class="page-content">
                    ${contentHTML}
                </div>
            </div>
        </div>
    `;

    const activePickupRequests = await getActivePickupRequests();
    const totalBags = activePickupRequests.reduce((sum, req) => sum + req.bagsToBeCollected, 0);
    document.getElementById('bags-badge').textContent = totalBags;

    document.getElementById('logout').addEventListener('click', logout);
    document.getElementById('nav-pickupRequests').addEventListener('click', pickupRequestView)
    document.getElementById('nav-stats').addEventListener('click', collectedBagsStats)
    document.getElementById('nav-expenses').addEventListener('click', expenseView)
    document.getElementById('nav-users').addEventListener('click', allUsers)
}