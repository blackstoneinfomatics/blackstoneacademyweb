"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

import { RiDashboardFill } from "react-icons/ri";
import { MdContactSupport, MdAssignment } from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { FaBookOpenReader } from "react-icons/fa6";
import { LuMessagesSquare } from "react-icons/lu";


const SuperSidebarItems = [
  {
    name: "Dashboard",
    href: "/modules/users/supervisor/ui/dashboard",
    icon: RiDashboardFill,
  },
  {
    name: "Recruitment",
    href: "/modules/users/supervisor/ui/recruitment",
    icon: IoPeopleSharp,
  },
  {
    name: "Meeting & Training",
    href: "/modules/users/supervisor/ui/meetingandtraining",
    icon: MdAssignment,
  },
  {
    name: "Teachers",
    href: "/modules/users/supervisor/ui/teachers",
    icon: FaBookOpenReader,
  },
  {
    name: "Messages",
    href: "/modules/users/supervisor/ui/message",
    icon: LuMessagesSquare,
  },
  {
    name: "Support",
    href: "/modules/users/supervisor/ui/support",
    icon: MdContactSupport,
  },
];

export default function Sidebar3() {
  const currentPath = usePathname();

  return (
    <div className="sidebar__wrapper bg-[#012A4A] dark:bg-[#1D1D1D] h-full overflow-y-auto">
      <aside className="sidebar bg-[#012A4A] dark:bg-[#1D1D1D] p-4 h-full flex flex-col">
        {/* Logo Section */}
        <div className="flex justify-center align-middle gap-2 p-4">
          <Image
            src="/assets/images/blackstone.png"
            width={150}
            height={150}
            className="bg-cover bg-center w-8 h-12"
            alt="logo"
          />
        </div>

        {/* Menu List */}
        <ul className="space-y-1.5 flex-1">
          {SuperSidebarItems.map(({ name, href, icon: Icon }) => (
            <li key={name}>
              <Link href={href} className="block no-underline">
                <button
                  className={`
                    w-full flex items-center gap-3 px-3 py-3
                    text-[13px] cursor-pointer rounded
                    ${
                      currentPath === href
                        ? "text-white font-medium bg-[#576CBC]"
                        : "text-[#818790] hover:text-[#a0c4ff]"
                    }
                    transition-colors duration-200
                  `}
                >
                  <span className="text-[18px] w-5 flex justify-center">
                    <Icon size={20} />
                  </span>
                  <span className="flex-1 text-left">{name}</span>
                </button>
              </Link>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
