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

    maneuverText(maneuver) {
        const texts = {
            TURN_LEFT: 'Drej til venstre',
            TURN_SLIGHT_LEFT: 'Drej let til venstre',
            TURN_SHARP_LEFT: 'Drej skarpt til venstre',
            U_TURN_LEFT: 'Lav en U-vending',
            TURN_RIGHT: 'Drej til højre',
            TURN_SLIGHT_RIGHT: 'Drej let til højre',
            TURN_SHARP_RIGHT: 'Drej skarpt til højre',
            U_TURN_RIGHT: 'Lav en U-vending',
            ROUNDABOUT_LEFT: 'Tag rundkørslen',
            ROUNDABOUT_RIGHT: 'Tag rundkørslen',
            ARRIVE: 'Du er fremme',
            FERRY: 'Tag færgen'
        }
        return texts[maneuver] || 'Fortsæt ligeud'
    },

    updateNavBanner(steps, stepIndex, currentPos) {
        const step = steps[stepIndex]
        if (!step) return
        const stepPos = { lat: step.startLocation.latLng.latitude, lng: step.startLocation.latLng.longitude }
        const dist = geoUtils.distanceMeters(currentPos, stepPos)
        const maneuver = step.navigationInstruction?.maneuver
        const iconEl = document.getElementById('nav-icon')
        const distEl = document.getElementById('nav-dist')
        const maneuverEl = document.getElementById('nav-maneuver')
        const detailEl = document.getElementById('nav-detail')
        if (iconEl) iconEl.textContent = this.maneuverIcon(maneuver)
        if (distEl) distEl.textContent = geoUtils.formatDist(dist)
        if (maneuverEl) maneuverEl.textContent = this.maneuverText(maneuver)
        if (detailEl) detailEl.textContent = this.extractRoadName(step.navigationInstruction?.instructions || '')
    },

    extractRoadName(instruction) {
        const patterns = [' ad ', ' og følg ', ' og tag ']
        const lower = instruction.toLowerCase()
        for (const pattern of patterns) {
            const idx = lower.indexOf(pattern)
            if (idx !== -1) return instruction.slice(idx + pattern.length)
        }
        return instruction
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
