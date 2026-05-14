"use client";

import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
} from "@vis.gl/react-google-maps";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { useEffect, useState, useRef } from "react";
import trees from "../../data/trees";
// [{ name: "Oak, English", lat: 43.64, lng: -79.41, key: "ABCD" }]

export default function Intro() {
  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <APIProvider apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}>
        <Map
          center={{ lat: 55.67594, lng: 12.56553 }}
          zoom={15}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID}
        >
          <Markers points={trees} />
        </Map>
      </APIProvider>
    </div>
  );
}

const Markers = ({ points }) => {
  const map = useMap();
  const [markers, setMarkers] = useState({});
  const clusterer = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (!clusterer.current) {
      clusterer.current = new MarkerClusterer({ map });
    }
  }, [map]);

  useEffect(() => {
    clusterer.current?.clearMarkers();
    clusterer.current?.addMarkers(Object.values(markers));
  }, [markers]);

  const setMarkerRef = (marker, key) => {
    if (marker && markers[key]) return;
    if (!marker && !markers[key]) return;

    setMarkers((prev) => {
      if (marker) {
        return { ...prev, [key]: marker };
      } else {
        const newMarkers = { ...prev };
        delete newMarkers[key];
        return newMarkers;
      }
    });
  };

  return (
    <>
      {points.map((point) => (
        <AdvancedMarker
          position={point}
          key={point.key}
          ref={(marker) => setMarkerRef(marker, point.key)}
        >
          <span style={{ fontSize: "2rem" }}>🌳</span>
        </AdvancedMarker>
      ))}
    </>
  );
};
