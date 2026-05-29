export const geoUtils = {
    distanceMeters(pos1, pos2) {
        const R = 6371000
        const lat1 = pos1.lat * Math.PI / 180
        const lat2 = pos2.lat * Math.PI / 180
        const dLat = (pos2.lat - pos1.lat) * Math.PI / 180
        const dLng = (pos2.lng - pos1.lng) * Math.PI / 180
        const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
        return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    },

    calculateBearing(from, to) {
        const lat1 = from.lat * Math.PI / 180
        const lat2 = to.lat * Math.PI / 180
        const dLng = (to.lng - from.lng) * Math.PI / 180
        const y = Math.sin(dLng) * Math.cos(lat2)
        const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
        return (Math.atan2(y, x) * 180 / Math.PI + 360) % 360
    },

    formatDist(meters) {
        return meters >= 1000 ? `${(meters / 1000).toFixed(1)} km` : `${Math.round(meters)} m`
    },

    formatCurrentDate() {
        const today = new Date()
        const weekday = today.toLocaleDateString('da-DK', { weekday: 'long' })
        const day = today.getDate()
        const month = today.toLocaleDateString('da-DK', { month: 'long' })
        const year = today.getFullYear()
        return `${weekday.charAt(0).toUpperCase() + weekday.slice(1)} · ${day}. ${month} ${year}`
    }
}
