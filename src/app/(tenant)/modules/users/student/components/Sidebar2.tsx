"use client";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation"; // Use usePathname to get the current path
import {
  MdContactSupport,
  MdOutlinePayment,
  MdAssignment,
} from "react-icons/md";
import { IoPeopleSharp } from "react-icons/io5";
import { TbLayoutDashboardFilled } from "react-icons/tb";
import { FaFolderOpen } from "react-icons/fa";
import { LuMessagesSquare } from "react-icons/lu";


const SidebarItems = [
  {
    name: "Dashboard",
    href: "/modules/users/student/ui/dashboard",
    icon: TbLayoutDashboardFilled,
  },
  {
    name: "Classes",
    href: "/modules/users/student/ui/classes",
    icon: IoPeopleSharp,
  },
  {
    name: "Assignment",
    href: "/modules/users/student/ui/assignment",
    icon: MdAssignment,
  },
  {
    name: "Payments",
    href: "/modules/users/student/ui/payment",
    icon: MdOutlinePayment,
  },
  {
    name: "Knowledge",
    href: "/modules/users/student/ui/knowledge",
    icon: FaFolderOpen,
  },
  {
    name: "Message",
    href: "/modules/users/student/ui/message",
    icon: LuMessagesSquare,
  },
  {
    name: "Support",
    href: "/modules/users/student/ui/support",
    icon: MdContactSupport,
  },
];

export default function Sidebar2() {
  const currentPath = usePathname(); // Get the current path

  return (
    <div className="sidebar__wrapper bg-[#012A4A] h-[100vh]">
      <aside className="sidebar bg-[#012A4A] shadow-lg">
        <div className='flex justify-center align-middle p-4 gap-2'>
      <Image     src="/assets/images/blackstone.png" width={150} height={150} className='bg-cover bg-center w-8 h-12' alt='logo' />
          {/* <div className="text-white">
            <h3 className="font-bold text-[19px]">AL FURQAN</h3>
            <h4 className="font-light text-[17px] justify-end ml-8 -mt-3 font-sans">academy</h4>
          </div> */}
        </div>
        <ul>
          {SidebarItems.map(({ name, href, icon: Icon }) => (
            <li
              className={`text-center justify-center ml-6 ${currentPath === href
                  ? "bg-[#476a9b] text-[#fff] rounded-lg"
                  : ""
                }`}
              key={name}
            >
              <Link
                href={href}
                className="no-underline flex align-middle justify-start w-[100%] text-[#fff] pt-[15px] pb-[15px] text-[15px] hover:no-underline hover:flex hover:bg-[#476a9b] hover:text-[#fff] pl-2 hover:rounded-lg"
              >
                <span className="text-[20px] inline-block mr-[10px]">
                  <Icon />
                </span>
                <span className="sidebar__name">{name}</span>
              </Link>
            </li>
          ))}
        </ul>
        <div className="mt-4 border-[1px] border-b-[#9882BB]"></div>

        <Image
          src="/assets/images/refer.png"
          width={180}
          height={180}
          className="text-center bg-cover bg-center w-28 justify-center ml-8"
          alt="logo"
        />

        <button className="relative ml-6 mt-3 flex items-center justify-center px-8 py-3 bg-gradient-to-b from-[#E63C48] via-[#EE693A] to-[#F9A826] text-white font-bold text-sm rounded-full shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-400">
          <span className="pr-2 text-[13px]">Upgrade</span>&nbsp;
          <span className="absolute ml-2 right-3 flex items-center justify-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="red"
              stroke="yellow"
              strokeWidth="2"
            >
              <polygon points="12,2 15,9 22,9 17,14 19,21 12,17 5,21 7,14 2,9 9,9" />
            </svg>
          </span>
        </button>
      </aside>
    </div>
  );
}
