import { logout } from "./auth.js";

export function renderAdminLayout(contentHTML, activeNav = '', totalBagsToBeCollected = 0) {
    document.querySelector('.content').innerHTML = `
        <div class="admin-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="docs/image/logo.png" alt="Qrecycle-logo" class="sidebar-logo-img">
                    <div class="sidebar-logo-text">Qrecycle<span></span></div>
                </div>
                <nav class="sidebar-nav">
                    <a class="${activeNav === 'active-pickup-requests' ? 'active' : ''}" id="nav-pickupRequests">Anmodninger <span class="badge">${totalBagsToBeCollected}</span></a>
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

    document.getElementById('logout')?.addEventListener('click', logout);
}