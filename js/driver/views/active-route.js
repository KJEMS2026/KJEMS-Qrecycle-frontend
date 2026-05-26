import { routeApi } from '../google-apis/route.api.js'
import { bottomPanel } from '../components/bottom.panel.js'
import { geoUtils } from '../utils/geo.utils.js'
import { navUtils } from '../utils/nav.utils.js'

const GPS_OPTIONS = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }
const REROUTE_MIN_INTERVAL_MS = 30000
const REROUTE_DISTANCE_THRESHOLD_M = 50
const STEP_ADVANCE_THRESHOLD_M = 30

export const driverActiveRoute = {
    async show(orderedStops, legs, driverLocation, navigation) {
        const currentStop = orderedStops[0]
        const firstLeg = legs[0]
        const distanceKm = (firstLeg.distanceMeters / 1000).toFixed(1)
        const durationMin = Math.round(parseInt(firstLeg.duration) / 60)

        document.querySelector('.content').innerHTML = this.buildHtml(currentStop, orderedStops, distanceKm, durationMin)

        const wakeLock = await this.requestWakeLock()
        const releaseWakeLock = () => { if (wakeLock) wakeLock.release() }

        let watchId = null
        bottomPanel.setupListeners(currentStop, { value: 1 }, () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
            releaseWakeLock()
            navigation.toDashboard()
        }, () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
            releaseWakeLock()
            navigation.toRouteList()
        })

        this.startNavigation(orderedStops, firstLeg, driverLocation, (id) => { watchId = id })
    },

    buildHtml(stop, orderedStops, distanceKm, durationMin) {
        return `
            <div class="active-route-app">
                <div class="nav-container">
                    <div class="nav-banner" id="nav-banner">
                        <div class="nav-arrow-section">
                            <span class="nav-dist" id="nav-dist">—</span>
                            <span class="nav-icon" id="nav-icon">↑</span>
                        </div>
                        <div class="nav-text-section">
                            <span class="nav-maneuver" id="nav-maneuver">Kører mod ${stop.companyName}</span>
                            <span class="nav-detail" id="nav-detail"></span>
                        </div>
                    </div>
                    <div id="active-map"></div>
                </div>
                ${bottomPanel.buildHtml(stop, orderedStops, distanceKm, durationMin)}
            </div>
        `
    },

    async requestWakeLock() {
        if (!('wakeLock' in navigator)) return null
        try {
            return await navigator.wakeLock.request('screen')
        } catch {
            return null
        }
    },

    async startNavigation(orderedStops, leg, driverLocation, onWatchId) {
        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const startPos = { lat: coords.latitude, lng: coords.longitude }
                const map = this.createActiveMap(startPos)
                const { encoding, AdvancedMarkerElement } = await this.loadMapLibraries()
                const fullPath = encoding.decodePath(leg.polyline.encodedPolyline)
                const { routePolyline, driverMarker } = this.setupRouteVisuals(map, leg, fullPath, AdvancedMarkerElement, startPos)

                const navState = {
                    steps: leg.steps || [],
                    stepIndex: 1,
                    fullPath,
                    currentPathIndex: 0,
                    lastRerouteTime: 0,
                    isRerouting: false,
                    prevPos: null,
                    currentPos: startPos
                }

                if (navState.steps.length > 1) navUtils.updateNavBanner(navState.steps, navState.stepIndex, startPos)

                const mapObjects = { map, driverMarker, routePolyline, encoding }
                const watchId = navigator.geolocation.watchPosition(
                    ({ coords }) => this.handlePositionUpdate(
                        { lat: coords.latitude, lng: coords.longitude },
                        navState, mapObjects, orderedStops
                    ),
                    null,
                    GPS_OPTIONS
                )
                onWatchId(watchId)
            },
            null,
            GPS_OPTIONS
        )
    },

    createActiveMap(center) {
        return new google.maps.Map(document.getElementById('active-map'), {
            mapId: 'DEMO_MAP_ID',
            zoom: 17,
            center,
            tilt: 45,
            disableDefaultUI: true,
            zoomControl: true,
            gestureHandling: 'greedy'
        })
    },

    async loadMapLibraries() {
        const { encoding } = await google.maps.importLibrary('geometry')
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')
        return { encoding, AdvancedMarkerElement }
    },

    setupRouteVisuals(map, leg, fullPath, AdvancedMarkerElement, startPos) {
        const routePolyline = new google.maps.Polyline({
            path: fullPath,
            map,
            strokeColor: '#4285f4',
            strokeWeight: 6,
            strokeOpacity: 0.95
        })

        const driverEl = document.createElement('div')
        driverEl.className = 'driver-live-dot'
        const driverMarker = new AdvancedMarkerElement({ map, position: startPos, content: driverEl })

        const stopPos = { lat: leg.endLocation.latLng.latitude, lng: leg.endLocation.latLng.longitude }
        const stopPin = document.createElement('div')
        stopPin.className = 'route-map-pin'
        stopPin.textContent = '1'
        new AdvancedMarkerElement({ map, position: stopPos, content: stopPin })

        return { routePolyline, driverMarker }
    },

    handlePositionUpdate(newPos, navState, mapObjects, orderedStops) {
        const { map, driverMarker, routePolyline } = mapObjects

        if (navState.prevPos) map.setHeading(geoUtils.calculateBearing(navState.prevPos, newPos))
        navState.prevPos = navState.currentPos
        navState.currentPos = newPos
        driverMarker.position = newPos
        map.panTo(newPos)

        const { index, distFromRoute } = navUtils.findNearestPathPoint(navState.fullPath, newPos, navState.currentPathIndex)
        navState.currentPathIndex = index
        routePolyline.setPath(navState.fullPath.slice(navState.currentPathIndex))

        this.advanceNavigationStep(navState, newPos)
        this.rerouteIfNeeded(navState, newPos, distFromRoute, mapObjects, orderedStops)
    },

    advanceNavigationStep(navState, currentPos) {
        if (navState.steps.length <= 1 || navState.stepIndex >= navState.steps.length) return

        const nextStep = navState.steps[navState.stepIndex]
        const nextStepPos = {
            lat: nextStep.startLocation.latLng.latitude,
            lng: nextStep.startLocation.latLng.longitude
        }

        if (geoUtils.distanceMeters(currentPos, nextStepPos) < STEP_ADVANCE_THRESHOLD_M
            && navState.stepIndex < navState.steps.length - 1) {
            navState.stepIndex++
        }

        navUtils.updateNavBanner(navState.steps, navState.stepIndex, currentPos)
    },

    rerouteIfNeeded(navState, currentPos, distFromRoute, mapObjects, orderedStops) {
        const hasMoved = !navState.prevPos || geoUtils.distanceMeters(navState.prevPos, currentPos) > 10
        const rerouteCooldownElapsed = Date.now() - navState.lastRerouteTime > REROUTE_MIN_INTERVAL_MS
        if (distFromRoute <= REROUTE_DISTANCE_THRESHOLD_M || !hasMoved || !rerouteCooldownElapsed || navState.isRerouting) return

        navState.isRerouting = true
        navState.lastRerouteTime = Date.now()
        routeApi.computeRoute(orderedStops, currentPos)
            .then(newRoute => this.applyRerouteResult(newRoute, navState, mapObjects, currentPos))
            .catch(() => { navState.isRerouting = false })
    },

    applyRerouteResult(newRoute, navState, mapObjects, currentPos) {
        const newLeg = newRoute.legs[0]
        navState.fullPath = mapObjects.encoding.decodePath(newLeg.polyline.encodedPolyline)
        navState.currentPathIndex = 0
        navState.steps = newLeg.steps || []
        navState.stepIndex = 1
        navState.isRerouting = false

        mapObjects.routePolyline.setPath(navState.fullPath)
        if (navState.steps.length > 1) navUtils.updateNavBanner(navState.steps, navState.stepIndex, currentPos)

        const distanceKmEl = document.getElementById('eta-km')
        const durationMinEl = document.getElementById('eta-min')
        if (distanceKmEl) distanceKmEl.textContent = `${(newLeg.distanceMeters / 1000).toFixed(1)} km`
        if (durationMinEl) durationMinEl.textContent = `${Math.round(parseInt(newLeg.duration) / 60)} min`
    }
}
