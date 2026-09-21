"use client";

import { ReactNode, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from "react-icons/ri";
import { MdCurrencyExchange } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { FaUsers } from "react-icons/fa6";
import { PermissionsContext } from "../../../../contexts/PermissionsContext";
import { BsGraphUpArrow } from "react-icons/bs";
import { AiFillControl } from "react-icons/ai";
import { SiSimpleanalytics } from "react-icons/si";
import { PiChats } from "react-icons/pi";
import { TfiReload } from "react-icons/tfi";
import { AiOutlineAudit } from "react-icons/ai";
import { LuDatabaseBackup } from "react-icons/lu";
import { IoIosSettings } from "react-icons/io";
import { IoIosArrowDown } from "react-icons/io";

interface Props {
  readonly children: ReactNode | ReactNode[];
}

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
    href: "/super-admin/ui/chatandsupport",
    icon: PiChats,
    subItems: [{ name: "Tickets", href: "/super-admin/ui/tickets" }],
  },
  { name: "Updates", href: "/super-admin/ui/updates", icon: TfiReload },
  { name: "Audit Logs", href: "/super-admin/ui/auditlogs", icon: AiOutlineAudit },
  { name: "Backup & Restore", href: "/super-admin/ui/backuprestore", icon: LuDatabaseBackup },
  { name: "Settings", href: "/super-admin/ui/settings", icon: IoIosSettings },
];

function SuperSidebar() {
  const pathname = usePathname();

  const [permissions, setPermissions] = useState<any>({});
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
    if (pathname === "/super-admin/ui/tickets") {
      setIsChatSupportOpen(true);
    }
  }, [pathname]);

  return (
    <div className="sidebar__wrapper bg-[#012A4A] dark:bg-[#1D1D1D] h-full w-full max-w-full overflow-y-auto flex flex-col">
      {/* Logo — proper top padding, no negative margin */}
      <div className="flex items-center justify-start px-4 pt-2 pb-1 shrink-0">
        <Image
          src="/assets/images/blackstone.png"
          width={150}
          height={160}
          className="h-[94px] w-auto sm:h-[100px] xl:h-[110px] object-contain"
          alt="Blackstone logo"
        />
      </div>

      {/* Menu List */}
      <ul className="space-y-2 flex-1 px-4 pb-4">
        {SuperSidebarItems.map(({ name, href, icon: Icon, subItems }) => {
          const key = name.toLowerCase().replace(/\s+/g, "");
          const modulePermission = permissions?.[key] || {};
          const hasReadAccess = modulePermission.read ?? true;
          const isChatSupport = name === "Chat & Support";

          return (
            <li key={name}>
              <div className="flex items-center w-full">
                <Link href={hasReadAccess ? href : "#"} className="flex-1 no-underline">
                  <button
                    className={`w-full flex items-center gap-2 px-2 py-2
                      text-[12px] sm:text-[13px] xl:text-[14px]
                      rounded transition-colors duration-200
                      ${pathname === href
                        ? "text-white font-medium bg-[#576CBC]"
                        : hasReadAccess
                          ? "text-[#818790] hover:text-[#a0c4ff]"
                          : "text-[#818790] opacity-70 cursor-not-allowed"
                      }`}
                    disabled={!hasReadAccess}
                  >
                    <span className="text-[18px] w-5 flex justify-center">
                      <Icon size={20} />
                    </span>
                    <span className="flex-1 text-left">{name}</span>
                  </button>
                </Link>

                {isChatSupport && hasReadAccess && subItems && subItems.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setIsChatSupportOpen((prev) => !prev)}
                    className="px-2 py-2 text-[#818790] hover:text-white"
                  >
                    <IoIosArrowDown
                      size={18}
                      className={`transition-transform duration-200 ${isChatSupportOpen ? "rotate-180" : ""
                        }`}
                    />
                  </button>
                )}
              </div>

              {isChatSupport &&
                hasReadAccess &&
                isChatSupportOpen &&
                subItems &&
                subItems.length > 0 && (
                  <ul className="ml-7 mt-1 space-y-1">
                    {subItems.map((subItem) => (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className={`block rounded px-2 py-1
                            text-[11px] sm:text-[12px] xl:text-[13px]
                            no-underline transition-colors duration-200
                            ${pathname === subItem.href
                              ? "bg-[#576CBC] text-white font-medium"
                              : "text-[#818790] hover:text-[#a0c4ff]"
                            }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export default function BaseLayout3({ children }: Props) {
  const [permissions, setPermissions] = useState<any>({});
  const [scale, setScale] = useState(1);

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

  useEffect(() => {
    const dpi = window.devicePixelRatio;
    if (dpi === 1.25) setScale(0.99);
    else if (dpi === 1.5) setScale(0.985);
    else if (dpi === 1.75) setScale(0.96);
    else if (dpi === 2) setScale(0.94);
    else setScale(1);
  }, []);

  const inverseScale = 1 / scale;

  return (
    <PermissionsContext.Provider value={permissions}>
      <style jsx global>{`
        /* Hide scrollbar on main content but keep scrolling */
        .main-content-scroll-none {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }

        .main-content-scroll-none::-webkit-scrollbar {
          display: none;
        }

        /* Sidebar scrollbar */
        .sidebar__wrapper {
          scrollbar-width: thin;
          scrollbar-color: #576cbc #012a4a;
        }

        .sidebar__wrapper::-webkit-scrollbar {
          width: 8px;
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

        /* ✅ Locked layout — same alignment on every screen */
        .layout-root {
          width: 100vw;
          height: 100vh;
          overflow: hidden;
        }

        .layout-grid {
          display: grid;
          grid-template-columns: 240px minmax(0, 1fr);
          height: 100%;
          width: 100%;
        }

        .layout-sidebar {
          width: 240px;
          min-width: 240px;
          max-width: 240px;
          height: 100%;
        }

        .layout-main {
          min-width: 0;
          width: 100%;
          height: 100%;
          overflow-x: hidden;
        }

        @media (max-width: 767px) {
          .layout-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>

      <div
        style={{
          width: `100vw`,
          height: `100vh`,
          overflow: "hidden",
        }}
        className="bg-[#E4E7F4] dark:bg-[#252525] text-black dark:text-white layout-root"
      >
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: "top left",
            width: `${100 * inverseScale}vw`,
            height: `${100 * inverseScale}vh`,
          }}
          className="layout-grid transition-all"
        >
          {/* Sidebar */}
          <div className="layout-sidebar hidden md:block bg-[#012A4A] dark:bg-[#001E34] overflow-y-auto sidebar__wrapper">
            <SuperSidebar />
          </div>

          {/* Main Content */}
          <div className="layout-main main-content-scroll-none overflow-y-auto py-2 px-4">
            {children}
          </div>
        </div>
      </div>
    </PermissionsContext.Provider>
  );
}