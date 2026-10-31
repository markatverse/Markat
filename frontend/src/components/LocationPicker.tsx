"use client";
import React, { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { Search, Loader2 } from 'lucide-react';

// Use dynamic import so MapContainer and TileLayer don't crash on SSR
const MapContainer = dynamic(() => import('react-leaflet').then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import('react-leaflet').then(mod => mod.TileLayer), { ssr: false });
const Marker = dynamic(() => import('react-leaflet').then(mod => mod.Marker), { ssr: false });

interface LocationPickerProps {
  latitude: number | null;
  longitude: number | null;
  onChange?: (lat: number, lng: number) => void;
  readOnly?: boolean;
  className?: string;
}

// Since useMapEvents relies on context provided by MapContainer, we need a separate inner component dynamically loaded
const InnerMap = dynamic(() => import('./InnerMap'), { ssr: false });

export default function LocationPicker({ latitude, longitude, onChange, readOnly = false, className }: LocationPickerProps) {
  const [position, setPosition] = useState<any | null>(null);
  const [mapType, setMapType] = useState<'streets' | 'satellite'>('streets');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
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

  const executeSearch = async () => {
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(searchQuery)}&countrycodes=in&format=json&limit=1`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.length > 0) {
          const lat = parseFloat(data[0].lat);
          const lon = parseFloat(data[0].lon);
          const L = await import('leaflet');
          const newPos = new L.LatLng(lat, lon);
          setPosition(newPos);
          if (onChange) onChange(lat, lon);
        } else {
          alert('Location not found. Try searching with city or district name.');
        }
      }
    } catch (err) {
      console.error('Search location error', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch();
  };

  if (!isClient) return <div className={`w-full bg-slate-100 animate-pulse ${className || 'h-64 rounded-2xl'}`}></div>;

  return (
    <div className={`w-full overflow-hidden z-0 relative ${className || 'h-64 rounded-2xl border-2 border-slate-200'}`}>
      {/* Ground-Level Search Bar */}
      {!readOnly && (
        <div className="absolute top-2 left-2 right-28 z-[1000]">
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search ground location, village, chowk..." 
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  executeSearch();
                }
              }}
              className="w-full bg-white/95 backdrop-blur-xs text-xs font-semibold pl-7 pr-3 py-1.5 rounded-lg shadow-md border border-slate-200 outline-none focus:ring-2 focus:ring-indigo-400 placeholder:text-slate-400 text-slate-800"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
            {isSearching && (
              <div className="absolute right-2 top-1/2 -translate-y-1/2">
                <Loader2 className="w-3 h-3 animate-spin text-indigo-600" />
              </div>
            )}
          </div>
        </div>
      )}

      {/* GPS Locate Me Button */}
      {!readOnly && (
        <div className="absolute top-2 right-2 z-[1000]">
          <button 
            type="button"
            disabled={isLocating}
            onClick={(e) => {
              e.preventDefault();
              setIsLocating(true);
              navigator.geolocation.getCurrentPosition(
                async (pos) => {
                  const L = await import('leaflet');
                  const newPos = new L.LatLng(pos.coords.latitude, pos.coords.longitude);
                  setPosition(newPos);
                  if (onChange) onChange(pos.coords.latitude, pos.coords.longitude);
                  setIsLocating(false);
                },
                (err) => {
                  alert('Could not get GPS location. Please check browser permissions.');
                  setIsLocating(false);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
              );
            }}
            className="bg-white text-slate-900 px-2.5 py-1.5 text-xs font-bold rounded-lg shadow-md hover:bg-slate-50 flex items-center gap-1 border border-slate-200"
          >
            {isLocating ? <Loader2 className="w-3 h-3 animate-spin text-indigo-600" /> : '📍'}
            <span>{isLocating ? 'Locating...' : 'Locate Me'}</span>
          </button>
        </div>
      )}

      {/* Satellite / Streets View Switcher */}
      <div className="absolute bottom-2 left-2 z-[1000] flex bg-white/95 backdrop-blur-xs rounded-lg shadow-md border border-slate-200 p-0.5 text-[10px] sm:text-[11px] font-bold">
        <button
          type="button"
          onClick={() => setMapType('streets')}
          className={`px-2 py-0.5 rounded-md transition-all ${mapType === 'streets' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          🗺️ Streets
        </button>
        <button
          type="button"
          onClick={() => setMapType('satellite')}
          className={`px-2 py-0.5 rounded-md transition-all ${mapType === 'satellite' ? 'bg-indigo-600 text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
        >
          🛰️ Satellite (Ground)
        </button>
      </div>

      <MapContainer 
        center={position || [28.6139, 77.2090]} // Default to Delhi if no location
        zoom={16} 
        maxZoom={19}
        style={{ height: '100%', width: '100%', zIndex: 1 }}
      >
        {mapType === 'streets' ? (
          <TileLayer
            key="osm-streets"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
        ) : (
          <TileLayer
            key="esri-satellite"
            attribution='&copy; <a href="https://www.esri.com/">Esri</a>, Earthstar Geographics'
            url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
            maxZoom={19}
          />
        )}
        {!readOnly ? (
          <InnerMap position={position} setPosition={(pos: any) => {
            setPosition(pos);
            if (onChange) onChange(pos.lat, pos.lng);
          }} />
        ) : (
          position && <Marker position={position} />
        )}
      </MapContainer>
    </div>
  );
}
