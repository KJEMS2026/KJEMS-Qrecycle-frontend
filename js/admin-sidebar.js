import { logout } from "./auth.js";

export function renderAdminLayout(contentHTML, activeNav = '') {
    document.querySelector('.content').innerHTML = `
        <div class="admin-layout">
            <aside class="sidebar">
                <div class="sidebar-logo">
                    <img src="docs/image/logo.png" alt="Qrecycle-logo" class="sidebar-logo-img">
                    <div class="sidebar-logo-text">Qrecycle<span></span></div>
                </div>
                <nav class="sidebar-nav">
                    <a class="${activeNav === 'anmodninger' ? 'active' : ''}" id="nav-anmodninger">Anmodninger</a>
                    <a class="${activeNav === 'brugere' ? 'active' : ''}" id="nav-brugere">Brugere</a>
                    <a class="${activeNav === 'virksomheder' ? 'active' : ''}" id="nav-virksomheder">Virksomheder</a>
                    <a class="${activeNav === 'statistik' ? 'active' : ''}" id="nav-statistik">Statistik</a>
                    <a class="${activeNav === 'omkostninger' ? 'active' : ''}" id="nav-omkostninger">Omkostninger</a>
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

    document.getElementById('logout-btn')?.addEventListener('click', logout);
}