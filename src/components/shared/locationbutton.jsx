"use client";

import {
  useMap,
} from "@vis.gl/react-google-maps";

import { Button } from "@/components/ui/button";

import { IconLocationPin } from "@tabler/icons-react"


export default function LocationButton({ setUserPosition }) {
  const map = useMap();

  const handleLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported.");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const pos = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };

        setUserPosition(pos);

        if (map) {
          map.panTo(pos);
          map.setZoom(14);
        }
      },
      () => {
        alert("Unable to retrieve location.");
      }
    );
  };

  return (
    <Button
      onClick={handleLocation}
      style={{
        position: "absolute",
        top: 16,
        left: 16,
        zIndex: 1,
      }}
    >
      <IconLocationPin data-icon="inline-start" stroke={2} />
    </Button>
  );
}
