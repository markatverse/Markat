"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

const getApiUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) return process.env.NEXT_PUBLIC_API_URL;
  if (typeof window !== 'undefined') {
    return `http://${window.location.hostname}:3001`;
  }
  return 'http://localhost:3001';
};
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
      const res = await fetch(`${API_URL}/configuration/sectors`);
      if (res.ok) {
        const data = await res.json();
        setSectors(data);
      }
    } catch (err) {
      console.error('Error fetching sectors:', err);
    }
  };

  const refreshSystemConfig = async () => {
    try {
      const res = await fetch(`${API_URL}/configuration/system-settings`);
      if (res.ok) {
        const data = await res.json();
        setSystemConfig(data);
      }
    } catch (err) {
      console.error('Error fetching system config:', err);
    }
  };

  useEffect(() => {
    refreshSectors();
    refreshSystemConfig();
  }, []);

  const isSectorActive = (sectorName: string) => {
    const sector = sectors.find(s => s.name.toLowerCase() === sectorName.toLowerCase());
    return sector ? sector.isActive : true; // Default to true if not found or not configured yet
  };

  const toggleSector = async (id: string, isActive: boolean) => {
    try {
      const res = await fetch(`${API_URL}/configuration/sectors/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive }),
      });
      if (!res.ok) throw new Error('Failed to update sector status');
      
      setSectors(prev => prev.map(s => s.id === id ? { ...s, isActive } : s));
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
      
      setSectors(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
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
      setSystemConfig(updated.data || updated);
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
  if (context === undefined) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
