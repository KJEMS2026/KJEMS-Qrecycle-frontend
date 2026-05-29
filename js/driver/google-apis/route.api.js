import { MAPS_KEY } from './maps.loader.js'

export const routeApi = {
    async computeRoute(stops, origin) {
        const intermediates = stops.slice(0, -1)
        const res = await fetch('https://routes.googleapis.com/directions/v2:computeRoutes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-Goog-Api-Key': MAPS_KEY,
                'X-Goog-FieldMask': 'routes.optimizedIntermediateWaypointIndex,routes.polyline,routes.legs.endLocation,routes.legs.duration,routes.legs.distanceMeters,routes.legs.polyline,routes.legs.steps.navigationInstruction,routes.legs.steps.startLocation,routes.legs.steps.distanceMeters'
            },
            body: JSON.stringify({
                origin: { location: { latLng: { latitude: origin.lat, longitude: origin.lng } } },
                destination: { address: stops[stops.length - 1].address },
                intermediates: intermediates.map(stop => ({ address: stop.address })),
                travelMode: 'DRIVE',
                ...(intermediates.length > 1 && !stops[0]?.isExtra && { optimizeWaypointOrder: true }),
                languageCode: 'da'
            })
        })
        const data = await res.json()
        if (!data.routes?.length) throw new Error('Ingen rute fundet')
        return data.routes[0]
    }
}
