import { pant } from './pant.js'

export const bottomPanel = {
    buildHtml(stop, orderedStops, distanceKm, durationMin) {
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
                ${stop.pickupRequestId ? `
                <p class="bags-label">Antal poser hentet</p>
                <div class="bags-controls">
                    <button class="bags-btn" id="btn-minus">−</button>
                    <span class="bags-count" id="bags-count">1</span>
                    <button class="bags-btn" id="btn-plus">+</button>
                </div>
                <button class="btn-mark-collected" id="btn-mark">✓ Marker stop som afhentet</button>
                ` : ''}
                <div class="route-secondary-actions">
                    ${stop.isExtra
                        ? `<button class="btn-secondary btn-end-stop" id="btn-end">✓ Afslut stop</button>`
                        : `<button class="btn-secondary btn-end-route" id="btn-end">× Afslut rute</button>`
                    }
                </div>
            </section>
        `
    },

    setupListeners(routeStop, bagsCountRef, onEnd, onMarkCollected) {
        if (routeStop.pickupRequestId) {
            document.getElementById('btn-minus').addEventListener('click', () => {
                if (bagsCountRef.value > 1) bagsCountRef.value--
                document.getElementById('bags-count').textContent = bagsCountRef.value
            })
            document.getElementById('btn-plus').addEventListener('click', () => {
                bagsCountRef.value++
                document.getElementById('bags-count').textContent = bagsCountRef.value
            })
            document.getElementById('btn-mark').addEventListener('click', async () => {
                const confirmed = confirm(`Er du sikker på at du vil markere ${routeStop.companyName} som afhentet?`)
                if (!confirmed) return
                await pant.registerPickup(routeStop, bagsCountRef.value)
                onMarkCollected()
            })
        }
        if (routeStop.isExtra) {
            document.getElementById('btn-end').addEventListener('click', onMarkCollected)
        } else {
            document.getElementById('btn-end').addEventListener('click', onEnd)
        }
    }
}
