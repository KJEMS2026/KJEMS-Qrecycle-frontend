import { routeApi } from './route.api.js'
import { bottomPanel } from './bottom.panel.js'
import { geoUtils } from './geo.utils.js'
import { navUtils } from './nav.utils.js'

export const driverActiveRoute = {
    show(orderedStops, legs, driverLocation, callbacks) {
        const stop = orderedStops[0]
        const leg = legs[0]
        const distanceKm = (leg.distanceMeters / 1000).toFixed(1)
        const durationMin = Math.round(parseInt(leg.duration) / 60)

        document.querySelector('.content').innerHTML = this.buildHtml(stop, orderedStops, distanceKm, durationMin)

        let watchId = null
        bottomPanel.setupListeners({ value: 0 }, () => {
            if (watchId) navigator.geolocation.clearWatch(watchId)
            callbacks.onEnd()
        })

        this.startNavigation(orderedStops, leg, driverLocation, (id) => { watchId = id })
    },

    buildHtml(stop, orderedStops, distanceKm, durationMin) {
        return `
            <div class="active-route-app">
                <div class="nav-container">
                    <div class="nav-banner" id="nav-banner">
                        <span class="nav-icon" id="nav-icon">↑</span>
                        <div class="nav-text">
                            <span class="nav-dist" id="nav-dist">beregner...</span>
                            <span class="nav-instruction" id="nav-instruction">Kører mod ${stop.companyName}</span>
                        </div>
                    </div>
                    <div id="active-map"></div>
                </div>
                ${bottomPanel.buildHtml(stop, orderedStops, distanceKm, durationMin)}
            </div>
        `
    },

    async startNavigation(orderedStops, leg, driverLocation, onWatchId) {
        let currentPos = driverLocation
        let prevPos = null
        let steps = leg.steps || []
        let stepIndex = 1
        let fullPath = []
        let currentPathIndex = 0
        let lastRerouteTime = 0
        let isRerouting = false

        const nextStopPos = {
            lat: leg.endLocation.latLng.latitude,
            lng: leg.endLocation.latLng.longitude
        }

        const gpsOptions = { enableHighAccuracy: true, maximumAge: 0, timeout: 10000 }

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

            const { encoding } = await google.maps.importLibrary('geometry')
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

            fullPath = encoding.decodePath(leg.polyline.encodedPolyline)
            const routePolyline = new google.maps.Polyline({
                path: fullPath,
                map: activeMap,
                strokeColor: '#4285f4',
                strokeWeight: 6,
                strokeOpacity: 0.95
            })

            const driverEl = document.createElement('div')
            driverEl.className = 'driver-live-dot'
            const driverMarker = new AdvancedMarkerElement({ map: activeMap, position: currentPos, content: driverEl })

            const stopPin = document.createElement('div')
            stopPin.className = 'route-map-pin'
            stopPin.textContent = '1'
            new AdvancedMarkerElement({ map: activeMap, position: nextStopPos, content: stopPin })

            if (steps.length > 1) navUtils.updateNavBanner(steps, stepIndex, currentPos)

            const watchId = navigator.geolocation.watchPosition(({ coords }) => {
                const newPos = { lat: coords.latitude, lng: coords.longitude }

                if (prevPos) activeMap.setHeading(geoUtils.calculateBearing(prevPos, newPos))
                prevPos = currentPos
                currentPos = newPos
                driverMarker.position = newPos
                activeMap.panTo(newPos)

                // Trim polyline til aktuel position
                const { index, distFromRoute } = navUtils.findNearestPathPoint(fullPath, newPos, currentPathIndex)
                currentPathIndex = index
                routePolyline.setPath(fullPath.slice(currentPathIndex))

                // Fremryk step og opdater nav-banner
                if (steps.length > 1 && stepIndex < steps.length) {
                    const stepPos = {
                        lat: steps[stepIndex].startLocation.latLng.latitude,
                        lng: steps[stepIndex].startLocation.latLng.longitude
                    }
                    if (geoUtils.distanceMeters(newPos, stepPos) < 30 && stepIndex < steps.length - 1) stepIndex++
                    navUtils.updateNavBanner(steps, stepIndex, newPos)
                }

                // Gensøg rute hvis for langt væk
                const now = Date.now()
                const hasMoved = !prevPos || geoUtils.distanceMeters(prevPos, newPos) > 10
                if (distFromRoute > 50 && hasMoved && now - lastRerouteTime > 30000 && !isRerouting) {
                    isRerouting = true
                    lastRerouteTime = now
                    routeApi.computeRoute(orderedStops, newPos).then(newRoute => {
                        const newLeg = newRoute.legs[0]
                        fullPath = encoding.decodePath(newLeg.polyline.encodedPolyline)
                        currentPathIndex = 0
                        routePolyline.setPath(fullPath)

                        steps = newLeg.steps || []
                        stepIndex = 1
                        if (steps.length > 1) navUtils.updateNavBanner(steps, stepIndex, newPos)

                        const kmEl = document.getElementById('eta-km')
                        const minEl = document.getElementById('eta-min')
                        if (kmEl) kmEl.textContent = `${(newLeg.distanceMeters / 1000).toFixed(1)} km`
                        if (minEl) minEl.textContent = `${Math.round(parseInt(newLeg.duration) / 60)} min`

                        isRerouting = false
                    }).catch(() => { isRerouting = false })
                }
            }, null, gpsOptions)

            onWatchId(watchId)
        }, null, gpsOptions)
    }
}
