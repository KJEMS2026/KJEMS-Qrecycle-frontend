export const stopItem = {
    buildRouteStopHtml(stop, index) {
        return `
            <div class="route-stop-item">
                <div class="route-stop-icon">✓</div>
                <div class="route-stop-info">
                    <span>${stop.companyName}</span>
                    <small>${stop.address}</small>
                </div>
                <button class="route-stop-remove" data-index="${index}">✕</button>
            </div>
        `
    },

    buildExtraStopHtml(stop, index) {
        return `
            <div class="route-stop-item route-stop-item--extra">
                <div class="route-stop-icon route-stop-icon--extra">+</div>
                <div class="route-stop-info">
                    <span>${stop.companyName}</span>
                    <small>${stop.address}</small>
                </div>
                <button class="route-stop-remove" data-index="${index}">✕</button>
            </div>
        `
    },

    buildPreviewStopHtml(stop, index) {
        return `
            <div class="route-stop-preview-item">
                <div class="route-stop-number">${index + 1}</div>
                <div class="route-stop-info">
                    <span>${stop.companyName}</span>
                    <small>${stop.address}</small>
                </div>
            </div>
        `
    }
}
