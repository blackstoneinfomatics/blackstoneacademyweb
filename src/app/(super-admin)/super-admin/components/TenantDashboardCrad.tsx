"use client";

import Image from "next/image";

const dashboardCards = [
  {
    id: 1,
    title: "Total Users",
    value: "1,500",
    change: "↑ 14%",
    text: "vs last Month",
    titleColor: "#5B4CFF",
    changeColor: "#16A34A",
    iconBg: "#EFE9FF",
    icon: "/assets/images/k (10).png",
  },
  {
    id: 2,
    title: "Active Users",
    value: "600",
    change: "↑ 14%",
    text: "vs last Month",
    titleColor: "#22C55E",
    changeColor: "#16A34A",
    iconBg: "#EAF9EE",
    icon: "/assets/images/k (11).png",
  },
  {
    id: 3,
    title: "Revenue",
    value: "4.65L",
    change: "↑ 14%",
    text: "vs last Month",
    titleColor: "#F59E0B",
    changeColor: "#EF4444",
    iconBg: "#FFF5E7",
    icon: "/assets/images/k (9).png",
  },
  {
    id: 4,
    title: "Open Tickets",
    value: "10",
    change: "↑ 14%",
    text: "vs last Month",
    titleColor: "#4F6BFF",
    changeColor: "#16A34A",
    iconBg: "#EEF1FF",
    icon: "/assets/images/k (12).png",
  },
];

export default function DashboardCards() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">

      {dashboardCards.map((card) => (

        <div
          key={card.id}
          className="bg-white rounded-2xl border border-[#ECECEC] px-5 py-4 shadow-sm"
        >

          <div className="flex items-start gap-4">

            {/* Icon */}
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center shrink-0"
            >
              <Image
                src={card.icon}
                alt={card.title}
                width={50}
                height={50}
              />
            </div>

            {/* Content */}
            <div>

              <h3
                className="text-[15px] font-semibold"
                style={{
                  color: card.titleColor,
                }}
              >
                {card.title}
              </h3>

              <h2 className="text-[34px] font-bold leading-none mt-2 text-[#1E293B]">
                {card.value}
              </h2>

              <div className="flex items-center gap-2 mt-4">

                <span
                  className="text-[13px] font-semibold"
                  style={{
                    color: card.changeColor,
                  }}
                >
                  {card.change}
                </span>

                <span className="text-[13px] text-[#6B7280]">
                  {card.text}
                </span>

              </div>

            </div>

          </div>

        </div>

      ))}

    </div>
  );
}