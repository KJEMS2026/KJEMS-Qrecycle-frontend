import { renderAdminLayout } from "./admin-sidebar.js";
import { getStatisticList } from "./api.js";

let statisticList = [];

export async function collectedBagsStats (){
    statisticList = await getStatisticList();

    renderAdminLayout(`
    
    `, 'active-pickup-requests');
}