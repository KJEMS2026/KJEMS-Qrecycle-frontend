import { supabase } from './supabase.js'
import { fetchRouteStops } from './api.js'
import { driverDashboard } from './driver/views/dashboard.js'
import { driverRouteList } from './driver/views/route-list.js'
import { driverRouteMap } from './driver/views/route-map.js'
import { driverActiveRoute } from './driver/views/active-route.js'

export async function driverView() {
    const { data: { session } } = await supabase.auth.getSession()
    const { data: userData } = await supabase.from('user').select('first_name').eq('id', session.user.id).single()

    const firstName = userData?.first_name || 'Chauffør'
    const stops = await fetchRouteStops().catch(() => [])

    showDashboard(firstName, stops)
}

function showDashboard(firstName, stops) {
    driverDashboard.show(firstName, stops, {
        toRouteList: () => showRouteList(firstName, stops)
    })
}

function showRouteList(firstName, stops) {
    driverRouteList.show(firstName, stops, {
        toDashboard: () => showDashboard(firstName, stops),
        toRouteMap: (filteredStops) => showRouteMap(firstName, filteredStops, stops)
    })
}

function showRouteMap(firstName, filteredStops, originalStops) {
    driverRouteMap.show(firstName, filteredStops, {
        toRouteList: () => showRouteList(firstName, originalStops),
        toActiveRoute: (orderedStops, legs, driverLocation) =>
            showActiveRoute(firstName, orderedStops, legs, driverLocation)
    })
}

function showActiveRoute(firstName, orderedStops, legs, driverLocation) {
    driverActiveRoute.show(orderedStops, legs, driverLocation, {
        toDashboard: () => driverView(),
        toRouteList: () => showRouteList(firstName, orderedStops.slice(1))
    })
}
