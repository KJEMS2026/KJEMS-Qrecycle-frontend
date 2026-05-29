import { renderAdminLayout } from "./admin-sidebar.js";
import { getStatisticList } from "./api.js";

let statistics = [];

export async function collectedBagsStats() {
    statistics = await getStatisticList();

    const companyNames = [...new Set(statistics.map(statistic => statistic.companyName))].sort();

    await renderAdminLayout(`
        <div class="stats-page-header">
            <h1>Statistik</h1>
        </div>

        <div class="stats-summary">
            <div class="summary-badge">
                <span class="summary-label">Total afhentninger</span>
                <span class="summary-value" id="total-pickups">${statistics.length}</span>
            </div>
            <div class="summary-badge">
                <span class="summary-label">Total poser</span>
                <span class="summary-value" id="total-bags">${statistics.reduce((total, statistic) => total + statistic.bagsCollected, 0)}</span>
            </div>
        </div>

        <div class="stats-filters">
            <select id="company-filter">
                <option value="">Alle virksomheder</option>
                ${companyNames.map(name => `<option value="${name}">${name}</option>`).join('')}
            </select>
            <div class="stats-date-range">
                <input type="date" id="from-date" title="Fra dato">
                <span class="date-separator">–</span>
                <input type="date" id="to-date" title="Til dato">
            </div>
            <button id="reset-filters" class="stats-reset-btn">Nulstil</button>
        </div>

        <div class="stats-table-card">
            <table class="stats-table">
                <thead>
                    <tr>
                        <th>DATO AFHENTET</th>
                        <th>VIRKSOMHED</th>
                        <th>AFTALT POSER</th>
                        <th>ANTAL AFHENTET</th>
                        <th>DIFFERENCE</th>
                        <th>CHAUFFØR</th>
                    </tr>
                </thead>
                <tbody id="stats-tbody">
                    ${buildStatisticRows(statistics)}
                </tbody>
            </table>
        </div>
    `, 'stats');

    document.getElementById('company-filter').addEventListener('change', applyFilters);
    document.getElementById('from-date').addEventListener('change', applyFilters);
    document.getElementById('to-date').addEventListener('change', applyFilters);
    document.getElementById('reset-filters').addEventListener('click', resetFilters);
}

function buildStatisticRows(statistics) {
    if (statistics.length === 0) {
        return `<tr><td colspan="6" class="stats-empty">Ingen resultater matcher filteret</td></tr>`;
    }
    return statistics.map(statistic => {
        const formattedDate = new Date(statistic.dateCollected).toLocaleDateString('da-DK', {
            day: '2-digit', month: '2-digit', year: '2-digit'
        });
        const bagDifference = statistic.differenceInBags;
        const differenceBadgeClass = bagDifference < 0 ? 'diff-negative' : bagDifference > 0 ? 'diff-positive' : 'diff-zero';
        const differenceLabel = bagDifference > 0 ? `+${bagDifference}` : `${bagDifference}`;
        return `
            <tr>
                <td>${formattedDate}</td>
                <td>${statistic.companyName}</td>
                <td>${statistic.bagsToBeCollected}</td>
                <td>${statistic.bagsCollected}</td>
                <td><span class="diff-badge ${differenceBadgeClass}">${differenceLabel}</span></td>
                <td>${statistic.fullName}</td>
            </tr>
        `;
    }).join('');
}

function resetFilters() {
    document.getElementById('company-filter').value = '';
    document.getElementById('from-date').value = '';
    document.getElementById('to-date').value = '';
    applyFilters();
}

function applyFilters() {
    const selectedCompany = document.getElementById('company-filter').value;
    const fromDate = document.getElementById('from-date').value;
    const toDate = document.getElementById('to-date').value;

    const filteredStatistics = statistics.filter(statistic => {
        if (selectedCompany && statistic.companyName !== selectedCompany) return false;
        const collectedDate = statistic.dateCollected.split('T')[0];
        if (fromDate && collectedDate < fromDate) return false;
        if (toDate && collectedDate > toDate) return false;
        return true;
    });

    document.getElementById('stats-tbody').innerHTML = buildStatisticRows(filteredStatistics);
    document.getElementById('total-pickups').textContent = filteredStatistics.length;
    document.getElementById('total-bags').textContent = filteredStatistics.reduce((total, statistic) => total + statistic.bagsCollected, 0);
}