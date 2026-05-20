import { supabase } from './supabase.js'
import { fetchRouteStops } from './api.js'

const MAPS_KEY = 'AIzaSyBmGSw3YXZZlzXWfptrK_JTH43wSlc31zo'

export async function driverView() {
    const { data: { session } } = await supabase.auth.getSession()

    const { data: userData } = await supabase
        .from('user')
        .select('first_name')
        .eq('id', session.user.id)
        .single()

    const firstName = userData?.first_name || 'Chauffør'
    const stops = await fetchRouteStops().catch(() => [])

    showDashboard(firstName, stops)
}

function formatDate() {
    const d = new Date()
    const weekday = d.toLocaleDateString('da-DK', { weekday: 'long' })
    const day = d.getDate()
    const month = d.toLocaleDateString('da-DK', { month: 'long' })
    const year = d.getFullYear()
    return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${day}. ${month} ${year}`
}

function showDashboard(firstName, stops) {
    document.querySelector('.content').innerHTML = `
        <div class="driver-app">
            <header class="driver-header">
                <img src="docs/image/logo.png" alt="Qrecycle">
            </header>
            <main class="driver-main">
                <h1 class="driver-greeting">Goddag, ${firstName}</h1>
                <p class="driver-date">${formatDate()}</p>
                <button class="driver-card" id="btn-see-route">
                    <div class="driver-card-content">
                        <span>Se dagens rute</span>
                        <small>${stops.length} ventende stop · klar nu</small>
                    </div>
                    <span class="driver-card-arrow">→</span>
                </button>
                <button class="driver-card driver-card-gold">
                    <div class="driver-card-content">
                        <span>Registrér omkostning</span>
                        <small>Parkering, brændstof, andet</small>
                    </div>
                    <span class="driver-card-arrow">+</span>
                </button>
            </main>
        </div>
    `

    document.getElementById('btn-see-route').addEventListener('click', () => showRouteList(firstName, stops))
}

function showRouteList(firstName, originalStops) {
    let currentStops = [...originalStops]

    const render = () => {
        document.querySelector('.content').innerHTML = `
            <div class="driver-app">
                <header class="driver-header">
                    <img src="docs/image/logo.png" alt="Qrecycle">
                    <button class="driver-header-back" id="btn-back">←</button>
                </header>
                <section class="route-list-section">
                    <h1 class="driver-greeting">Goddag, ${firstName}</h1>
                    <p class="driver-date">${formatDate()}</p>
                    <p class="route-list-title">Med på ruten (${currentStops.length})</p>
                    <div class="route-stop-list">
                        ${currentStops.length > 0
                            ? currentStops.map((stop, i) => `
                                <div class="route-stop-item">
                                    <div class="route-stop-icon">✓</div>
                                    <div class="route-stop-info">
                                        <span>${stop.companyName}</span>
                                        <small>${stop.address}</small>
                                    </div>
                                    <button class="route-stop-remove" data-index="${i}">←</button>
                                </div>
                            `).join('')
                            : '<div class="route-calculating">Ingen ventende stop</div>'
                        }
                    </div>
                    <button class="btn-add-stop" disabled>+ Tilføj stop</button>
                    <button class="btn-calculate-route" id="btn-calculate" ${currentStops.length === 0 ? 'disabled' : ''}>
                        Beregn rute →
                    </button>
                </section>
            </div>
        `

        document.getElementById('btn-back').addEventListener('click', () => showDashboard(firstName, originalStops))

        document.querySelectorAll('.route-stop-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                const index = parseInt(e.currentTarget.dataset.index)
                currentStops.splice(index, 1)
                render()
            })
        })

        if (currentStops.length > 0) {
            document.getElementById('btn-calculate').addEventListener('click', () =>
                showRouteMap(firstName, currentStops, originalStops)
            )
        }
    }

    render()
}

async function showRouteMap(firstName, stops, originalStops) {
    document.querySelector('.content').innerHTML = `
        <div class="driver-app">
            <header class="driver-header">
                <img src="docs/image/logo.png" alt="Qrecycle">
                <button class="driver-header-back" id="btn-back">←</button>
            </header>
            <section class="route-map-section">
                <h1 class="driver-greeting">Dagens rute</h1>
                <p class="route-map-subtitle">${stops.length} stop · Google Maps beregner total km &amp; tid</p>
                <div id="map"></div>
                <div class="route-stops-preview" id="stop-list">
                    <div class="route-calculating">Beregner rute...</div>
                </div>
                <div class="start-choice">
                    <button class="btn-start-option" id="btn-start-embed" disabled>🗺 Google Maps</button>
                    <button class="btn-start-option btn-start-option-alt" id="btn-start-js" disabled>📍 Indbygget</button>
                </div>
            </section>
        </div>
    `

    document.getElementById('btn-back').addEventListener('click', () => showRouteList(firstName, originalStops))

    await loadGoogleMaps()

    navigator.geolocation.getCurrentPosition(
        async ({ coords }) => {
            const driverLocation = { lat: coords.latitude, lng: coords.longitude }
            try {
                const route = await computeRoute(stops, driverLocation)
                const orderedStops = route.optimizedIntermediateWaypointIndex.map(i => stops[i])
                const stopPositions = route.legs.slice(0, orderedStops.length).map(l => l.endLocation)

                const map = new google.maps.Map(document.getElementById('map'), {
                    mapId: 'DEMO_MAP_ID',
                    zoom: 12,
                    center: driverLocation,
                    disableDefaultUI: true,
                    zoomControl: true
                })

                await drawRoute(map, route.polyline.encodedPolyline, stopPositions)
                renderStopList(orderedStops)

                document.getElementById('btn-start-embed').disabled = false
                document.getElementById('btn-start-js').disabled = false

                document.getElementById('btn-start-embed').addEventListener('click', () =>
                    showActiveRouteEmbed(firstName, orderedStops, route.legs, driverLocation)
                )
                document.getElementById('btn-start-js').addEventListener('click', () =>
                    showActiveRoute(firstName, orderedStops, route.legs, driverLocation)
                )
            } catch {
                document.getElementById('stop-list').innerHTML =
                    '<div class="route-calculating">Kunne ikke beregne rute. Tjek at adresserne er korrekte.</div>'
            }
        },
        () => {
            document.getElementById('map').innerHTML =
                '<div style="height:100%;display:flex;align-items:center;justify-content:center;padding:16px;text-align:center">Tillad lokation i browseren for at beregne ruten</div>'
            document.getElementById('stop-list').innerHTML = ''
        }
    )
}

function loadGoogleMaps() {
    return new Promise(resolve => {
        if (window.google?.maps) { resolve(); return }
        window.__mapsReady = resolve
        const script = document.createElement('script')
        script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&loading=async&libraries=geometry,marker&callback=__mapsReady`
        document.head.appendChild(script)
    })
}

async function computeRoute(stops, origin) {
    const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-Goog-Api-Key': MAPS_KEY,
            'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.polyline,routes.legs.endLocation,routes.legs.duration,routes.legs.distanceMeters,routes.legs.polyline,routes.legs.steps.navigationInstruction,routes.legs.steps.startLocation,routes.legs.steps.distanceMeters'
        },
        body: JSON.stringify({
            origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
            destination: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
            intermediates: stops.map(s => ({ address: s.address })),
            travelMode: 'DRIVE',
            optimizeWaypointOrder: true,
            languageCode: 'da'
        })
    })
    const data = await res.json()
    if (!data.routes?.length) throw new Error('Ingen rute fundet')
    return data.routes[0]
}

async function drawRoute(map, encodedPolyline, stopPositions) {
    const { encoding } = await google.maps.importLibrary("geometry")
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker")

    const path = encoding.decodePath(encodedPolyline)
    new google.maps.Polyline({
        path,
        map,
        strokeColor: '#1a2332',
        strokeWeight: 4,
        strokeOpacity: 0.9
    })

    stopPositions.forEach((pos, i) => {
        const pin = document.createElement('div')
        pin.className = 'route-map-pin'
        pin.textContent = i + 1
        new AdvancedMarkerElement({
            map,
            position: { lat: pos.latLng.latitude, lng: pos.latLng.longitude },
            content: pin
        })
    })
}

function renderStopList(orderedStops) {
    const PREVIEW_COUNT = 3
    const visible = orderedStops.slice(0, PREVIEW_COUNT)
    const hiddenCount = orderedStops.length - PREVIEW_COUNT

    document.getElementById('stop-list').innerHTML = `
        ${visible.map((stop, i) => `
            <div class="route-stop-preview-item">
                <div class="route-stop-number">${i + 1}</div>
                <div class="route-stop-info">
                    <span>${stop.companyName}</span>
                    <small>${stop.address}</small>
                </div>
            </div>
        `).join('')}
        ${hiddenCount > 0 ? `<div class="show-more-stops" id="show-more">↓ ${hiddenCount} stop mere</div>` : ''}
    `

    if (hiddenCount > 0) {
        document.getElementById('show-more').addEventListener('click', () => {
            document.getElementById('stop-list').innerHTML = orderedStops.map((stop, i) => `
                <div class="route-stop-preview-item">
                    <div class="route-stop-number">${i + 1}</div>
                    <div class="route-stop-info">
                        <span>${stop.companyName}</span>
                        <small>${stop.address}</small>
                    </div>
                </div>
            `).join('')
        })
    }
}

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

function activeBottomPanelHTML(stop, orderedStops, distanceKm, durationMin) {
    return `
        <section class="active-bottom-panel">
            <div class="active-stop-row">
                <div>
                    <p class="active-stop-label">NÆSTE STOP · 1 AF ${orderedStops.length}</p>
                    <h2 class="active-stop-name">${stop.companyName}</h2>
                    <p class="active-stop-address">${stop.address}</p>
                </div>
                <div class="active-stop-eta">
                    <span class="eta-km" id="eta-km">${distanceKm} km</span>
                    <span class="eta-min" id="eta-min">${durationMin} min</span>
                </div>
            </div>
            <div class="active-divider"></div>
            <p class="bags-label">Antal poser hentet</p>
            <div class="bags-controls">
                <button class="bags-btn" id="btn-minus">−</button>
                <span class="bags-count" id="bags-count">0</span>
                <button class="bags-btn" id="btn-plus">+</button>
            </div>
            <button class="btn-mark-collected" id="btn-mark">✓ Marker stop som afhentet</button>
            <div class="route-secondary-actions">
                <button class="btn-secondary" id="btn-expense">+ Omkostning</button>
                <button class="btn-secondary btn-end-route" id="btn-end">× Afslut rute</button>
            </div>
        </section>
    `
}

function setupBottomPanelListeners(bagsCountRef, onEnd) {
    document.getElementById('btn-minus').addEventListener('click', () => {
        if (bagsCountRef.value > 0) bagsCountRef.value--
        document.getElementById('bags-count').textContent = bagsCountRef.value
    })
    document.getElementById('btn-plus').addEventListener('click', () => {
        bagsCountRef.value++
        document.getElementById('bags-count').textContent = bagsCountRef.value
    })
    document.getElementById('btn-end').addEventListener('click', onEnd)
}

// Tilgang A — Google Maps Embed iframe
async function showActiveRouteEmbed(firstName, orderedStops, legs, driverLocation) {
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

// Tilgang B — Indbygget JS API med live navigation
async function showActiveRoute(firstName, orderedStops, legs, driverLocation) {
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