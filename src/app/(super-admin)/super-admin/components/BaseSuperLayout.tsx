"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { RiDashboardFill } from "react-icons/ri";
import { MdCurrencyExchange } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { FaUsers } from "react-icons/fa6";
import { BsGraphUpArrow } from "react-icons/bs";
import { AiFillControl } from "react-icons/ai";
import { SiSimpleanalytics } from "react-icons/si";
import { PiChats } from "react-icons/pi";
import { TfiReload } from "react-icons/tfi";
import { AiOutlineAudit } from "react-icons/ai";
import { LuDatabaseBackup } from "react-icons/lu";
import { IoIosArrowDown } from "react-icons/io";
import { FiSettings } from "react-icons/fi";

import { PermissionsContext } from "../../../../contexts/PermissionsContext";

interface Props {
  readonly children: ReactNode | ReactNode[];
}

type PermissionState = Record<string, { read?: boolean;[key: string]: unknown }>;

const SuperSidebarItems = [
  { name: "Dashboard", href: "/super-admin/ui/dashboard", icon: RiDashboardFill },
  { name: "Tenants Management", href: "/super-admin/ui/tenants", icon: IoPeopleSharp },
  { name: "Subscriptions", href: "/super-admin/ui/subscriptions", icon: MdCurrencyExchange },
  { name: "Finance", href: "/super-admin/ui/finance", icon: BsGraphUpArrow },
  { name: "Users & Roles", href: "/super-admin/ui/users&roles", icon: FaUsers },
  { name: "Feature Control", href: "/super-admin/ui/featureandcontrol", icon: AiFillControl },
  { name: "Analytics", href: "/super-admin/ui/analytics", icon: SiSimpleanalytics },
  {
    name: "Chat & Support",
    icon: PiChats,
    subItems: [
      { name: "Chat", href: "/super-admin/ui/chatandsupport" },
      { name: "Tickets", href: "/super-admin/ui/tickets" },
    ],
  },
  { name: "Updates", href: "/super-admin/ui/updates", icon: TfiReload },
  { name: "Audit Logs", href: "/super-admin/ui/auditlogs", icon: AiOutlineAudit },
  { name: "Backup & Restore", href: "/super-admin/ui/backuprestore", icon: LuDatabaseBackup },
  { name: "Settings", href: "/super-admin/ui/settings", icon: FiSettings },
];

/* ------------------------------------------------------------------ */
/* Layout-critical CSS, rendered as raw <style> so it ships in the     */
/* initial HTML and prevents the un-styled flash on hard refresh.      */
/* ------------------------------------------------------------------ */

const LAYOUT_CSS = `
  .layout-root {
    width: 100vw;
    height: 100vh;
    overflow: hidden;
  }

  .layout-grid {
    display: grid;
    grid-template-columns: 220px minmax(0, 1fr);
    height: 100%;
    width: 100%;
  }

  .layout-sidebar {
    width: 220px;
    min-width: 220px;
    max-width: 220px;
    height: 100%;
  }

  .layout-main {
    min-width: 0;
    width: 100%;
    height: 100%;
    overflow-x: hidden;
  }

  .main-content-scroll-none {
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
  .main-content-scroll-none::-webkit-scrollbar {
    display: none;
  }

  @media (max-width: 1279px) and (min-width: 768px) {
    .layout-grid {
      grid-template-columns: 200px minmax(0, 1fr);
    }
    .layout-sidebar {
      width: 200px;
      min-width: 200px;
      max-width: 200px;
    }
  }

  @media (max-width: 767px) {
    .layout-grid {
      grid-template-columns: 1fr;
    }
    .layout-sidebar {
      display: none;
    }
  }
`;

function SuperSidebar() {
  const pathname = usePathname();

  const [permissions, setPermissions] = useState<PermissionState>({});
  const [isChatSupportOpen, setIsChatSupportOpen] = useState(false);

  useEffect(() => {
    const roleAccessRaw = localStorage.getItem("SupervisorRolePermission");

    if (roleAccessRaw) {
      try {
        const roleAccess = JSON.parse(roleAccessRaw);
        const modules = roleAccess?.supervisormodules || roleAccess;
        setPermissions(modules);
      } catch (error) {
        console.error("❌ Invalid SupervisorRolePermission JSON", error);
      }
    }
  }, []);

  useEffect(() => {
    if (
      pathname === "/super-admin/ui/chatandsupport" ||
      pathname === "/super-admin/ui/tickets"
    ) {
      setIsChatSupportOpen(true);
    }
  }, [pathname]);

  return (
    <div className="sidebar__wrapper bg-[#012A4A] dark:bg-[#1D1D1D] h-full w-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-start px-4 pt-2 pb-1 shrink-0">
        <Image
          src="/assets/images/blackstone.png"
          width={150}
          height={160}
          className="h-[70px] w-auto sm:h-[84px] xl:h-[94px] object-contain"
          alt="Blackstone logo"
        />
      </div>

      <ul className="space-y-2 flex-1 px-4 pb-4">
        {SuperSidebarItems.map(({ name, href, icon: Icon, subItems }) => {
          const key = name.toLowerCase().replace(/\s+/g, "");
          const modulePermission = permissions?.[key] || {};
          const hasReadAccess = modulePermission.read ?? true;
          const isChatSupport = name === "Chat & Support";
          const isChatSupportActive =
            pathname === "/super-admin/ui/chatandsupport" ||
            pathname === "/super-admin/ui/tickets";

          return (
            <li key={name}>
              {isChatSupport ? (
                <>
                  <button
                    type="button"
                    disabled={!hasReadAccess}
                    onClick={() => {
                      if (hasReadAccess) setIsChatSupportOpen((prev) => !prev);
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2
                      text-[12px] sm:text-[13px] xl:text-[14px]
                      rounded transition-colors duration-200
                      ${isChatSupportActive
                        ? "text-white font-medium bg-[#576CBC]"
                        : hasReadAccess
                          ? "text-[#818790] hover:text-[#a0c4ff]"
                          : "text-[#818790] opacity-70 cursor-not-allowed"
                      }
                    `}
                  >
                    <span className="text-[18px] w-5 flex justify-center">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1 text-left">{name}</span>
                    <IoIosArrowDown
                      size={18}
                      className={`transition-transform duration-200 ${isChatSupportOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>

                  {hasReadAccess && isChatSupportOpen && subItems && subItems.length > 0 && (
                    <ul className="ml-7 mt-1 space-y-1">
                      {subItems.map((subItem) => {
                        const isSubItemActive = pathname === subItem.href;
                        return (
                          <li key={subItem.name}>
                            <Link
                              href={subItem.href}
                              className={`block rounded px-3 py-2
                                text-[11px] sm:text-[12px] xl:text-[13px]
                                no-underline transition-colors duration-200
                                ${isSubItemActive
                                  ? "bg-[#576CBC] text-white font-medium"
                                  : "text-[#818790] hover:text-[#a0c4ff]"
                                }
                              `}
                            >
                              {subItem.name}
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  )}
                </>
              ) : (
                <Link
                  href={hasReadAccess ? href ?? "#" : "#"}
                  className="flex-1 no-underline"
                >
                  <button
                    type="button"
                    disabled={!hasReadAccess}
                    className={`w-full flex items-center gap-2 px-2 py-2
                      text-[12px] sm:text-[13px] xl:text-[14px]
                      rounded transition-colors duration-200
                      ${pathname === href
                        ? "text-white font-medium bg-[#576CBC]"
                        : hasReadAccess
                          ? "text-[#818790] hover:text-[#a0c4ff]"
                          : "text-[#818790] opacity-70 cursor-not-allowed"
                      }
                    `}
                  >
                    <span className="text-[18px] w-5 flex justify-center">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1 text-left">{name}</span>
                  </button>
                </Link>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function BaseLayout3({ children }: Props) {
  const [permissions, setPermissions] = useState<PermissionState>({});

  useEffect(() => {
    const roleAccessRaw = localStorage.getItem("AcademicRolePermission");

    if (roleAccessRaw) {
      try {
        const roleAccess = JSON.parse(roleAccessRaw);
        const modules = roleAccess?.academicmodules || roleAccess;
        setPermissions(modules);
      } catch (error) {
        console.error("❌ Invalid AcademicRolePermission JSON", error);
      }
    }
  }, []);

  return (
    <PermissionsContext.Provider value={permissions}>
      {/* Layout-critical CSS — rendered inline so it applies on first paint */}
      <style dangerouslySetInnerHTML={{ __html: LAYOUT_CSS }} />

      {/* Non-critical: sidebar scrollbar styling */}
      <style jsx global>{`
        .sidebar__wrapper {
          scrollbar-width: thin;
          scrollbar-color: #576cbc #012a4a;
        }
        .sidebar__wrapper::-webkit-scrollbar {
          width: 6px;
        }
        .sidebar__wrapper::-webkit-scrollbar-track {
          background: transparent;
        }
        .sidebar__wrapper::-webkit-scrollbar-thumb {
          background: #576cbc;
          border-radius: 8px;
        }
        .sidebar__wrapper::-webkit-scrollbar-thumb:hover {
          background: #8296e6;
        }
        .dark .sidebar__wrapper {
          scrollbar-color: #576cbc #1d1d1d;
        }
        .dark .sidebar__wrapper::-webkit-scrollbar-thumb {
          background: #576cbc;
        }
      `}</style>

      <div className="bg-[#E4E7F4] dark:bg-[#252525] text-black dark:text-white layout-root">
        <div className="layout-grid">
          <div className="layout-sidebar hidden md:block bg-[#012A4A] dark:bg-[#001E34] overflow-y-auto sidebar__wrapper">
            <SuperSidebar />
          </div>

          <div className="layout-main main-content-scroll-none overflow-y-auto py-2 px-4">
            {children}
          </div>
        </div>
      </div>
    </PermissionsContext.Provider>
  );
}