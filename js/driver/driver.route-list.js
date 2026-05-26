import { geoUtils } from './geo.utils.js'
import { stopItem } from './stop.item.js'
import { mapsLoader } from './maps.loader.js'

export const driverRouteList = {
    show(firstName, originalStops, callbacks) {
        let currentStops = [...originalStops]

        const render = () => {
            document.querySelector('.content').innerHTML = this.buildHtml(firstName, currentStops)
            this.attachListeners(currentStops, callbacks, render)
        }

        render()
    },

    buildHtml(firstName, stops) {
        const hasExtraStop = stops.some(stop => stop.isExtra)
        return `
            <div class="driver-app">
                <header class="driver-header">
                    <img src="docs/image/logo.png" alt="Qrecycle">
                    <button class="driver-header-back" id="btn-back">←</button>
                </header>
                <section class="route-list-section">
                    <h1 class="driver-greeting">Goddag, ${firstName}</h1>
                    <p class="driver-date">${geoUtils.formatCurrentDate()}</p>
                    <p class="route-list-title">Med på ruten (${stops.length})</p>
                    <div class="route-stop-list">
                        ${stops.length > 0
                            ? stops.map((stop, i) => stop.isExtra
                                ? stopItem.buildExtraStopHtml(stop, i)
                                : stopItem.buildRouteStopHtml(stop, i)).join('')
                            : '<div class="route-calculating">Ingen ventende stop</div>'
                        }
                    </div>
                    <button class="btn-add-stop ${hasExtraStop ? '' : 'btn-add-stop--active'}" id="btn-add-stop" ${hasExtraStop ? 'disabled' : ''}>+ Tilføj stop</button>
                    <div id="autocomplete-container" class="autocomplete-container" style="display:none">
                        <input id="places-input" class="places-input" type="text" placeholder="Søg efter sted eller adresse...">
                    </div>
                    <button class="btn-calculate-route" id="btn-calculate" ${stops.length === 0 ? 'disabled' : ''}>
                        Beregn rute →
                    </button>
                </section>
            </div>
        `
    },

    attachListeners(currentStops, callbacks, render) {
        document.getElementById('btn-back').addEventListener('click', callbacks.onBack)

        document.querySelectorAll('.route-stop-remove').forEach(btn => {
            btn.addEventListener('click', e => {
                const index = parseInt(e.currentTarget.dataset.index)
                currentStops.splice(index, 1)
                render()
            })
        })

        if (currentStops.length > 0) {
            document.getElementById('btn-calculate').addEventListener('click', () =>
                callbacks.onCalculate(currentStops)
            )
        }

        document.getElementById('btn-add-stop').addEventListener('click', () =>
            this.handleAddStop(currentStops, render)
        )
    },

    async handleAddStop(currentStops, render) {
        await mapsLoader.load()
        document.getElementById('btn-add-stop').style.display = 'none'
        document.getElementById('autocomplete-container').style.display = 'block'

        const input = document.getElementById('places-input')
        const userPos = await this.getUserPosition()
        const autocomplete = this.createAutocomplete(input, userPos)

        autocomplete.addListener('place_changed', () => {
            const selectedPlace = autocomplete.getPlace()
            if (!selectedPlace.geometry) return
            currentStops.unshift({
                companyName: selectedPlace.name,
                address: selectedPlace.formatted_address,
                lat: selectedPlace.geometry.location.lat(),
                lng: selectedPlace.geometry.location.lng(),
                isExtra: true
            })
            render()
        })

        input.focus()
    },

    getUserPosition() {
        return new Promise(resolve =>
            navigator.geolocation.getCurrentPosition(
                ({ coords }) => resolve(new google.maps.LatLng(coords.latitude, coords.longitude)),
                () => resolve(null),
                { enableHighAccuracy: true, timeout: 5000 }
            )
        )
    },

    createAutocomplete(input, userPos) {
        const bounds = userPos
            ? new google.maps.Circle({ center: userPos, radius: 15000 }).getBounds()
            : null
        return new google.maps.places.Autocomplete(input, {
            fields: ['name', 'formatted_address', 'geometry'],
            componentRestrictions: { country: 'dk' },
            ...(bounds && { bounds, strictBounds: false })
        })
    }
}
