import { geoUtils } from './geo.utils.js'
import { stopItem } from './stop.item.js'

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
                            ? stops.map((stop, i) => stopItem.buildRouteStopHtml(stop, i)).join('')
                            : '<div class="route-calculating">Ingen ventende stop</div>'
                        }
                    </div>
                    <button class="btn-add-stop" disabled>+ Tilføj stop</button>
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
    }
}
