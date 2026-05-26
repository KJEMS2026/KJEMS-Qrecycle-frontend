import { mapsLoader } from './maps.loader.js'
import { routeApi } from './route.api.js'
import { mapRenderer } from './map.renderer.js'
import { stopItem } from './stop.item.js'

const PREVIEW_COUNT = 3

export const driverRouteMap = {
    show(firstName, stops, callbacks) {
        document.querySelector('.content').innerHTML = this.buildHtml(stops.length)
        document.getElementById('btn-back').addEventListener('click', callbacks.onBack)
        this.loadAndRender(stops, callbacks)
    },

    buildHtml(stopCount) {
        return `
            <div class="driver-app">
                <header class="driver-header">
                    <img src="docs/image/logo.png" alt="Qrecycle">
                    <button class="driver-header-back" id="btn-back">←</button>
                </header>
                <section class="route-map-section">
                    <h1 class="driver-greeting">Dagens rute</h1>
                    <p class="route-map-subtitle">${stopCount} stop · optimeret rækkefølge</p>
                    <div id="map"></div>
                    <div class="route-stops-preview" id="stop-list">
                        <div class="route-calculating">Beregner rute...</div>
                    </div>
                    <button class="btn-calculate-route" id="btn-start-nav" disabled>Start rute →</button>
                </section>
            </div>
        `
    },

    async loadAndRender(stops, callbacks) {
        await mapsLoader.load()

        navigator.geolocation.getCurrentPosition(
            async ({ coords }) => {
                const driverLocation = { lat: coords.latitude, lng: coords.longitude }
                try {
                    const route = await routeApi.computeRoute(stops, driverLocation)
                    const orderedStops = this.buildOrderedStops(stops, route)
                    const stopPositions = route.legs.map(leg => leg.endLocation)

                    const map = new google.maps.Map(document.getElementById('map'), {
                        mapId: 'DEMO_MAP_ID',
                        zoom: 12,
                        center: driverLocation,
                        disableDefaultUI: true,
                        zoomControl: true
                    })

                    await mapRenderer.drawRoute(map, route.polyline.encodedPolyline, stopPositions)
                    this.renderStopPreview(orderedStops)
                    this.enableStartNavigation(orderedStops, route.legs, driverLocation, callbacks)
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
    },

    buildOrderedStops(stops, route) {
        const optimizedIndices = route.optimizedIntermediateWaypointIndex
        return [
            ...(optimizedIndices?.length > 0
                ? optimizedIndices.map(i => stops[i])
                : stops.slice(0, -1)),
            stops[stops.length - 1]
        ]
    },

    enableStartNavigation(orderedStops, legs, driverLocation, callbacks) {
        const btnStart = document.getElementById('btn-start-nav')
        btnStart.disabled = false
        btnStart.addEventListener('click', () =>
            callbacks.onStartNavigation(orderedStops, legs, driverLocation)
        )
    },

    renderStopPreview(orderedStops) {
        const visibleStops = orderedStops.slice(0, PREVIEW_COUNT)
        const hiddenCount = orderedStops.length - PREVIEW_COUNT

        document.getElementById('stop-list').innerHTML = `
            ${visibleStops.map((stop, i) => stopItem.buildPreviewStopHtml(stop, i)).join('')}
            ${hiddenCount > 0 ? `<div class="show-more-stops" id="show-more">↓ ${hiddenCount} stop mere</div>` : ''}
        `

        if (hiddenCount > 0) {
            document.getElementById('show-more').addEventListener('click', () => {
                document.getElementById('stop-list').innerHTML =
                    orderedStops.map((stop, i) => stopItem.buildPreviewStopHtml(stop, i)).join('')
            })
        }
    }
}
