export const MAPS_KEY = 'AIzaSyBmGSw3YXZZlzXWfptrK_JTH43wSlc31zo'

export const mapsLoader = {
    load() {
        return new Promise(resolve => {
            if (window.google?.maps) { resolve(); return }
            window.__mapsReady = resolve
            const script = document.createElement('script')
            script.src = `https://maps.googleapis.com/maps/api/js?key=${MAPS_KEY}&loading=async&libraries=geometry,marker,places&callback=__mapsReady`
            document.head.appendChild(script)
        })
    }
}
