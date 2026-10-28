"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { getApiUrl, fastFetch } from '@/utils/api';

const API_URL = getApiUrl();

export type Sector = {
  id: string;
  businessTypeId: string;
  name: string;
  description: string | null;
  parameters?: any;
  isActive: boolean;
  businessType?: {
    mainType: string;
    name: string;
  };
};

type SettingsContextType = {
  sectors: Sector[];
  isSectorActive: (sectorName: string) => boolean;
  refreshSectors: () => Promise<void>;
  toggleSector: (id: string, isActive: boolean) => Promise<void>;
  editSector: (id: string, data: { name?: string; description?: string; parameters?: any }) => Promise<void>;
  systemConfig: any;
  updateSystemConfig: (data: any) => Promise<void>;
};

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [sectors, setSectors] = useState<Sector[]>([]);
  const [systemConfig, setSystemConfig] = useState<any>({});

    const refreshSectors = async () => {
    try {
      const data = await fastFetch<Sector[]>('/configuration/sectors', { ttlMs: 60000 });
      if (Array.isArray(data)) {
        setSectors(data);
        try {
          localStorage.setItem('mv_cache_sectors', JSON.stringify(data));
        } catch {}
      }
    } catch {
      // Graceful fallback
    }
  };

  const refreshSystemConfig = async () => {
    try {
      const data = await fastFetch<any>('/configuration/system-settings', { ttlMs: 60000 });
      if (data && typeof data === 'object') {
        setSystemConfig(data);
        try {
          localStorage.setItem('mv_cache_system_config', JSON.stringify(data));
        } catch {}
      }
    } catch {
      // Graceful fallback
    }
  };

  useEffect(() => {
    try {
      const cachedSectors = localStorage.getItem('mv_cache_sectors');
      if (cachedSectors) {
        const parsed = JSON.parse(cachedSectors);
        if (Array.isArray(parsed) && parsed.length > 0) setSectors(parsed);
      }
      const cachedCfg = localStorage.getItem('mv_cache_system_config');
      if (cachedCfg) {
        const parsed = JSON.parse(cachedCfg);
        if (parsed && typeof parsed === 'object') setSystemConfig(parsed);
      }
    } catch {}

    refreshSectors();
    refreshSystemConfig();
  }, []);

  const isSectorActive = (sectorName: string) => {
    if (!sectors || sectors.length === 0) return true;
    const query = sectorName.toLowerCase().trim();
    const sector = sectors.find(s => {
      const name = s.name.toLowerCase().trim();
      const mainType = (s.businessType?.mainType || '').toLowerCase().trim();

      if (name === query) return true;
      if (mainType && mainType === query) return true;
      if (name.replace(/^product\s+/, '') === query) return true;
      if (`product ${name}` === query) return true;

      // Both B2B & B2C product sector
      if ((query === 'both' || query === 'both b2b & b2c') && (name.includes('both') || mainType === 'both')) return true;

      // Automobile & Car Wash service sector
      if ((query === 'car wash' || query === 'automobile' || query === 'automobile & car wash' || query === 'auto') &&
          (name.includes('car wash') || name.includes('automobile'))) return true;

      // Salon & Spa & Beauty service sector
      if ((query === 'salon' || query === 'spa' || query === 'beauty') &&
          (name.includes('salon') || name.includes('beauty') || name.includes('spa'))) return true;

      // Home Services sector
      if ((query === 'home' || query === 'home services') &&
          (name === 'home' || name.includes('home'))) return true;

      // Events & Planning / Professional sector
      if ((query === 'events' || query === 'event' || query === 'organizers' || query === 'professional') &&
          (name === 'events' || name.includes('event'))) return true;

      // Transport & Logistics sector
      if ((query === 'transport' || query === 'logistics' || query === 'rentals') &&
          (name === 'transport' || name.includes('transport'))) return true;

      // Food & Dining sector
      if ((query === 'food' || query === 'dining' || query === 'restaurant') &&
          (name === 'food' || name.includes('food'))) return true;

      return false;
    });
    return sector ? sector.isActive : true;
  };

  const toggleSector = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`${API_URL}/configuration/sectors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update sector status');
      
      setSectors(prev => {
        const next = prev.map(s => s.id === id ? { ...s, isActive } : s);
        try {
          localStorage.setItem('mv_cache_sectors', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.error(err);
      refreshSectors();
      throw err;
    }
  };

  const editSector = async (id: string, data: { name?: string; description?: string; parameters?: any }) => {
    try {
      const res = await fetch(`${API_URL}/configuration/sectors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update sector details');
      
      setSectors(prev => {
        const next = prev.map(s => s.id === id ? { ...s, ...data } : s);
        try {
          localStorage.setItem('mv_cache_sectors', JSON.stringify(next));
        } catch {}
        return next;
      });
    } catch (err) {
      console.error(err);
      refreshSectors();
      throw err;
    }
  };

  const updateSystemConfig = async (data: any) => {
    try {
      const res = await fetch(`${API_URL}/configuration/system-settings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error('Failed to update system config');
      const updated = await res.json();
      const cfg = updated.data || updated;
      setSystemConfig(cfg);
      try {
        localStorage.setItem('mv_cache_system_config', JSON.stringify(cfg));
      } catch {}
    } catch (err) {
      console.error(err);
      throw err;
    }
  };

  return (
    <SettingsContext.Provider value={{ sectors, isSectorActive, refreshSectors, toggleSector, editSector, systemConfig, updateSystemConfig }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    return {
      sectors: [],
      isSectorActive: () => true,
      refreshSectors: async () => {},
      toggleSector: async () => {},
      editSector: async () => {},
      systemConfig: {},
      updateSystemConfig: async () => {},
    };
  }
  return context;
}
