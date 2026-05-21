// ─────────────────────────────────────────────
// TILGANG A — Google Maps Embed iframe (C5A)
// ─────────────────────────────────────────────

import { MAPS_KEY, activeBottomPanelHTML, setupBottomPanelListeners, driverView } from './driver.js'

export async function showActiveRouteEmbed(firstName, orderedStops, legs, driverLocation) {
    const bagsCount = { value: 0 }
    const stop = orderedStops[0]
    const leg = legs[0]
    const distanceKm = (leg.distanceMeters / 1000).toFixed(1)
    const durationMin = Math.round(parseInt(leg.duration) / 60)

    const origin = `${driverLocation.lat},${driverLocation.lng}`
    const addresses = orderedStops.map(s => encodeURIComponent(s.address))
    const destination = addresses[addresses.length - 1]
    const waypoints = addresses.length > 1 ? addresses.slice(0, -1).join('|') : ''
    const waypointParam = waypoints ? `&waypoints=${waypoints}` : ''

    const embedUrl = `https://www.google.com/maps/embed/v1/directions?key=${MAPS_KEY}&origin=${origin}&destination=${destination}${waypointParam}&mode=driving`

    document.querySelector('.content').innerHTML = `
        <div class="active-route-app">
            <div class="nav-container">
                <iframe
                    src="${embedUrl}"
                    width="100%"
                    height="100%"
                    style="border:0;"
                    allowfullscreen
                    loading="lazy"
                    referrerpolicy="no-referrer-when-downgrade">
                </iframe>
            </div>
            ${activeBottomPanelHTML(stop, orderedStops, distanceKm, durationMin)}
        </div>
    `

    setupBottomPanelListeners(bagsCount, () => driverView())
}
