"use client";

import { useState } from "react";

import {
  APIProvider,
  Map,
  AdvancedMarker,
  Pin,
  InfoWindow,
} from "@vis.gl/react-google-maps";
import LocationButton from "@/components/shared/locationbutton";

import { Button } from "@/components/ui/button";
import { IconLocationPin } from "@tabler/icons-react"


export default function Maps() {
  const defaultPosition = {
    lat: 55.67594,
    lng: 12.56553,
  };

  const [open, setOpen] = useState(false);

  const [userPosition, setUserPosition] = useState(null);

  return (
    <APIProvider
      apiKey={process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""}
    >
      <div
        style={{
          width: "100%",
          height: "100vh",
          position: "relative",
        }}
      >
        <Map
          defaultCenter={defaultPosition}
          defaultZoom={10}
          mapId={process.env.NEXT_PUBLIC_GOOGLE_MAPS_ID || ""}
          gestureHandling="greedy"
          disableDefaultUI={false}
          zoomControl={true}
          scrollwheel={true}
          draggable={true}
          keyboardShortcuts={true}
          fullscreenControl={true}
          streetViewControl={true}
          mapTypeControl={true}
        >
          {/* Default Marker */}
          <AdvancedMarker
            position={defaultPosition}
            onClick={() => setOpen(true)}
          >
            <Pin
              background="darkblue"
              borderColor="black"
              glyphColor="white"
            />

            {open && (
              <InfoWindow onCloseClick={() => setOpen(false)}>
                <div>Marker Info</div>
              </InfoWindow>
            )}
          </AdvancedMarker>

          {/* User Marker */}
          {userPosition && (
            <AdvancedMarker position={userPosition}>
              <Pin
                background="red"
                borderColor="black"
                glyphColor="white"
              />
            </AdvancedMarker>
          )}
        </Map>

        <LocationButton setUserPosition={setUserPosition} />
      </div>
    </APIProvider>
  );
}
