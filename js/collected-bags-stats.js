import { renderAdminLayout } from "./admin-sidebar.js";
import { getStatisticList } from "./api.js";

let statisticList = [];

export async function collectedBagsStats (){
    statisticList = await getStatisticList();
    console.log(statisticList);

    let totalPickups = statisticList.length;
    let totalBags = statisticList.reduce((sum, stat) => sum + stat.bagsCollected, 0);

    renderAdminLayout(`
        <div>
    <h1>Statistik</h1>
</div>

<div>
    <span>TOTAL AFHENTNINGER</span>
    <span>${totalPickups}</span>
</div>

<div>
    <span>TOTAL POSER</span>
    <span>${totalBags}</span>
</div>

<table>
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
        return `
        <tr>
            <td>${date}</td>
            <td>${stat.companyName}</td>
            <td>${stat.bagsToBeCollected}</td>
            <td>${stat.bagsCollected}</td>
            <td>${stat.differenceInBags}</td>
            <td>${stat.fullName}</td>
        </tr>
    `;
    }).join('')}
    </tbody>
</table>
    `, 'stats');
}