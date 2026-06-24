'use client';

import AdminHeader from '@/app/(tenant)/modules/users/admin-main/components/AdminHeader';
import axios from 'axios';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import { AppFailureToastMessages, appSuccessToastMessages } from '@/app/_components/contents/toast_message';
import 'react-toastify/dist/ReactToastify.css';
import BaseLayout4 from '../../../components/BaseLayout4';
import { AppApiEndpoints } from '@/app/_components/contents/api-endpoints';

type PermissionType = 'read' | 'write' | 'delete';

interface Permission {
  read: boolean;
  write: boolean;
  delete: boolean;
}

type ModuleAccess = {
  [key: string]: Permission;
};

const StudentModuleAccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeId = searchParams.get('employeeId');

  const [permissions, setPermissions] = useState<Record<string, ModuleAccess>>({
    studentmodules: {},
  });

  const [selectedModules, setSelectedModules] = useState<Record<string, boolean>>({});
  const [isRedirecting, setIsRedirecting] = useState(false);

  const modules = [
    'Dashboard',
    'Classes',
    'Assignments',
    'Payments',
    'Knowledge',
    'Message',
    'Support',
  ];

  const getModuleKey = (moduleName: string) =>
    moduleName.toLowerCase().replace(/ & /g, '').replace(/\s+/g, '');

  // ----------------------------- FETCH EMPLOYEE ACCESS -----------------------------
  useEffect(() => {
    if (!employeeId) {
      toast.error(AppFailureToastMessages.EMPLOYEE_ID_NOT_FOUND);
      setIsRedirecting(true);
      return;
    }

    const token =
      typeof window !== 'undefined'
        ? localStorage.getItem('AdminAuthToken')
        : null;

    if (!token) return;

    fetchEmployeeData(token);
  }, [employeeId]);

  const fetchEmployeeData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RBAC.GET_ACCESS}/${employeeId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      const access = json?.data?.roleAccess;
      const studentModules = access?.studentmodules ?? {};

      const selected: Record<string, boolean> = {};
      const modulePermissions: ModuleAccess = {};

      modules.forEach((module) => {
        const key = getModuleKey(module);
        const perms =
          studentModules[key] ?? { read: false, write: false, delete: false };

        selected[key] = perms.read || perms.write || perms.delete;
        modulePermissions[key] = perms;
      });

      setSelectedModules(selected);

      setPermissions((prev) => ({
        ...prev,
        studentmodules: modulePermissions,
      }));
    } catch (error) {
      toast.error(AppFailureToastMessages.PERMISSION_LOAD);
    }
  };

  useEffect(() => {
    if (isRedirecting) {
      router.push('/modules/users/admin-main/ui/settings');
    }
  }, [isRedirecting]);

  // ----------------------------- TOGGLE MODULE / PERMISSION -----------------------------
  const toggleModule = (module: string, permission?: PermissionType) => {
    if (!permission) {
      // Entire module toggle
      setSelectedModules((prev) => ({
        ...prev,
        [module]: !prev[module],
      }));

      setPermissions((prev) => {
        const newState = !selectedModules[module];

        return {
          ...prev,
          studentmodules: {
            ...prev.studentmodules,
            [module]: {
              read: newState,
              write: newState,
              delete: newState,
            },
          },
        };
      });
    } else {
      // Individual permission toggle
      setPermissions((prev) => ({
        ...prev,
        studentmodules: {
          ...prev.studentmodules,
          [module]: {
            ...prev.studentmodules[module],
            [permission]: !prev.studentmodules[module]?.[permission],
          },
        },
      }));
    }
  };

  // ----------------------------- SUBMIT UPDATE -----------------------------
  const handleUpdateAccess = async () => {
    const roleAccess = {
      student: true,
      studentmodules: permissions.studentmodules,
    };

    try {
      const token =
        typeof window !== 'undefined'
          ? localStorage.getItem('AdminAuthToken')
          : null;

      if (!token) return;

      await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RBAC.UPDATE_ACCESS}/${employeeId}`,
        { roleAccess },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(appSuccessToastMessages.ACCESS_UPDATED);
      setTimeout(() => router.push('/modules/users/admin-main/ui/settings'), 2000);
    } catch (error) {
      toast.error(AppFailureToastMessages.ACCESS_UPDATE_FAILED);
    }
  };

  // ----------------------------- CANCEL BUTTON LOGIC (FULL RESET) -----------------------------
  const handleCancel = () => {
    const clearedModules: Record<string, boolean> = {};
    const clearedPermissions: ModuleAccess = {};

    modules.forEach((module) => {
      const key = getModuleKey(module);
      clearedModules[key] = false;

      clearedPermissions[key] = {
        read: false,
        write: false,
        delete: false,
      };
    });

    setSelectedModules(clearedModules);

    setPermissions({
      studentmodules: clearedPermissions,
    });
  };

  // ----------------------------- UI -----------------------------
  return (
    <BaseLayout4>
      <AdminHeader currentSection="Student Module Access" showBackButton showBackPath="/modules/users/admin-main/ui/settings"/>

      <ToastContainer />

      <div className="mt-4">
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434]">
          <table className="w-full table-auto">
            <thead className="text-[12px] bg-[#4C6993] text-white">
              <tr>
                <th className="p-3 text-left">Modules</th>
                <th className="p-3 text-center">Read</th>
                <th className="p-3 text-center">Write</th>
                <th className="p-3 text-center">Delete</th>
              </tr>
            </thead>

            <tbody>
              {modules.map((module) => {
                const moduleKey = getModuleKey(module);

                return (
                  <tr key={module} className="border-t">
                    <td className="p-4 flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedModules[moduleKey] || false}
                        onChange={() => toggleModule(moduleKey)}
                        className="h-3 w-3"
                      />
                      <span className="text-[12px]">{module}</span>
                    </td>

                    {['read', 'write', 'delete'].map((perm) => (
                      <td key={perm} className="p-2 text-center">
                        <input
                          type="checkbox"
                          checked={
                            permissions.studentmodules[moduleKey]?.[
                              perm as PermissionType
                            ] || false
                          }
                          onChange={() =>
                            toggleModule(moduleKey, perm as PermissionType)
                          }
                          className="h-3 w-3"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* BUTTONS */}
        <div className="flex justify-end mt-4">
          <button
            onClick={handleCancel}
            className="bg-[#e4e7f4] border border-[#576CBC] text-[#576CBC] text-[13px] px-6 py-1 rounded-lg shadow-md"
          >
            Cancel
          </button>

          <button
            onClick={handleUpdateAccess}
            className="bg-[#576CBC] text-white text-[13px] px-6 py-1 rounded-lg shadow-md ml-2"
          >
            Submit
          </button>
        </div>
      </div>
    </BaseLayout4>
  );
};

export default StudentModuleAccess;
