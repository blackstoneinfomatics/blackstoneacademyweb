"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { RiDashboardFill } from "react-icons/ri";
import { MdBookmarks, MdAnalytics } from "react-icons/md";
import { LuMessagesSquare, LuLifeBuoy } from "react-icons/lu";
import { PiBookOpenFill } from "react-icons/pi";
import {
  IoMdSettings,
  IoIosArrowForward,
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
  const commonItems = SidebarItems.filter((item) =>
    COMMON_SIDEBAR_ITEMS.includes(item.name),
  );

  // Common items remain visible even if access data is not loaded yet.
  if (accessMode !== "TRIAL" && accessMode !== "TENANT") {
    return commonItems;
  }

  // Trial tenants can see all configured sidebar items.
  if (accessMode === "TRIAL") {
    return SidebarItems;
  }

  // TENANT mode requires a valid enabled portal configuration.
  if (!access || access.tenantPortal?.isEnabled !== true) {
    return commonItems;
  }

  const modules = access.modules ?? [];
  const allowedItems = SidebarItems.filter((item) => {
    if (COMMON_SIDEBAR_ITEMS.includes(item.name)) {
      return true;
    }

    const module = findModule(item.name, modules);

    if (module?.isEnabled === true) {
      if (!item.subItems?.length) {
        return true;
      }

      const enabledSubItems = item.subItems.filter((subItem) => {
        const child = findChild(subItem.name, module.children);

        if (child?.isEnabled === true) {
          return true;
        }

        if (hasEnabledFeature(subItem.name, module.features)) {
          return true;
        }

        return (module.children ?? []).some(
          (nestedChild) =>
            nestedChild.isEnabled === true &&
            hasEnabledFeature(subItem.name, nestedChild.features),
        );
      });

      return enabledSubItems.length > 0;
    }

    // A top-level sidebar link may map directly to a feature.
    return modules.some(
      (candidate) =>
        candidate.isEnabled === true &&
        hasEnabledFeature(item.name, candidate.features),
    );
  });

  // Preserve only the enabled submenu links for each visible parent.
  return allowedItems.map((item) => {
    if (!item.subItems?.length) return item;

    const module = findModule(item.name, modules);
    if (!module) return item;

    const subItems = item.subItems.filter((subItem) => {
      const child = findChild(subItem.name, module.children);
      return (
        child?.isEnabled === true ||
        hasEnabledFeature(subItem.name, module.features) ||
        (module.children ?? []).some(
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

    // The storage event does not fire in the same tab, so support a custom event too.
    const handleTenantAccessUpdated = () => loadSidebarAccess();

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("tenant-access-updated", handleTenantAccessUpdated);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener(
        "tenant-access-updated",
        handleTenantAccessUpdated,
      );
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
    <div className="sidebar__wrapper">
      <aside className="sidebar !bg-[#012A4A] dark:!bg-[#1D1D1D] p-4 h-full flex flex-col">
        <div className="flex items-center justify-center py-6 px-2">
          <Image
            src="/assets/images/blackstone.png"
            width={180}
            height={60}
            className="object-contain"
            alt="Blackstone logo"
            priority
          />
        </div>

        <ul className="space-y-1.5 flex-1">
          {visibleSidebarItems.map(({ name, href, icon: Icon, subItems }) => {
            const isParentActive = currentPath === href;
            const isChildActive = subItems?.some(
              (subItem) => currentPath === subItem.href,
            );
            const isActive = isParentActive || isChildActive;

            const itemContent = (
              <div
                className={`group w-full flex items-center gap-3 px-3 py-3 text-[16px] font-normal rounded-md transition-all duration-200 ${
                  isActive
                    ? "bg-[#576CBC] text-white hover:bg-[#6b80d6]"
                    : "text-[#818790] hover:text-[#a0c4ff]"
                }`}
              >
                <span
                  className={`text-[18px] w-5 flex justify-center items-center ${
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
                    className={
                      isActive
                        ? "text-white"
                        : "text-[#818790] group-hover:text-[#a0c4ff]"
                    }
                  >
                    {expandedItem === name ? (
                      <IoIosArrowDown />
                    ) : (
                      <IoIosArrowForward />
                    )}
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
                  <Link href={href}>{itemContent}</Link>
                )}

                {subItems && expandedItem === name && (
                  <ul className="ml-10 mt-1 space-y-1.5">
                    {subItems.map((subItem) => {
                      const isSubActive = currentPath === subItem.href;
                      return (
                        <li key={subItem.name}>
                          <Link
                            href={subItem.href}
                            className={`block text-[15px] font-normal py-1.5 px-2 rounded-md ${
                              isSubActive
                                ? "text-[#576CBC]"
                                : "text-[#818790] hover:text-[#576CBC]"
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
      </aside>
    </div>
  );
}
