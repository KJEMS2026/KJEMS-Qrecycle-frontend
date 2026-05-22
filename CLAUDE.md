# KJEMS Qrecycle Frontend — Projektdokumentation

## Projektstruktur

To separate repos:
- **Frontend:** `KJEMS-Qrecycle-frontend` — Vanilla JS (ES modules), HTML, CSS
- **Backend:** `KJEMS-Qrecycle-backend` — Java, Spring Boot, JPA, MySQL

## Tech Stack

- Vanilla JavaScript (ES modules)
- HTML, CSS
- Supabase (auth + brugerdata)
- Google Maps JavaScript API (Routes API v2)

## Mappestruktur

```
index.html          — Eneste HTML-fil, alle views renderes i <div class="content">
js/
  app.js            — Entry point, kalder login()
  auth.js           — Login/logout, router til korrekt view baseret på rolle
  driver.js         — Al chauffør-logik (C2–C5)
  company.js        — Virksomhedsview
  admin.js          — Adminview
  api.js            — fetch-kald til backend (BACKEND_URL = http://localhost:8080)
  supabase.js       — Supabase-klient
css/
  login.css         — Login-side + globale variabler (:root)
  driver.css        — C2 dashboard, C3 ruteliste, C4 ruteoversigt
  active-route.css  — C4 kortpins, C5 aktiv kørsel styles
  start-choice.css  — C4 to-knap layout (🗺 Google Maps / 📍 Indbygget)
  navigation.css    — C5 nav-banner layout (nav-text, nav-dist, nav-instruction, nav-icon)
docs/
  wireframes/       — Wireframes navngivet C1–C7 (chauffør), V1–V4 (virksomhed), AD1–AD11 (admin)
```

## Konventioner

- **CSS:** Opret altid en ny `.css`-fil pr. feature — skriv aldrig i eksisterende filer. Link den nye fil i `index.html`
- **Views:** Hvert view er en JS-funktion der skriver HTML til `.content`-div med `innerHTML`
- **Routing:** Ingen URL-routing — views skiftes ved at kalde den relevante funktion

## Brugerroller og routing

Auth via Supabase. Efter login hentes `user_role` fra Supabase-tabellen `user`:

| Rolle | Funktion |
|-------|----------|
| `DRIVER` | `driverView()` |
| `COMPANY` | `companyView()` |
| `ADMIN` | `adminView()` |

## Chauffør-flow (js/driver.js)

| Screen | Funktion | Beskrivelse |
|--------|----------|-------------|
| C2 | `showDashboard()` | Dashboard med "Se dagens rute" og "Registrér omkostning" |
| C3 | `showRouteList()` | Liste af stops, mulighed for at fjerne enkeltvis |
| C4 | `showRouteMap()` | Kort med optimeret rute, nummererede pins, to start-knapper |
| C5A | `showActiveRouteEmbed()` | Tilgang A — Google Maps iframe med alle stops som waypoints |
| C5B | `showActiveRoute()` | Tilgang B — Indbygget kort: tilt 45°, heading følger kørselsretning, ETA opdateres hvert 30s via Routes API |

**Delte hjælpefunktioner i driver.js:**
- `activeBottomPanelHTML()` — genererer bund-panel HTML (delt mellem A og B)
- `setupBottomPanelListeners()` — posetæller og afslut-knap (delt mellem A og B)
- `calculateBearing()` — beregner kørselsretning mellem to GPS-punkter (bruges til `map.setHeading()`)
- `distanceMeters()` — haversine-afstand i meter mellem to GPS-punkter
- `maneuverIcon()` — mapper Routes API manøvre-enum til Unicode-pil (←↑→ osv.)
- `formatDist()` — formaterer meter til "250 m" eller "1.2 km"
- `updateNavBanner()` — opdaterer nav-banner ikon, afstand og vejinstruktion i DOM
- `findNearestPathPoint()` — finder nærmeste punkt på polyline fra et givet index fremad

**Tilgang B — navigationslogik:**
- `languageCode: 'da'` i Routes API-kald → danske vejinstruktioner
- Field mask inkluderer `routes.legs.steps.navigationInstruction`, `routes.legs.steps.startLocation`, `routes.legs.steps.distanceMeters`
- `stepIndex` starter ved 1 (springer DEPART over), avancerer når <30m fra næste step
- Polyline-trimning: `routePolyline.setPath(fullPath.slice(currentPathIndex))` fjerner tilbagelagt rute
- Gensøgning: hvis >50m fra rute og driver har bevæget sig >10m, re-kald `computeRoute` (max hvert 30s)

## Google Maps

- **API-nøgle:** ligger i konstanten `MAPS_KEY` øverst i `js/driver.js`
- Bruger **Routes API v2** (`routes.googleapis.com/directions/v2:computeRoutes`) via fetch
- Bruger `AdvancedMarkerElement` — kræver `mapId: 'DEMO_MAP_ID'` på alle kort
- Indlæses med `loading=async&libraries=geometry,marker&callback=__mapsReady`
- **Skal aktiveres i Google Cloud Console:** Maps JavaScript API + Routes API (separat)

## Hvad mangler (åbne tickets)

- "Marker stop som afhentet" — UI er klar i C5, backend endpoint mangler
- "+ Omkostning" — separat feature (C7)
- Navigér videre til næste stop efter afhentning