"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import 'leaflet/dist/leaflet.css';

// Use dynamic import so MapContainer and TileLayer don't crash on SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

// Since useMapEvents relies on context provided by MapContainer, we need a separate inner component dynamically loaded
const InnerMap = dynamic(() => import('./InnerMap'), { ssr: false });

export default function LocationPicker({ latitude, longitude, onChange, readOnly = false }: LocationPickerProps) {
  const [position, setPosition] = useState<any | null>(null);
  
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    // Fix Leaflet's default icon path issues dynamically on client side
    import('leaflet').then((L) => {
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
        iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      });
      if (latitude && longitude) {
        setPosition(new L.LatLng(latitude, longitude));
      }
    });
  }, [latitude, longitude]);

  if (!isClient) return <div className="h-64 bg-slate-100 rounded-2xl animate-pulse"></div>;

  return (
    <div className="h-64 w-full rounded-2xl overflow-hidden border-2 border-slate-200 z-0 relative">
      <MapContainer 
        center={position || [28.6139, 77.2090]} // Default to Delhi if no location
        zoom={13} 
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {!readOnly ? (
          <InnerMap position={position} setPosition={(pos: any) => {
            setPosition(pos);
            if (onChange) onChange(pos.lat, pos.lng);
          }} />
        ) : (
          position && <Marker position={position} />
        )}
      </MapContainer>
      {!readOnly && (
        <div className="absolute top-2 right-2 z-[1000]">
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            navigator.geolocation.getCurrentPosition(
              async (pos) => {
                const L = await import('leaflet');
                setPosition(new L.LatLng(pos.coords.latitude, pos.coords.longitude));
                if (onChange) onChange(pos.coords.latitude, pos.coords.longitude);
              },
              (err) => alert('Could not get your location')
            );
          }}
          className="bg-white text-slate-900 px-3 py-1.5 text-xs font-bold rounded-lg shadow-md hover:bg-slate-50"
        >
          📍 Locate Me
        </button>
      </div>
      )}
    </div>
  );
}
