// ─────────────────────────────────────────────
// TILGANG B — Indbygget JS API med live navigation (C5B)
// ─────────────────────────────────────────────

import { computeRoute, activeBottomPanelHTML, setupBottomPanelListeners, driverView } from './driver.js'

function distanceMeters(pos1, pos2) {
    const R = 6371000
    const lat1 = pos1.lat * Math.PI / 180
    const lat2 = pos2.lat * Math.PI / 180
    const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
    const dLng = (pos2.lng - pos1.lng) * Math.PI / 180
    const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function maneuverIcon(maneuver) {
    const icons = {
        TURN_LEFT: '←', TURN_SLIGHT_LEFT: '↖', TURN_SHARP_LEFT: '↰', U_TURN_LEFT: '↩',
        TURN_RIGHT: '→', TURN_SLIGHT_RIGHT: '↗', TURN_SHARP_RIGHT: '↱', U_TURN_RIGHT: '↪',
        ROUNDABOUT_LEFT: '↺', ROUNDABOUT_RIGHT: '↻',
        ARRIVE: '📍', FERRY: '⛴'
    }
    return icons[maneuver] || '↑'
}

function formatDist(meters) {
    return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
}

function updateNavBanner(steps, stepIndex, currentPos) {
    const step = steps[stepIndex]
    if (!step) return
    const stepPos = { lat: step.startLocation.latLng.latitude, lng: step.startLocation.latLng.longitude }
    const dist = distanceMeters(currentPos, stepPos)
    const iconEl = document.getElementById('nav-icon')
    const distEl = document.getElementById('nav-dist')
    const instrEl = document.getElementById('nav-instruction')
    if (iconEl) iconEl.textContent = maneuverIcon(step.navigationInstruction?.maneuver)
    if (distEl) distEl.textContent = formatDist(dist)
    if (instrEl) instrEl.textContent = step.navigationInstruction?.instructions || ''
}

function findNearestPathPoint(path, pos, fromIndex) {
    let minDist = Infinity
    let minIndex = fromIndex
    for (let i = fromIndex; i < path.length; i++) {
        const d = distanceMeters(pos, { lat: path[i].lat(), lng: path[i].lng() })
        if (d < minDist) { minDist = d; minIndex = i }
        else if (d > minDist + 100) break
    }
    return { index: minIndex, distFromRoute: minDist }
}

function calculateBearing(from, to) {
    const lat1 = from.lat * Math.PI / 180
    const lat2 = to.lat * Math.PI / 180
    const dLng = (to.lng - from.lng) * Math.PI / 180
    const y = Math.sin(dLng) * Math.cos(lat2)
    const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
    return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
}

export async function showActiveRoute(firstName, orderedStops, legs, driverLocation) {
    const bagsCount = { value: 0 }
    let watchId = null
    let currentPos = driverLocation
    let prevPos = null
    let stepIndex = 1
    let currentPathIndex = 0
    let routePolyline = null
    let fullPath = []
    let lastRerouteTime = 0
    let isRerouting = false

    const stop = orderedStops[0]
    const leg = legs[0]
    const steps = leg.steps || []
    const distanceKm = (leg.distanceMeters / 1000).toFixed(1)
    const durationMin = Math.round(parseInt(leg.duration) / 60)

    document.querySelector('.content').innerHTML = `
        <div class="active-route-app">
            <div class="nav-container">
                <div class="nav-banner" id="nav-banner">
                    <span class="nav-icon" id="nav-icon">↑</span>
                    <div class="nav-text">
                        <span class="nav-dist" id="nav-dist">beregner...</span>
                        <span class="nav-instruction" id="nav-instruction">Kører mod ${stop.companyName}</span>
                    </div>
                    <span class="live-badge">● LIVE</span>
                </div>
                <div id="active-map"></div>
            </div>
            ${activeBottomPanelHTML(stop, orderedStops, distanceKm, durationMin)}
        </div>
    `

    setupBottomPanelListeners(bagsCount, () => {
        if (watchId) navigator.geolocation.clearWatch(watchId)
        driverView()
    })

    const nextStopPos = {
        lat: leg.endLocation.latLng.latitude,
        lng: leg.endLocation.latLng.longitude
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
        currentPos = { lat: coords.latitude, lng: coords.longitude }

        const activeMap = new google.maps.Map(document.getElementById('active-map'), {
            mapId: 'DEMO_MAP_ID',
            zoom: 17,
            center: currentPos,
            tilt: 45,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'greedy'
        })

        const { encoding } = await google.maps.importLibrary("geometry")
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")

        fullPath = encoding.decodePath(leg.polyline.encodedPolyline)
        routePolyline = new google.maps.Polyline({
            path: fullPath,
            map: activeMap,
            strokeColor: '#4285f4',
            strokeWeight: 6,
            strokeOpacity: 0.95
        })

        const driverEl = document.createElement('div')
        driverEl.className = 'driver-live-dot'
        const driverMarker = new AdvancedMarkerElement({
            map: activeMap,
            position: currentPos,
            content: driverEl
        })

        const stopPin = document.createElement('div')
        stopPin.className = 'route-map-pin'
        stopPin.textContent = '1'
        new AdvancedMarkerElement({ map: activeMap, position: nextStopPos, content: stopPin })

        if (steps.length > 1) updateNavBanner(steps, stepIndex, currentPos)

        watchId = navigator.geolocation.watchPosition(({ coords }) => {
            const newPos = { lat: coords.latitude, lng: coords.longitude }

            // Heading
            if (prevPos) activeMap.setHeading(calculateBearing(prevPos, newPos))
            prevPos = currentPos
            currentPos = newPos
            driverMarker.position = newPos
            activeMap.panTo(newPos)

            // Step tracking og banneropdatering
            if (steps.length > 1 && stepIndex < steps.length) {
                const stepPos = {
                    lat: steps[stepIndex].startLocation.latLng.latitude,
                    lng: steps[stepIndex].startLocation.latLng.longitude
                }
                if (distanceMeters(newPos, stepPos) < 30 && stepIndex < steps.length - 1) stepIndex++
                updateNavBanner(steps, stepIndex, newPos)
            }

            // Polyline-trimning
            const { index, distFromRoute } = findNearestPathPoint(fullPath, newPos, currentPathIndex)
            currentPathIndex = index
            routePolyline.setPath(fullPath.slice(currentPathIndex))

            // Gensøgning hvis kørt af rute
            const now = Date.now()
            const hasMoved = !prevPos || distanceMeters(prevPos, newPos) > 10
            if (distFromRoute > 50 && hasMoved && now - lastRerouteTime > 30000 && !isRerouting) {
                isRerouting = true
                lastRerouteTime = now
                computeRoute(orderedStops, newPos).then(newRoute => {
                    const newLeg = newRoute.legs[0]
                    fullPath = encoding.decodePath(newLeg.polyline.encodedPolyline)
                    currentPathIndex = 0
                    routePolyline.setPath(fullPath)

                    const kmEl = document.getElementById('eta-km')
                    const minEl = document.getElementById('eta-min')
                    if (kmEl) kmEl.textContent = `${(newLeg.distanceMeters / 1000).toFixed(1)} km`
                    if (minEl) minEl.textContent = `${Math.round(parseInt(newLeg.duration) / 60)} min`

                    const newSteps = newLeg.steps || []
                    steps.length = 0
                    steps.push(...newSteps)
                    stepIndex = 1
                    if (newSteps.length > 1) updateNavBanner(newSteps, stepIndex, newPos)
                    isRerouting = false
                }).catch(() => { isRerouting = false })
            }
        })
    })
}
