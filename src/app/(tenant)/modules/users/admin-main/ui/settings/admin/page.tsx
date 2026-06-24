"use client";

import AdminHeader from "@/app/(tenant)/modules/users/admin-main/components/AdminHeader";
import axios from "axios";
import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { FaRegMinusSquare } from "react-icons/fa";
import { toast, ToastContainer } from "react-toastify";
import { AppFailureToastMessages, appSuccessToastMessages } from "@/app/_components/contents/toast_message";
import "react-toastify/dist/ReactToastify.css";
import BaseLayout4 from "../../../components/BaseLayout4";
import { AppApiEndpoints } from "@/app/_components/contents/api-endpoints";

type PermissionType = "read" | "write" | "delete";

type Permission = {
  read: boolean;
  write: boolean;
  delete: boolean;
};

type ModuleAccess = {
  [key: string]: Permission;
};

const AdminModuleAccess = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const employeeId = searchParams.get("employeeId");

  const [permissions, setPermissions] = useState<Record<string, ModuleAccess>>({
    adminmodules: {},
  });

  const [selectedModules, setSelectedModules] = useState<
    Record<string, boolean>
  >({});

  const [isRedirecting, setIsRedirecting] = useState(false);

  const modules = [
    "Dashboard",
    "Evaluation",
    "Students",
    "Employees",
    "Meetings",
    "Courses",
    "Classes",
    "Finance",
    "Analytics",
    "Messages",
  ];

  const getModuleKey = (moduleName: string) =>
    moduleName.toLowerCase().replace(/ & /g, "").replace(/\s+/g, "");

  useEffect(() => {
    if (!employeeId) {
      toast.error(AppFailureToastMessages.EMPLOYEE_ID_NOT_FOUND);
      setIsRedirecting(true);
      return;
    }

    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("AdminAuthToken")
        : null;

    if (!token) {
      console.error("❌ AdminAuthToken not found");
      return;
    }

    fetchEmployeeData(token);
  }, [employeeId]);

  const fetchEmployeeData = async (token: string) => {
    try {
      const res = await fetch(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RBAC.GET_ACCESS}/${employeeId}`,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const json = await res.json();
      console.log("Fetched data:", json);

      const access = json?.data?.roleAccess;
      const adminModules = access?.adminmodules ?? {};

      const selected: Record<string, boolean> = {};
      const modulePermissions: ModuleAccess = {};

      modules.forEach((module) => {
        const key = getModuleKey(module);

        const perms = adminModules[key] ?? {
          read: false,
          write: false,
          delete: false,
        };

        selected[key] = perms.read || perms.write || perms.delete;

        modulePermissions[key] = perms;
      });

      setSelectedModules(selected);
      setPermissions((prev) => ({
        ...prev,
        adminmodules: modulePermissions,
      }));
    } catch (error) {
      console.error("Failed to fetch employee data:", error);
      toast.error(AppFailureToastMessages.PERMISSION_LOAD);
    }
  };

  useEffect(() => {
    if (isRedirecting) {
      router.push("/modules/users/admin-main/ui/settings");
    }
  }, [isRedirecting, router]);

  const toggleModule = (module: string, permission?: PermissionType) => {
    if (!permission) {
      setSelectedModules((prev) => {
        const updated = { ...prev };
        updated[module] = !prev[module];
        return updated;
      });

      setPermissions((prev) => ({
        ...prev,
        adminmodules: {
          ...prev.adminmodules,
          [module]: {
            read: !prev.adminmodules[module]?.read,
            write: !prev.adminmodules[module]?.write,
            delete: !prev.adminmodules[module]?.delete,
          },
        },
      }));
    } else {
      setPermissions((prev) => ({
        ...prev,
        adminmodules: {
          ...prev.adminmodules,
          [module]: {
            ...prev.adminmodules[module],
            [permission]: !prev.adminmodules[module]?.[permission],
          },
        },
      }));
    }
  };

  const handleUpdateAccess = async () => {
    const roleAccess = {
      admin: true,
      adminmodules: permissions.adminmodules,
    };

    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("AdminAuthToken")
          : null;

      const response = await axios.put(
        `${AppApiEndpoints.API_END_POINT}${AppApiEndpoints.RBAC.UPDATE_ACCESS}/${employeeId}`,
        { roleAccess },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("Access updated successfully:", response.data);
      toast.success(appSuccessToastMessages.ACCESS_UPDATED);
      setTimeout(() => {
        router.push("/modules/users/admin-main/ui/settings");
      }, 2000);
    } catch (error) {
      console.error("Failed to update access:", error);
      toast.error(AppFailureToastMessages.ACCESS_UPDATE_FAILED);
    }
  };

  // ✅ FINAL FIX: Cancel resets all checkbox + all permissions
  const handleCancel = () => {
    const clearedSelected: Record<string, boolean> = {};
    const clearedPermissions: ModuleAccess = {};

    modules.forEach((module) => {
      const key = getModuleKey(module);

      clearedSelected[key] = false;

      clearedPermissions[key] = {
        read: false,
        write: false,
        delete: false,
      };
    });

    setSelectedModules(clearedSelected);

    setPermissions({
      adminmodules: clearedPermissions,
    });
  };

  return (
    <BaseLayout4>
      <AdminHeader currentSection="Admin Module Access" showBackButton showBackPath="/modules/users/admin-main/ui/settings"/>
      <ToastContainer position="top-right" autoClose={2000} />

      <div className="mt-4">
        <div className="w-full bg-[#FAFAFB] dark:bg-[#343434]">
          <table className="w-full table-auto">
            <thead className="text-[12px] bg-[#4C6993] text-white">
              <tr>
                <th className="p-3 text-[13px] text-left flex ml-1 flex-row gap-3 ">
                  <FaRegMinusSquare className="rounded mt-1 text-[13px]" />
                  Modules
                </th>
                <th className="p-3 text-center w-[20%]"></th>
                <th className="p-3 text-center w-[20%]"></th>
                <th className="p-3 text-center w-[20%]"></th>
              </tr>
            </thead>

            <tbody>
              {modules.map((module) => {
                const moduleKey = getModuleKey(module);

                return (
                  <tr key={module} className="border-t">
                    <td className="p-4 flex items-center w-[74%] space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedModules[moduleKey] || false}
                        onChange={() => toggleModule(moduleKey)}
                        className="h-3 w-3 text-[#012A4A]"
                      />

                      <span className="text-[12px] text-[#344054] dark:text-[#fff]">
                        {module}
                      </span>
                    </td>

                    {["read", "write", "delete"].map((perm) => (
                      <td key={perm} className="p-2 text-center w-[20%]">
                        <label className="flex items-center">
                          <input
                            type="checkbox"
                            checked={
                              permissions.adminmodules[moduleKey]?.[
                                perm as PermissionType
                              ] || false
                            }
                            onChange={() =>
                              toggleModule(moduleKey, perm as PermissionType)
                            }
                            className="h-3 w-3 text-[#012A4A]"
                          />

                          <span className="ml-2 text-[12px] text-[#344054] dark:text-[#fff]">
                            {perm.charAt(0).toUpperCase() + perm.slice(1)}
                          </span>
                        </label>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Buttons */}
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

export default AdminModuleAccess;
