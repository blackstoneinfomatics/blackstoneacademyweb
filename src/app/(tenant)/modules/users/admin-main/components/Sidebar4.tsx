"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from "react-icons/ri";
import { MdBookmarks, MdAnalytics } from "react-icons/md";
import { LuMessagesSquare, LuLifeBuoy, LuTicketsPlane  } from "react-icons/lu";
import { MdPublishedWithChanges } from "react-icons/md";
import { PiBookOpenFill } from "react-icons/pi";
import {
  IoMdSettings,
  IoIosArrowDown,
} from "react-icons/io";

type SidebarSubItem = {
  name: string;
  href: string;
};

type SidebarItem = {
  name: string;
  href: string;
  icon: React.ElementType | string;
  subItems?: SidebarSubItem[];
};

// Dashboard and Support are common items and are never access-filtered.
const COMMON_SIDEBAR_ITEMS = ["Dashboard", "Support"];

const SidebarItems: SidebarItem[] = [
  {
    name: "Dashboard",
    href: "/modules/users/admin-main/ui/dashboard",
    icon: RiDashboardFill,
  },
  {
    name: "Evaluation",
    href: "#",
    icon: MdBookmarks,
    subItems: [
      {
        name: "Trial Class",
        href: "/modules/users/admin-main/ui/evaluations",
      },
      {
        name: "Scheduled Trial class",
        href: "/modules/users/admin-main/ui/trailmanagement",
      },
    ],
  },
  {
    name: "Manage Students",
    href: "/modules/users/admin-main/ui/student",
    icon: "/assets/images/local-library.png",
  },
  {
    name: "Manage Employees",
    href: "/modules/users/admin-main/ui/employees",
    icon: "/assets/images/business-center.png",
  },
  {
    name: "Learning management",
    href: "/modules/users/admin-main/ui/courses",
    icon: PiBookOpenFill,
  },
  {
    name: "Schedules",
    href: "#",
    icon: "/assets/images/ChalkboardTeacher.png",
    subItems: [
      {
        name: "Classes",
        href: "/modules/users/admin-main/ui/classes",
      },
      {
        name: "Meeting",
        href: "/modules/users/admin-main/ui/meeting",
      },
    ],
  },
  {
    name: "Finance",
    href: "#",
    icon: "/assets/images/ChartLineUp.png",
    subItems: [
      {
        name: "Invoice",
        href: "/modules/users/admin-main/ui/Invoice",
      },
      {
        name: "Salary and Wages",
        href: "/modules/users/admin-main/ui/salaryandwages",
      },
      {
        name: "Expenses",
        href: "/modules/users/admin-main/ui/expenses",
      },
    ],
  },
  {
    name: "Analytics",
    href: "/modules/users/admin-main/ui/analytics",
    icon: MdAnalytics,
  },
  {
    name: "Messages",
    href: "/modules/users/admin-main/ui/messagess",
    icon: LuMessagesSquare,
  },
  {
    name: "Tickets",
    href: "/modules/users/admin-main/ui/tickets",
    icon: LuTicketsPlane,
  },
  {
    name: "Updates",
    href: "/modules/users/admin-main/ui/updates",
    icon: MdPublishedWithChanges,
  },
  {
    name: "Settings",
    href: "/modules/users/admin-main/ui/settings",
    icon: IoMdSettings,
  },
  {
    name: "Support",
    href: "/modules/users/admin-main/ui/support",
    icon: LuLifeBuoy,
  },
];

type AccessFeature = {
  featureId: string;
  featureName: string;
  isEnabled: boolean;
};

type AccessChild = {
  childModuleId: string;
  childModuleName: string;
  isEnabled: boolean;
  features?: AccessFeature[];
};

type AccessModule = {
  moduleId: string;
  moduleName: string;
  isEnabled: boolean;
  features?: AccessFeature[];
  children?: AccessChild[];
};

type TenantPortalAccess = {
  tenantId: string;
  tenantPortal: {
    tenantPortalId: string;
    portalId?: string;
    portalCode?: string;
    portalName: string;
    portalType: string;
    isEnabled: boolean;
  };
  modules: AccessModule[];
};

const normalizeName = (value: string): string =>
  value.trim().toLowerCase().replace(/[^a-z0-9]/g, "");

const normalizeAccessMode = (value: string | null): string | null =>
  value ? value.trim().toUpperCase() : null;

const hasEnabledFeature = (
  name: string,
  features: AccessFeature[] = [],
): boolean =>
  features.some(
    (feature) =>
      normalizeName(feature.featureName) === normalizeName(name) &&
      feature.isEnabled === true,
  );

const findModule = (
  name: string,
  modules: AccessModule[],
): AccessModule | undefined =>
  modules.find(
    (module) => normalizeName(module.moduleName) === normalizeName(name),
  );

const findChild = (
  name: string,
  children: AccessChild[] = [],
): AccessChild | undefined =>
  children.find(
    (child) => normalizeName(child.childModuleName) === normalizeName(name),
  );

const filterSidebarItems = (
  access: TenantPortalAccess | null,
  accessMode: string | null,
): SidebarItem[] => {
  const normalizedAccessMode = normalizeAccessMode(accessMode);
  const commonItems = SidebarItems.filter((item) =>
    COMMON_SIDEBAR_ITEMS.includes(item.name),
  );

  if (normalizedAccessMode !== "TRIAL" && normalizedAccessMode !== "TENANT") {
    return commonItems;
  }

  if (normalizedAccessMode === "TRIAL") {
    return SidebarItems;
  }

  if (!access || access.tenantPortal?.isEnabled !== true) {
    return commonItems;
  }

  const modules = access.modules ?? [];
  const allowedItems = SidebarItems.filter((item) => {
    if (COMMON_SIDEBAR_ITEMS.includes(item.name)) {
      return true;
    }

    const matchedModule = findModule(item.name, modules);

    if (matchedModule?.isEnabled === true) {
      if (!item.subItems?.length) {
        return true;
      }

      const enabledSubItems = item.subItems.filter((subItem) => {
        const child = findChild(subItem.name, matchedModule.children);

        if (child?.isEnabled === true) {
          return true;
        }

        if (hasEnabledFeature(subItem.name, matchedModule.features)) {
          return true;
        }

        return (matchedModule.children ?? []).some(
          (nestedChild) =>
            nestedChild.isEnabled === true &&
            hasEnabledFeature(subItem.name, nestedChild.features),
        );
      });

      return enabledSubItems.length > 0;
    }

    return modules.some(
      (candidate) =>
        candidate.isEnabled === true &&
        hasEnabledFeature(item.name, candidate.features),
    );
  });

  return allowedItems.map((item) => {
    if (!item.subItems?.length) return item;

    const matchedModule = findModule(item.name, modules);
    if (!matchedModule) return item;

    const subItems = item.subItems.filter((subItem) => {
      const child = findChild(subItem.name, matchedModule.children);
      return (
        child?.isEnabled === true ||
        hasEnabledFeature(subItem.name, matchedModule.features) ||
        (matchedModule.children ?? []).some(
          (nestedChild) =>
            nestedChild.isEnabled === true &&
            hasEnabledFeature(subItem.name, nestedChild.features),
        )
      );
    });

    return { ...item, subItems };
  });
};

export default function Sidebar4() {
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [visibleSidebarItems, setVisibleSidebarItems] = useState<SidebarItem[]>(
    SidebarItems.filter((item) => COMMON_SIDEBAR_ITEMS.includes(item.name)),
  );
  const currentPath = usePathname();

  useEffect(() => {
    const loadSidebarAccess = () => {
      const storedAccess = localStorage.getItem("TenantPortalAccess");
      const accessMode = localStorage.getItem("TenantAccessMode");

      try {
        const access = storedAccess
          ? (JSON.parse(storedAccess) as TenantPortalAccess)
          : null;

        setVisibleSidebarItems(filterSidebarItems(access, accessMode));
      } catch (error) {
        console.error("Failed to load tenant portal access:", error);
        setVisibleSidebarItems(
          SidebarItems.filter((item) => COMMON_SIDEBAR_ITEMS.includes(item.name)),
        );
      }
    };

    loadSidebarAccess();

    const handleStorageChange = (event: StorageEvent) => {
      if (
        event.key === "TenantPortalAccess" ||
        event.key === "TenantAccessMode" ||
        event.key === null
      ) {
        loadSidebarAccess();
      }
    };

    const handleTenantAccessUpdated = () => loadSidebarAccess();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tenant-access-updated", handleTenantAccessUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("tenant-access-updated", handleTenantAccessUpdated);
    };
  }, []);

  useEffect(() => {
    const activeParent = visibleSidebarItems.find((item) =>
      item.subItems?.some((subItem) => currentPath === subItem.href),
    );

    if (activeParent) {
      setExpandedItem(activeParent.name);
    }
  }, [currentPath, visibleSidebarItems]);

  const toggleSubItems = (name: string) => {
    setExpandedItem((previous) => (previous === name ? null : name));
  };

  const iconFilters = {
    active: "brightness(0) invert(1)",
    inactive:
      "brightness(0) saturate(100%) invert(67%) sepia(6%) saturate(422%) hue-rotate(185deg) brightness(89%) contrast(86%)",
    hover:
      "brightness(0) saturate(100%) invert(83%) sepia(12%) saturate(1032%) hue-rotate(185deg) brightness(105%) contrast(96%)",
  };

  return (
    <div className="sidebar__wrapper bg-[#012A4A] dark:bg-[#1D1D1D] h-full w-full overflow-y-auto flex flex-col">
      <div className="flex items-center justify-start px-4 pt-2 pb-1 shrink-0">
        <Image
          src="/assets/images/blackstone.png"
          width={150}
          height={160}
          className="h-[70px] w-auto sm:h-[84px] xl:h-[94px] object-contain"
          alt="Blackstone logo"
          priority
        />
      </div>

      <ul className="space-y-2 flex-1 px-4 pb-4">
        {visibleSidebarItems.map(({ name, href, icon: Icon, subItems }) => {
          const isParentActive = currentPath === href;
          const isChildActive = subItems?.some(
            (subItem) => currentPath === subItem.href,
          );
          const isActive = isParentActive || isChildActive;

          const itemContent = (
            <div
              className={`group flex w-full items-center gap-2 rounded px-2 py-2 text-[12px] transition-colors duration-200 sm:text-[13px] xl:text-[14px] ${
                isActive
                  ? "bg-[#576CBC] font-medium text-white"
                  : "text-[#818790] hover:text-[#a0c4ff]"
              }`}
            >
              <span
                className={`flex w-5 items-center justify-center text-[18px] ${
                  isActive
                    ? "text-white"
                    : "text-[#818790] group-hover:text-[#a0c4ff]"
                }`}
              >
                {typeof Icon === "string" ? (
                  <span className="relative w-5 h-5">
                    <Image
                      src={Icon}
                      fill
                      alt={`${name} icon`}
                      className="object-contain"
                      style={{
                        filter: isActive
                          ? iconFilters.active
                          : iconFilters.inactive,
                        transition: "filter 0.2s ease-in-out",
                      }}
                      onMouseEnter={(event) => {
                        if (!isActive) {
                          event.currentTarget.style.filter = iconFilters.hover;
                        }
                      }}
                      onMouseLeave={(event) => {
                        if (!isActive) {
                          event.currentTarget.style.filter = iconFilters.inactive;
                        }
                      }}
                    />
                  </span>
                ) : (
                  <Icon size={20} />
                )}
              </span>

              <span className="flex-1 text-left">{name}</span>

              {subItems && (
                <span
                  className={`transition-transform duration-200 ${
                    expandedItem === name ? "rotate-180" : ""
                  } ${isActive ? "text-white" : "text-[#818790] group-hover:text-[#a0c4ff]"}`}
                >
                  <IoIosArrowDown size={18} />
                </span>
              )}
            </div>
          );

          return (
            <li key={name}>
              {subItems ? (
                <button
                  type="button"
                  onClick={() => toggleSubItems(name)}
                  className="w-full text-left"
                >
                  {itemContent}
                </button>
              ) : (
                <Link href={href} className="block no-underline">
                  {itemContent}
                </Link>
              )}

              {subItems && expandedItem === name && (
                <ul className="ml-7 mt-1 space-y-1">
                  {subItems.map((subItem) => {
                    const isSubActive = currentPath === subItem.href;
                    return (
                      <li key={subItem.name}>
                        <Link
                          href={subItem.href}
                          className={`block rounded px-3 py-2 text-[11px] no-underline transition-colors duration-200 sm:text-[12px] xl:text-[13px] ${
                            isSubActive
                              ? "bg-[#576CBC] font-medium text-white"
                              : "text-[#818790] hover:text-[#a0c4ff]"
                          }`}
                        >
                          {subItem.name}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}