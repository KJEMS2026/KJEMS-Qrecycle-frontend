export const placesApi = {
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
