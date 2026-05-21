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
    },

    setupListeners(bagsCountRef, onEnd) {
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
}
