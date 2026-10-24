"use client";

import React, { createContext, useContext, useState, ReactNode } from 'react';

export type AdminRole = 'super_admin' | 'catalog_admin' | 'onboarding_admin' | 'support_admin';

interface AdminRoleContextType {
  currentAdminRole: AdminRole;
  setCurrentAdminRole: (role: AdminRole) => void;
  canEdit: (section: string) => boolean;
  canToggleSector: () => boolean;
}

const AdminRoleContext = createContext<AdminRoleContextType | undefined>(undefined);

export function AdminRoleProvider({ children }: { children: ReactNode }) {
  const [currentAdminRole, setCurrentAdminRole] = useState<AdminRole>('super_admin');

  // RBAC Helper Methods
  const canEdit = (section: string) => {
    if (currentAdminRole === 'super_admin') return true;
    if (currentAdminRole === 'catalog_admin' && (section === 'products' || section === 'services' || section === 'categories')) return true;
    if (currentAdminRole === 'onboarding_admin' && section === 'sellers') return true;
    if (currentAdminRole === 'support_admin' && section === 'users') return true;
    return false;
  };

  const canToggleSector = () => {
    return currentAdminRole === 'super_admin';
  };

  return (
    <AdminRoleContext.Provider value={{ currentAdminRole, setCurrentAdminRole, canEdit, canToggleSector }}>
      {children}
    </AdminRoleContext.Provider>
  );
}

export function useAdminRole() {
  const context = useContext(AdminRoleContext);
  if (context === undefined) {
    return {
      currentAdminRole: 'super_admin' as AdminRole,
      setCurrentAdminRole: () => {},
      currentRole: 'SUPER_ADMIN' as any,
      setCurrentRole: () => {},
      hasPermission: () => true,
      canEdit: () => true,
      canToggleSector: () => true,
    };
  }
  return context;
}
