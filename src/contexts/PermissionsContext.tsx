'use client';
import { createContext, useContext, useEffect, useState } from 'react';

export type PermissionState = Record<string, { read?: boolean; [key: string]: unknown }>;

export const PermissionsContext = createContext<PermissionState | null>(null);

export const PermissionsProvider = ({ children }: { children: React.ReactNode }) => {
  const [permissions, setPermissions] = useState<PermissionState | null>(null);

  useEffect(() => {
    const userId = localStorage.getItem("localacademicid");
    console.log("🆔 User ID from localStorage:", userId);

    if (userId) {
      const roleData = localStorage.getItem("AcademicRolePermission");
      if (roleData) {
        try {
          const parsed = JSON.parse(roleData);
          const userPermissions = parsed[userId]; // assuming format is { userId: { ...permissions } }

          if (userPermissions) {
            // Optional: if nested inside academicmodules
            const permissionSet = userPermissions.academicmodules || userPermissions;
            setPermissions(permissionSet);
            console.log("✅ Loaded permissions:", permissionSet);
          } else {
            console.warn("⚠️ No permissions found for this user ID");
          }
        } catch (err) {
          console.error("❌ Failed to parse AcademicRolePermission:", err);
        }
      } else {
        console.warn("⚠️ AcademicRolePermission is not found in localStorage");
      }
    }
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
      {children}
    </PermissionsContext.Provider>
  );
};

export const usePermissions = () => useContext(PermissionsContext);
