import { renderAdminLayout } from "./admin-sidebar.js";
import { getStatisticList } from "./api.js";

let statisticList = [];

export async function collectedBagsStats (){
    statisticList = await getStatisticList();

    let totalPickups = statisticList.length;
    let totalBags = statisticList.reduce((sum, stat) => sum + stat.bagsCollected, 0);

    await renderAdminLayout(`
        <div class="stats-page-header">
            <h1>Statistik</h1>
        </div>
 
        <div class="stats-summary">
            <div class="summary-badge">
                <span class="summary-label">Total afhentninger</span>
                <span class="summary-value">${totalPickups}</span>
            </div>
            <div class="summary-badge">
                <span class="summary-label">Total poser</span>
                <span class="summary-value">${totalBags}</span>
            </div>
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
                <tbody>
                    ${statisticList.map(stat => {
        const date = new Date(stat.dateCollected).toLocaleDateString('da-DK', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        });
        const diff = stat.differenceInBags;
        const diffClass = diff < 0 ? 'diff-negative' : diff > 0 ? 'diff-positive' : 'diff-zero';
        const diffLabel = diff > 0 ? `+${diff}` : `${diff}`;
        return `
                            <tr>
                                <td>${date}</td>
                                <td>${stat.companyName}</td>
                                <td>${stat.bagsToBeCollected}</td>
                                <td>${stat.bagsCollected}</td>
                                <td><span class="diff-badge ${diffClass}">${diffLabel}</span></td>
                                <td>${stat.fullName}</td>
                            </tr>
                        `;
    }).join('')}
                </tbody>
            </table>
        </div>
    `, 'stats');

}