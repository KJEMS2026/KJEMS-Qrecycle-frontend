import { geoUtils } from './geo.utils.js'

export const navUtils = {
    maneuverIcon(maneuver) {
        const icons = {
            TURN_LEFT: '←', TURN_SLIGHT_LEFT: '↖', TURN_SHARP_LEFT: '↰', U_TURN_LEFT: '↩',
            TURN_RIGHT: '→', TURN_SLIGHT_RIGHT: '↗', TURN_SHARP_RIGHT: '↱', U_TURN_RIGHT: '↪',
            ROUNDABOUT_LEFT: '↺', ROUNDABOUT_RIGHT: '↻',
            ARRIVE: '📍', FERRY: '⛴'
        }
        return icons[maneuver] || '↑'
    },

    updateNavBanner(steps, stepIndex, currentPos) {
        const step = steps[stepIndex]
        if (!step) return
        const stepPos = { lat: step.startLocation.latLng.latitude, lng: step.startLocation.latLng.longitude }
        const dist = geoUtils.distanceMeters(currentPos, stepPos)
        const iconEl = document.getElementById('nav-icon')
        const distEl = document.getElementById('nav-dist')
        const instrEl = document.getElementById('nav-instruction')
        if (iconEl) iconEl.textContent = this.maneuverIcon(step.navigationInstruction?.maneuver)
        if (distEl) distEl.textContent = geoUtils.formatDist(dist)
        if (instrEl) instrEl.textContent = step.navigationInstruction?.instructions || ''
    },

    findNearestPathPoint(path, pos, fromIndex) {
        let minDist = Infinity
        let minIndex = fromIndex
        for (let i = fromIndex; i < path.length; i++) {
            const d = geoUtils.distanceMeters(pos, { lat: path[i].lat(), lng: path[i].lng() })
            if (d < minDist) { minDist = d; minIndex = i }
            else if (d > minDist + 100) break
        }
        return { index: minIndex, distFromRoute: minDist }
    }
}
