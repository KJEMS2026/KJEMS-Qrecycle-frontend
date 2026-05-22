export const mapRenderer = {
    async drawRoute(map, encodedPolyline, stopPositions) {
        const { encoding } = await google.maps.importLibrary('geometry')
        const { AdvancedMarkerElement } = await google.maps.importLibrary('marker')

        const path = encoding.decodePath(encodedPolyline)
        new google.maps.Polyline({ path, map, strokeColor: '#1a2332', strokeWeight: 4, strokeOpacity: 0.9 })

        stopPositions.forEach((pos, i) => {
            const pin = document.createElement('div')
            pin.className = 'route-map-pin'
            pin.textContent = i + 1
            new AdvancedMarkerElement({
                map,
                position: { lat: pos.latLng.latitude, lng: pos.latLng.longitude },
                content: pin
            })
        })
    }
}
