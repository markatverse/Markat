import React, { useEffect, useMemo, useRef } from 'react';
import { useMapEvents, Marker } from 'react-leaflet';
import L from 'leaflet';

export default function InnerMap({ 
  position, 
  setPosition 
}: { 
  position: L.LatLng | null; 
  setPosition: (pos: L.LatLng) => void;
}) {
  const markerRef = useRef<any>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 17), { duration: 0.8 });
    },
    locationfound(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, Math.max(map.getZoom(), 17), { duration: 0.8 });
    },
  });

  // Automatically fly to position and zoom into ground level (17)
  useEffect(() => {
    if (position) {
      map.flyTo(position, Math.max(map.getZoom(), 17), { duration: 1 });
    }
  }, [position?.lat, position?.lng]);

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          setPosition(newPos);
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker 
      position={position} 
      draggable={true} 
      eventHandlers={eventHandlers}
      ref={markerRef}
    />
  );
}
